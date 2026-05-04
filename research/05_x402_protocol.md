# x402 Protocol — Deep Technical Research

## Source
- https://x402.org, https://docs.x402.org, GitHub repos
- Date: 2026-05-04

---

## 1. What Exactly Is x402?

**x402** is an open, transport-native payment standard for internet-native micropayments. It is **not** the legacy HTTP 402 status code itself — it is a protocol that *uses* the long-dormant `402 Payment Required` response to negotiate machine-to-machine payments over HTTP (and other transports like MCP and A2A).

- **Official site:** https://x402.org
- **Whitepaper:** https://x402.org/x402-whitepaper.pdf
- **Primary GitHub repo (x402 Foundation):** https://github.com/x402-foundation/x402
- **Coinbase development fork:** https://github.com/coinbase/x402
- **Documentation:** https://docs.x402.org
- **Discord:** https://discord.gg/cdp
- **Telegram:** https://t.me/+ijgZ6c_f0iA1MmY5

x402 was initially authored by Coinbase and co-founded with Cloudflare as the **x402 Foundation** (announced Sept 2025).

---

## 2. Technical Flow: How x402 Works

x402 separates three concerns:
- **Transport** (how data moves — HTTP, MCP, A2A)
- **Scheme** (how money moves — `exact`, `upto`, `deferred`)
- **Network** (where value settles — Base, Solana, Stellar, Aptos, etc.)

### Typical HTTP Flow (V2)
```
1. Client → Resource Server: GET /weather
2. Resource Server → Client: 402 Payment Required
   Header: PAYMENT-REQUIRED: <base64 PaymentRequired JSON>
3. Client: selects one PaymentRequirements option, constructs PaymentPayload
4. Client → Resource Server: GET /weather
   Header: PAYMENT-SIGNATURE: <base64 PaymentPayload JSON>
5. Resource Server: POST /verify to Facilitator
6. Facilitator → Resource Server: VerifyResponse { isValid: true }
7. Resource Server: fulfills request
8. Resource Server: POST /settle to Facilitator
9. Facilitator: submits transaction to blockchain
10. Facilitator → Resource Server: SettlementResponse
11. Resource Server → Client: 200 OK + body
```

### Schemes
- **`exact`**: Fixed price per request. Available on EVM, Solana, Stellar, Aptos.
- **`upto`**: Usage-based billing — client authorizes a max. **EVM-only** currently.
- **`deferred`**: Batched/settlement-later flows.

---

## 3. Solana Programs & Open-Source Implementations

x402 on Solana does **not** require a custom on-chain program. It uses standard Solana programs:

| Program | Address | Role |
|---------|---------|------|
| SPL Token | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` | Primary token transfer |
| Token-2022 | `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` | Alternative |
| Compute Budget | `ComputeBudget111111111111111111111111111111` | Sets CU limit & price |
| SPL Memo | `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr` | Transaction uniqueness |
| Lighthouse | `L2TExMFKdjpN9kozasaurPirfHy9P8sbXoAN1qA3S95` | Wallet-injected protection |

### Exact Scheme on Solana
- Uses **SPL Token `TransferChecked`** between ATAs
- Client partially signs transaction
- Facilitator adds signature as feePayer and submits

### Critical Security Rules
- Transaction must contain 3–6 instructions in specific order
- Fee payer must NOT appear in any instruction accounts
- Compute unit price ≤ 5 lamports
- Destination must equal ATA PDA for `(owner = payTo, mint = asset)`
- Transfer `amount` must exactly match `PaymentRequirements.amount`

### Duplicate Settlement Mitigation
- Reference implementation uses `SettlementCache` (120-second TTL)

---

## 4. Web Application Integration — Code Examples

### Install Dependencies
```bash
npm install @x402/core @x402/evm @x402/svm @x402/express
# Python
pip install "x402[fastapi]" "x402[svm]"
# Go
go get github.com/x402-foundation/x402/go
```

### Express Server (TypeScript) — Multi-Network
```typescript
import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { ExactSvmScheme } from "@x402/svm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const app = express();
const facilitatorClient = new HTTPFacilitatorClient({
  url: "https://x402.org/facilitator"
});

app.use(
  paymentMiddleware(
    {
      "GET /weather": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.001",
            network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
            payTo: svmAddress,
          },
        ],
        description: "Weather data",
        mimeType: "application/json",
      },
    },
    new x402ResourceServer(facilitatorClient)
      .register("solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1", new ExactSvmScheme()),
  ),
);

app.get("/weather", (req, res) => {
  res.send({ report: { weather: "sunny", temperature: 70 } });
});
```

### Solana Network Identifiers (CAIP-2)
| Network | Identifier |
|---------|------------|
| Solana Mainnet | `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` |
| Solana Devnet | `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1` |

---

## 5. CORBITS.DEV & MCPay — Hackathon Projects

### CORBITS / BlockStory
- **Corbits** (https://corbits.dev) — AI agent orchestration & governance platform, also a production x402 facilitator
- **BlockStory** by Elio Jordan Lopes: https://github.com/lopeselio/blockstory-pay
  - Built at Chainlink Convergence 2026 Hackathon
  - Unified intelligence gateway using x402 for pay-per-request micropayments
  - Uses Corbits Proxy for Nansen data access

### MCPay
- **MCPay** (https://mcpay.tech) — Payment layer for MCP servers
- **Repo:** https://github.com/microchipgnu/mcpay.tech
- **What it built:** Full-stack platform to discover, build, and monetize MCP servers with x402 pay-per-call
- **Note:** No explicit hackathon win documentation found; appears to be a product/infrastructure project

---

## 6. Production Readiness & Risks

### Current Status
- **V2 launched:** December 11, 2025
- **Payment volume:** 100M+ payments processed in first 6 months
- **Production facilitators:** 25+ listed facilitators
- **Default testnet facilitator:** `https://x402.org/facilitator`

### Risks & Caveats
| Risk | Detail |
|------|--------|
| Protocol maturity | V2 is ~5 months old, evolving rapidly |
| Facilitator centralization | Most integrations rely on third-party facilitators |
| Solana race condition | Duplicate settlement possible without SettlementCache |
| Upto scheme limited | Usage-based billing is EVM-only currently |
| No formal audit cited | No publicly listed third-party security audit |

---

## 7. Exact Package Names, CLI Tools & SDKs

### TypeScript / Node.js
| Package | Purpose |
|---------|---------|
| `@x402/core` | Core types, facilitator client, resource server |
| `@x402/svm` | Solana exact scheme |
| `@x402/express` | Express middleware |
| `@x402/next` | Next.js middleware |
| `@x402/fetch` | Fetch wrapper for clients |
| `@x402/mcp` | MCP server integration |

### Python
```bash
pip install x402
pip install "x402[fastapi]" "x402[svm]" "x402[httpx]"
```

### Go
```bash
go get github.com/x402-foundation/x402/go
```

### CLI Tools
| Tool | Command |
|------|---------|
| x402-proxy | `npx x402-proxy` |
| mcpay | `npx mcpay server --urls <url> --api-key <key>` |

---

## Key URLs

| Resource | URL |
|----------|-----|
| x402 Foundation Repo | https://github.com/x402-foundation/x402 |
| V2 Spec | https://github.com/x402-foundation/x402/blob/main/specs/x402-specification-v2.md |
| Exact SVM Spec | https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_svm.md |
| Quickstart (Sellers) | https://docs.x402.org/getting-started/quickstart-for-sellers |
| Ecosystem | https://x402.org/ecosystem |
| BlockStory | https://github.com/lopeselio/blockstory-pay |
| MCPay | https://github.com/microchipgnu/mcpay.tech |
