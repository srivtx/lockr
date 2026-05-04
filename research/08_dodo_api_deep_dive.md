# Dodo Payments API — Dense Technical Reference

## Source
- https://docs.dodopayments.com/api-reference/introduction
- https://docs.dodopayments.com/llms.txt
- Research date: 2026-05-04

---

## 1. Environments, Base URLs & Authentication

| Environment | Base URL | Dashboard mode |
|---|---|---|
| **Test / Sandbox** | `https://test.dodopayments.com` | `test_mode` |
| **Live** | `https://live.dodopayments.com` | `live_mode` |

**Authentication:** Bearer token in `Authorization` header.

**Rate limits (Tier 0 default):**
- Burst: 40 req/s
- Sustained: 240 req/min

---

## 2. Checkout Sessions API

### Create a session
`POST /checkouts`

**Minimum request body**
```json
{
  "product_cart": [
    { "product_id": "prod_xxx", "quantity": 1 }
  ]
}
```

**Key fields:**
| Field | Type | Description |
|---|---|---|
| `product_cart` | **required** array | `{ product_id, quantity, addons?, amount? }` |
| `metadata` | object<string,string> | **Custom metadata attached to payment.** Keys max 40 chars, values max 500 chars, max 50 pairs. |
| `customer` | object | `{ customer_id }` or `{ email, name?, phone_number? }` |
| `return_url` | string | Redirect after success/failure |
| `cancel_url` | string | Redirect if cancelled |
| `confirm` | boolean | If `true`, session finalized immediately, valid for **15 min** (default **24 h**) |
| `customization` | object | Theme, language, UI controls |
| `feature_flags` | object | `redirect_immediately`, `allow_discount_code`, etc. |
| `subscription_data` | object | Trial period, on-demand mandate |
| `discount_code` | string | Pre-applied coupon |
| `billing_currency` | string | Override currency |
| `custom_fields` | array (max 5) | Extra fields at checkout |

**Example request with metadata**
```json
{
  "product_cart": [{ "product_id": "prod_escrow_credits", "quantity": 1 }],
  "return_url": "https://myapp.com/checkout/return",
  "metadata": {
    "escrow_id": "esc_7aBc9",
    "solana_pda_address": "APDEtHHZ2WvUbDgTpPiPj5M2t5mGqF8zQf..."
  },
  "customer": { "email": "buyer@example.com", "name": "Alice" },
  "billing_address": { "country": "US", "zipcode": "94102" },
  "feature_flags": { "redirect_immediately": true }
}
```

**Response**
```json
{
  "session_id": "cks_Gi6KGJ2zFJo9rq9Ukifwa",
  "checkout_url": "https://test.checkout.dodopayments.com/session/cks_Gi6KGJ2zFJo9rq9Ukifwa"
}
```

### Preview pricing
`POST /checkouts/preview` — same body as create. Returns `CalculateSessionResponse` with price breakdown.

### Retrieve session
`GET /checkouts/{id}`
```json
{
  "id": "cks_xxx",
  "payment_id": "pay_xxx",
  "payment_status": "succeeded",
  "customer_email": "alice@example.com"
}
```

---

## 3. Payments API

### Get payment detail
`GET /payments/{payment_id}`

Key fields:
| Field | Notes |
|---|---|
| `payment_id` | e.g. `pay_xxx` |
| `status` | `succeeded`, `failed`, `cancelled`, `processing` |
| `metadata` | **Metadata from checkout creation is surfaced here.** |
| `checkout_session_id` | Link back to originating session |
| `total_amount` | Smallest currency unit (cents) |
| `currency` / `settlement_currency` | Adaptive pricing data |
| `product_cart` | Array of `{ product_id, quantity }` |
| `subscription_id` | Present if payment started subscription |
| `refunds[]` | Refund status |
| `invoice_id` / `invoice_url` | Invoice PDF link |
| `custom_field_responses` | Customer answers to checkout fields |

> **Deprecation notice:** `POST /payments` is deprecated. Use Checkout Sessions for all new integrations.

---

## 4. Webhooks

### Event types emitted

| Category | Events |
|---|---|
| **Payment** | `payment.succeeded`, `payment.failed`, `payment.processing`, `payment.cancelled` |
| **Subscription** | `subscription.active`, `subscription.updated`, `subscription.on_hold`, `subscription.renewed`, `subscription.plan_changed`, `subscription.cancelled`, `subscription.failed`, `subscription.expired` |
| **Refund** | `refund.succeeded`, `refund.failed` |
| **Dispute** | `dispute.opened`, `dispute.expired`, `dispute.accepted`, `dispute.cancelled`, `dispute.challenged`, `dispute.won`, `dispute.lost` |
| **Credit** | `credit.added`, `credit.deducted`, `credit.expired`, `credit.rolled_over`, `credit.rollover_forfeited`, `credit.overage_charged`, `credit.manual_adjustment`, `credit.balance_low` |
| **Recovery** | `abandoned_checkout.detected`, `abandoned_checkout.recovered` |
| **License Key** | `license_key.created` |

### Delivery headers
```http
webhook-id: msg_xxx
webhook-signature: v1,<base64_hmac>
webhook-timestamp: 1722755700
```

### Payload envelope
```json
{
  "business_id": "bus_xxx",
  "type": "payment.succeeded",
  "timestamp": "2025-08-04T06:15:00.000000Z",
  "data": {
    "payload_type": "Payment",
    "payment_id": "pay_1234567890",
    "status": "succeeded",
    "metadata": {
      "escrow_id": "esc_7aBc9",
      "solana_pda_address": "APDEtHHZ2WvUbDgTpPiPj5M2t5mGqF8zQf..."
    },
    "customer": { "customer_id": "cus_xxx", "name": "Alice", "email": "alice@example.com" },
    "billing": { "country": "US", "city": "San Francisco", "state": "CA", "zipcode": "94102" },
    "checkout_session_id": "cks_Gi6KGJ2zFJo9rq9Ukifwa",
    "payment_method": "card",
    "card_last_four": "4242",
    "total_amount": 2999,
    "currency": "USD",
    "tax": 199,
    "settlement_amount": 2800,
    "settlement_currency": "USD",
    "product_cart": [{ "product_id": "prod_escrow_credits", "quantity": 1 }],
    "refunds": [],
    "disputes": [],
    "created_at": "2025-08-04T06:14:00.000000Z"
  }
}
```

### Signature verification (HMAC SHA256)
Dodo follows the **Standard Webhooks** specification.

**SDK verification (recommended)**
```typescript
const client = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
});

const unwrapped = client.webhooks.unwrap(rawBody, {
  headers: {
    'webhook-id': req.headers['webhook-id'],
    'webhook-signature': req.headers['webhook-signature'],
    'webhook-timestamp': req.headers['webhook-timestamp'],
  },
});
```

### Retries & idempotency
- Timeout: **15 seconds**
- Retries (8 total): immediate, 5s, 5min, 30min, 2h, 5h, 10h, 10h
- Return **2xx** to acknowledge. Use `webhook-id` for idempotency.

---

## 5. Credit-Based Billing & Usage Events

### Credit entitlements
`POST /credit-entitlements`

```json
{
  "name": "Escrow Credits",
  "precision": 0,
  "unit": "Escrow Credits",
  "rollover_enabled": false,
  "overage_enabled": false,
  "expires_after_days": 90,
  "currency": "USD",
  "price_per_unit": "1.00"
}
```

Response prefix: `cde_`.

### Manual ledger adjustments
`POST /credit-entitlements/{credit_entitlement_id}/balances/{customer_id}/ledger-entries`

```json
{
  "entry_type": "credit",
  "amount": "100",
  "reason": "Escrow deposit",
  "idempotency_key": "uuid-v4",
  "metadata": { "escrow_id": "esc_7aBc9" }
}
```

### Usage event ingestion
`POST /events/ingest`

```json
{
  "events": [
    {
      "event_id": "evt_001",
      "customer_id": "cus_xxx",
      "event_name": "escrow.milestone.completed",
      "timestamp": "2025-08-04T06:15:00Z",
      "metadata": { "milestone": "delivery", "escrow_id": "esc_7aBc9" }
    }
  ]
}
```

Limits: max **1,000 events** per request; `event_id` is idempotent.

> ⚠️ **Important:** Dodo Credits are a **virtual balance** tracked by Dodo. They do **not** hold actual fiat funds in escrow.

---

## 6. Next.js / TypeScript Integration

### Install
```bash
npm install dodopayments
```

### Environment variables
```bash
DODO_PAYMENTS_API_KEY=your_api_key
DODO_PAYMENTS_WEBHOOK_KEY=your_webhook_secret
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_PAYMENTS_RETURN_URL=https://yourdomain.com/checkout/return
```

### Create checkout session (`app/api/checkout/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';

const client = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode') ?? 'live_mode',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session = await client.checkoutSessions.create({
      product_cart: body.product_cart,
      return_url: body.return_url ?? process.env.DODO_PAYMENTS_RETURN_URL,
      metadata: {
        escrow_id: body.escrow_id,
        solana_pda_address: body.solana_pda_address,
        ...body.metadata,
      },
      customer: body.customer,
      billing_address: body.billing_address,
      feature_flags: body.feature_flags,
      discount_code: body.discount_code,
      subscription_data: body.subscription_data,
      confirm: body.confirm ?? false,
      short_link: body.short_link ?? false,
    });

    return NextResponse.json({
      session_id: session.session_id,
      checkout_url: session.checkout_url,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

### Receive & verify webhooks (`app/api/webhooks/dodo/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';

const client = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,
  environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode') ?? 'live_mode',
});

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const webhookId = req.headers.get('webhook-id') ?? '';
  const webhookSignature = req.headers.get('webhook-signature') ?? '';
  const webhookTimestamp = req.headers.get('webhook-timestamp') ?? '';

  try {
    const unwrapped = client.webhooks.unwrap(rawBody, {
      headers: {
        'webhook-id': webhookId,
        'webhook-signature': webhookSignature,
        'webhook-timestamp': webhookTimestamp,
      },
    });

    switch (unwrapped.type) {
      case 'payment.succeeded':
        console.log('Payment succeeded', unwrapped.data.payment_id, unwrapped.data.metadata);
        break;
      case 'payment.failed':
        console.log('Payment failed', unwrapped.data.payment_id, unwrapped.data.error_message);
        break;
      case 'subscription.active':
        console.log('Subscription active', unwrapped.data.subscription_id);
        break;
      case 'credit.added':
        console.log('Credits added', unwrapped.data.credit_entitlement_id);
        break;
      case 'credit.balance_low':
        console.log('Low balance alert', unwrapped.data.available_balance);
        break;
      default:
        console.log('Unhandled event', unwrapped.type);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
}
```

### Client-side redirect
```typescript
const res = await fetch('/api/checkout', { method: 'POST', body: JSON.stringify({ ... }) });
const { checkout_url } = await res.json();
window.location.href = checkout_url;
```

---

## 7. Quick Reference

| Resource | ID Prefix |
|---|---|
| Checkout Session | `cks_` |
| Payment | `pay_` |
| Subscription | `sub_` |
| Customer | `cus_` |
| Credit Entitlement | `cde_` |
| Product | `prod_` / `pdt_` |
| Invoice | `inv_` |

| URL | Purpose |
|---|---|
| `https://test.dodopayments.com/checkouts` | Create/preview session (Test) |
| `https://live.dodopayments.com/checkouts` | Create/preview session (Live) |
| `https://test.checkout.dodopayments.com/session/{cks_xxx}` | Hosted checkout page (Test) |
| `https://live.checkout.dodopayments.com/session/{cks_xxx}` | Hosted checkout page (Live) |

**Summary for our use-case:**
- Pass `metadata: { escrow_id, solana_pda_address }` when creating a Checkout Session.
- Metadata appears on the Payment object and in webhook payloads.
- Use Credit-Based Billing as an alternative: create "Escrow Credits" and attach to a one-time product.
- Verify webhooks with SDK `client.webhooks.unwrap(...)` or manual HMAC SHA256.
