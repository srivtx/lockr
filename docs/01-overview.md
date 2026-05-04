# LOCKR — System Overview

## THE PROBLEM

Indian freelancers lose $100-160 per month to PayPal fees.

Bank wires take 3-5 days.

There is no trustless escrow for cross-border freelance work.

Freelancers either work on faith and get scammed, or they eat 5-8% fees with zero protection.

Current solutions fail because:
- PayPal charges 5-8% + FX markup
- Wise is fast but has no escrow
- Crypto wallets require the client to understand crypto
- Existing escrow platforms are US-centric and expensive

## THE IDEA

LOCKR is a milestone-based escrow where:
- The client pays in fiat via Dodo (card, UPI)
- Funds lock on Solana as USDC
- The freelancer delivers work
- The client cryptographically approves each milestone release
- USDC hits the freelancer's wallet in 3 seconds

The client never knows they are using crypto.
The freelancer gets instant, low-fee, trustless settlement.

**Analogy:**
Like a vending machine for freelance payments.
The buyer inserts fiat coins.
The machine holds the item.
The seller delivers the work.
The buyer presses the button.
The machine releases the item instantly.
No trust needed. No 5-day wait. No 8% fee.

## HOW IT WORKS (STEP-BY-STEP)

### Step 1: Freelancer Creates Escrow
- Connects Phantom/Solflare wallet
- Enters client email + milestones
- Signs Solana transaction to create PDA
- Copies payment link

**Numeric example:**
Priya creates 3 milestones:
- Wireframes: $500
- Frontend: $1000
- QA: $500
Total: $2,000

### Step 2: Client Pays in Fiat
- Clicks link → Dodo checkout page
- Enters card or UPI
- Pays $2,000
- No crypto knowledge required

### Step 3: Webhook Triggers On-Chain Funding
- Dodo fires `payment.succeeded` webhook
- Backend verifies signature + checks idempotency
- Enqueues BullMQ job
- Worker signs Solana tx → locks $2,000 USDC into escrow PDA
- 3 seconds later, Priya sees "FUNDED"

### Step 4: Freelancer Delivers
- Uploads wireframes
- Clicks "Mark Delivered"
- Client gets email notification

### Step 5: Client Approves Release
- Clicks magic link in email
- Signs cryptographic message: `release:escrow-123:0:deadline`
- Backend verifies signature
- Signs Solana tx → releases $500 USDC to freelancer
- 3 seconds later, Priya has $500

### Step 6: Timeout Protection
- If client ghosts for 14 days
- Freelancer clicks "Trigger Refund"
- Solana program checks `Clock::get()?.unix_timestamp > deadline`
- If true, returns remaining USDC

## SYSTEM FLOW

```
Freelancer Dashboard
  → Create Escrow Form
    → POST /api/escrow/create
      → Anchor create_escrow → Solana PDA
      → Prisma Escrow.create + Milestone.create
      → POST /api/checkout
        → Dodo checkoutSessions.create
        → Returns { checkout_url }
          → Freelancer sends link to client

Client Browser
  → Clicks checkout_url
    → Dodo hosted page
      → Client pays $2,000 (card/UPI)
        → Dodo fires webhook POST /api/webhooks/dodo
          → Verify HMAC signature
          → Check PaymentEvent idempotency
          → Enqueue BullMQ job 'fund-escrow'
            → Worker: buildFundMilestoneTx
              → Anchor fund_escrow → Solana
                → USDC moves to escrow PDA
                → Prisma: Escrow.status = FUNDED
                  → Freelancer sees FUNDED on dashboard

Freelancer Dashboard
  → Click "Mark Delivered" on milestone 0
    → POST /api/escrow/[id]/deliver
      → Prisma: Milestone.status = COMPLETED
        → Email sent to client

Client Email
  → Magic link: /approve/[token]
    → Client clicks "Approve Release"
      → Signs message with ephemeral keypair
        → POST /api/escrow/[id]/approve
          → Verify ed25519 signature
          → buildApproveReleaseTx
            → Anchor release_milestone → Solana
              → USDC moves from PDA → freelancer wallet
                → Prisma: Milestone.status = RELEASED
```

## DESIGN DECISIONS

### Decision: Why Anchor over raw Solana programs?
**Options:** Raw Rust, Anchor, Seahorse
**Chosen:** Anchor 0.29.0
**Why:**
- IDL auto-generation → TypeScript types for free
- PDA derivation macros → no manual byte math
- CPI helpers → SPL token transfers in 3 lines
- 90% less boilerplate than raw Rust

**Why not raw Rust:**
- 500+ lines of manual serialization
- No type safety between program and frontend
- Error-prone account validation

### Decision: Why Dodo over Stripe?
**Options:** Stripe, Razorpay, Dodo
**Chosen:** Dodo Payments
**Why:**
- Hackathon sponsor → meaningful integration requirement
- 40+ payment methods including UPI
- Native webhook system with HMAC verification
- Metadata field allows attaching escrow_id

**Why not Stripe:**
- Stripe India is "Preview" only
- No meaningful Dodo integration possible
- Would not satisfy hackathon judging criteria

### Decision: Why milestone-based escrow?
**Options:** Lump sum, hourly, milestone
**Chosen:** Milestone
**Why:**
- Reduces risk for both parties
- Client pays once, releases incrementally
- Freelancer gets paid as work is delivered
- Matches how real projects actually work

**Numeric example:**
Lump sum: Client pays $2,000 upfront. Freelancer ghosts after $500 of work. Client loses $1,500.

Milestone: Client pays $2,000 upfront. Freelancer ghosts after $500. Client only lost $500 (first milestone). Remaining $1,500 is in escrow and can be refunded.

### Decision: Why USDC on Solana?
**Options:** USDC on Ethereum, USDT on Tron, native SOL
**Chosen:** USDC on Solana
**Why:**
- $0.001 per transaction (Ethereum: $5-20)
- 3 second settlement (Ethereum: 12s, banks: 3-5 days)
- SPL Token standard → stable, well-documented
- Hackathon explicitly asks for stablecoins on Solana

## TRADEOFFS

**What we gain:**
- Trustless escrow (no single party controls funds)
- 3-second settlement
- 0.1% fees vs 5-8% for PayPal
- Client needs zero crypto knowledge

**What we lose:**
- Freelancer receives USDC, not INR (off-ramp is simulated)
- Backend holds hot wallet (centralization for MVP)
- Devnet only (not mainnet)
- Dispute resolution is manual (no decentralized jury)

## FAILURE CASES

### 1. Dodo Webhook Never Fires
**What breaks:** Escrow stays in CREATED state forever
**Mitigation:**
- BullMQ retry with exponential backoff (8 attempts over 24 hours)
- `/reconcile` endpoint to poll Dodo API for missed payments
- Admin can manually trigger funding

### 2. Solana Devnet Congestion
**What breaks:** Transaction times out, worker retries
**Mitigation:**
- Helius RPC (faster than public devnet)
- Priority fees on transactions
- Pre-funded devnet wallets

### 3. Client Loses Approval Link
**What breaks:** Freelancer can't get paid
**Mitigation:**
- Resend email API
- Freelancer can regenerate link from dashboard
- Timeout refund after deadline

### 4. Backend Key Compromise
**What breaks:** Attacker drains escrow treasury
**Mitigation:**
- Devnet only for hackathon
- Post-hackathon: AWS KMS / Turnkey MPC
- Treasury is separate from escrow funds (escrow is in PDA)

### 5. Client Disputes After Release
**What breaks:** USDC already sent, no clawback
**Mitigation:**
- Dispute must happen BEFORE release
- Once released, funds are gone (by design)
- On-chain state is immutable

## COMMON CONFUSION

**No, the client does NOT need a crypto wallet.**
They pay with a normal credit card on a Dodo checkout page. Crypto is invisible to them.

**No, we are NOT a bank or exchange.**
We do not hold fiat. Dodo holds fiat. We hold USDC in a smart contract. We are software, not a financial institution.

**No, the backend cannot steal escrow funds.**
The escrow PDA is controlled by the Solana program, not the backend. The backend can only trigger state transitions that the program allows.

**No, USDC is not volatile for this use case.**
USDC is pegged to $1. The freelancer receives USDC and immediately converts to INR. The peg holds for the 3 seconds between release and off-ramp.

**No, this does not replace PayPal for everyone.**
This is specifically for Indian freelancers with international clients who want escrow protection. UPI is still better for domestic payments.

**No, the dispute resolution is not decentralized yet.**
For the MVP, the arbiter is the program authority (us). Post-hackathon, this becomes a decentralized jury or Kleros integration.

## FREE INFRASTRUCTURE STACK

LOCKR runs entirely on free tiers. Zero credit card required.

| Service | Role | Free Tier | Link |
|---------|------|-----------|------|
| **Vercel** | Next.js hosting | Unlimited hobby projects | vercel.com |
| **Supabase** | PostgreSQL | 500MB storage | supabase.com |
| **Upstash** | Redis (BullMQ) | 10,000 commands/day | upstash.com |
| **Helius** | Solana RPC | 100 req/s devnet | helius.dev |
| **Dodo** | Fiat payments | Test mode (no fees) | dodopayments.com |
| **Solana Devnet** | Blockchain | Free test tokens | solana.com |

**Total cost: $0**

## WHERE IT EXISTS IN CODE

| Concept | File |
|---------|------|
| Escrow PDA creation | `programs/trustlock/src/instructions/create_escrow.rs` |
| USDC lock | `programs/trustlock/src/instructions/fund_escrow.rs` |
| Milestone release | `programs/trustlock/src/instructions/release_milestone.rs` |
| Refund logic | `programs/trustlock/src/instructions/refund.rs` |
| Dispute state | `programs/trustlock/src/instructions/dispute.rs` |
| Dodo webhook handler | `app/api/webhooks/dodo/route.ts` |
| Checkout creation | `app/api/checkout/route.ts` |
| Escrow creation API | `app/api/escrow/create/route.ts` |
| Client approval API | `app/api/escrow/[id]/approve/route.ts` |
| Release API | `app/api/escrow/[id]/release/route.ts` |
| Refund API | `app/api/escrow/[id]/refund/route.ts` |
| Deliver API | `app/api/escrow/[id]/deliver/route.ts` |
| Dispute API | `app/api/escrow/[id]/dispute/route.ts` |
| Solana tx worker | `src/worker/index.ts` |
| Solana helpers | `src/lib/solana.ts` |
| Dodo client | `src/lib/dodo.ts` |
| Prisma schema | `prisma/schema.prisma` |
| Create escrow page | `app/escrow/create/page.tsx` |
| Dashboard | `app/dashboard/page.tsx` |
| Escrow detail | `app/escrow/[id]/page.tsx` |
| Client approval | `app/approve/[token]/page.tsx` |
| Landing page | `app/page.tsx` |
