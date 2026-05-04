# Dodo Payments — Comprehensive Research

## Source
- https://dodopayments.com
- https://docs.dodopayments.com
- Research date: 2026-05-04

---

## 1. What is Dodo Payments?

**Dodo Payments** is an all-in-one **billing, payments, and distribution platform** built specifically for **AI-first companies and SaaS businesses**. It acts as a **Merchant of Record (MoR)**, meaning Dodo assumes legal liability for transactions, handling global tax compliance (VAT, GST, sales tax), fraud prevention, chargebacks, and local payment regulations across **220+ countries and territories**.

### Core Value Proposition
Instead of piecing together Stripe + Tax tools + Billing software + License key managers, Dodo offers a single platform to:
- **Accept global payments** (40+ payment methods, 80+ currencies)
- **Run flexible billing** (subscriptions, usage-based, credit-based, one-time, hybrid)
- **Distribute digital products** (license keys, file delivery, storefronts, affiliate programs)
- **Stay compliant** (PCI DSS Level 1, automatic tax calculation & filing)

### Key Stats
- **40+** payment methods
- **220+** countries & territories supported
- **14+** languages on checkout
- **99.99%** uptime
- **25,000+** builders and founders worldwide
- Backed by: Antler, a16z, Lightspeed, Visa, Goldman Sachs, Razorpay, AWS, PayU

**Primary URLs:**
- Website: https://dodopayments.com
- Dashboard: https://app.dodopayments.com
- Docs: https://docs.dodopayments.com

---

## 2. APIs & SDKs

Dodo Payments is **developer-first** with extensive API and SDK coverage.

### REST API
- **Base URLs:**
  - Test: `https://test.dodopayments.com`
  - Live: `https://live.dodopayments.com`
- **Authentication:** Bearer token (`Authorization: Bearer YOUR_API_KEY`)
- **Rate Limits:** 40 req/s burst, 240 req/min sustained (higher tiers available)
- **Features:** Idempotency, auto-pagination, structured error codes, webhook signing

### Official SDKs (9+ languages)
| Language | Install Command / Package |
|---|---|
| **TypeScript / Node.js** | `npm install dodopayments` |
| **Python** | `pip install dodopayments` |
| **Go** | `go get github.com/dodopayments/dodopayments-go` |
| **PHP** | `composer require dodopayments/client` |
| **Java** | Maven/Gradle supported |
| **Kotlin** | Coroutines + null-safety |
| **C# / .NET 8+** | Async Task-based API (Beta) |
| **Ruby** | Ruby-native conventions |
| **React Native** | Native iOS/Android SDK |
| **CLI** | `npx dodopayments` or `dodopayments` binary |

### Framework Adapters
Pre-built adapters to integrate in under 10 lines of code:
- **Next.js**, **Better Auth**, **Supabase**, **Convex**
- **SvelteKit**, **Nuxt**, **Remix**, **Astro**, **TanStack**
- **Express**, **Fastify**, **Hono**, **Bun**

### Special Developer Tools
- **MCP Server** (Model Context Protocol): Lets AI agents discover and execute Dodo API operations via natural language.
- **Knowledge MCP**: Semantic search across all Dodo documentation.
- **Agent Skills**: Reusable skill packs (`npx skills add dodopayments/skills`) that teach AI agents how to implement checkout, subscriptions, usage-based billing, webhooks, etc.
- **BillingSDK** (https://billingsdk.com): Open-source, production-ready React/ShadCN components for pricing tables, subscription dashboards, and usage meters.
- **Sentra**: AI billing assistant IDE extension (VS Code, Cursor, Windsurf) that scaffolds integrations from prompts.

### API Coverage Highlights
- Products, Checkout Sessions, Payments
- Subscriptions, Add-ons, Plan Changes
- Usage Events & Meters
- Credit Entitlements & Ledger
- Customers, Customer Portal Sessions
- Discounts, Refunds, Disputes
- License Keys (create, validate, activate, deactivate)
- Webhooks, Payouts, Balance Ledger
- Brands, Short Links

Full API index: https://docs.dodopayments.com/llms.txt

---

## 3. Payment Methods Supported

Dodo supports **40+ payment methods** across **220+ countries**.

### Global Methods
- Credit / Debit Cards (Visa, Mastercard, Amex)
- Apple Pay & Google Pay
- PayPal
- BNPL: Klarna, Afterpay / Clearpay
- Amazon Pay

### Local / Regional Methods
- **India:** UPI, UPI AutoPay, RuPay, local debit/credit cards
- **Europe:** SEPA, iDEAL (Netherlands), Bancontact
- **Brazil:** PIX
- **China:** WeChat Pay
- **UK/EU:** RevolutPay, Billie
- **Other APMs:** 50+ local bank transfers, wallets, and region-specific methods

### Adaptive Currency / Multi-Currency
- Supports **80+ currencies**
- Automatically displays prices in the buyer's local currency
- Same-currency refunds to reduce FX friction

### React Native Mobile SDK
- Supports multiple payment methods natively in-app
- *Note:* Apple Pay, Google Pay, Cash App, and UPI are **not yet** supported in the React Native SDK (planned).

---

## 4. Blockchain & Crypto Integrations

**Direct blockchain/crypto payment support is NOT currently offered.** Dodo Payments does not list Bitcoin, Ethereum, Solana, or stablecoin (USDC/USDT) checkout as a native payment method.

### However, they are "Crypto-Aware":
- **Stablecoin Newsletter (April 2026):** Analysis on stablecoins entering real-world trade.
  - URL: https://dodopayments.com/blogs/newsletter-april10
- **Agentic Commerce Blog:** Discusses AI agents purchasing compute, API credits, and SaaS subscriptions autonomously.
  - URL: https://dodopayments.com/blogs/agentic-commerce

**Bottom Line:** For the hackathon, do NOT pitch a project that requires native crypto checkout via Dodo. Instead, focus on **fiat payments for AI/Web3 SaaS tools**, or use Dodo for the fiat on-ramp while handling crypto wallets separately.

---

## 5. What is Relevant for a "Payments Track" Hackathon?

Given Dodo's positioning as the **billing platform for AI-first companies**, the strongest hackathon projects would demonstrate:

### A. AI-Native Commerce / Agentic Payments
Build an app where **AI agents transact autonomously** using Dodo's **MCP Server** and **Credit-Based Billing**.
- Example: An AI research agent that buys API credits, subscribes to data services, and manages its own budget.
- Leverage: MCP Server, usage events, credit entitlements.

### B. Usage-Based Billing for AI Products
Build a SaaS tool that meters AI tokens, compute seconds, or image generations and bills via Dodo.
- Leverage: Usage-Based Billing guide, LLM ingestion blueprints, meters.
- Docs: https://docs.dodopayments.com/developer-resources/usage-based-billing-guide

### C. Credit-Based Billing System
Implement a "prepaid credits" model with rollover, overage, and expiration — perfect for AI API gateways.
- Leverage: Credit entitlements API, ledger entries, webhook events.
- Docs: https://docs.dodopayments.com/features/credit-based-billing

### D. Embedded Finance / Marketplace
Build a multi-vendor marketplace or a platform where users can sell digital products.
- Leverage: Merchant of Record, license keys, digital product delivery, affiliate (Affonso) support.

### E. Global Checkout Experience
Build a localized, multi-currency, multi-language checkout with fraud protection and tax compliance.
- Leverage: Overlay/Inline checkout, adaptive currency, fraud protection, 14+ language support.

### F. Billing Infrastructure as a Service
Use **BillingSDK** + **Dodo API** to spin up a complete billing dashboard (pricing pages, subscription management, usage meters) in minutes.

### G. Mobile In-App Payments
Build a React Native app with embedded payments using the Dodo mobile SDK.

---

## 6. Developer Docs, API References, & Integration Guides

### Main Documentation
- **Docs Hub:** https://docs.dodopayments.com
- **API Reference:** https://docs.dodopayments.com/api-reference/introduction
- **Full Docs Index (for LLMs):** https://docs.dodopayments.com/llms.txt
- **Markdown-per-page:** Append `.md` to any docs URL (e.g., `/api-reference/introduction.md`)

### Integration Guides
| Topic | URL |
|---|---|
| Quick Start / Integration Guide | https://docs.dodopayments.com/developer-resources/integration-guide |
| Subscription Integration | https://docs.dodopayments.com/developer-resources/subscription-integration-guide |
| Usage-Based Billing Guide | https://docs.dodopayments.com/developer-resources/usage-based-billing-guide |
| Credit-Based Billing | https://docs.dodopayments.com/features/credit-based-billing |
| Checkout Sessions | https://docs.dodopayments.com/developer-resources/checkout-session |
| Overlay Checkout | https://docs.dodopayments.com/developer-resources/overlay-checkout |
| Inline Checkout | https://docs.dodopayments.com/developer-resources/inline-checkout |
| Webhooks | https://docs.dodopayments.com/developer-resources/webhooks |
| Mobile Integration | https://docs.dodopayments.com/developer-resources/mobile-integration |
| React Native Integration | https://docs.dodopayments.com/developer-resources/react-native-integration |
| MCP Server Setup | https://docs.dodopayments.com/developer-resources/mcp-server |
| Agent Skills | https://docs.dodopayments.com/developer-resources/agent-skills |
| Sentra AI Assistant | https://docs.dodopayments.com/developer-resources/sentra |

### Boilerplates & Adapters
- Next.js Boilerplate: https://docs.dodopayments.com/developer-resources/nextjs-boilerplate
- Supabase + Next.js Starter: https://docs.dodopayments.com/developer-resources/supabase-boilerplate
- FastAPI Boilerplate: https://docs.dodopayments.com/developer-resources/fastapi-boilerplate
- Go Boilerplate: https://docs.dodopayments.com/developer-resources/go-boilerplate
- Expo Boilerplate: https://docs.dodopayments.com/developer-resources/expo-boilerplate
- Astro Minimal Boilerplate: https://docs.dodopayments.com/developer-resources/astro-boilerplate

### Billing Deconstructions
Dodo provides guides on how to replicate billing models of:
- OpenAI, Anthropic, Midjourney, Cursor, ElevenLabs, Replicate, Lovable
- https://docs.dodopayments.com/developer-resources/billing-deconstructions/introduction

### Community & Support
- Discord: https://discord.gg/bYqAp4ayYh
- Support: support@dodopayments.com

---

## 7. Unique Features & Capabilities to Showcase

| Feature | Why It Stands Out |
|---|---|
| **Sentra (AI Billing Agent)** | IDE extension that lets you build payment integrations by describing what you want in natural language. |
| **MCP Server + Code Mode** | First payment platform to expose a true MCP server where AI agents write and execute TypeScript to manage subscriptions, issue refunds, and ingest usage. |
| **Credit-Based Billing with Rollover & Overage** | Advanced credit entitlements (custom units or fiat) that roll over, expire, or bill overages — ideal for AI token economies. |
| **Usage-Based Billing (Metered)** | Real-time event ingestion with multiple aggregation types (Count, Sum, Max, Last, Unique Count). Built-in blueprints for LLM tokens, API gateways, object storage, streaming, and compute. |
| **Merchant of Record (MoR)** | Dodo handles tax, compliance, and liability in 150+ countries. You can sell globally from day one without a legal entity. |
| **Overlay & Inline Checkout** | Embeddable, conversion-optimized checkouts with no redirects. Supports themes, multi-language, adaptive currency, and address autofill. |
| **License Key Management** | Automated generation, validation, activation, and deactivation of license keys for software/digital products. |
| **Customer Portal (Unified)** | Self-serve portal for customers to manage subscriptions, view usage, update payment methods, and see credit balances. |
| **Abandoned Cart Recovery & Dunning** | Built-in revenue recovery with automated email sequences. |
| **BillingSDK** | Free, open-source React components for pricing pages, subscription dashboards, and usage meters. |
| **Affiliate Program (Affonso)** | Launch affiliate programs with automated referral tracking and payouts. |

---

## Summary Cheat Sheet

| Question | Answer |
|---|---|
| **What is it?** | All-in-one billing, payments, and distribution platform for AI/SaaS. |
| **API/SDKs?** | REST API + 8 official SDKs + React Native + CLI + 12+ framework adapters + MCP Server. |
| **Payment methods?** | 40+ methods (Cards, Apple/Google Pay, PayPal, BNPL, UPI, SEPA, PIX, iDEAL, WeChat Pay, etc.). |
| **Crypto/Blockchain?** | No native crypto checkout. Crypto-aware via blogs on stablecoins & agentic commerce. |
| **Hackathon angle?** | AI agent commerce, usage/credit-based billing for AI apps, global checkout, embedded finance. |
| **Key differentiators?** | MCP Server for AI agents, Sentra IDE assistant, Credit-Based Billing, Merchant of Record. |
| **Pricing?** | 4% + 40¢ per transaction (Standard). No monthly fees. Enterprise available. |
