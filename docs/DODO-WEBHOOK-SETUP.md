# How to Create a Dodo Payments Webhook

## Step 1: Go to Dodo Dashboard

1. Open https://app.dodopayments.com
2. Log in with your account

## Step 2: Navigate to Webhooks Section

1. Go to **Developer** (left sidebar)
2. Click **Webhooks**
3. Click **Add Endpoint** or **Create Webhook**

## Step 3: Configure Webhook URL

**Webhook URL:**
This is the URL where Dodo will send payment events.

**For local development:**
You CANNOT use `localhost:3000` because Dodo's servers can't reach your local machine.

**Option A: Use ngrok (for local testing)**
```bash
# Install ngrok
npm install -g ngrok

# Expose your local Next.js server
ngrok http 3000

# Output:
# Forwarding: https://abc123.ngrok-free.app → http://localhost:3000
```

Use this ngrok URL:
```
https://abc123.ngrok-free.app/api/webhooks/dodo
```

**Option B: Deploy to Vercel first (recommended)**
```bash
# Deploy to Vercel
npm i -g vercel
vercel --prod

# Get the production URL
# https://trustlock-yourname.vercel.app
```

Use your Vercel URL:
```
https://trustlock-yourname.vercel.app/api/webhooks/dodo
```

## Step 4: Select Events

Check these events:
- [x] `payment.succeeded`
- [x] `payment.failed`
- [x] `payment.cancelled`

You can select all events if you want, but these 3 are the minimum.

## Step 5: Save Webhook

Click **Save** or **Create Endpoint**.

## Step 6: Copy the Webhook Secret

After saving, Dodo will show you a **Webhook Secret** (starts with `whsec_`).

**IMPORTANT:**
- Copy this immediately — it's shown only once
- It looks like: `whsec_abc123def456...`
- This is your `DODO_WEBHOOK_KEY`

## What You Get

After creating the webhook, you have:

| Value | What It Is | Where to Find |
|-------|-----------|--------------|
| **API Key** | For creating checkouts | Developer → API Keys |
| **Webhook Secret** | For verifying webhooks | Developer → Webhooks → your endpoint |
| **Webhook URL** | Where Dodo sends events | You set this in Step 3 |

## How to Test the Webhook

### Option 1: Dodo Dashboard Test
1. Go to Developer → Webhooks
2. Click your endpoint
3. Click **Send Test Event**
4. Select `payment.succeeded`
5. Dodo will send a test webhook

### Option 2: Create Real Test Payment
1. Open your app
2. Create an escrow
3. Copy payment link
4. Open in incognito window
5. Pay with test card: `4242 4242 4242 4242`
6. Dodo will send real webhook

## Troubleshooting

### "Webhook not received"
- Check if your server is running (`npm run dev`)
- Check if ngrok/Vercel URL is correct
- Check Dodo webhook logs in dashboard
- Check your server logs

### "Invalid signature" error
- Make sure `DODO_WEBHOOK_KEY` matches the secret in dashboard
- Make sure you're using the secret, not the API key
- Secret starts with `whsec_`, API key starts with `dodo_test_`

### "Could not resolve host"
- If using ngrok: make sure ngrok is still running
- If using Vercel: make sure deployment succeeded
- Check the URL has no typos

## Quick Checklist

- [ ] Created webhook endpoint in Dodo dashboard
- [ ] Set URL to your server (`/api/webhooks/dodo`)
- [ ] Selected `payment.succeeded` event
- [ ] Copied webhook secret (starts with `whsec_`)
- [ ] Pasted secret into `.env.local` as `DODO_WEBHOOK_KEY`
- [ ] Server is running and accessible
- [ ] Tested with "Send Test Event"

## Next Step

Once you have:
1. ✅ API Key (`DODO_API_KEY`)
2. ✅ Webhook Secret (`DODO_WEBHOOK_KEY`)
3. ✅ Webhook URL configured

**Send me both keys and I'll update the code.**

Then we'll:
1. Deploy the Anchor program to devnet
2. Fund your wallet
3. Test the full flow
