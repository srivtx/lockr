# LOCKR Documentation

## What Is This?

This directory contains complete documentation for LOCKR — a milestone-based escrow for Indian freelancers built on Solana and Dodo Payments.

## Doc Index

| # | Doc | What It Covers |
|---|-----|---------------|
| 01 | `01-overview.md` | The problem, the idea, high-level system flow |
| 02 | `02-solana-program.md` | Anchor escrow program: PDAs, milestones, USDC |
| 03 | `03-dodo-integration.md` | Dodo Payments: checkout, webhooks, fiat bridge |
| 04 | `04-backend-architecture.md` | Next.js API, BullMQ, workers, database |
| 05 | `05-frontend-flow.md` | Pages, components, user journeys |
| 06 | `06-database-design.md` | Prisma schema, relations, indexes |
| 07 | `07-end-to-end-demo.md` | Demo script with timing and talking points |

## How to Read These Docs

**Start here:** `01-overview.md`

**Then read based on your role:**
- **Blockchain developer:** `02-solana-program.md`
- **Backend developer:** `03-dodo-integration.md` + `04-backend-architecture.md`
- **Frontend developer:** `05-frontend-flow.md`
- **Database engineer:** `06-database-design.md`
- **Demo presenter:** `07-end-to-end-demo.md`

## Doc Structure

Every doc follows the same template:

1. **THE PROBLEM** — Why this exists
2. **THE IDEA** — Core concept + analogy
3. **HOW IT WORKS** — Step-by-step flow
4. **SYSTEM FLOW** — End-to-end walkthrough
5. **DESIGN DECISIONS** — Why we chose what we chose
6. **TRADEOFFS** — What we gain vs lose
7. **FAILURE CASES** — What breaks and how we fix it
8. **COMMON CONFUSION** — "No, it's not X" clarifications
9. **WHERE IT EXISTS IN CODE** — File references

## Quick Stats

| Metric | Value |
|--------|-------|
| Program instructions | 5 (create, fund, release, refund, dispute) |
| API routes | 11 |
| Frontend pages | 6 |
| Database tables | 3 (Escrow, Milestone, PaymentEvent) |
| Fee per transaction | ~$0.001 |
| Settlement time | ~3 seconds |
| PayPal equivalent | 5-8% fee, 3-5 days |

## Analogy Summary

**LOCKR is like a smart vending machine for freelance payments.**

- Buyer inserts fiat coins (Dodo checkout)
- Machine holds the item (Solana escrow PDA)
- Seller delivers the work (mark milestone complete)
- Buyer presses the button (cryptographic approval)
- Machine releases the item instantly (USDC transfer)
- No trust needed. No 5-day wait. No 8% fee.

## Project Files

| Directory | Contents |
|-----------|----------|
| `programs/trustlock/` | Anchor escrow program |
| `app/` | Next.js frontend + API routes |
| `src/lib/` | Backend libraries (Solana, Dodo, Prisma) |
| `src/worker/` | BullMQ worker |
| `prisma/` | Database schema |
| `docs/` | This documentation |
| `research/` | Hackathon research |
| `idea.md` | Product spec |
| `plan.md` | Build plan |

## Next Steps

1. Read `01-overview.md`
2. Deploy program to devnet
3. Set up environment variables
4. Run end-to-end test
5. Record demo video

See `07-end-to-end-demo.md` for the full demo script.
