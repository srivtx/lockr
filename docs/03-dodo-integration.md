# Dodo Payments Integration

## THE PROBLEM

International clients need to pay freelancers in fiat.
Freelancers want to receive stablecoins on Solana.
There is no native bridge between fiat and Solana smart contracts.

Current approaches fail:
- Manual bank transfer + manual USDC purchase = slow, error-prone
- Crypto wallets for clients = high friction, low adoption
- Stripe → manual settlement = not programmable, not trustless

## THE IDEA

Use Dodo Payments as the **fiat on-ramp**.
Use webhooks as the **trigger mechanism**.
Use metadata as the **bridge data**.

Dodo handles:
- Card payments
- UPI
- 40+ methods
- Webhook delivery
- Idempotency

Our backend handles:
- Webhook verification
- Database state updates
- Solana transaction relay

**Analogy:**
Like a hotel reception desk.
The guest (client) pays at the front desk (Dodo checkout).
The front desk system (Dodo) notifies housekeeping (our backend).
Housekeeping unlocks the room (funds the escrow).
The guest never interacts with the room lock directly.

## HOW IT WORKS (STEP-BY-STEP)

### Step 1: Create Checkout Session

```typescript
const session = await dodoClient.checkoutSessions.create({
  product_cart: [{ product_id: "prod_escrow", quantity: 1 }],
  metadata: {
    escrow_id: "esc_7aBc9",
    solana_pda_address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    freelancer_wallet: "APDEtHHZ2WvUbDgTpPiPj5M2t5mGqF8zQf..."
  },
  return_url: "https://trustlock.app/checkout/success",
  cancel_url: "https://trustlock.app/checkout/cancel",
});
```

**What happens:**
Dodo creates a checkout session.
Returns a URL: `https://test.checkout.dodopayments.com/session/cks_Gi6KGJ...`
Metadata is stored and attached to the payment.

**Numeric example:**
Total amount: $2,000
Dodo fee: 4% + $0.40 = $80.40
Net to us: $1,919.60
(We don't care about net for hackathon — we just need the webhook)

### Step 2: Client Pays

Client opens checkout URL.
Enters card details.
Clicks "Pay $2,000".
Dodo processes payment.

**What the client sees:**
A normal checkout page.
No mention of crypto, Solana, or USDC.
Just "Pay $2,000 for Project Escrow".

### Step 3: Dodo Fires Webhook

```json
{
  "business_id": "bus_H4ekzPSlcg",
  "type": "payment.succeeded",
  "timestamp": "2026-05-04T06:15:00.000000Z",
  "data": {
    "payment_id": "pay_1234567890",
    "status": "succeeded",
    "metadata": {
      "escrow_id": "esc_7aBc9",
      "solana_pda_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
    },
    "total_amount": 200000,
    "currency": "USD"
  }
}
```

**What happens:**
Dodo sends POST to `https://api.trustlock.app/api/webhooks/dodo`.
Includes HMAC signature in headers.
Includes all metadata we attached.

### Step 4: Backend Verifies Webhook

```typescript
const unwrapped = dodoClient.webhooks.unwrap(rawBody, {
  headers: {
    'webhook-id': webhookId,
    'webhook-signature': webhookSignature,
    'webhook-timestamp': webhookTimestamp,
  },
});
```

**What happens:**
Backend verifies HMAC SHA256.
Checks `webhook-id` against database (idempotency).
If already processed, returns 200 immediately.
If new, proceeds to enqueue job.

**Why this matters:**
Without verification, anyone can POST fake webhooks.
Without idempotency, one payment funds the escrow twice.

### Step 5: Enqueue Solana Transaction

```typescript
await solanaTxQueue.add('fund-escrow', {
  paymentId: 'pay_1234567890',
  escrowId: 'esc_7aBc9',
  solanaPda: '7xKXtg2...',
}, {
  jobId: 'pay_1234567890',  // Prevents duplicates
  attempts: 5,
  backoff: { type: 'exponential', delay: 5000 }
});
```

**What happens:**
Job is stored in Redis.
Worker picks it up.
If worker crashes, job retries automatically.
If Solana RPC fails, job retries with backoff.

### Step 6: Worker Funds Escrow

```typescript
const tx = await buildFundMilestoneTx(
  escrow.escrowId,
  milestone.index,
  seed,
  escrowPda,
  freelancerWallet
);
const signature = await signAndSendTransaction(tx);
```

**What happens:**
Worker signs and sends Solana tx.
USDC moves from backend treasury to escrow PDA.
Database updates: Escrow.status = FUNDED.

**Numeric example:**
Before: Escrow PDA = 0 USDC
After: Escrow PDA = 500_000_000 USDC (= $500)

## SYSTEM FLOW

```
Frontend: Create Escrow
  → POST /api/escrow/create
    → Solana: create_escrow → PDA created
    → POST /api/checkout
      → Dodo API: checkoutSessions.create
        → Returns { checkout_url }
          → Frontend displays payment link

Client Browser:
  → Opens checkout_url
    → Dodo hosted page
      → Enters card details
        → Clicks Pay
          → Dodo processes $2,000
            → Dodo fires webhook

Backend:
  → POST /api/webhooks/dodo
    → Verify HMAC signature
      → Check idempotency (PaymentEvent table)
        → If new: enqueue BullMQ job
          → Worker: buildFundMilestoneTx
            → Solana: fund_escrow
              → USDC → escrow PDA
                → DB: Escrow.status = FUNDED
```

## DESIGN DECISIONS

### Decision: Why use metadata to bridge Dodo and Solana?
**Options:** Separate database lookup, metadata field
**Chosen:** Metadata field
**Why:**
- Dodo persists metadata through the entire lifecycle
- Metadata appears in webhook payload automatically
- No database lookup needed during webhook processing
- Reduces latency by one DB query

**Why not separate lookup:**
- Would require querying DB by checkout_session_id
- Adds 50-100ms latency
- More complex webhook handler

### Decision: Why return 200 immediately and queue?
**Options:** Block until Solana confirms, return 200 immediately
**Chosen:** Return 200 immediately
**Why:**
- Dodo webhook timeout is 15 seconds
- Solana confirmation takes 2-8 seconds
- If we block, Dodo might retry → duplicate funding
- Queue decouples HTTP response from blockchain latency

**Numeric example:**
Block approach:
- Dodo webhook → verify (100ms) → Solana tx (3s) → confirm (5s) = 8.1s
- Risk: Dodo timeout at 15s, but what if devnet is slow?

Queue approach:
- Dodo webhook → verify (100ms) → enqueue (50ms) = 0.15s
- Worker: Solana tx (3s) → confirm (5s) = 8s (offline)
- Zero risk of Dodo timeout

### Decision: Why exponential backoff for retries?
**Options:** Fixed interval, linear backoff, exponential backoff
**Chosen:** Exponential backoff (5s, 10s, 20s, 40s, 80s)
**Why:**
- Solana devnet congestion is bursty
- Immediate retry likely fails again
- Exponential gives network time to recover
- Max 5 attempts = total wait ~2.5 minutes

**Why not fixed:**
- Fixed 5s: 5 retries in 25s, all might fail if congestion lasts 30s
- Exponential: last retry at 80s, likely after congestion clears

## TRADEOFFS

**What we gain:**
- Client pays with familiar checkout (no crypto)
- 40+ payment methods including UPI
- Automatic webhook retry (8 attempts)
- Idempotency built-in

**What we lose:**
- Dodo test mode may not support all regions
- Webhook delivery is async (not instant)
- Dodo fee (4% + $0.40) vs direct crypto (0.1%)
- We act as intermediary (need USDC treasury)

## FAILURE CASES

### 1. Webhook Signature Mismatch
**What breaks:** Payment is ignored
**Symptoms:** 401 response, payment never funds escrow
**Fix:** Check `DODO_WEBHOOK_KEY` env var matches Dodo dashboard

### 2. Duplicate Webhook
**What breaks:** Escrow funded twice
**Symptoms:** Two Solana transactions for same payment
**Fix:** Unique constraint on `PaymentEvent.dodoPaymentId` + BullMQ `jobId`

### 3. Metadata Missing
**What breaks:** Can't link payment to escrow
**Symptoms:** Payment succeeds but escrow stays CREATED
**Fix:** Validate metadata exists before creating checkout

### 4. Dodo Test Mode Limitations
**What breaks:** Client can't complete payment
**Symptoms:** Checkout page shows error
**Fix:** Verify test mode supports client's region/card

### 5. Webhook URL Not Accessible
**What breaks:** Dodo can't reach our server
**Symptoms:** No webhook received
**Fix:** Use Railway/Render public URL, not localhost

## COMMON CONFUSION

**No, Dodo does not handle the Solana transaction.**
Dodo only fires a webhook. Our backend handles the Solana tx. Dodo has zero crypto integration.

**No, the client does not pay in USDC.**
The client pays in fiat (USD, INR, etc.). Our backend converts the fiat signal into a USDC transfer.

**No, the 4% Dodo fee is not the same as our fee.**
Dodo takes 4% for processing fiat. We take nothing (MVP). The freelancer's only cost is the Solana tx fee ($0.001).

**No, we do not need a Dodo merchant account for every freelancer.**
We have one Dodo account. All payments go through our checkout. Freelancers don't need their own Dodo accounts.

**No, the webhook is not instant.**
Webhook fires after Dodo confirms the payment. This can take 1-10 seconds depending on the payment method.

**No, we cannot force-release without the client's approval.**
The Solana program requires a valid client signature. We cannot forge it. The backend only relays verified signatures.

## WHERE IT EXISTS IN CODE

| Component | File |
|-----------|------|
| Dodo client setup | `src/lib/dodo.ts` |
| Webhook handler | `app/api/webhooks/dodo/route.ts` |
| Checkout creation | `app/api/checkout/route.ts` |
| Checkout API call | `app/escrow/create/page.tsx` |
| Worker funding | `src/worker/index.ts` |
| PaymentEvent model | `prisma/schema.prisma` |
