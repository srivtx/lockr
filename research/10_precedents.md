# Precedent Research: Fiat-to-Solana Escrow & Payment Bridges

## Source
- Web research on hackathon winners, GitHub repos, production products
- Date: 2026-05-04

---

## 1. Hackathon Winners / Projects

### Credible Finance — Cypherpunk 2nd Place (Stablecoin Track)
- **Website**: https://credible.finance ("Payment Orchestration with Stablecoins")
- **Hackathon**: Solana Cypherpunk (Colosseum)
- **What they built**: Stablecoin-powered remittance platform for banks, fintechs, and businesses sending money in/out of India. Selected for Solana Colosseum Accelerator.
- **Architecture**: Likely a B2B API layer that locks stablecoins on Solana while fiat moves via local rails (UPI/IMPS) on either end.
- **Note**: No open-source repo or detailed whitepaper found.

### CORBITS.DEV / BlockStory — x402 Facilitator
- **Website**: https://corbits.dev
- **What they built**: First-party hosted x402 facilitator. Merchants/AI agents accept/send crypto payments with "no blockchain complexity."
- **BlockStory** (github.com/lopeselio/blockstory-pay): Used Corbits Proxy + x402 pay-per-request + Chainlink CRE. Submitted to Chainlink Convergence 2026.
- **Key insight**: Corbits abstracts blockchain but is still **crypto-in, crypto-out**. No fiat bridge.

### MCPay (Frames) — Stablecoin Track
- **Website**: https://mcpay.tech
- **What they built**: Pay-per-request micropayments for MCP servers using x402-like flows.
- **Stats**: 380,981 transactions, $76.10K volume.
- **Architecture**: Agents get wallet funded with stablecoins, spend on tools. Crypto abstracted from end user.

### Other Notable Projects
- **Zoneless** — Real marketplace payouts (see Production section)
- **Yumi Finance** — Cypherpunk DeFi winner
- **Unruggable** — Grand prize winner (hardware wallet)

---

## 2. Production Products

### Stripe → Solana Integrations
- **zonelessdev/zoneless** (GitHub, 278 stars, Apache 2.0)
  - Open-source Stripe Connect alternative. Identical API to Stripe. Instant global USDC payouts on Solana.
  - Production-tested by PromptBase (450K+ users). ~$0.002 payout cost.
  - **Limitation**: Payout system (merchant → seller), not escrow. Does not hold funds in smart contract.

- **solana-developers/stripe-onramp** (GitHub, 5 stars)
  - Abandoned Next.js demo from Mar 2023. Not production-ready.

### Bridge / On-Ramp Products
- **Onramp Money** (onramp.money)
  - Fiat-to-crypto onramp. Users pay in local fiat (UPI, SEPA, PIX); merchants receive stablecoins.
  - **Limitation**: Direct on-ramp. No escrow hold or "fiat payment triggers on-chain release" API.

- **Meso** (meso.network)
  - "Payment infrastructure designed for crypto." Sparse public details. No escrow-release API found.

### Coinbase Commerce → Crypto Settlement
- **coinbase/x402** (GitHub, 70 stars)
  - Reference x402 implementation. Supports Solana exact-payment schemes.
  - Settlement is on-chain (USDC/SOL), not fiat-based. No webhook-to-escrow pattern.

---

## 3. Open-Source Repositories

### Anchor Escrow Programs (Forkable)
| Repo | Stars | Notes |
|------|-------|-------|
| **ironaddicteddog/anchor-escrow** | 197 | Classic escrow: Initialize → Cancel → Exchange. Token A for Token B. PDA vault authority. MIT. |
| **solanakite/anchor-escrow-2026** | 73 | Modern, Anchor 0.32.1, Solana CLI 2.1.21, Rust 1.86. Includes LiteSVM + TypeScript tests. **Best starting point.** |
| **arunavo4/sol-sell-escrow** | 12 | Escrow for selling NFTs. Good single-asset reference. |
| **Daltonic/fundus** | 16 | Next.js + Anchor crowdfunding dApp. Good frontend scaffolding. |

### Webhook → Solana Transaction
| Repo | Stars | Notes |
|------|-------|-------|
| **rohitdevsol/Solana-Bounty-SDK** | 0 | **Closest precedent.** GitHub webhooks → validates 5 security layers → calls `releaseEscrow()` on Solana program. Provider-based architecture. |
| **0xjeffro/PumpScan** | 35 | Helius webhook → real-time Solana transaction indexer. |
| **Aran404/Forwarder** | 6 | Go-based Solana transaction forwarding + webhook notifications. |
| **m3yevn/solana-sentry** | 0 | TypeScript transaction monitoring + webhook service. |

### x402 / Payment Middleware
| Repo | Stars | Notes |
|------|-------|-------|
| **coinbase/x402** | 70 | Reference implementation. Solana exact-payment schemes. |
| **Woody4618/x402-solana-examples** | 11 | Minimal working examples: pay-in-SOL, pay-in-USDC, pay-using-Coinbase-facilitator. |

### Next.js + Solana + Fiat
| Repo | Stars | Notes |
|------|-------|-------|
| **NewSoulOnTheBlock/printrhouse** | 0 | Creator merch marketplace: Next.js + Solana + Stripe. Very new. |
| **stream-protocol/stripe-onramp** | 0 | Fork of solana-developers/stripe-onramp. |

---

## 4. What Can We Copy vs. What Must We Build

### Repos to Fork as Starting Points
1. **On-chain escrow program**: Fork **solanakite/anchor-escrow-2026** (modern toolchain).
2. **Webhook → transaction architecture**: Fork **rohitdevsol/Solana-Bounty-SDK**. Already has provider pattern, webhook verification, and `releaseEscrow()` call.
3. **Stripe-compatible API/webhooks**: Fork **zonelessdev/zoneless**. Full Express API with Stripe-compatible webhooks. Repurpose payout flow into escrow release.

### Exact Gaps We Must Fill
1. **"Fiat payment received" → "Escrow released" oracle gap**
   - No repo connects fiat payment webhooks to Solana escrow release.
   - Zoneless does fiat→USDC payout; Solana-Bounty-SDK does webhook→escrow for GitHub events.
   - We must build the adapter: listen to `payment.succeeded` (Dodo) and call `fundEscrow()` / `releaseEscrow()` on Solana.

2. **Fiat hold / custody model**
   - Existing escrows assume both parties deposit crypto into PDA.
   - In our model, fiat sits in Dodo/custodial account, crypto sits on-chain.
   - Need a **two-sided escrow** where oracle confirms fiat receipt, then releases crypto.

3. **Dispute / arbiter logic**
   - Basic open-source escrows have no third-party arbiter.
   - Our fiat-crypto escrow needs an arbiter/oracle that can refund crypto if fiat side fails.

4. **KYC / compliance bridge**
   - No open-source project wires KYC, identity verification, and escrow state transitions together.

### Bottom Line
- **Closest overall architecture**: Combine **zoneless** (Stripe-compatible API + webhooks) + **Solana-Bounty-SDK** (webhook handler → releaseEscrow pattern) + **solanakite/anchor-escrow-2026** (on-chain program).
- **The "fiat on-ramp → on-chain escrow" pattern specifically has not been built and open-sourced before.** Individual pieces exist, but the bridge between a fiat webhook and a Solana smart contract escrow is the exact gap we would be filling.
