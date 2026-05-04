# End-to-End Demo Walkthrough

## THE PROBLEM

Judges need to understand the full flow in 3 minutes.
One gap in the narrative = confusion = lower score.
Every step must be visible, verifiable, and impressive.

## THE IDEA

A scripted demo that tells a story:
"Meet Priya. She just finished a $2,000 project. Here's how LOCKR changes everything."

**Analogy:**
Like a cooking show.
The chef doesn't show you 4 hours of prep.
They show you the key steps.
Mix → Bake → Decorate → Serve.
Each step is 30 seconds.
The result is beautiful.

## HOW IT WORKS (STEP-BY-STEP)

### Step 0: Setup (Before Demo)

**What you do (off-screen):**
1. Deploy program to devnet → get real program ID
2. Fund backend wallet with devnet SOL
3. Fund backend wallet with devnet USDC
4. Set Dodo API keys in `.env.local`
5. Start Next.js dev server
6. Start BullMQ worker
7. Open dashboard in browser

**Numeric example:**
Backend wallet: 10 SOL, 10,000 USDC
Devnet faucet: solana.com/faucet
USDC airdrop: create custom SPL mint

### Step 1: Create Escrow (30 seconds)

**What you show:**
1. Dashboard → "Create New Escrow"
2. Enter client email: `demo-client@example.com`
3. Add milestones:
   - Wireframes: $500
   - Frontend: $1,000
   - QA: $500
4. Deadline: 14 days from now
5. Click "Create Escrow"
6. Solana tx confirms → shows explorer link
7. Payment link modal appears

**What you say:**
"Priya creates 3 milestones totaling $2,000.
The Solana program creates a PDA — a trustless vault.
Here's the transaction on-chain."

**What judges see:**
- Real Solana transaction
- Real PDA address
- Real Dodo checkout URL

### Step 2: Client Pays (30 seconds)

**What you show:**
1. Open payment link in incognito window
2. Dodo checkout page loads
3. Enter test card: `4242 4242 4242 4242`
4. Enter expiry: `12/30`, CVC: `123`
5. Click "Pay $2,000"
6. Success page

**What you say:**
"The client pays with a normal credit card.
No crypto knowledge needed. No wallet installation."

**What judges see:**
- Professional checkout page
- Familiar payment flow
- No crypto jargon

### Step 3: Webhook Triggers Funding (30 seconds)

**What you show:**
1. Switch to backend logs
2. Show webhook arrival: `POST /api/webhooks/dodo`
3. Show HMAC verification
4. Show job enqueue: `solana-tx queue: fund-escrow`
5. Switch to worker logs
6. Show transaction build → sign → send
7. Show Solana explorer link

**What you say:**
"Dodo fires a webhook. Our backend verifies the signature.
Then it locks $2,000 USDC into the escrow on Solana.
This happens in 3 seconds."

**Numeric example:**
Webhook received: T+0s
HMAC verified: T+0.1s
Job enqueued: T+0.2s
Worker picks up: T+0.7s
Transaction built: T+1.5s
Transaction sent: T+2.0s
Confirmation: T+3.0s

### Step 4: Dashboard Updates (15 seconds)

**What you show:**
1. Switch to dashboard
2. Status changes from CREATED → FUNDED
3. Progress bar shows 0/3 released
4. Milestones show status: FUNDED

**What you say:**
"Priya sees the escrow is funded. She can now start work."

### Step 5: Mark Delivered (15 seconds)

**What you show:**
1. Click "Mark Delivered" on Milestone 1
2. Status changes: FUNDED → COMPLETED
3. Show backend log: milestone updated

**What you say:**
"Priya finishes the wireframes. She marks it delivered.
The client gets an email with an approval link."

### Step 6: Client Approves Release (30 seconds)

**What you show:**
1. Open email (or magic link directly)
2. Client approval page loads
3. Shows: "Approve Release for Wireframes — $500"
4. Click "Approve Release"
5. Browser signs message (invisible to user)
6. POST to backend
7. Backend verifies signature
8. Solana tx: release_milestone
9. Show explorer link

**What you say:**
"The client clicks approve. Their browser signs a cryptographic message.
The backend verifies it and releases $500 to Priya instantly."

**Numeric example:**
Client clicks: T+0s
Message signed: T+0.5s
POST to backend: T+1.0s
Signature verified: T+1.2s
Transaction built: T+1.5s
Transaction sent: T+2.0s
Confirmation: T+3.0s
Priya has $500 USDC: T+3.0s

### Step 7: Show Final State (15 seconds)

**What you show:**
1. Dashboard: Milestone 1 status = RELEASED
2. Progress bar: 1/3 released
3. Escrow detail: transaction history
4. Solana Explorer links for all txs

**What you say:**
"That's it. $500 released in 3 seconds. Fee: $0.001.
Compare to PayPal: 5-8% fee, 3-5 day wait."

**Numeric comparison:**
LOCKR: $0.001 fee, 3s settlement
PayPal: $25-40 fee (5% of $500), 3-5 days
Wise: $12-15 fee, 1-2 days

### Step 8: Timeout/Refund (Optional, 15 seconds)

**What you show:**
1. Fast-forward to after deadline
2. Click "Trigger Refund"
3. Solana tx: refund
4. Remaining USDC returns to treasury

**What you say:**
"If the client ghosts, the deadline protects the freelancer.
Remaining funds are automatically refundable."

## DESIGN DECISIONS

### Decision: Why show logs during demo?
**Options:** Only UI, UI + logs
**Chosen:** UI + logs
**Why:**
- Judges want to see the backend working
- Logs prove the webhook fired
- Logs prove the transaction was signed
- Adds technical credibility

**When to show:**
- After client pays (show webhook log)
- After approval (show worker log)
- Keep logs brief (3-4 lines)

### Decision: Why use test card 4242?
**Options:** Real payment, test card
**Chosen:** Test card
**Why:**
- Dodo test mode
- No real money
- Instant confirmation
- Predictable behavior

**Why not real:**
- Real cards take longer to process
- Risk of failed payment during demo
- Unnecessary for judging

### Decision: Why 3 milestones?
**Options:** 1, 2, 3, 5
**Chosen:** 3
**Why:**
- Shows milestone progression
- Not too many (time constraint)
- Demonstrates partial release
- Realistic for a real project

## TRADEOFFS

**What we gain:**
- Clear narrative arc
- Visible on-chain proof
- Easy to follow
- Impressive numbers

**What we lose:**
- Demo is scripted (not live improvisation)
- Requires setup beforehand
- Dependent on devnet stability
- Can't show mainnet transactions

## FAILURE CASES

### 1. Devnet is Down
**What breaks:** Transactions fail
**Mitigation:**
- Have screenshots ready
- Record video as backup
- Use Helius RPC (more reliable)

### 2. Dodo Test Mode Fails
**What breaks:** Checkout doesn't load
**Mitigation:**
- Test checkout the day before
- Have screenshot of checkout page
- Explain architecture even if payment fails

### 3. Browser Wallet Not Connected
**What breaks:** Can't create escrow
**Mitigation:**
- Connect wallet before demo starts
- Have backup wallet ready
- Show connect flow as part of demo

### 4. Worker Not Running
**What breaks:** Webhook received but no funding
**Mitigation:**
- Check worker logs before demo
- Have `npm run worker` running in separate terminal
- Show queue status

### 5. Demo Runs Over Time
**What breaks:** Judges lose attention
**Mitigation:**
- Practice twice
- Time each segment
- Skip optional steps if running late

## COMMON CONFUSION

**No, the demo does not use real money.**
Devnet SOL and USDC are free test tokens. The test card is fake. Nothing is real.

**No, the 3-second settlement is not guaranteed.**
Devnet can be slow. In production on mainnet, it's consistently 1-3 seconds.

**No, the client approval is not a Solana transaction.**
The client signs an off-chain message. The backend submits the Solana tx.

**No, we cannot demo on mainnet for the hackathon.**
Mainnet requires real USDC and real fees. Devnet is sufficient for judging.

## WHERE IT EXISTS IN CODE

| Demo Step | File | Action |
|-----------|------|--------|
| Create escrow | `app/escrow/create/page.tsx` | Form submission |
| Dashboard | `app/dashboard/page.tsx` | Status display |
| Escrow detail | `app/escrow/[id]/page.tsx` | Milestone actions |
| Client approval | `app/approve/[token]/page.tsx` | Signature + approval |
| Webhook | `app/api/webhooks/dodo/route.ts` | Backend processing |
| Worker | `src/worker/index.ts` | Solana tx execution |
