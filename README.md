# LOCKR

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://lockr.srivtx.tech)
[![License](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)

**Milestone-based escrow for Indian freelancers. Fiat in. Trustless out.**

[lockr.srivtx.tech](https://lockr.srivtx.tech) · [Demo](https://vimeo.com/1191304055) · [Twitter](https://x.com/lockr_sol)

---

## What It Is

LOCKR is a non-custodial escrow protocol that lets international clients pay Indian freelancers in fiat (INR, card, UPI) while freelancers receive USDC on Solana. A smart contract locks funds until work is delivered and approved — no platform custody, no 30-day delays.

**The problem:** Indian freelancers lose $3.2B annually to payment delays and disputes. Upwork and Fiverr charge 20% and hold funds for weeks. Crypto escrow exists but clients don't have wallets.

**The solution:** LOCKR bridges fiat and crypto. Client pays by card → Dodo converts to USDC → Solana escrow holds it → freelancer delivers → client approves → USDC releases instantly.

---

## How It Works

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

| Step | What happens |
|------|-------------|
| 1 | Freelancer creates escrow with milestones, client gets email with payment link |
| 2 | Client clicks link, pays via Dodo (card/UPI/40+ methods) |
| 3 | Webhook fires, USDC locks on Solana escrow PDA |
| 4 | Freelancer delivers milestone, marks complete |
| 5 | Client approves via email, USDC releases to freelancer wallet in ~3 seconds |

Disputed? Either party triggers refund after timeout. Relayer pays gas so freelancers never need SOL.

---

## Why This Wins

- **First escrow protocol with Dodo Payments fiat on-ramp** — not just a checkout button, a full milestone escrow
- **Solves a $3.2B problem** for 15M+ Indian freelancers
- **Sub-second settlement, $0.001 fees** vs 5-20% and weeks on traditional platforms
- **Gasless for freelancers** — relayer handles SOL, they just need a USDC wallet
- **End-to-end working product** — live, deployed, tested, not a demo

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Smart Contract | [Anchor](https://www.anchor-lang.com/) (Rust), [Solana](https://solana.com/) Devnet |
| Frontend | [Next.js 15](https://nextjs.org/), React 19, [Tailwind CSS](https://tailwindcss.com/) |
| Backend | Next.js API Routes, [Prisma](https://www.prisma.io/) ORM |
| Database | [PostgreSQL](https://www.postgresql.org/) ([Supabase](https://supabase.com/)) |
| Payments | [Dodo Payments](https://dodopayments.com/) (test mode) |
| Email | [Resend](https://resend.com/) |
| RPC | [Helius](https://helius.dev/) |
| Deployment | [Vercel](https://vercel.com/) |

---

## Hackathons

### Colosseum Solana Frontier 2026
World's largest online Solana hackathon. 18,000+ builders. $250K+ in prizes.

| | |
|---|---|
| **Track** | Payments + Commerce |
| **Dates** | April 6 — May 11, 2026 |
| **Prizes** | $30K Grand Champion · $10K Public Goods · $10K University · $200K across 20 teams |
| **Accelerator** | Winners considered for $250K pre-seed + Colosseum accelerator |

### Superteam India × Dodo Payments
Dedicated track for Indian builders using Dodo Payments on Solana.

| | |
|---|---|
| **Track** | Payments — Superteam India × Dodo Payments |
| **Prize Pool** | 10,000 USDG (1st: 5K · 2nd: 3K · 3rd: 2K) |
| **Region** | India only |
| **Submissions** | 31 |

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
└── prisma/                 # Database schema
```

---

## Local Development

```bash
# Prerequisites: Node.js 20+, Solana CLI, Anchor, PostgreSQL

npm install
npx prisma migrate dev
npm run dev
```

**Environment variables:** See `.env.example` or README section below for full list.

---

## Program

Deployed on **Solana Devnet**:

```
F6PigaZhXTPpb6ao46yr4U4gWBzv5xqKPps7szv6AGyD
```

---

## Contact

[![X](https://img.shields.io/badge/%40lockr__sol-black?logo=x&logoColor=white)](https://x.com/lockr_sol)

---

## License

MIT
