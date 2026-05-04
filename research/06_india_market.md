# India Payments & Remittance Market Research

## Source
- Web research on RBI, NPCI, World Bank, Wise, Remitly, RazorpayX, Stripe India
- Date: 2026-05-04

---

## 1. India Remittance Market Size

### Inward Remittances
| Metric | Value | Source |
|---|---|---|
| **2023 Inflows** | **US$125 billion** | World Bank via Economic Times |
| **2023-24 Inflows (RBI)** | **US$129 billion** (~3.4% of GDP) | RBI Bulletin |
| **2022-23 Inflows (RBI)** | **US$107.5 billion** | RBI Bulletin |
| **Global Rank** | **#1 recipient** for multiple consecutive years | World Bank / KNOMAD |
| **Diaspora size** | ~35 million NRIs / PIOs | Ministry of Overseas Indian Affairs |

### Outward Remittances
- From India to other countries: ~US$7.01 billion (2020) vs. inward ~$107.5B (2022-23)
- Under LRS (Liberalised Remittance Scheme): resident Indians can remit up to **US$250,000 per financial year**

### Top Source Countries (2023-24, RBI data)
| Country | Share |
|---|---|
| United States | 27.7% |
| United Arab Emirates | 19.2% |
| United Kingdom | 10.8% |
| Saudi Arabia | 6.7% |
| Singapore | 6.6% |
| Qatar | 4.1% |
| Kuwait | 3.9% |

### Cost & Speed Benchmarks (USD→INR)
| Provider | Fee Structure | Exchange Rate | Speed |
|---|---|---|---|
| **Wise** | ~$8.75 on $350 transfer | Mid-market | **Seconds** (74% under 20s) |
| **Remitly** | Variable; often $0 promo | Markup varies | Minutes to 1 day; supports **UPI deposit** |
| **Banks / WU** | 3-6% total cost | Significant markup | 1-5 business days |

**Key Insight:** India receives more remittance volume than any country on earth. The US→India corridor alone is ~$35B+/year.

---

## 2. India Payment Infrastructure

### UPI (Unified Payments Interface)
- **Operator:** NPCI, regulated by RBI
- **Scale (2025):** **250 billion annual transactions** worth **US$3.4 trillion**
- **Daily throughput:** >**640 million transactions/day**, surpassing Visa's global daily volume
- **Market share:** UPI accounts for **84% of digital payments** in India
- **Mechanics:** Open-source API over IMPS. Instant 24/7/365 bank-to-bank push/pull using VPA, mobile number, or QR. No MDR for most domestic transactions.

**Transaction Limits (NPCI / RBI):**
| Use Case | Limit |
|---|---|
| Standard P2P / P2M | ₹1 lakh (₹100,000) |
| IPO / Retail Direct Gilt | ₹5 lakh |
| Hospital & educational payments | ₹5 lakh |
| UPI AutoPay / e-mandate | ₹1 lakh |
| UPI Lite | ₹2,000 wallet |
| UPI 123PAY | ₹10,000 |

### Foreign Access to UPI
- **NRIs:** RBI/NPCI expanded UPI access to international mobile numbers of NRIs from **10 countries**: USA, UK, UAE, Canada, Singapore, Australia, Hong Kong, Oman, Qatar, Saudi Arabia.
- **Tourists:** **UPI One World** allows foreign tourists to load prepaid wallet and pay via UPI QR.
- **International linkages:** UPI linked to Singapore (PayNow), UAE, France, Mauritius, Bhutan, Oman, Qatar, and others.

### IMPS, NEFT, RTGS
- **IMPS:** 24/7 instant interbank via mobile/internet banking
- **NEFT:** 24/7 since Dec 2019, settled in half-hourly batches
- **RTGS:** 24/7 since Dec 2020, minimum ₹2 lakh, no charges

---

## 3. Stablecoin Adoption in India

### Regulatory Stance (RBI & Government)
- **RBI is deeply hostile to private cryptocurrencies.** Governor Shaktikanta Das has repeatedly called for an outright ban.
- **Stablecoins specifically:** RBI has described stablecoins as a "money-printing business" that could undermine the rupee.
- **CBDC (Digital Rupee):** RBI is piloting wholesale and retail CBDC.
- **Taxation (Union Budget 2022):** **30% flat tax** on crypto gains and **1% TDS** on transactions.
- **FIU-India & PMLA:** In 2023-24, FIU issued compliance notices to offshore exchanges. Crypto activities brought under PMLA requiring KYC/AML.

**Bottom line:** Running a stablecoin-to-INR exchange *inside* India is legally perilous. However, **offshore stablecoin rails that settle into Indian accounts via UPI or banking partners** operate in a gray zone.

### Existing Players
- **Credible Finance:** "Payment Orchestration with Stablecoins" — building infrastructure for cross-border settlement.
- **Stellar-based remittance apps:** MoneyGram International, GetPaid, Fonbnk using Stellar USDC.
- **Stripe:** India is a **Preview** market for Stripe. Lists "Crypto — Wallet, stablecoin issuing and card infrastructure" and "Global Payouts."

---

## 4. B2B Payment Pain Points in India

### Cross-Border SaaS & Freelancer Payouts
- **Receiving international payments** is painful for Indian SMEs and freelancers. Stripe India remains in **Preview**.
- **High forex markups:** Banks charge 2-4% FX spread plus SWIFT fees.
- **FIRC (Foreign Inward Remittance Certificate):** Required for GST export exemptions; banks often delay auto-generating FIRCs.
- **TDS & 206C compliance:** Must deduct TDS on international vendor payments, file 15CA/CB forms, manage GST on reverse charge.

### Supplier Payments (Imports / B2B Trade)
- **LRS outward remittance cap:** $250K/year per resident insufficient for mid-size importers.
- **Manual processes:** Most Indian SMEs still use net-banking NEFT/RTGS with manual invoice matching.
- **Working capital gap:** Suppliers demand payment before shipment; buyers want credit.

### RazorpayX & Stripe India Signals
- RazorpayX markets **Forex / FDI Transfers**, **Bulk Payouts**, **Vendor Payments** — validating demand.
- Stripe India promotes "Global Payouts" and "Crypto" use cases.

---

## 5. Target User Personas

### Persona 1: "Remittance Raj" — NRI Sending Money Home
- **Profile:** Software engineer in San Francisco, age 32. Sends $1,500/month to parents in Hyderabad.
- **Pain Points:**
  - Bank wires cost $25-50 and take 2-3 days.
  - Wise is fast but charges ~$12-15; parents must withdraw to bank, then manually move to UPI.
  - Wants to send money directly to parents' UPI ID instantly.
- **Value Prop:** Buy USDC via ACH (low fee) → settle instantly to receiver's UPI ID in INR at mid-market rate. Cut fees by 60-70%.

### Persona 2: "SaaS Siddharth" — Indian Founder Collecting Global Revenue
- **Profile:** Founder of a B2B SaaS in Bangalore, age 28. Customers pay in USD/EUR.
- **Pain Points:**
  - Stripe India is "Preview"; uses a US entity just to collect revenue.
  - Incoming SWIFT wires cost 3-4% in FX spread and take 3-5 days.
  - Needs FIRC for every inflow to claim GST zero-rating; banks unreliable.
- **Value Prop:** Customers pay in USDC → instant settlement to Indian business current account, with auto-generated FIRC-equivalent documentation.

### Persona 3: "Importer Isha" — SME Buying Goods from China / SEA
- **Profile:** Runs a ₹5Cr/year electronics trading business in Delhi. Pays suppliers in USD/CNY.
- **Pain Points:**
  - LRS cap of $250K/year is a bottleneck.
  - Traditional LC takes 7-10 days and costs 1-2%.
  - Manual TDS, 15CA/CB, and GST compliance for each wire.
- **Value Prop:** Use USDC to settle supplier invoices in minutes instead of days, with programmatic compliance APIs.

---

## 6. Competitive Landscape

| Player | Model | Strengths | Gaps |
|---|---|---|---|
| **Wise** | Neo-bank remittance | Transparent fees, mid-market FX, fast | No native UPI deposit |
| **Remitly** | Digital MTO | Strong UPI deposit, cash pickup | FX markup hidden; not B2B |
| **Western Union** | Agent-based MTO | Brand trust, cash network | High fees (3-6%), slow |
| **RazorpayX** | Neobank for Indian businesses | Bulk payouts, forex, tax APIs | Domestic-first; limited cross-border stablecoin |
| **Stripe India** | Payment gateway + treasury | Global payouts, stablecoin treasury | India is **Preview** only |
| **Credible** | Stablecoin payment orchestration | Crypto-native, low-cost | Early stage; unclear India depth |
| **Stellar Ecosystem** | Blockchain remittance | Fast settlement, low cost | Fragmented UX; limited UPI integration |
| **Boundless** | Cross-border payments | Emerging market corridors | Limited public info on India UPI |

**Gap Analysis:**
1. **No major player offers seamless "Stablecoin → UPI" instant payout** for US/UK/UAE→India corridor.
2. **B2B stablecoin invoicing** with automatic Indian tax compliance is virtually non-existent.
3. **Stripe India preview status** leaves a window for a crypto-native alternative.

---

## 7. Go-to-Market for India — First 100 Users

### Phase 0: Regulatory & Banking Wrapper (Weeks 1-4)
- **Entity:** Domicile in **Singapore** or **Dubai** to avoid direct RBI licensing.
- **Banking / UPI Partner:** Partner with Indian PPI licensee or neobank (RazorpayX, Cashfree) for INR leg and UPI push.
- **Compliance:** Integrate FIU-India reporting APIs; build 15CA/CB auto-generation.

### Phase 1: First 100 Users (Months 1-3)
**Channels:**
1. **IndieHackers / Product Hunt / Hacker News** — "Send USDC to UPI in 30 seconds"
2. **NRIs in Tech** — Partner with Indian ERGs at Google, Meta, Microsoft, YC alumni
3. **CA / Finance Consultants** — 0.1% referral revenue for onboarding B2B clients
4. **Hackathon Circuit** — Sponsor tracks at ETHIndia, Devfolio, IIT Bombay E-Summit
5. **WhatsApp / Telegram Communities** — Indian fintech and "NRI Finance" groups

**Tactical Hook:**
- Zero-fee first transfer up to $500
- Instant UPI receipt — 15-second demo video
- B2B "FIRC-less" guarantee — auto-generate compliance docs

### Phase 2: Partnerships (Months 3-6)
- Apply to NPCI's international partner program
- Build plugins for **Zoho Books, Tally, ClearTax**
- Partner with Circle for Stellar USDC liquidity

---

## Appendix: Key URLs
1. https://www.knomad.org/publication/migration-and-development-brief-41
2. https://en.wikipedia.org/wiki/Remittances_to_India
3. https://wise.com/us/send-money/send-money-to-india
4. https://www.remitly.com/us/en/india
5. https://en.wikipedia.org/wiki/Unified_Payments_Interface
6. https://en.wikipedia.org/wiki/Payment_and_settlement_systems_in_India
7. https://www.indiastack.org/
8. https://razorpay.com/x/current-accounts/
9. https://stripe.com/en-in/global
10. https://www.stellar.org/case-studies
11. https://credible.finance/
