# Backend Architecture

## THE PROBLEM

A hackathon backend must:
- Receive webhooks in under 200ms
- Sign Solana transactions securely
- Prevent double-spending
- Handle retries gracefully
- Survive crashes

Building this in 1 week with zero infra is hard.
One bug in idempotency = drained treasury.
One unhandled exception = lost webhook = lost payment.

## THE IDEA

A Next.js backend with three layers:
1. **API Layer** — Fast, stateless, returns 200 quickly
2. **Queue Layer** — Redis + BullMQ, durable, retry-capable
3. **Worker Layer** — Long-running, signs Solana txs, handles failures

**Analogy:**
Like a restaurant kitchen.
The waiter (API) takes the order and returns immediately.
The ticket (queue) goes to the kitchen board.
The chef (worker) cooks the food.
If the chef burns the dish, the ticket stays on the board for retry.
The customer is never waiting at the table for the chef.

## HOW IT WORKS (STEP-BY-STEP)

### Step 1: Webhook Arrives

```
POST /api/webhooks/dodo
  → Verify HMAC (10ms)
    → Check idempotency (DB query, 20ms)
      → Enqueue job (Redis, 15ms)
        → Return 200 (45ms total)
```

**Why fast:**
Dodo expects 200 within 15 seconds.
We return in 45ms.
The actual work happens offline.

### Step 2: Job Queued

```typescript
await solanaTxQueue.add('fund-escrow', {
  paymentId: 'pay_123',
  escrowId: 'esc_abc',
  solanaPda: '7xKX...',
}, {
  jobId: 'pay_123',      // Deduplication
  attempts: 5,           // Retry count
  backoff: {
    type: 'exponential',
    delay: 5000          // 5s, 10s, 20s, 40s, 80s
  }
});
```

**Why jobId:**
If Dodo sends the same webhook twice, BullMQ rejects the duplicate.
Only one Solana transaction is created.

### Step 3: Worker Processes Job

```typescript
const worker = new Worker('solana-tx', async (job) => {
  // 1. Read escrow from DB
  const escrow = await prisma.escrow.findUnique({...});

  // 2. Check milestone-level idempotency
  if (milestone.status !== 'PENDING') return { alreadyFunded: true };

  // 3. Build Solana tx
  const tx = await buildFundMilestoneTx(...);

  // 4. Sign and send
  const signature = await signAndSendTransaction(tx);

  // 5. Update DB atomically
  await prisma.$transaction([
    prisma.milestone.update({ status: 'FUNDED' }),
    prisma.escrow.update({ status: 'FUNDED' }),
  ]);

  return { signature };
}, { concurrency: 5 });
```

**Why atomic DB update:**
If the server crashes between steps 4 and 5, the job retries.
On retry, step 2 detects the milestone is already funded and skips.
No double-spending.

### Step 4: Frontend Polls Status

```typescript
// Every 3 seconds
const { data } = await fetch(`/api/escrow/${id}/status`).then(r => r.json());
if (data.escrow.status === 'FUNDED') {
  showConfetti();
}
```

**Why polling:**
WebSockets are overkill for a hackathon.
Polling is simple, reliable, and works through firewalls.
3-second interval = user perceives near-instant updates.

## SYSTEM FLOW

### Full Request Lifecycle

```
Client Browser
  → POST /api/escrow/create
    → Next.js API Route
      → Validate input (Zod)
        → Build Solana tx (create_escrow)
          → Sign tx (backend keypair)
            → Send tx (Helius RPC)
              → Wait confirmation (2-8s)
                → Prisma: Escrow.create + Milestone.create
                  → Return { escrow, signature, explorer }

Client Browser
  → POST /api/checkout
    → Next.js API Route
      → Dodo API: create checkout session
        → Return { checkout_url }

Dodo Server
  → POST /api/webhooks/dodo
    → Next.js API Route
      → Verify HMAC
        → Check idempotency
          → Enqueue BullMQ job
            → Return 200

BullMQ Worker
  → Pick up job
    → Read DB
      → Build Solana tx (fund_escrow)
        → Sign tx
          → Send tx
            → Wait confirmation
              → Update DB
                → Job complete

Client Browser
  → GET /api/escrow/123/status (every 3s)
    → Next.js API Route
      → Prisma: Escrow.findUnique
        → Return { escrow, milestones, signatures }
```

## DESIGN DECISIONS

### Decision: Why Next.js API routes over Express?
**Options:** Express, Fastify, Next.js API routes
**Chosen:** Next.js API routes
**Why:**
- One codebase for frontend + backend
- Automatic TypeScript support
- Easy deployment to Railway/Vercel
- File-based routing (no router config)

**Why not Express:**
- Separate server file
- More boilerplate
- Harder to deploy alongside Next.js frontend

### Decision: Why BullMQ over in-memory queue?
**Options:** In-memory array, BullMQ, SQS
**Chosen:** BullMQ + Redis
**Why:**
- Persists across server restarts
- Built-in retry with exponential backoff
- Job deduplication via jobId
- Observability (Bull Dashboard)

**Why not in-memory:**
- Lost on server restart
- No retry logic
- No concurrency control

**Why not SQS:**
- AWS account required
- More complex setup
- Overkill for hackathon

### Decision: Why Upstash over Railway Redis?
**Options:** Railway Redis, Upstash, Docker Redis
**Chosen:** Upstash (free tier)
**Why:**
- Free tier: 10,000 commands/day
- Serverless (no server to manage)
- HTTPS/TLS by default
- Works with BullMQ out of the box
- Global edge network (low latency)

**Why not Railway:**
- Requires $5/month
- Need to manage Redis instance
- Extra infrastructure to maintain

**Why not Docker:**
- Extra setup
- No persistence on serverless platforms
- Overkill for hackathon

### Decision: Why Prisma over raw SQL?
**Options:** Raw SQL, Knex, Prisma
**Chosen:** Prisma
**Why:**
- Type-safe queries
- Auto-generated client
- Migration system
- Intuitive relations (Escrow.milestones)

**Why not raw SQL:**
- No type safety
- Manual migration management
- Error-prone string queries

### Decision: Why Supabase over Railway PostgreSQL?
**Options:** Railway, Supabase, Render, Docker
**Chosen:** Supabase (free tier)
**Why:**
- Free tier: 500MB, no credit card
- Managed PostgreSQL (no Docker, no server management)
- Connection pooling built-in
- Works with Prisma out of the box
- Easy dashboard for checking data

**Why not Railway:**
- Requires $5/month (free tier exists but limited)
- Need to manage connection pool yourself
- Supabase is purpose-built for this

**Why not Docker:**
- Extra setup complexity
- No persistent storage on Vercel
- Not suitable for hackathon deadline

## TRADEOFFS

**What we gain:**
- Durable queue (survives crashes)
- Idempotent processing (no double-funding)
- Type-safe database
- Fast webhook response

**What we lose:**
- Redis dependency (another service to manage)
- PostgreSQL dependency (can't run purely serverless)
- Hot wallet in env var (security risk for production)
- No WebSocket real-time updates

## FAILURE CASES

### 1. Redis Connection Lost
**What breaks:** Webhooks can't enqueue jobs
**Symptoms:** 500 errors on webhook endpoint
**Mitigation:**
- Redis reconnect logic in ioredis
- Fallback: write to database queue table
- Monitor Redis health

### 2. Database Connection Pool Exhausted
**What breaks:** API requests timeout
**Symptoms:** 500 errors, slow responses
**Mitigation:**
- Prisma connection pooling (default 10)
- Increase pool size for hackathon demo
- Use `$transaction` sparingly

### 3. Worker Crash Mid-Transaction
**What breaks:** DB updated but Solana tx not sent
**Symptoms:** Escrow shows FUNDED but PDA is empty
**Mitigation:**
- Check milestone status BEFORE building tx
- If status is already FUNDED, skip
- Atomic updates: update DB only after tx confirms

### 4. Hot Wallet Key Leak
**What breaks:** Attacker drains treasury
**Symptoms:** USDC missing from backend wallet
**Mitigation:**
- Devnet only (no real money)
- Post-hackathon: AWS KMS / Turnkey
- Separate treasury from escrow (PDA holds funds, not backend)

### 5. Rate Limiting on Helius RPC
**What breaks:** Transactions fail with 429
**Symptoms:** Worker retries repeatedly
**Mitigation:**
- Helius free tier: 100 req/s
- Worker concurrency: 5 (well under limit)
- Retry with exponential backoff

## COMMON CONFUSION

**No, the backend does not hold escrow funds.**
The backend holds a treasury wallet for funding. The actual escrow funds sit in the PDA on Solana. The backend cannot spend PDA funds without the program's permission.

**No, the queue is not optional.**
Without BullMQ, a slow Solana tx would cause Dodo to timeout and retry. This would create duplicate funding. The queue is essential for correctness.

**No, Prisma is not an ORM in the traditional sense.**
Prisma generates a type-safe client from your schema. It compiles queries at build time, not runtime. This is why it's fast and safe.

**No, the worker does not run in the same process as the API.**
The API returns 200 immediately. The worker is a separate process (or thread) that picks up jobs from Redis. They are decoupled.

**No, we cannot use SQLite for the hackathon demo.**
SQLite locks the entire database file on write. If the webhook handler and the worker both write at the same time, one will fail. PostgreSQL handles concurrent writes.

**No, the 200 response to Dodo does not mean the escrow is funded.**
It means "we received your webhook and will process it." The actual funding happens asynchronously in the worker.

## WHERE IT EXISTS IN CODE

| Layer | File | Purpose |
|-------|------|---------|
| API | `app/api/webhooks/dodo/route.ts` | Webhook handler |
| API | `app/api/checkout/route.ts` | Checkout creation |
| API | `app/api/escrow/create/route.ts` | Escrow creation |
| API | `app/api/escrow/route.ts` | List escrows |
| API | `app/api/escrow/[id]/status/route.ts` | Status polling |
| API | `app/api/escrow/[id]/approve/route.ts` | Client approval |
| API | `app/api/escrow/[id]/release/route.ts` | Release milestone |
| API | `app/api/escrow/[id]/refund/route.ts` | Refund escrow |
| API | `app/api/escrow/[id]/deliver/route.ts` | Mark delivered |
| API | `app/api/escrow/[id]/dispute/route.ts` | Raise dispute |
| Queue | `src/lib/queue.ts` | BullMQ setup |
| Worker | `src/worker/index.ts` | Solana tx worker |
| DB | `prisma/schema.prisma` | Schema definition |
| DB | `src/lib/prisma.ts` | Client singleton |
| Config | `.env.local.example` | Env vars template |
