# LOCKR

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://lockr.srivtx.tech)
[![License](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)

Milestone-based escrow for Indian freelancers. Fiat in. Trustless out.

LOCKR lets clients pay freelancers in INR through Dodo Payments, then locks those funds in a Solana smart contract as USDC. Work gets delivered, client approves, freelancer receives stablecoins in seconds — not days.

**Live demo:** [lockr.srivtx.tech](https://lockr.srivtx.tech)

---

## Hackathon Tracks

### Colosseum Solana Frontier Hackathon 2026

Built for the [Colosseum Solana Frontier Hackathon](https://colosseum.com/frontier) — the world's largest online Solana hackathon with 18,000+ builders.

| | |
|---|---|
| **Hackathon** | Colosseum Solana Frontier 2026 |
| **Dates** | April 6 — May 11, 2026 |
| **Track** | Payments + Commerce |
| **Prizes** | $250,000 total ($30K Grand Champion, $10K Public Goods, $10K University, $200K across 20 teams) |
| **Accelerator** | Winners interviewed for $250,000 pre-seed funding |

### Superteam India × Dodo Payments Track

Also submitted for the [Superteam India × Dodo Payments Track](https://superteam.fun/earn/listing/payments-track-or-superteam-india-x-dodo-payments) — a dedicated prize track for Indian builders focused on payment solutions using Dodo Payments on Solana.

| | |
|---|---|
| **Track** | Payments — Superteam India × Dodo Payments |
| **Prize Pool** | 10,000 USDG |
| **1st Place** | 5,000 USDG |
| **2nd Place** | 3,000 USDG |
| **3rd Place** | 2,000 USDG |
| **Focus** | Fiat-to-crypto payments on Solana |
| **Region** | India only |

### Links

| **Live App** | [lockr.srivtx.tech](https://lockr.srivtx.tech) |
| **Demo Video** | [Watch on Vimeo](https://vimeo.com/1191304055) |
| **Repository** | [github.com/srivtx/lockr](https://github.com/srivtx/lockr) |

---

## Overview

Freelancers in India lose an estimated **$3.2B annually** to payment delays and disputes. International clients want to pay by card. Freelancers want to receive in crypto. Existing platforms charge 5–20% and hold funds for weeks.

LOCKR bridges this gap. It is a non-custodial escrow protocol with a fiat on-ramp. The client pays in their currency. The freelancer receives USDC on Solana. A smart contract enforces the terms — not a platform.

This project demonstrates:
- **Real-world utility** — Solves a $3.2B problem for 15M+ Indian freelancers
- **Payments innovation** — First escrow protocol with Dodo Payments fiat on-ramp
- **Solana-native design** — Sub-second settlement, $0.001 fees, program-owned escrow
- **Full-stack delivery** — Smart contract + frontend + backend + email automation

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

## Contact

Questions or feedback? Reach out on X.

[![X](https://img.shields.io/badge/Follow%20%40lockr__sol-black?logo=x&logoColor=white)](https://x.com/lockr_sol)

---

## License

MIT
