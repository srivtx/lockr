# Database Design

## THE PROBLEM

A freelance escrow platform needs to track:
- Escrows (who, what, when, how much)
- Milestones (progress, status, amounts)
- Payments (Dodo events, idempotency)
- All while staying in sync with Solana on-chain state

One wrong relation = orphaned milestones.
One missing index = slow dashboard queries.
One race condition = double-funding.

## THE IDEA

Three core tables:
1. **Escrow** — The contract
2. **Milestone** — The deliverables
3. **PaymentEvent** — The fiat bridge

**Analogy:**
Like a wedding planner's binder.
The binder (Escrow) holds the contract.
Each checklist item (Milestone) tracks a task.
Each vendor receipt (PaymentEvent) proves payment.
All three bind together to tell the full story.

## HOW IT WORKS (STEP-BY-STEP)

### Step 1: Create Escrow

```sql
INSERT INTO escrows (
  escrow_id,          -- "esc_7aBc9"
  solana_pda,         -- "7xKXtg2..."
  freelancer_wallet,  -- "APDEtHH..."
  client_email,       -- "client@company.com"
  client_email_hash,  -- "a3f5c2..."
  total_amount,       -- 2000000000 ($2,000, 6 decimals)
  status,             -- CREATED
  deadline,           -- 2026-05-18T00:00:00Z
  seed                -- 42
) VALUES (...);

INSERT INTO milestones (
  escrow_id,     -- FK to escrows
  index,         -- 0, 1, 2
  description,   -- "Wireframes"
  amount,        -- 500000000 ($500)
  status         -- PENDING
) VALUES (...), (...), (...);
```

**What happens:**
One escrow row.
Three milestone rows.
All linked by `escrow_id`.

### Step 2: Dodo Webhook Arrives

```sql
INSERT INTO payment_events (
  dodo_payment_id,         -- "pay_1234567890"
  dodo_checkout_session_id, -- "cks_Gi6KG..."
  status,                   -- "succeeded"
  metadata,                 -- { escrow_id: "esc_7aBc9" }
  escrow_id                 -- FK to escrows
) VALUES (...);
```

**What happens:**
Payment event linked to escrow.
`dodo_payment_id` is UNIQUE → prevents duplicates.
If duplicate webhook arrives: `P2002` error → idempotency.

### Step 3: Worker Funds Milestone

```sql
BEGIN;
  UPDATE milestones
  SET status = 'FUNDED'
  WHERE id = 'milestone_0' AND status = 'PENDING';

  UPDATE escrows
  SET status = 'FUNDED',
      funding_signature = '5xK...'
  WHERE id = 'escrow_123';
COMMIT;
```

**What happens:**
Atomic transaction.
Both updates succeed or both fail.
No partial state.

### Step 4: Client Approves Release

```sql
BEGIN;
  UPDATE milestones
  SET status = 'RELEASED',
      released_at = NOW()
  WHERE id = 'milestone_0';

  -- Check if all milestones released
  SELECT COUNT(*) FROM milestones
  WHERE escrow_id = 'escrow_123'
  AND status != 'RELEASED';

  -- If count = 0
  UPDATE escrows
  SET status = 'COMPLETED'
  WHERE id = 'escrow_123';
COMMIT;
```

**What happens:**
Milestone marked released.
If all milestones released, escrow completed.

## SYSTEM FLOW

### Schema Diagram

```
Escrow (1)
├── id: String @id
├── escrow_id: String @unique
├── solana_pda: String @unique
├── freelancer_wallet: String
├── client_email: String
├── client_email_hash: String
├── client_public_key: String?
├── total_amount: BigInt
├── status: EscrowStatus
├── deadline: DateTime
├── seed: BigInt
├── funding_signature: String?
├── created_at: DateTime
├── updated_at: DateTime
│
├── milestones: Milestone[] (1:N)
└── payment_events: PaymentEvent[] (1:N)

Milestone (N)
├── id: String @id
├── escrow_id: String @map("escrow_id")
├── index: Int
├── description: String
├── amount: BigInt
├── status: MilestoneStatus
├── deliverable_url: String?
├── completed_at: DateTime?
├── released_at: DateTime?
│
└── escrow: Escrow (N:1)

PaymentEvent (N)
├── id: String @id
├── dodo_payment_id: String @unique
├── dodo_checkout_session_id: String
├── status: String
├── metadata: Json?
├── signature: String?
├── completed_at: DateTime?
├── escrow_id: String?
│
└── escrow: Escrow? (N:1)
```

## DESIGN DECISIONS

### Decision: Why separate Escrow and Milestone tables?
**Options:** Single table with JSON milestones, separate tables
**Chosen:** Separate tables
**Why:**
- Query milestones independently
- Update milestone status without rewriting entire escrow
- Type-safe relations in Prisma
- Index milestone status for dashboard queries

**Why not JSON:**
- Can't index milestone status
- Hard to query "all pending milestones"
- No foreign key constraints

### Decision: Why BigInt for amounts?
**Options:** Float, Decimal, BigInt
**Chosen:** BigInt
**Why:**
- USDC uses 6 decimals ($1.00 = 1_000_000)
- Float introduces precision errors (0.1 + 0.2 != 0.3)
- BigInt is exact
- JavaScript supports BigInt natively

**Numeric example:**
Amount: $500.00
Float: 500.00 (precise now, but 500.0000001 after math)
BigInt: 500000000 (exact, no math errors)

### Decision: Why UUID for IDs?
**Options:** Auto-increment, UUID, custom format
**Chosen:** CUID (Prisma default)
**Why:**
- Unique across distributed systems
- No sequence prediction
- URL-safe
- Prisma generates automatically

**Why not auto-increment:**
- Predictable (escrow #1, #2, #3)
- Hard to shard
- Leaks creation order

### Decision: Why indexes on freelancer_wallet and status?
**Options:** No indexes, single index, composite index
**Chosen:** Separate indexes
**Why:**
- Dashboard queries: `WHERE freelancer_wallet = ?`
- Status filtering: `WHERE status = 'FUNDED'`
- Without indexes: table scan on every page load
- With indexes: O(log n) lookup

**Numeric example:**
10,000 escrows.
No index: scan all 10,000 rows = 50ms.
With index: btree lookup = 1ms.

## TRADEOFFS

**What we gain:**
- Type-safe queries via Prisma
- Atomic transactions
- Indexed lookups
- Relational integrity

**What we lose:**
- PostgreSQL dependency (can't use SQLite)
- Migration overhead (schema changes require migration)
- Connection pool limits (10 concurrent by default)

## FAILURE CASES

### 1. Orphaned Milestones
**What breaks:** Milestone exists but escrow was deleted
**Cause:** `ON DELETE CASCADE` not set
**Mitigation:**
- Prisma relation with `onDelete: Cascade`
- Orphaned milestones can't happen

### 2. Duplicate Escrow IDs
**What breaks:** Two escrows with same `escrow_id`
**Cause:** UUID collision (theoretically possible)
**Probability:** 1 in 2^122 (effectively zero)
**Mitigation:**
- `@unique` constraint on `escrow_id`
- If collision: Prisma throws P2002

### 3. Payment Event Without Escrow
**What breaks:** Dodo webhook references non-existent escrow
**Cause:** Metadata tampering or race condition
**Mitigation:**
- `escrow_id` is optional (nullable)
- Webhook handler checks if escrow exists
- If not: logs error, returns 200 (don't retry)

### 4. Status Enum Mismatch
**What breaks:** Frontend sends "completed" but DB expects "COMPLETED"
**Cause:** Case sensitivity
**Mitigation:**
- Prisma enums are case-sensitive
- API routes validate with Zod before writing
- Frontend uses exact enum values

### 5. Race Condition on Fund
**What breaks:** Two workers fund same milestone
**Cause:** Dodo webhook duplicate + queue dedup failure
**Mitigation:**
- `WHERE status = 'PENDING'` in update query
- If already funded: update affects 0 rows
- Worker checks affected rows and skips

## COMMON CONFUSION

**No, `total_amount` is not in dollars.**
It's in USDC base units (6 decimals). $2,000 is stored as 2_000_000_000.

**No, `escrow_id` is not the same as `id`.**
`id` is the database primary key (CUID).
`escrow_id` is the business identifier used in URLs and Solana seeds.

**No, deleting an escrow does not delete Solana data.**
The database row is gone. The PDA still exists on-chain.
This is intentional. The blockchain is the source of truth.

**No, `client_email_hash` is not encrypted.**
It's a SHA-256 hash. It's one-way. We can't recover the email from the hash.
We only use it for signature verification.

**No, `PaymentEvent` is not the same as a Solana transaction.**
`PaymentEvent` tracks the Dodo fiat payment.
The Solana transaction is tracked by `funding_signature` on the Escrow.

**No, the database does not store USDC balances.**
USDC balances are on-chain. The database only tracks status and metadata.

## WHERE IT EXISTS IN CODE

| Concept | File | Line |
|---------|------|------|
| Escrow model | `prisma/schema.prisma` | ~10 |
| Milestone model | `prisma/schema.prisma` | ~30 |
| PaymentEvent model | `prisma/schema.prisma` | ~47 |
| EscrowStatus enum | `prisma/schema.prisma` | ~62 |
| MilestoneStatus enum | `prisma/schema.prisma` | ~73 |
| Prisma client | `src/lib/prisma.ts` | ~5 |
| Escrow creation | `app/api/escrow/create/route.ts` | ~30 |
| Webhook handler | `app/api/webhooks/dodo/route.ts` | ~15 |
| Status API | `app/api/escrow/[id]/status/route.ts` | ~10 |
