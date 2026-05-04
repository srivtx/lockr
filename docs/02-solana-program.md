# Solana Escrow Program

## THE PROBLEM

Building a trustless escrow on Solana requires:
- Holding USDC in a program-controlled account
- Enforcing release conditions (client approval, deadlines)
- Preventing double-spending
- Handling multiple milestones

Raw Solana programs are 500+ lines of manual serialization.
One wrong byte in account validation drains the escrow.

## THE IDEA

An Anchor program that acts as a **neutral vending machine** for freelance payments.

The program:
- Creates a PDA (Program Derived Address) to hold escrow state
- Accepts USDC via SPL Token CPI
- Releases USDC only when conditions are met
- Refunds automatically after deadlines

**Analogy:**
Like a smart locker at a train station.
The buyer puts money in.
The locker holds the money.
The seller puts the item in.
The buyer scans their QR code.
The locker opens and releases both.
No attendant needed. No trust required.

## HOW IT WORKS (STEP-BY-STEP)

### Step 1: Create Escrow PDA

```rust
pub fn create_escrow(
    ctx: Context<CreateEscrow>,
    escrow_id: String,           // e.g., "esc_abc123"
    client_email: String,        // "client@company.com"
    total_amount: u64,           // 2_000_000_000 (=$2,000, 6 decimals)
    deadline: i64,               // Unix timestamp
    milestones: Vec<Milestone>,  // [{desc: "Wireframes", amount: 500_000_000}]
    seed: u64,                   // Random nonce for unique PDA
) -> Result<()>
```

The program derives a PDA:
```
seeds = [b"escrow", escrow_id.as_bytes(), freelancer.key().as_ref(), seed.to_le_bytes()]
```

This PDA is:
- Deterministic (same inputs → same address)
- Program-controlled (no private key exists)
- Unique per escrow (seed prevents collision)

**Numeric example:**
Escrow ID: "esc_7aBc9"
Freelancer: `APDEtHHZ2WvUbDgTpPiPj5M2t5mGqF8zQf...`
Seed: 42
PDA: `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`

### Step 2: Fund Escrow

```rust
pub fn fund_escrow(
    ctx: Context<FundEscrow>,
    escrow_id: String,
    milestone_index: u8,  // Which milestone to fund
    seed: u64,
) -> Result<()>
```

The program:
1. Verifies the payer is the backend authority
2. Creates escrow ATA if it doesn't exist (init_if_needed)
3. Transfers USDC from payer ATA to escrow ATA via CPI
4. Updates milestone status to `Funded`
5. Updates escrow status to `Funded`

**Numeric example:**
Milestone 0 amount: $500 = 500_000_000 USDC base units
Payer ATA balance: 1_000_000_000
After transfer:
- Payer ATA: 500_000_000
- Escrow ATA: 500_000_000

### Step 3: Release Milestone

```rust
pub fn release_milestone(
    ctx: Context<ReleaseMilestone>,
    escrow_id: String,
    milestone_index: u8,
    seed: u64,
    client_signature: [u8; 64],
) -> Result<()>
```

The program:
1. Verifies the authority (backend relayer) signed
2. Checks milestone is in `Funded` or `Complete` status
3. Verifies client signature matches stored hash
4. Transfers USDC from escrow ATA to freelancer ATA
5. Updates milestone status to `Released`

**Numeric example:**
Escrow ATA: 500_000_000
Freelancer ATA: 0
After release:
- Escrow ATA: 0
- Freelancer ATA: 500_000_000

### Step 4: Refund

```rust
pub fn refund(
    ctx: Context<Refund>,
    escrow_id: String,
    seed: u64,
) -> Result<()>
```

The program:
1. Verifies caller is freelancer OR backend authority
2. Checks `Clock::get()?.unix_timestamp > escrow.deadline`
3. Verifies escrow is NOT already `Released`
4. Transfers ALL remaining USDC from escrow ATA back to payer
5. Updates escrow status to `Refunded`

**Numeric example:**
Deadline: May 18, 2026 00:00:00 UTC = 1752825600
Current time: May 20, 2026 00:00:00 UTC = 1752912000
1752912000 > 1752825600 → TRUE → refund allowed

### Step 5: Dispute

```rust
pub fn dispute(
    ctx: Context<Dispute>,
    escrow_id: String,
    seed: u64,
    client_signature: [u8; 64],
) -> Result<()>
```

The program:
1. Verifies caller is freelancer OR client (via signature)
2. Sets escrow status to `Disputed`
3. Only arbiter (program authority) can resolve in MVP

## SYSTEM FLOW

### Full Escrow Lifecycle

```
Freelancer calls create_escrow
  → Program derives PDA
    → Initializes Escrow state
      → Status: Pending
        → Milestones: [Pending, Pending, Pending]
          → PDA address returned

Dodo webhook triggers fund_escrow(milestone_index=0)
  → Program checks authority
    → CPI transfer: payer ATA → escrow ATA
      → Milestone[0].status = Funded
        → Escrow.status = Funded

Freelancer delivers work
  → Backend marks milestone Complete (off-chain)

Client clicks approve link
  → Signs message: "release:esc_7aBc9:0:1752825600"
    → Backend verifies signature
      → Calls release_milestone
        → CPI transfer: escrow ATA → freelancer ATA
          → Milestone[0].status = Released

If client ghosts for 14 days
  → Freelancer calls refund
    → Program checks: Clock > deadline
      → TRUE
        → CPI transfer: escrow ATA → payer ATA
          → Escrow.status = Refunded
```

## DESIGN DECISIONS

### Decision: Why PDA instead of regular account?
**Options:** Regular account, PDA
**Chosen:** PDA
**Why:**
- No private key to manage or lose
- Deterministic address (can compute off-chain)
- Program has sole control
- Cannot be drained by external key compromise

**Why not regular account:**
- Requires keypair management
- Risk of private key exposure
- No deterministic derivation

### Decision: Why SPL Token CPI for USDC transfer?
**Options:** Manual token program invocation, SPL Token CPI
**Chosen:** SPL Token CPI via Anchor's `token::transfer`
**Why:**
- Type-safe account validation
- Automatic ATA handling
- 3 lines vs 30 lines of manual Rust

**Why not manual:**
- Error-prone account ordering
- No compile-time safety
- Harder to audit

### Decision: Why off-chain signature verification?
**Options:** On-chain ed25519 verification, off-chain verification + relay
**Chosen:** Off-chain verification
**Why:**
- Solana compute budget is expensive for crypto ops
- Client is a fiat user, not a crypto user
- Simpler program logic
- Backend can do additional checks (rate limiting, fraud detection)

**Why not on-chain:**
- 2,000+ compute units per verification
- Complex instruction layout
- Harder to test

### Decision: Why Vec<Milestone> instead of fixed array?
**Options:** Fixed [Milestone; 5], Vec<Milestone>
**Chosen:** Vec<Milestone> with max 5
**Why:**
- Variable number of milestones (1-5)
- Anchor handles serialization automatically
- Matches real-world project structures

**Tradeoff:**
Vec uses more compute units than fixed array.
We cap at 5 to stay within budget.

## TRADEOFFS

**What we gain:**
- Trustless escrow (no single party controls funds)
- Immutable state (no one can edit history)
- 3-second settlement
- $0.001 transaction cost

**What we lose:**
- Devnet only (not production-ready)
- Off-chain signature verification (backend is a trusted relay)
- Manual dispute resolution (no decentralized jury)
- USDC float requirement (backend needs USDC treasury)

## FAILURE CASES

### 1. PDA Collision
**What breaks:** Two escrows with same ID + same freelancer + same seed
**Probability:** Near zero with UUID + random seed
**Mitigation:** UUID (2^122 combinations) + 64-bit random seed

### 2. Insufficient Compute Budget
**What breaks:** Transaction fails with "exceeded compute budget"
**Mitigation:**
- Cap milestones at 5
- Use `init_if_needed` sparingly
- Test with `solana-test-validator`

### 3. ATA Not Initialized
**What breaks:** Transfer fails because escrow ATA doesn't exist
**Mitigation:**
- `init_if_needed` on escrow ATA in fund instruction
- Pre-create ATA during escrow creation (optional)

### 4. Client Signature Replay
**What breaks:** Same signature used to release twice
**Mitigation:**
- Milestone status check: only `Funded` or `Complete` can be released
- Once released, status becomes `Released` → prevents double-release

### 5. Clock Manipulation
**What breaks:** Validator manipulates clock to trigger early refund
**Mitigation:**
- Devnet only for hackathon
- Mainnet: use oracle or decentralized time source
- Acceptable risk for MVP

## COMMON CONFUSION

**No, the PDA is not a regular wallet.**
A PDA has no private key. Only the program can sign for it. This is why it's trustless.

**No, USDC does not sit in our backend server.**
USDC sits in the PDA on Solana. The backend only triggers the program. It cannot steal funds.

**No, the client does not sign a Solana transaction.**
The client signs an off-chain message. The backend verifies it and submits the Solana tx.

**No, we cannot edit escrow data after creation.**
Solana accounts are immutable unless the program explicitly allows updates. Our program does not allow editing milestones or amounts after creation.

**No, the refund is not instant.**
The refund only works AFTER the deadline. Before the deadline, the client can still approve release.

**No, the program does not handle INR conversion.**
The program only handles USDC. INR conversion happens off-chain via exchange APIs.

## WHERE IT EXISTS IN CODE

| Instruction | File | Line |
|-------------|------|------|
| create_escrow | `programs/trustlock/src/instructions/create_escrow.rs` | ~40 |
| fund_escrow | `programs/trustlock/src/instructions/fund_escrow.rs` | ~50 |
| release_milestone | `programs/trustlock/src/instructions/release_milestone.rs` | ~60 |
| refund | `programs/trustlock/src/instructions/refund.rs` | ~50 |
| dispute | `programs/trustlock/src/instructions/dispute.rs` | ~30 |
| Escrow state | `programs/trustlock/src/state/escrow.rs` | ~40 |
| Error definitions | `programs/trustlock/src/errors.rs` | ~20 |
| Program entrypoint | `programs/trustlock/src/lib.rs` | ~70 |
| IDL | `target/idl/trustlock.json` | Auto-generated |
| Tests | `tests/trustlock.ts` | ~100 |
| Backend integration | `src/lib/solana.ts` | ~150 |
