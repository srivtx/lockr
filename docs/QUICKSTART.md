# Quick Start Guide

## Prerequisites

- Node.js 18+
- Rust + Solana CLI + Anchor
- A Solana wallet (Phantom/Solflare)

## Step 1: Clone and Install

```bash
git clone <repo>
cd trustlock
npm install
```

## Step 2: Set Up Supabase (PostgreSQL)

**Free tier — no credit card required.**

1. Go to https://supabase.com and create a project
2. Wait for database provisioning (~2 minutes)
3. Go to **Settings → Database → Connection string**
4. Copy the URI (use port 5432 — Session pooler)
5. Paste into `.env.local` as `DATABASE_URL`

```bash
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

**Why Supabase?**
- Free tier: 500MB storage, unlimited API requests
- Managed PostgreSQL (no Docker needed)
- Built-in connection pooling
- Works with Prisma out of the box

## Step 3: Set Up Upstash (Redis)

**Free tier — no credit card required.**

1. Go to https://upstash.com and create a Redis database
2. Go to **Details → Redis Connect → Node.js**
3. Copy the Redis URL (starts with `rediss://`)
4. Paste into `.env.local` as `REDIS_URL`

```bash
REDIS_URL=rediss://default:[password]@[endpoint]:6379
```

**Why Upstash?**
- Free tier: 10,000 commands/day
- Serverless (no server to manage)
- Works with BullMQ out of the box
- HTTPS/TLS by default

## Step 4: Set Up Dodo Payments (Test Mode)

**Free — test mode only.**

1. Go to https://app.dodopayments.com
2. Create an account
3. Go to **Developer → API Keys**
4. Copy API key and Webhook secret
5. Paste into `.env.local`

```bash
DODO_API_KEY=dodo_test_xxx
DODO_WEBHOOK_KEY=whsec_xxx
DODO_ENVIRONMENT=test_mode
```

## Step 5: Set Up Helius (Solana RPC)

**Free tier — no credit card required.**

1. Go to https://helius.dev
2. Create an account
3. Generate a devnet API key
4. Paste into `.env.local`

```bash
HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
NEXT_PUBLIC_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
```

## Step 6: Generate Escrow Keypair

```bash
# Generate a new Solana keypair
solana-keygen new --outfile escrow.json

# Convert to JSON array for env var
node -e "const fs=require('fs');const data=JSON.parse(fs.readFileSync('escrow.json'));console.log(JSON.stringify(Array.from(data.slice(0,64))))"

# Copy the output into .env.local
ESCROW_KEYPAIR=[64,123,45,...]
```

## Step 7: Deploy Anchor Program to Devnet

```bash
cd programs/trustlock

# Build
anchor build

# Deploy to devnet (requires devnet SOL)
anchor deploy --provider.cluster devnet

# Copy the program ID from output
# Update NEXT_PUBLIC_SOLANA_PROGRAM_ID in .env.local
```

**Get devnet SOL:**
```bash
solana airdrop 2 $(solana address) --url devnet
```

## Step 8: Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push
```

## Step 9: Start Services

Terminal 1 — Next.js dev server:
```bash
npm run dev
```

Terminal 2 — BullMQ worker:
```bash
npm run worker
```

## Step 10: Test End-to-End

1. Open http://localhost:3000
2. Connect Phantom/Solflare wallet (devnet)
3. Create escrow with test data
4. Copy payment link
5. Open in incognito window
6. Pay with Dodo test card: `4242 4242 4242 4242`
7. Watch dashboard update to FUNDED
8. Mark milestone delivered
9. Approve release via magic link

## Deployment (Optional)

If you need a live URL for submission:

| Service | Role | Cost |
|---------|------|------|
| **Vercel** | Next.js frontend + API | FREE |
| **Supabase** | PostgreSQL | FREE |
| **Upstash** | Redis | FREE |
| **Total** | | **$0** |

```bash
# Deploy to Vercel
npm i -g vercel
vercel --prod
```

**Note:** Vercel has a 10-second function timeout. The webhook handler returns in 50ms (fine), but the worker must run as a **separate long-running process** on Railway or Render.

## Common Issues

### "Cannot connect to Supabase"
- Check `DATABASE_URL` uses port 5432 (not 6543) for Prisma
- Make sure IP is not restricted in Supabase Settings → Database

### "Cannot connect to Upstash"
- Use `rediss://` (with double `s` for TLS)
- Check the password includes the full token

### "ESCROW_KEYPAIR invalid"
- Must be exactly 64 bytes
- Generate with `solana-keygen` not a random array

### "Program ID not found on devnet"
- Run `anchor deploy` first
- Update `.env.local` with real program ID
- Restart dev server after updating env

## Demo Checklist

- [ ] Supabase project created
- [ ] Upstash Redis created
- [ ] Dodo test API keys obtained
- [ ] Helius devnet key obtained
- [ ] Escrow keypair generated
- [ ] Program deployed to devnet
- [ ] `.env.local` configured
- [ ] Prisma schema pushed to Supabase
- [ ] Next.js dev server running
- [ ] BullMQ worker running
- [ ] Test escrow created successfully
- [ ] Test payment processed
- [ ] Test milestone released
- [ ] Demo video recorded
