# LOCKR — Product Idea Document

## Hackathon
- **Track:** Payments Track | Superteam India x Dodo Payments
- **Hackathon:** Solana Frontier (powered by Colosseum)
- **Deadline:** May 13, 2026
- **Prize Pool:** $10,000 USDG
- **Submission:** Superteam Earn + Colosseum Frontier

---

## One-Liner
**Milestone Escrow for Indian Freelancers — Fiat In, Trustless Out.**

---

## The Problem

Indian freelancers on Upwork, Fiverr, and Toptal face three critical pain points when working with international clients:

1. **High fees:** PayPal charges 5-8% + FX markup on every payment.
2. **Slow settlement:** Bank wires and PayPal take 3-5 days to settle to INR.
3. **No trustless escrow:** Freelancers work on faith or rely on platform escrow that still costs a fortune.

**Result:** A freelancer earning $2,000/month loses $100-160 to fees and waits nearly a week for each payment.

---

## The User

**Primary:** Indian freelancer (developer, designer, writer) earning $500-5,000/month from international clients.

**Secondary:** International client who wants to pay a freelancer but does not want to learn crypto, install wallets, or deal with volatility.

---

## The Solution

LOCKR is a **milestone-based escrow** where:
- **International clients pay in fiat** via Dodo Payments (card, UPI, 40+ methods).
- **Funds lock into a Solana smart contract** (PDA) as USDC.
- **The client cryptographically approves** each milestone release.
- **If the client ghosts, a time-locked refund** protects the freelancer.
- **Freelancer receives USDC instantly** upon approval (3 seconds, $0.001 fee).

**The client never knows they're using crypto.** They see a normal checkout page.
**The freelancer gets trustless, instant, low-fee settlement.**

---

## Why Solana + Stablecoins Beat the Status Quo

| Metric | PayPal | Wise | LOCKR |
|--------|--------|------|-----------|
| Fee | 5-8% | ~$12-15 flat | ~0.1% ($0.001/tx) |
| Settlement | 3-5 days | 1-2 days | 3 seconds |
| Escrow | Platform-controlled | None | Trustless on-chain |
| Milestones | None | None | Programmable per milestone |
| Client needs crypto? | N/A | N/A | No (pays fiat) |

**Programmability advantage:** PayPal cannot do milestone releases, time-locked refunds, or cryptographic client approval. Solana does this natively.

---

## The Exact User Flow

### Step 1: Freelancer Creates Escrow
- Connects Solana wallet (Phantom/Solflare) on LOCKR dashboard.
- Defines: client email, project description, milestones (e.g., 30% upfront, 70% on delivery).
- Solana program creates a PDA storing all data on-chain.
- Freelancer copies a payment link and sends it to the client.

### Step 2: Client Pays in Fiat
- Clicks link → lands on Dodo-hosted checkout page.
- Enters card/UPI details (whatever Dodo supports in their region).
- Pays. No crypto knowledge required.

### Step 3: Dodo Webhook Triggers Funding
- Dodo fires `payment.succeeded` webhook to our backend.
- Backend verifies webhook HMAC signature.
- Backend locks equivalent USDC into the escrow PDA on Solana.
- Freelancer sees "Milestone 1: FUNDED" on dashboard.

### Step 4: Freelancer Delivers
- Uploads deliverable, marks milestone "COMPLETE".
- Client receives email notification.

### Step 5: Client Approves Release
- Clicks magic link in email.
- Signs a cryptographic message approving release for this milestone.
- Backend verifies signature against `client_email` hash stored in PDA.
- Backend relays release transaction to Solana.
- USDC moves from escrow PDA → freelancer's wallet in 3 seconds.

### Step 6: Timeout Protection
- If client never approves within deadline (e.g., 14 days):
  - Freelancer triggers `refund()` or `force_release()`.
  - Time-locked logic in Solana program handles it automatically.

### Step 7: Off-Ramp to INR
- Freelancer clicks "Withdraw to Bank" in UI.
- Quotes INR rate from CoinDCX/WazirX API.
- Simulated swap + withdrawal shown (real integration post-hackathon).

---

## Architecture

### Dodo Payments Layer (Fiat On-Ramp)
| Feature | How We Use It |
|---------|--------------|
| Checkout Sessions | Client pays fiat via Dodo-hosted page |
| Metadata | Attach `escrow_id` + `solana_pda_address` to every checkout |
| Webhooks | `payment.succeeded` triggers backend to fund Solana escrow |
| Webhook Verification | HMAC signature check prevents fake events |
| Payment Status API | Poll/get status for reconciliation |

### Solana Layer (Trustless Settlement)
| Feature | How We Use It |
|---------|--------------|
| Escrow PDA | Holds USDC. No single party controls it. |
| Milestone Logic | Multiple milestones, each with separate release conditions |
| Client Signature Verification | Program verifies cryptographic approval before release |
| Time-Locked Refund | Deadline expires → refund path activates |
| Dispute State | `Disputed` state exists in program |
| Memo Instruction | Every tx includes Dodo `payment_id` for auditability |

### Backend Layer (The Bridge)
| Component | Role |
|-----------|------|
| Next.js API | Receives Dodo webhooks, serves frontend, polls escrow status |
| BullMQ + Redis | Queues Solana transactions so webhooks don't timeout |
| Prisma + PostgreSQL | Tracks payment events, prevents double-processing |
| Solana Signer | Relays transactions (pays gas). **Cannot spend without client approval.** |
| Email Service | Sends magic links to clients for release approval |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 + Tailwind CSS + Solana Wallet Adapter |
| Backend | Next.js API Routes + BullMQ + Redis |
| Database | PostgreSQL via Supabase + Prisma |
| Queue | BullMQ + Upstash Redis |
| Blockchain | Solana Devnet + Anchor 0.29 + SPL Token |
| RPC | Helius (free tier) |
| Payments | Dodo Payments (test mode) |
| Email | Resend / SendGrid |
| Hosting | Railway |

---

## MVP Scope (What's Real vs. Simulated)

| Component | Status |
|-----------|--------|
| Dodo checkout + webhook | Fully real |
| Solana escrow program | Fully real (devnet) |
| Client signature approval | Fully real (message signing) |
| Milestone logic | Fully real |
| Time-locked refund | Fully real |
| Webhook → Solana bridge | Fully real |
| Freelancer wallet + USDC receipt | Fully real |
| INR off-ramp to bank | **Simulated UI** (shows quote + flow, swap mocked) |
| Dispute arbitration | **State exists, arbiter is us for demo** |

---

## Why Judges Will Love This

1. **Dodo integration is load-bearing** — Remove Dodo and the product literally doesn't work. Not a logo on a page.
2. **Solana program is non-trivial** — Milestones, timeouts, dispute states, cryptographic signature verification. Not a tutorial PDA.
3. **Real user, real pain** — Every judge knows a freelancer who got scammed by PayPal.
4. **Demo tells a story** — "Client pays $100 in fiat. 3 seconds later, freelancer has $100 in USDC. No PayPal. No 5-day wait."
5. **India-focused** — Superteam India wants Indian builders solving Indian problems. 15M+ Indian freelancers.

---

## Judging Defense

**Q: "Why is this on a blockchain?"**

**Bad answer:** "Because it's decentralized and trustless."

**Good answer:** "The escrow program is a non-custodial state machine. Even our backend cannot release funds without the client's cryptographic approval. We use Solana as a neutral settlement layer for the final payment, while Dodo handles fiat complexity. For the freelancer, we integrate with local off-ramp partners to minimize forex friction."

---

## Research Files
All research saved to `/Users/zen/Desktop/superteam/research/`:
- `01_hackathon_requirements.md`
- `02_dodo_payments.md`
- `03_frontier_hackathon_context.md`
- `04_solana_infrastructure.md`
- `05_x402_protocol.md`
- `06_india_market.md`
- `07_critic_review.md`
- `08_dodo_api_deep_dive.md`
- `09_backend_architecture.md`
- `10_precedents.md`
- `11_alternative_angles.md`
- `12_architecture_critique.md`

---

## Open Questions / Decisions

1. **Name:** "LOCKR" is a working title. Change if desired.
2. **Off-ramp partner:** CoinDCX vs. WazirX vs. Onramp Money.
3. **Milestone count:** Start with 2 milestones (upfront + final) or allow N?
4. **Dispute arbiter:** Program authority (us) for MVP, or no arbiter (auto-refund on timeout)?
5. **Frontend framework:** Next.js App Router vs. Pages Router.

---

## Next Step
Launch Planner Agent + Component Owner Agents to build in parallel.
