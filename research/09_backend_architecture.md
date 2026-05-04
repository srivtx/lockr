# Backend Architecture: Dodo Webhook → Solana Escrow

## Source
- Agent research on webhook patterns, queue systems, Solana tx signing, idempotency
- Date: 2026-05-04

---

## 1. Architecture Patterns

### Pattern A: Webhook Listener → Queue → Worker → Solana RPC (Recommended)

```
Dodo Webhook POST /api/webhooks/dodo
    ↓
Next.js API Route
    ↓
Redis Queue (BullMQ)
    ↓
Worker (Node.js process)
    ↓
Solana RPC (Helius) → Escrow PDA funded with USDC
```

**Why this wins for 1-week builds:**
- Decouples HTTP response from transaction latency (Solana tx confirmation takes 2-8s).
- Dodo expects a 200ms response. If you block on Solana confirmation, Dodo retries → duplicate transactions.
- BullMQ gives retries, deduplication, and observability.

**Exact code pattern:**
```typescript
// app/api/webhooks/dodo/route.ts
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redis = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
const txQueue = new Queue('solana-tx', { connection: redis });

export async function POST(req: Request) {
  if (!verifyDodoSignature(req)) return new Response('Unauthorized', { status: 401 });
  
  const paymentId = req.body.payment_id;
  const existing = await prisma.paymentEvent.findUnique({ where: { paymentId } });
  if (existing) return Response.json({ status: 'already_processed' });

  await txQueue.add('fund-escrow', 
    { paymentId, payload: req.body },
    { 
      jobId: paymentId,
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 }
    }
  );

  return Response.json({ status: 'queued' });
}
```

```typescript
// worker.ts
import { Worker } from 'bullmq';
import { Connection, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

const worker = new Worker('solana-tx', async (job) => {
  const { paymentId, payload } = job.data;

  const dbEvent = await prisma.paymentEvent.findUnique({ where: { paymentId } });
  if (dbEvent?.status === 'completed') return { status: 'already_done' };

  const connection = new Connection(process.env.HELIUS_RPC_URL, 'confirmed');
  const wallet = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.ESCROW_KEYPAIR)));
  
  const tx = new Transaction().add(
    await program.methods.fundEscrow(new anchor.BN(payload.amount))
      .accounts({
        escrow: escrowPDA,
        usdcMint: new PublicKey(USDC_MINT_DEVNET),
        payerUsdc: payerTokenAccount,
        escrowUsdc: escrowTokenAccount,
        payer: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction()
  );

  // Add memo with paymentId for on-chain auditability
  tx.add(
    new TransactionInstruction({
      keys: [],
      programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      data: Buffer.from(`dodo:${paymentId}`),
    })
  );

  const sig = await sendAndConfirmTransaction(connection, tx, [wallet], {
    commitment: 'confirmed',
    maxRetries: 3,
  });

  await prisma.paymentEvent.update({
    where: { paymentId },
    data: { status: 'completed', signature: sig, completedAt: new Date() },
  });

  return { signature: sig };
}, { 
  connection: redis,
  concurrency: 10,
  limiter: { max: 50, duration: 1000 }
});
```

### Pattern B: Serverless Functions
- **Vercel Edge Runtime:** No native `crypto` for ed25519. 10s timeout. **Do not use for blocking tx flows.**
- **AWS Lambda:** 15min timeout. Good for async processing. Use for webhook receiver + queue enqueue, then trigger async Lambda from SQS.

### Pattern C: Dedicated Backend (Express/Fastify)
Overkill for 1 week unless you need WebSocket subscriptions. Next.js API routes are sufficient.

---

## 2. Security & Key Management

### The Threat Model
Backend holds a hot wallet that can move USDC into escrow. If compromised, attacker drains user funds.

### Storage Options

| Method | Security | Complexity | Verdict |
|---|---|---|---|
| `process.env.ESCROW_KEYPAIR` | Low | Trivial | **Acceptable for hackathon/devnet only** |
| AWS Secrets Manager | Medium | Low | **Production minimum** |
| AWS KMS / HashiCorp Vault | High | Medium | **Production recommended** |
| Turnkey / Privy / Magic (MPC) | High | Low | **Best for production** |

### Devnet Recommendation
```bash
# .env.local
ESCROW_KEYPAIR=[64,123,45,...]
```

```typescript
import { Keypair } from '@solana/web3.js';
const keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.ESCROW_KEYPAIR)));
export const escrowSigner = keypair;
```

### RPC Security
Never expose Helius API key in frontend. Server-side only.

---

## 3. Idempotency & Race Conditions

### The Problem
- Dodo guarantees at-least-once delivery.
- Solana transactions may fail, timeout, or land twice if rebuilt with new blockhash.

### Defense in Depth

#### Layer 1: Database as Source of Truth
```prisma
model PaymentEvent {
  id          String   @id @default(cuid())
  paymentId   String   @unique
  status      String   // 'pending' | 'processing' | 'completed' | 'failed'
  signature   String?  @unique
  amount      BigInt
  escrowPda   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([status])
}
```

#### Layer 2: BullMQ Job Deduplication
By setting `jobId: paymentId`, BullMQ guarantees only one job exists.

#### Layer 3: Pessimistic Worker Locking
```typescript
const result = await prisma.$transaction(async (tx) => {
  const event = await tx.paymentEvent.findUnique({ where: { paymentId } });
  if (event?.status === 'completed') return { status: 'skipped' };
  
  await tx.paymentEvent.update({
    where: { paymentId },
    data: { status: 'processing' },
  });
  
  return { status: 'proceed' };
});

if (result.status === 'skipped') return;
```

#### Layer 4: Solana Memo + Signature Uniqueness
Append memo with `paymentId` for on-chain auditability and double-spend detection.

#### Layer 5: Webhook Signature Verification
Verify Dodo signature before queuing.

---

## 4. Latency & UX

### Timeline
| Step | Latency |
|---|---|
| User completes payment | 10-60s |
| Dodo fires webhook | <1s |
| API receives + verifies + enqueues | <100ms |
| Worker picks up job | <500ms |
| Build + sign + send Solana tx | 1-3s |
| Solana confirmation | 2-8s |
| **Total user-perceived delay** | **~15-75s after fiat success** |

### What to Show the User
After Dodo redirect:
```
State: "Payment received. Finalizing on Solana..."
Progress bar: ~30s estimate
Background polling: GET /api/escrow/:escrowId/status every 3s
```

**Polling endpoint:**
```typescript
export async function GET(req: Request, { params }) {
  const escrow = await prisma.escrow.findUnique({ where: { id: params.id } });
  return Response.json({
    status: escrow.status,
    solanaSignature: escrow.fundingSignature,
    solanaExplorerUrl: escrow.fundingSignature 
      ? `https://explorer.solana.com/tx/${escrow.fundingSignature}?cluster=devnet`
      : null,
  });
}
```

---

## 5. Exact Tech Stack Recommendation (1-Week Deadline)

### Database: PostgreSQL via Supabase (Free tier)
Managed Postgres + Prisma. Not SQLite — concurrent writes will bottleneck.

### Queue: BullMQ + Redis via Upstash (Free tier)
Serverless Redis. Zero infra. Free tier: 10,000 commands/day.
```bash
npm install bullmq ioredis
```

### Hosting: Railway or Render
| Platform | Cost | Notes |
|---|---|---|
| **Railway** | $5/mo starter | Native Redis + Postgres + Node.js. Best DX. |
| **Render** | Free tier (sleeps) | Worker will sleep and miss webhooks. |
| **Fly.io** | Free tier | Good if you want Docker. |

**Architecture on Railway:**
1. **Service 1:** Next.js app (`web`) — webhooks, polling API, frontend.
2. **Service 2:** Node.js worker (`worker`) — runs `tsx worker.ts`.
3. **Add-on:** Redis (Upstash or Railway Redis).
4. **Add-on:** PostgreSQL (Railway Postgres).

### Solana RPC: Helius Free Tier
```bash
HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=your_key
```

### NPM Package Lock
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "@solana/web3.js": "^1.91.0",
    "@coral-xyz/anchor": "^0.29.0",
    "@solana/spl-token": "^0.3.11",
    "bullmq": "^5.0.0",
    "ioredis": "^5.3.0",
    "@prisma/client": "^5.0.0",
    "prisma": "^5.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsx": "^4.0.0"
  }
}
```

### File Structure
```
├── app/
│   ├── api/
│   │   ├── webhooks/dodo/route.ts
│   │   └── escrow/[id]/status/route.ts
│   └── page.tsx
├── src/
│   ├── lib/prisma.ts
│   ├── lib/solana.ts
│   ├── lib/dodo.ts
│   └── worker/index.ts
├── prisma/schema.prisma
├── package.json
└── Procfile
```

---

## Summary Checklist
- [ ] Webhook handler: Verify signature, check DB idempotency, enqueue with `jobId = paymentId`
- [ ] Worker: Separate long-lived process, DB pessimistic locking, Solana memo, BullMQ retry
- [ ] Security: `.env` keypair for devnet, plan Turnkey/KMS for mainnet
- [ ] UX: Immediate "queued" response, poll DB, show Solana Explorer link
- [ ] Stack: Next.js + Railway + PostgreSQL + Upstash Redis + BullMQ + Helius
