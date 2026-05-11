# LOCKR

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://lockr-oc7ebps49-zencodees-projects.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)

Milestone-based escrow for Indian freelancers. Fiat in. Trustless out.

LOCKR lets clients pay freelancers in INR through Dodo Payments, then locks those funds in a Solana smart contract as USDC. Work gets delivered, client approves, freelancer receives stablecoins in seconds — not days.

---

## Overview

Freelancers in India lose an estimated **$3.2B annually** to payment delays and disputes. International clients want to pay by card. Freelancers want to receive in crypto. Existing platforms charge 5–20% and hold funds for weeks.

LOCKR bridges this gap. It is a non-custodial escrow protocol with a fiat on-ramp. The client pays in their currency. The freelancer receives USDC on Solana. A smart contract enforces the terms — not a platform.

**Live demo:** [lockr-oc7ebps49-zencodees-projects.vercel.app](https://lockr-oc7ebps49-zencodees-projects.vercel.app/)

---

## How It Works

| Step | Client | System | Freelancer |
|------|--------|--------|------------|
| 1 | Creates escrow with milestones | Generates Solana PDA | Receives email with tracking link |
| 2 | Pays via Dodo checkout | Converts fiat to USDC, funds escrow | — |
| 3 | — | Locks funds on-chain | Delivers work, marks milestone complete |
| 4 | Reviews deliverable | — | — |
| 5 | Approves release | Executes `release_funds` instruction | Receives USDC instantly |

If a milestone is disputed, either party can trigger a refund after a timeout. The relayer handles transaction fees so freelancers never need SOL in their wallet.

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Client    │────▶│ Dodo Payments│────▶│   Next.js API   │
│   (Browser) │     │ (Fiat / INR) │     │  (Webhook + DB) │
└─────────────┘     └──────────────┘     └─────────────────┘
                                                  │
                                                  ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Freelancer │◀────│  Resend API  │◀────│   PostgreSQL    │
│   (Wallet)  │     │   (Email)    │     │   (Prisma)      │
└─────────────┘     └──────────────┘     └─────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                     Solana Devnet                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Escrow PDA  │  │ Milestone   │  │ USDC Token Account  │ │
│  │ (State)     │  │ (State)     │  │ (Locked Funds)      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                             │
│  Program: F6PigaZhXTPpb6ao46yr4U4gWBzv5xqKPps7szv6AGyD    │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features

- **Non-custodial escrow** — Funds live on a Solana PDA, not in a company account
- **Fiat on-ramp** — Dodo Payments handles INR / card payments, no crypto knowledge required from clients
- **Milestone-based** — Break large projects into deliverables, release funds incrementally
- **Gasless for freelancers** — Relayer pays SOL fees; freelancers only need a USDC wallet
- **Email notifications** — Status updates via Resend for every state change
- **Dispute protection** — Refund window with on-chain timeout enforcement

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Smart Contract | Anchor (Rust), Solana Devnet |
| Frontend | Next.js 15, React 19, Tailwind CSS |
| Backend | Next.js API Routes, Prisma ORM |
| Database | PostgreSQL (Supabase) |
| Payments | Dodo Payments (test mode) |
| Email | Resend |
| RPC | Helius |
| Deployment | Vercel |

---

## Project Structure

```
lockr/
├── programs/trustlock/     # Anchor escrow program
├── app/                    # Next.js App Router (pages + API)
│   ├── api/                # Webhooks, escrow CRUD, checkout
│   ├── components/         # React components
│   └── ...                 # Page routes
├── src/lib/                # Solana tx builders, Dodo client, Prisma
├── prisma/                 # Database schema
└── research/               # Hackathon research & references
```

---

## Local Development

### Prerequisites

- Node.js 20+
- Solana CLI + Anchor
- PostgreSQL database (local or Supabase)

### Environment Variables

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
ESCROW_KEYPAIR="[relayer keypair array]"
HELIUS_RPC_URL="https://devnet.helius-rpc.com/..."
NEXT_PUBLIC_RPC_URL="https://devnet.helius-rpc.com/..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SOLANA_PROGRAM_ID="F6PigaZhXTPpb6ao46yr4U4gWBzv5xqKPps7szv6AGyD"
DODO_API_KEY="dodo_prod_..."
DODO_WEBHOOK_KEY="whsec_..."
DODO_ENVIRONMENT="test_mode"
DODO_PRODUCT_ID="pdt_..."
REDIS_URL="redis://..."
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="LOCKR <noreply@...>"
```

### Install & Run

```bash
npm install
npx prisma migrate dev
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## Program Deployment

The escrow program is deployed on **Solana Devnet**:

```
Program ID: F6PigaZhXTPpb6ao46yr4U4gWBzv5xqKPps7szv6AGyD
```

---

## License

MIT
