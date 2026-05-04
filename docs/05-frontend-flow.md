# Frontend User Flow

## THE PROBLEM

Freelancers and clients have different mental models.
Freelancers think in milestones and deliverables.
Clients think in payments and approvals.
The UI must bridge both without confusing either.

Current crypto apps fail because:
- They assume everyone has a wallet
- They show raw transaction hashes
- They use jargon ("sign message", "PDA", "ATA")
- They have no concept of milestones or deadlines

## THE IDEA

Two views of the same escrow:
- **Freelancer view:** Dashboard, create, deliver, withdraw
- **Client view:** Approval page only (magic link)

The freelancer sees crypto details.
The client sees a normal approval form.
Both see progress, status, and next steps.

**Analogy:**
Like Airbnb.
The host (freelancer) sees bookings, cleaning schedules, and payouts.
The guest (client) sees photos, reviews, and a "Book Now" button.
Same property. Different interfaces. Both simple.

## HOW IT WORKS (STEP-BY-STEP)

### Step 1: Landing Page

```
/ (Landing)
  → Hero: "Milestone Escrow for Indian Freelancers"
  → 3-step visual: Create → Client Pays → Get Paid
  → CTA: "Connect Wallet to Start"
  → Trust badges: Solana, Dodo, USDC
```

**What the user sees:**
A clean, dark-themed page.
No technical jargon.
Just "Fiat In, Trustless Out."

**Why this works:**
Freelancers immediately understand the value prop.
"I create milestones. Client pays. I get USDC."

### Step 2: Connect Wallet

```
Dashboard
  → WalletMultiButton (Phantom/Solflare/Backpack)
    → If not connected: show connect prompt
    → If connected: show escrow list
```

**What the user sees:**
A button that says "Select Wallet."
A modal with Phantom, Solflare, Backpack.
One click to connect.

**Why this works:**
Solana wallet adapter handles everything.
No manual keypair import.
No seed phrase exposure.

### Step 3: Create Escrow

```
/escrow/create
  → Client Email input
  → Milestones (dynamic rows)
    → Description + Amount
    → Add/Remove buttons
  → Deadline picker (default 14 days)
  → Total amount auto-calculated
  → Submit → create_escrow on Solana → Dodo checkout
```

**What the user sees:**
A form that looks like any project management tool.
Enter client email.
Add milestones: "Wireframes $500", "Frontend $1000".
Pick deadline.
Click "Create Escrow".

**What happens behind the scenes:**
1. Frontend validates with Zod
2. Calls `/api/escrow/create`
3. Backend creates Solana PDA
4. Backend creates Dodo checkout session
5. Frontend shows payment link modal

**Numeric example:**
Milestones:
- Wireframes: $500
- Frontend: $1,000
- QA: $500
Total: $2,000

### Step 4: Dashboard

```
/dashboard
  → Escrow cards (grid layout)
    → Client email, total, status badge
    → Milestone progress bar
    → Click to view details
```

**What the user sees:**
Cards showing each escrow.
Green badge for FUNDED.
Progress bar showing 2/3 milestones released.

**Why this works:**
Freelancers can scan all projects at a glance.
Status badges replace technical state machines.
Progress bars replace raw transaction hashes.

### Step 5: Escrow Detail (Freelancer View)

```
/escrow/[id]
  → Escrow info (client, total, deadline)
  → Milestone list
    → Status badge per milestone
    → "Mark Delivered" button (if FUNDED)
    → "Approve Release" button (if COMPLETE, client view)
  → Funding transaction link
  → Refund button (if deadline passed)
```

**What the user sees:**
"Milestone 1: Wireframes — $500 — RELEASED"
"Milestone 2: Frontend — $1,000 — COMPLETE"
Button: "Mark Delivered" on milestone 3.

**Why this works:**
Clear next action per milestone.
No ambiguity about what to do.
Links to Solana Explorer for transparency.

### Step 6: Client Approval

```
/approve/[token]
  → Decoded from magic link token
  → Milestone details
  → "Approve Release" button
  → Signs message in browser (tweetnacl)
  → POSTs signature to backend
```

**What the user sees:**
"Approve Release for Frontend Build — $1,000"
Button: "Approve Release"
Click → "Processing..." → "Release Approved!"
Link to Solana Explorer.

**What happens behind the scenes:**
1. Token decodes to escrow_id + milestone_index
2. Browser generates ephemeral keypair from token
3. Signs message: `release:esc_abc:1:deadline`
4. POSTs to `/api/escrow/[id]/approve`
5. Backend verifies signature
6. Backend signs Solana tx
7. USDC released

**Why this works:**
Client needs zero crypto knowledge.
No wallet installation.
No seed phrases.
Just click and approve.

### Step 7: Withdraw

```
/withdraw
  → USDC balance display
  → Bank details form (account, IFSC)
  → INR rate quote (CoinDCX API)
  → "Withdraw to Bank" button (simulated)
```

**What the user sees:**
"You have $1,500 USDC"
"Estimated INR: ₹124,500"
"Withdraw to Bank"

**Why this works:**
Shows the full loop even if off-ramp is simulated.
Demonstrates real-world utility.
Sets expectation for post-hackathon integration.

## SYSTEM FLOW

### Freelancer Journey

```
Landing Page
  → "Connect Wallet"
    → Dashboard (empty state)
      → "Create Your First Escrow"
        → Create Form
          → Enter client email
          → Add milestones
          → Set deadline
          → Submit
            → Payment Link Modal
              → Copy link
                → Send to client
                  → Dashboard (shows new escrow, status: CREATED)
                    → Wait for client to pay
                      → Dashboard updates (status: FUNDED)
                        → Deliver work
                          → Click "Mark Delivered"
                            → Wait for client approval
                              → Dashboard updates (status: RELEASED)
                                → Repeat for next milestone
                                  → All milestones released → status: COMPLETED
                                    → Withdraw page → simulated INR conversion
```

### Client Journey

```
Email from freelancer
  → "Click to pay $2,000"
    → Dodo checkout page
      → Enter card details
        → Pay
          → Success page
            → (Later) Email: "Milestone complete, click to approve"
              → Magic link → /approve/[token]
                → Review milestone
                  → Click "Approve Release"
                    → Processing...
                      → Success + Solana Explorer link
```

## DESIGN DECISIONS

### Decision: Why two separate views?
**Options:** Single unified view, separate freelancer/client views
**Chosen:** Separate views
**Why:**
- Freelancers need dashboard, create, withdraw
- Clients only need approval
- Unified view would confuse both
- Separate views optimize for each persona

**Why not unified:**
- Too many buttons for the client
- Too few for the freelancer
- Role-based UI is cleaner

### Decision: Why polling over WebSockets?
**Options:** WebSockets, Server-Sent Events, polling
**Chosen:** Polling (3-second interval)
**Why:**
- Works through all firewalls
- No WebSocket server needed
- Simple to implement
- Sufficient for hackathon demo

**Why not WebSockets:**
- Requires separate server
- More complex state management
- Overkill for demo

### Decision: Why magic links for client approval?
**Options:** Client login, email OTP, magic link
**Chosen:** Magic link
**Why:**
- No account creation needed
- No password to remember
- Single-use token
- Works on any device

**Why not login:**
- Client would need to create account
- Adds friction
- Magic link is one-click

### Decision: Why dark theme?
**Options:** Light, dark, system
**Chosen:** Dark (slate-950 + emerald-400)
**Why:**
- Crypto/fintech apps use dark themes
- Reduces eye strain
- Emerald accent matches "money/growth"
- Looks premium

## TRADEOFFS

**What we gain:**
- Simple client experience (no crypto knowledge)
- Clear freelancer workflow
- Real-time status updates
- Mobile-friendly

**What we lose:**
- Real-time is actually 3-second polling
- Client view is minimal (no dashboard)
- No mobile app (web only)
- No push notifications (email only)

## FAILURE CASES

### 1. Wallet Connection Fails
**What breaks:** User can't create escrow
**Symptoms:** Wallet modal doesn't open
**Fix:** Check if wallet extension is installed
**Fallback:** Show "Install Phantom" link

### 2. Client Approval Link Expires
**What breaks:** Token becomes invalid
**Symptoms:** "Invalid or expired approval link"
**Fix:** Tokens are stateless (no expiry)
**But:** If escrow is already released, approval is rejected

### 3. Frontend Shows Stale Data
**What breaks:** Dashboard shows old status
**Symptoms:** "I just paid but it still says CREATED"
**Fix:** Polling every 3 seconds
**Fallback:** Manual refresh button

### 4. Mobile Browser Incompatibility
**What breaks:** Wallet connect fails on mobile
**Symptoms:** Phantom doesn't open
**Fix:** Use Phantom deep links
**Fallback:** Show QR code for desktop approval

### 5. Client Clicks Approve Twice
**What breaks:** Double approval attempt
**Symptoms:** Second approval fails
**Fix:** Milestone status check on backend
**Result:** Second request returns "already released"

## COMMON CONFUSION

**No, the client does not need Phantom.**
The client uses a magic link in their email. They click "Approve Release." No wallet. No crypto. Nothing.

**No, the freelancer does not manually send USDC to the client.**
The freelancer marks work as delivered. The client approves. The program automatically sends USDC. The freelancer never touches the transfer.

**No, the "Mark Delivered" button does not release funds.**
It only marks the milestone as complete. Funds are released when the client clicks "Approve."

**No, the progress bar is not a blockchain confirmation.**
It's a UI element showing milestone completion. Blockchain confirmation happens separately.

**No, the client cannot see the freelancer's wallet balance.**
The client only sees the escrow details and approval buttons. No financial data.

**No, the dashboard does not update instantly.**
It polls every 3 seconds. After payment, wait 3-15 seconds for status to change.

## WHERE IT EXISTS IN CODE

| Page | File | User |
|------|------|------|
| Landing | `app/page.tsx` | Both |
| Dashboard | `app/dashboard/page.tsx` | Freelancer |
| Create Escrow | `app/escrow/create/page.tsx` | Freelancer |
| Escrow Detail | `app/escrow/[id]/page.tsx` | Freelancer |
| Client Approval | `app/approve/[token]/page.tsx` | Client |
| Withdraw | `app/withdraw/page.tsx` | Freelancer |
| Layout | `app/layout.tsx` | Both |
| Wallet Provider | `app/components/WalletProvider.tsx` | Freelancer |
| Escrow Card | `app/components/EscrowCard.tsx` | Freelancer |
| Milestone List | `app/components/MilestoneList.tsx` | Freelancer |
| Status Badge | `app/components/StatusBadge.tsx` | Both |
| Payment Link Modal | `app/components/PaymentLinkModal.tsx` | Freelancer |
