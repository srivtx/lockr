# LOCKR — Detailed Build Plan

> **Track:** Payments Track | Superteam India x Dodo Payments  
> **Hackathon:** Solana Frontier (powered by Colosseum)  
> **Deadline:** May 13, 2026  
> **Planner Agent Output** — This document is the single source of truth for all component agents.

---

## 1. System Breakdown

### 1.1 Solana Program (Anchor 0.29)

| # | File | Purpose |
|---|------|---------|
| 1.1.1 | `programs/trustlock/Cargo.toml` | Anchor program dependencies |
| 1.1.2 | `programs/trustlock/src/lib.rs` | Program entrypoint, instruction router |
| 1.1.3 | `programs/trustlock/src/instructions/create_escrow.rs` | Initialize PDA with milestones |
| 1.1.4 | `programs/trustlock/src/instructions/fund_escrow.rs` | Lock USDC into PDA |
| 1.1.5 | `programs/trustlock/src/instructions/release_milestone.rs` | Release USDC for approved milestone |
| 1.1.6 | `programs/trustlock/src/instructions/refund.rs` | Time-locked refund after deadline |
| 1.1.7 | `programs/trustlock/src/instructions/force_release.rs` | Admin/timeout force release |
| 1.1.8 | `programs/trustlock/src/instructions/dispute.rs` | Mark escrow as disputed |
| 1.1.9 | `programs/trustlock/src/instructions/resolve_dispute.rs` | Arbiter resolves dispute (demo) |
| 1.1.10 | `programs/trustlock/src/state/escrow.rs` | Escrow PDA state struct |
| 1.1.11 | `programs/trustlock/src/state/milestone.rs` | Milestone struct |
| 1.1.12 | `programs/trustlock/src/errors.rs` | Custom program errors |
| 1.1.13 | `programs/trustlock/src/utils/verify_signature.rs` | Off-chain signature verification helper |
| 1.1.14 | `Anchor.toml` | Anchor config, devnet RPC |
| 1.1.15 | `Cargo.lock` | Rust dependency lock |

### 1.2 Database Layer (Prisma + PostgreSQL)

| # | File | Purpose |
|---|------|---------|
| 1.2.1 | `prisma/schema.prisma` | Escrow, Milestone, PaymentEvent, User models |
| 1.2.2 | `prisma/migrations/` | Migration files (auto-generated) |
| 1.2.3 | `prisma/seed.ts` | Seed data for demo |

### 1.3 Backend (Next.js API Routes + BullMQ)

| # | File | Purpose |
|---|------|---------|
| 1.3.1 | `src/lib/prisma.ts` | Prisma client singleton |
| 1.3.2 | `src/lib/redis.ts` | Redis client for BullMQ |
| 1.3.3 | `src/lib/solana.ts` | Anchor provider, program IDL, connection |
| 1.3.4 | `src/lib/dodo.ts` | Dodo API client, webhook verification |
| 1.3.5 | `src/lib/email.ts` | Resend email service wrapper |
| 1.3.6 | `src/lib/queue.ts` | BullMQ queue definitions |
| 1.3.7 | `src/lib/workers/solana.worker.ts` | BullMQ worker: processes Solana tx jobs |
| 1.3.8 | `src/lib/workers/email.worker.ts` | BullMQ worker: sends emails async |
| 1.3.9 | `src/app/api/webhooks/dodo/route.ts` | POST handler for Dodo webhooks |
| 1.3.10 | `src/app/api/escrow/route.ts` | POST: create escrow in DB |
| 1.3.11 | `src/app/api/escrow/[id]/route.ts` | GET: fetch escrow details |
| 1.3.12 | `src/app/api/escrow/[id]/fund/route.ts` | POST: fund escrow (triggered by webhook) |
| 1.3.13 | `src/app/api/escrow/[id]/release/route.ts` | POST: release milestone with signature |
| 1.3.14 | `src/app/api/escrow/[id]/refund/route.ts` | POST: trigger refund after timeout |
| 1.3.15 | `src/app/api/escrow/[id]/dispute/route.ts` | POST: raise/resolve dispute |
| 1.3.16 | `src/app/api/escrow/[id]/approve/route.ts` | GET: client magic link handler (renders approval page) |
| 1.3.17 | `src/app/api/solana/pda/route.ts` | GET: compute PDA from seeds |
| 1.3.18 | `src/app/api/dodo/checkout/route.ts` | POST: create Dodo checkout session |
| 1.3.19 | `src/app/api/dodo/status/route.ts` | GET: poll Dodo payment status |
| 1.3.20 | `src/types/api.ts` | Shared TypeScript types for API contracts |

### 1.4 Frontend (Next.js 14 App Router + Tailwind)

| # | File | Purpose |
|---|------|---------|
| 1.4.1 | `src/app/layout.tsx` | Root layout with Solana wallet provider |
| 1.4.2 | `src/app/page.tsx` | Landing page |
| 1.4.3 | `src/app/dashboard/page.tsx` | Freelancer dashboard (list escrows) |
| 1.4.4 | `src/app/dashboard/layout.tsx` | Dashboard layout with nav |
| 1.4.5 | `src/app/escrow/create/page.tsx` | Escrow creation form |
| 1.4.6 | `src/app/escrow/[id]/page.tsx` | Escrow detail view |
| 1.4.7 | `src/app/approve/[token]/page.tsx` | Client approval page (magic link) |
| 1.4.8 | `src/app/withdraw/page.tsx` | Withdraw/off-ramp UI (simulated) |
| 1.4.9 | `src/components/WalletButton.tsx` | Connect Phantom/Solflare |
| 1.4.10 | `src/components/EscrowCard.tsx` | Card showing escrow summary |
| 1.4.11 | `src/components/MilestoneList.tsx` | Milestone progress + actions |
| 1.4.12 | `src/components/CreateEscrowForm.tsx` | Multi-step escrow creation |
| 1.4.13 | `src/components/ApprovalSigner.tsx` | Client message signing UI |
| 1.4.14 | `src/components/WithdrawForm.tsx` | Off-ramp simulation UI |
| 1.4.15 | `src/components/StatusBadge.tsx` | Escrow status chip |
| 1.4.16 | `src/hooks/useEscrow.ts` | SWR hook for escrow data |
| 1.4.17 | `src/hooks/useAnchor.ts` | Hook for Anchor program interaction |
| 1.4.18 | `src/hooks/useDodoCheckout.ts` | Hook to create Dodo checkout |
| 1.4.19 | `src/utils/format.ts` | USDC formatting, date helpers |
| 1.4.20 | `src/utils/constants.ts` | Program IDs, RPC URLs, devnet config |
| 1.4.21 | `src/providers/SolanaProvider.tsx` | Wallet adapter context |
| 1.4.22 | `public/logo.svg` | LOCKR logo |

### 1.5 Infrastructure & Config

| # | File | Purpose |
|---|------|---------|
| 1.5.1 | `package.json` | Dependencies |
| 1.5.2 | `next.config.js` | Next.js config |
| 1.5.3 | `tailwind.config.ts` | Tailwind theme |
| 1.5.4 | `tsconfig.json` | TypeScript config |
| 1.5.5 | `.env.example` | Required env vars template |
| 1.5.6 | `.env.local` | Local secrets (gitignored) |
| 1.5.7 | `docker-compose.yml` | Local PostgreSQL + Redis |
| 1.5.8 | `railway.json` | Railway deployment config |
| 1.5.9 | `README.md` | Setup + run instructions |
| 1.5.10 | `scripts/deploy-program.sh` | Deploy Anchor program to devnet |
| 1.5.11 | `scripts/setup-dev.sh` | One-command local dev setup |

---

## 2. Execution Order

### Phase 0: Foundation (Day 1 Morning)
1. Initialize monorepo: `npx create-next-app@latest` + Anchor init in subdir
2. Configure `tsconfig.json`, `tailwind.config.ts`, `.env.example`
3. Set up `docker-compose.yml` (Postgres 15 + Redis 7)
4. Run `scripts/setup-dev.sh` to validate local environment

### Phase 1: Solana Program (Day 1 Afternoon → Day 2 Morning)
5. Define `Escrow` and `Milestone` state structs in `state/`
6. Implement `create_escrow` instruction
7. Implement `fund_escrow` instruction (USDC SPL token transfer into PDA)
8. Implement `release_milestone` with signature verification
9. Implement `refund` and `force_release` with time-lock checks
10. Implement `dispute` and `resolve_dispute` (basic state transitions)
11. Write Anchor tests (all happy paths + edge cases)
12. Deploy to devnet, save program ID to `.env`

### Phase 2: Database (Day 2 Morning)
13. Write `prisma/schema.prisma`
14. Run initial migration
15. Write `prisma/seed.ts` with demo data
16. Verify seed script works

### Phase 3: Backend Core (Day 2 Afternoon → Day 3 Morning)
17. Set up `prisma.ts`, `redis.ts`, `solana.ts`, `queue.ts` lib files
18. Implement Dodo webhook handler (`api/webhooks/dodo/route.ts`)
19. Implement Solana transaction worker (`solana.worker.ts`)
20. Implement escrow CRUD API routes
21. Implement Dodo checkout creation route
22. Implement client approval API (`api/escrow/[id]/approve/route.ts`)
23. Implement release/refund/dispute routes
24. Write backend integration tests (webhook → queue → Solana)

### Phase 4: Frontend (Day 3 Morning → Day 4 Afternoon)
25. Set up `SolanaProvider.tsx` with wallet adapter
26. Build landing page (`app/page.tsx`)
27. Build dashboard with `EscrowCard` and `MilestoneList`
28. Build escrow creation flow (`CreateEscrowForm`)
29. Build escrow detail page
30. Build client approval page (`ApprovalSigner`)
31. Build withdraw/off-ramp simulation page
32. Connect frontend to backend APIs (SWR hooks)

### Phase 5: Integration & Polish (Day 4 Afternoon → Day 5)
33. End-to-end test: create escrow → Dodo checkout → webhook → fund → release
34. Add error handling, loading states, toast notifications
35. Demo video script + flow rehearsal
36. Deploy to Railway
37. Final QA + bug fixes

---

## 3. File Structure

```
trustlock/
├── Anchor.toml
├── Cargo.lock
├── Cargo.toml
├── docker-compose.yml
├── next.config.js
├── package.json
├── postcss.config.js
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── programs/
│   └── trustlock/
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs
│           ├── instructions/
│           │   ├── create_escrow.rs
│           │   ├── fund_escrow.rs
│           │   ├── release_milestone.rs
│           │   ├── refund.rs
│           │   ├── force_release.rs
│           │   ├── dispute.rs
│           │   └── resolve_dispute.rs
│           ├── state/
│           │   ├── escrow.rs
│           │   └── milestone.rs
│           ├── errors.rs
│           └── utils/
│               └── verify_signature.rs
├── public/
│   └── logo.svg
├── railway.json
├── scripts/
│   ├── deploy-program.sh
│   └── setup-dev.sh
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── escrow/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── approve/
│   │   │   │       │   └── route.ts
│   │   │   │       ├── dispute/
│   │   │   │       │   └── route.ts
│   │   │   │       ├── fund/
│   │   │   │       │   └── route.ts
│   │   │   │       ├── refund/
│   │   │   │       │   └── route.ts
│   │   │   │       └── release/
│   │   │   │           └── route.ts
│   │   │   ├── dodo/
│   │   │   │   ├── checkout/
│   │   │   │   │   └── route.ts
│   │   │   │   └── status/
│   │   │   │       └── route.ts
│   │   │   ├── solana/
│   │   │   │   └── pda/
│   │   │   │       └── route.ts
│   │   │   └── webhooks/
│   │   │       └── dodo/
│   │   │           └── route.ts
│   │   ├── approve/
│   │   │   └── [token]/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── escrow/
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── withdraw/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ApprovalSigner.tsx
│   │   ├── CreateEscrowForm.tsx
│   │   ├── EscrowCard.tsx
│   │   ├── MilestoneList.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── WalletButton.tsx
│   │   └── WithdrawForm.tsx
│   ├── hooks/
│   │   ├── useAnchor.ts
│   │   ├── useDodoCheckout.ts
│   │   └── useEscrow.ts
│   ├── lib/
│   │   ├── dodo.ts
│   │   ├── email.ts
│   │   ├── prisma.ts
│   │   ├── queue.ts
│   │   ├── redis.ts
│   │   ├── solana.ts
│   │   └── workers/
│   │       ├── email.worker.ts
│   │       └── solana.worker.ts
│   ├── providers/
│   │   └── SolanaProvider.tsx
│   ├── types/
│   │   └── api.ts
│   └── utils/
│       ├── constants.ts
│       └── format.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 4. Module Dependencies

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DEPENDENCY GRAPH                               │
└─────────────────────────────────────────────────────────────────────────────┘

Solana Program (Anchor)
    │
    ├──► IDL (auto-generated: target/idl/trustlock.json)
    │       │
    │       └──► Backend: src/lib/solana.ts imports IDL
    │       │
    │       └──► Frontend: src/hooks/useAnchor.ts imports IDL
    │
    └──► Program ID (devnet address)
            │
            ├──► Backend .env: ANCHOR_PROGRAM_ID
            └──► Frontend constants.ts: ANCHOR_PROGRAM_ID

Database (Prisma)
    │
    ├──► Prisma Client
    │       │
    │       ├──► Backend: src/lib/prisma.ts (singleton)
    │       ├──► API Routes: all /api/escrow/* routes
    │       └──► Workers: solana.worker.ts reads escrow state
    │
    └──► Schema
            │
            └──► Must be finalized BEFORE backend routes are written

Backend (Next.js API + BullMQ)
    │
    ├──► Depends on: Solana Program (IDL + deployed program ID)
    ├──► Depends on: Database (Prisma schema migrated)
    ├──► Depends on: Redis (for BullMQ queues)
    │
    ├──► Dodo Integration
    │       ├──► Webhook handler: api/webhooks/dodo/route.ts
    │       ├──► Checkout creation: api/dodo/checkout/route.ts
    │       └──► Status polling: api/dodo/status/route.ts
    │
    ├──► Solana Workers
    │       ├──► solana.worker.ts queues fund/release/refund txs
    │       └──► Reads/writes Prisma to prevent double-processing
    │
    └──► Email Worker
            └──► email.worker.ts sends magic links via Resend

Frontend (Next.js App Router)
    │
    ├──► Depends on: Backend API routes (contract defined in types/api.ts)
    ├──► Depends on: Solana Program (IDL for direct reads via RPC)
    │
    ├──► Wallet Adapter
    │       └──► SolanaProvider.tsx wraps @solana/wallet-adapter-react
    │
    ├──► Hooks
    │       ├──► useEscrow.ts → calls /api/escrow/*
    │       ├──► useDodoCheckout.ts → calls /api/dodo/checkout
    │       └──► useAnchor.ts → direct RPC calls to devnet
    │
    └──► Pages
            ├──► Dashboard → useEscrow + EscrowCard + MilestoneList
            ├──► Create Escrow → CreateEscrowForm → POST /api/escrow
            ├──► Escrow Detail → useEscrow + MilestoneList
            └──► Approve → ApprovalSigner (signs message for backend)
```

### Critical Dependency Chain (must be built in this order)

```
Prisma Schema ──► Database Migration ──► Solana Program ──► IDL
                                                      │
                            ┌─────────────────────────┘
                            ▼
                    Backend API Routes + Workers
                            │
                            ▼
                    Frontend (all pages + components)
```

---

## 5. MVP vs Advanced Split

### MVP (Must Ship by May 13)

| Component | Detail | Priority |
|-----------|--------|----------|
| **Solana Program** | 2 milestones max (upfront + final) | P0 |
| | `create_escrow` — PDA with escrow data | P0 |
| | `fund_escrow` — USDC lock via SPL transfer | P0 |
| | `release_milestone` — client sig verification | P0 |
| | `refund` — time-locked, freelancer triggers | P0 |
| | `force_release` — auto after timeout | P1 |
| | `dispute` state exists | P1 |
| | `resolve_dispute` — admin resolve for demo | P2 |
| **Database** | Escrow, Milestone, PaymentEvent tables | P0 |
| | Deduplication index on PaymentEvent | P0 |
| **Backend** | Dodo webhook handler + HMAC verify | P0 |
| | Solana tx worker (fund escrow) | P0 |
| | Escrow CRUD API | P0 |
| | Client approval API (magic link) | P0 |
| | Release API (sig verify + relay tx) | P0 |
| | Refund API | P1 |
| | Dodo checkout session creation | P0 |
| **Frontend** | Wallet connect (Phantom/Solflare) | P0 |
| | Dashboard — list escrows | P0 |
| | Create escrow form (2 milestones) | P0 |
| | Escrow detail + milestone status | P0 |
| | Client approval page (sign message) | P0 |
| | Off-ramp simulation UI (static quote) | P1 |
| **Integration** | End-to-end: create → checkout → pay → webhook → fund → release | P0 |

### Advanced (Nice to Have)

| Component | Detail | Priority |
|-----------|--------|----------|
| **Solana Program** | N milestones (dynamic array) | P2 |
| | Partial milestone release | P2 |
| | Multi-sig client approval | P3 |
| **Backend** | Webhook retry logic with exponential backoff | P2 |
| | Email worker with HTML templates | P2 |
| | Admin dashboard for dispute resolution | P2 |
| | On-chain event indexing (Helius webhooks) | P3 |
| **Frontend** | Real-time escrow updates (WebSocket) | P2 |
| | Mobile-responsive polish | P2 |
| | Dark mode | P3 |
| | INR rate real-time fetch (CoinDCX API) | P2 |
| **DevOps** | CI/CD pipeline | P3 |
| | Monitoring/logging (Sentry) | P3 |

### Cut List (If Time Runs Out)

1. **Dispute arbitration UI** — Keep dispute state in program, but manual DB flag for demo. Skip admin dashboard.
2. **Real off-ramp** — Always simulate. Judges care about the escrow flow, not the bank transfer.
3. **Email HTML templates** — Plain text emails work.
4. **N milestones** — Cap at 2. Complexity explodes in Anchor with dynamic arrays.
5. **Multi-currency** — USD only. Dodo handles forex to USDC.
6. **Auto fund on timeout** — Just `refund()` is enough for MVP.

---

## 6. Risk Areas

### Risk 1: Dodo Webhook Reliability
- **Problem:** Webhook might not fire, or we might process it twice.
- **Mitigation:**
  - Store every webhook payload in `PaymentEvent` table with unique `payment_id`.
  - Database-level unique constraint on `PaymentEvent.dodoPaymentId`.
  - Poll Dodo status API as fallback reconciliation.
  - BullMQ idempotency: job ID = `payment_id`.
- **Backup Plan:** If Dodo webhooks fail in demo, manually trigger fund via admin API.

### Risk 2: Solana Devnet Congestion
- **Problem:** Devnet can be slow or unreliable during hackathon crunch.
- **Mitigation:**
  - Use Helius free tier RPC (faster than public devnet).
  - Pre-fund devnet wallets before demo.
  - Queue all Solana txs in BullMQ with retry logic.
- **Backup Plan:** Record demo video early; don't rely on live devnet during judging.

### Risk 3: Client Signature Verification Complexity
- **Problem:** Verifying client email signature off-chain then relaying on-chain is tricky.
- **Mitigation:**
  - Store `client_email_hash` in PDA at creation.
  - Client signs message: `release:${escrow_id}:${milestone_index}`.
  - Backend verifies ed25519 signature against derived public key (from email).
  - Anchor program double-checks: releases only if sig matches stored hash.
- **Backup Plan:** Simplify to backend-only verification for MVP, add on-chain check post-hackathon.

### Risk 4: Time-Lock Logic Bugs
- **Problem:** `refund` instruction might be callable too early or too late.
- **Mitigation:**
  - Store `deadline: i64` in each milestone.
  - Program checks: `Clock::get()?.unix_timestamp > milestone.deadline`.
  - Extensive Anchor tests for boundary conditions.
- **Backup Plan:** Use a large timeout (30 days) for demo; no one will hit it.

### Risk 5: USDC Devnet Faucet
- **Problem:** We need devnet USDC to test fund/release.
- **Mitigation:**
  - Use USDC devnet mint: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`.
  - Create a devnet airdrop script.
  - Fund test wallets in advance.
- **Backup Plan:** Mock USDC transfers in tests; use real SPL for demo only.

### Risk 6: Dodo Payments Test Mode Limitations
- **Problem:** Dodo test mode might not support all payment methods or regions.
- **Mitigation:**
  - Verify test checkout works with Indian cards early.
  - Use Dodo test API keys from day 1.
  - Have screenshots of successful test payment ready.
- **Backup Plan:** If live checkout fails during demo, show recorded video + explain architecture.

---

## 7. Integration Points

### 7.1 Freelancer Creates Escrow

**Trigger:** Freelancer clicks "Create Escrow" on frontend.

**Flow:**
1. `CreateEscrowForm.tsx` collects: client email, project desc, 2 milestones (amount + deadline).
2. Frontend calls `POST /api/escrow` with form data + freelancer's wallet pubkey.
3. Backend:
   - Validates input (amounts sum to 100%).
   - Generates `escrow_id` (UUID).
   - Calls Anchor `create_escrow` instruction on Solana devnet.
   - Passes seeds: `[b"escrow", escrow_id.as_bytes(), freelancer_pubkey.as_ref()]`.
   - Program derives PDA, initializes state with milestones + `client_email_hash`.
   - Backend saves to PostgreSQL: `Escrow` row + 2 `Milestone` rows + `solana_pda_address`.
   - Returns `escrow_id` + `payment_link` + `solana_pda_address` to frontend.
4. Frontend displays payment link (e.g., `https://trustlock.app/pay/{escrow_id}`) for freelancer to copy.

**Data Flow:**
```
Frontend (CreateEscrowForm)
  → POST /api/escrow { clientEmail, milestones[], freelancerPubkey }
    → Backend: validate → Anchor create_escrow → Solana PDA created
      → Backend: Prisma Escrow.create({ pdaAddress, milestones... })
        → Frontend: display payment_link
```

### 7.2 Client Pays via Dodo

**Trigger:** Client clicks payment link.

**Flow:**
1. Client lands on `/pay/{escrow_id}` (served by frontend).
2. Page shows project details + "Pay Now" button.
3. On click, frontend calls `POST /api/dodo/checkout`.
4. Backend creates Dodo checkout session:
   - `amount`: total escrow amount in smallest currency unit.
   - `currency`: "USD".
   - `metadata`: `{ escrow_id, solana_pda_address, freelancer_pubkey }`.
   - `success_url`: `/escrow/{escrow_id}/success`.
   - `webhook_url`: `https://api.trustlock.app/api/webhooks/dodo`.
5. Dodo returns `checkout_url`. Backend forwards to frontend.
6. Frontend redirects client to Dodo-hosted checkout page.
7. Client enters card/UPI, pays.

**Data Flow:**
```
Client clicks "Pay Now"
  → Frontend: POST /api/dodo/checkout { escrow_id }
    → Backend: Dodo API → checkout session
      → Dodo: checkout_url
        → Frontend: window.location = checkout_url
          → Dodo: client pays fiat
```

### 7.3 Dodo Webhook Funds Solana Escrow

**Trigger:** Dodo fires `payment.succeeded` webhook.

**Flow:**
1. Dodo POSTs to `POST /api/webhooks/dodo` with payload:
   ```json
   {
     "event": "payment.succeeded",
     "data": {
       "payment_id": "pay_xxx",
       "amount": 10000,
       "currency": "USD",
       "metadata": { "escrow_id": "...", "solana_pda_address": "..." }
     }
   }
   ```
2. Backend verifies HMAC signature (`X-Dodo-Signature` header).
3. Backend checks `PaymentEvent` table for existing `payment_id`. If exists, return 200 (idempotent).
4. Backend creates `PaymentEvent` row: `{ dodoPaymentId, escrowId, amount, status: "SUCCEEDED" }`.
5. Backend enqueues BullMQ job `fund-escrow`:
   - Job data: `{ escrow_id, solana_pda_address, amount_usd, payment_id }`.
   - Job ID = `payment_id` (prevents duplicates).
6. `solana.worker.ts` picks up job:
   - Reads escrow from Prisma to verify state.
   - Calculates USDC amount (1 USD = 1 USDC for hackathon; real world uses oracle).
   - Backend wallet (relayer) calls Anchor `fund_escrow` instruction:
     - Transfers USDC from backend treasury ATA to escrow PDA ATA.
     - Includes memo instruction: `dodo:pay_xxx`.
   - Waits for confirmation.
   - Updates Prisma: `Escrow.status = "FUNDED"`, `Milestone[0].status = "FUNDED"`.
   - Emails freelancer: "Your escrow is funded!"
7. Frontend dashboard (polling `GET /api/escrow/{id}`) shows "FUNDED" status.

**Data Flow:**
```
Dodo
  → POST /api/webhooks/dodo { payment.succeeded }
    → Backend: HMAC verify + dedup check
      → BullMQ: addJob('fund-escrow', { escrow_id, pda, amount })
        → solana.worker.ts
          → Anchor fund_escrow → Solana (USDC → PDA)
            → Prisma: update Escrow.status = FUNDED
              → Email worker: notify freelancer
```

### 7.4 Client Approves Milestone Release

**Trigger:** Freelancer marks milestone complete → email sent to client.

**Flow:**
1. Freelancer clicks "Mark Complete" for milestone 0 on dashboard.
2. Frontend calls `POST /api/escrow/{id}/release` (no sig yet, just state update).
3. Backend:
   - Updates `Milestone.status = "PENDING_APPROVAL"`.
   - Generates JWT/magic token: `token = jwt.sign({ escrow_id, milestone_index, client_email }, SECRET)`.
   - Enqueues email job: `{ to: client_email, template: "approval", token }`.
4. `email.worker.ts` sends email with magic link: `https://trustlock.app/approve/{token}`.
5. Client clicks link, lands on `app/approve/[token]/page.tsx`.
6. Frontend decodes token (client-side JWT decode, no secret needed for payload read).
7. Page shows: "Approve release of $X for [project]?"
8. Client clicks "Approve".
9. Frontend:
   - Prompts client to sign message: `release:{escrow_id}:{milestone_index}`.
   - Client signs with wallet (or ephemeral key derived from email — see note below).
   - Sends `POST /api/escrow/{id}/release` with `{ milestone_index, signature, public_key }`.
10. Backend:
    - Verifies JWT token is valid and not expired.
    - Verifies signature against message and stored `client_email_hash`.
    - Enqueues BullMQ job `release-milestone`:
      - Job data: `{ escrow_id, pda, milestone_index, signature, public_key }`.
    - `solana.worker.ts` picks up job:
      - Calls Anchor `release_milestone` instruction:
        - Program verifies signature matches `client_email_hash`.
        - Transfers USDC from PDA ATA to freelancer's wallet ATA.
        - Updates milestone state to `RELEASED`.
      - Waits for confirmation.
      - Updates Prisma: `Milestone.status = "RELEASED"`.
      - If all milestones released, `Escrow.status = "COMPLETED"`.
      - Emails both parties.
11. Frontend dashboard updates to "RELEASED".

**Data Flow:**
```
Freelancer clicks "Mark Complete"
  → POST /api/escrow/{id}/release (initiate)
    → Backend: Milestone.status = PENDING_APPROVAL
      → Email worker: send magic link to client
        → Client clicks /approve/{token}
          → Frontend: sign message "release:{id}:{index}"
            → POST /api/escrow/{id}/release { signature }
              → Backend: verify sig + enqueue release job
                → solana.worker.ts
                  → Anchor release_milestone → Solana (PDA → freelancer wallet)
                    → Prisma: Milestone.status = RELEASED
```

**Note on Client Wallet:** The client is a fiat payer, not a crypto user. For MVP, the approval signature is an off-chain cryptographic proof. Two options:
- **Option A (MVP):** Client signs with a temporary ephemeral keypair generated in-browser and linked to their email. Backend stores the pubkey mapping.
- **Option B (Advanced):** Client connects a real wallet (Phantom, etc.) and signs.
- **Decision:** Use Option A for MVP. It requires zero crypto knowledge from the client. The ephemeral key is generated when they first open the approval page and stored in `localStorage`. Backend saves `client_pubkey` to DB at escrow creation or first approval.

### 7.5 Timeout Refund

**Trigger:** Milestone deadline passes with no client approval.

**Flow:**
1. Freelancer clicks "Request Refund" on dashboard for a `PENDING_APPROVAL` milestone past deadline.
2. Frontend calls `POST /api/escrow/{id}/refund` with `{ milestone_index }`.
3. Backend enqueues BullMQ job `refund-escrow`.
4. `solana.worker.ts`:
   - Calls Anchor `refund` instruction.
   - Program checks: `Clock::get()?.unix_timestamp > milestone.deadline`.
   - If true, transfers USDC from PDA ATA back to backend treasury ATA.
   - Updates on-chain state.
5. Backend updates Prisma: `Milestone.status = "REFUNDED"`, `Escrow.status = "REFUNDED"`.
6. Emails both parties.

**Data Flow:**
```
Freelancer clicks "Request Refund" (past deadline)
  → POST /api/escrow/{id}/refund
    → BullMQ: addJob('refund-escrow')
      → solana.worker.ts
        → Anchor refund → Solana (PDA → treasury, if timestamp > deadline)
          → Prisma: Escrow.status = REFUNDED
```

### 7.6 Dispute (Demo Mode)

**Trigger:** Either party clicks "Dispute".

**Flow:**
1. Frontend calls `POST /api/escrow/{id}/dispute`.
2. Backend enqueues job calling Anchor `dispute` instruction.
3. Program sets `Escrow.state = Disputed`.
4. Backend updates Prisma, notifies admin.
5. Admin (us) logs into DB or uses a simple admin API to call `resolve_dispute`.
6. For demo, we resolve manually in the presentation by showing the program state.

**Data Flow:**
```
Party clicks "Dispute"
  → POST /api/escrow/{id}/dispute
    → Anchor dispute → Escrow.state = Disputed
      → Admin manually resolves (demo)
        → Anchor resolve_dispute → Escrow.state = Resolved
```

### 7.7 Summary of All API Contracts

| Endpoint | Method | Request | Response |
|----------|--------|---------|----------|
| `/api/escrow` | POST | `{ clientEmail, projectDesc, milestones[], freelancerPubkey }` | `{ escrow_id, pda_address, payment_link }` |
| `/api/escrow/{id}` | GET | — | `{ escrow, milestones, payments }` |
| `/api/escrow/{id}/fund` | POST | `{ payment_id, amount }` | `{ tx_signature }` |
| `/api/escrow/{id}/release` | POST | `{ milestone_index, signature, public_key }` | `{ tx_signature }` |
| `/api/escrow/{id}/refund` | POST | `{ milestone_index }` | `{ tx_signature }` |
| `/api/escrow/{id}/dispute` | POST | `{ reason }` | `{ tx_signature }` |
| `/api/escrow/{id}/approve` | GET | `token` (query) | Renders approval page |
| `/api/dodo/checkout` | POST | `{ escrow_id }` | `{ checkout_url }` |
| `/api/dodo/status` | GET | `payment_id` (query) | `{ status, amount }` |
| `/api/webhooks/dodo` | POST | Dodo webhook payload | `200 OK` (or error) |
| `/api/solana/pda` | GET | `escrow_id`, `freelancer_pubkey` | `{ pda_address, bump }` |

---

## 8. Environment Variables

```bash
# Solana
ANCHOR_PROGRAM_ID=abc123...
SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=xxx
SOLANA_RELAYER_PRIVATE_KEY=[58, 123, ...]  # JSON array of bytes

# Dodo Payments
DODO_API_KEY=dodo_test_xxx
DODO_WEBHOOK_SECRET=whsec_xxx
DODO_API_URL=https://sandbox.dodopayments.com

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/trustlock

# Redis (BullMQ)
REDIS_URL=redis://localhost:6379

# Email
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@trustlock.app

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOLANA_PROGRAM_ID=abc123...
```

---

## 9. Demo Script (For Reference)

**Narrative:** "Meet Priya, a developer from Bangalore. Her client in Berlin owes her $1,000. Here's how LOCKR changes everything."

1. **Create:** Priya creates an escrow: 30% upfront ($300), 70% on delivery ($700). She sends a link.
2. **Pay:** Client clicks link, pays $300 with their German credit card on Dodo. No crypto needed.
3. **Fund:** Dodo webhook fires. 3 seconds later, Priya's dashboard shows "Milestone 1: FUNDED — $300 in USDC locked on-chain."
4. **Deliver:** Priya submits code, marks milestone complete. Client gets email.
5. **Approve:** Client clicks magic link, signs approval. $300 USDC moves to Priya's wallet instantly. Fee: $0.001.
6. **Timeout (if needed):** If client ghosts for 14 days, Priya triggers refund. Smart contract enforces it automatically.
7. **Off-ramp:** Priya sees a simulated INR quote. "Coming soon: direct bank withdrawal."

**Time:** 3-minute demo. Practice twice.

---

## 10. Checklist for Component Agents

Before starting work, each agent must confirm:
- [ ] Read `idea.md` and this `plan.md`.
- [ ] Understand which files they own (see Section 1).
- [ ] Understand upstream dependencies (see Section 4).
- [ ] Know the API contracts (see Section 7.7).
- [ ] Have access to `.env.example` and know required env vars.
- [ ] Know the MVP vs Advanced split (see Section 5).

---

*Plan generated by Planner Agent. Last updated: May 4, 2026.*
*Any deviation from this plan requires approval from the team lead.*
