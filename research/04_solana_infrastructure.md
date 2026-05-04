# Solana Stablecoin Infrastructure — Technical Deep Dive

## Source
- Agent research on Solana devnet, SPL tokens, wallet adapters, RPC providers
- Date: 2026-05-04

---

## 1. USDC on Solana (SPL Token)

### Program IDs (Mainnet & Devnet)
| Program | Mainnet / Devnet ID | Notes |
|---|---|---|
| SPL Token | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` | Standard token standard (USDC, USDT, etc.) |
| Associated Token Account (ATA) | `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL` | Idempotent ATA derivation |
| Token-2022 | `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` | Next-gen standard (transfer hooks, metadata) |
| Devnet USDC Mint | `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` | Circle-issued devnet USDC (6 decimals) |
| Mainnet USDC Mint | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` | Native SPL (not Wormhole) |

### Dependencies
```bash
npm install @solana/web3.js@^1.95.0 @solana/spl-token@^0.4.0
npm install -D @types/node
```

### Create / Derive an ATA
```typescript
import { Connection, PublicKey, Keypair, clusterApiUrl } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
const payer = Keypair.generate(); // Fund this with devnet SOL first
const mint = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
const owner = new PublicKey('RECIPIENT_WALLET_ADDRESS');

const ata = await getOrCreateAssociatedTokenAccount(
  connection,
  payer,
  mint,
  owner,
  false
);
console.log('ATA:', ata.address.toBase58());
```

### Transfer SPL Tokens (USDC)
```typescript
import { transfer } from '@solana/spl-token';

const sig = await transfer(
  connection,
  payer,
  sourceATA,
  destATA,
  owner,
  1_000_000 // 1 USDC
);
```

### Mint a Custom Test Token
```typescript
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';

const mint = await createMint(connection, payer, payer.publicKey, null, 6);
const ata = await getOrCreateAssociatedTokenAccount(connection, payer, mint, recipient);
await mintTo(connection, payer, mint, ata.address, payer, 10_000_000_000);
```

---

## 2. Stablecoin Programmability & Programmable Payment Flows

### A. Solana Pay Protocol
- **Spec:** https://solana.com/solana-pay
- **Repo:** github.com/solana-labs/solana-pay
- **Transfer Request:** `solana:<recipient>?amount=1.50&spl-token=<MINT>&reference=<UNIQUE_PUBKEY>&label=Invoice%23123`
- **Transaction Request:** Merchant endpoint returns base64-encoded transaction

### B. Streaming Payments
- **Streamflow** (`streamflow.finance`) — SDK: `@streamflow/stream`
- **Zebec** (`zebec.io`) — SDK: `@zebec/protocol`

### C. Escrow & Conditional Release (Custom Program)

**Recommended Architecture**
| Component | Implementation |
|---|---|
| Escrow Storage | PDA: `["escrow", merchant.key(), invoice_id.as_bytes(), seed.to_le_bytes()]` |
| Token Custody | Escrow ATA owned by the PDA |
| Deposit | CPI `spl_token::transfer` into escrow ATA |
| Release | Time-lock or multi-party `release` instruction |

**Anchor CPI Snippet (Rust)**
```rust
use anchor_spl::token::{self, Transfer, Token, TokenAccount};

let cpi_accounts = Transfer {
    from: ctx.accounts.escrow_token_account.to_account_info(),
    to: ctx.accounts.merchant_token_account.to_account_info(),
    authority: ctx.accounts.escrow.to_account_info(),
};
let seeds = &[
    b"escrow",
    ctx.accounts.merchant.key.as_ref(),
    &ctx.accounts.escrow.invoice_id.to_le_bytes(),
    &[ctx.accounts.escrow.bump],
];
let signer = &[&seeds[..]];
let cpi_ctx = CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_accounts, signer);
token::transfer(cpi_ctx, ctx.accounts.escrow.amount)?;
```

### D. Multisig / Treasury
- **Squads Protocol** (`squads.so`) — Program V4: `SQDS4ep65T866zMzyvWrTmqRYofSCxY6Ei1PZnpxL1T`
- SDK: `@sqds/sdk`

---

## 3. Wallet Integration Best Practices (Next.js)

### Packages
```bash
npm install \
  @solana/web3.js@^1.95.0 \
  @solana/wallet-adapter-base@^0.9.23 \
  @solana/wallet-adapter-react@^0.15.35 \
  @solana/wallet-adapter-react-ui@^0.9.35 \
  @solana/wallet-adapter-phantom@^0.9.24 \
  @solana/wallet-adapter-solflare@^0.6.28 \
  @solana/wallet-adapter-backpack@^0.1.14 \
  react@^18 react-dom@^18 next@^14
```

### Provider Setup
```tsx
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter, BackpackWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';
require('@solana/wallet-adapter-react-ui/styles.css');

function MyApp({ Component, pageProps }) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => 
    process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl(network), 
  []);
  
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({ network }),
    new BackpackWalletAdapter(),
  ], [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Component {...pageProps} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

### Dynamic Import (App Router / SSR Safety)
```tsx
'use client';
import dynamic from 'next/dynamic';

const WalletMultiButtonDynamic = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);
```

### Payment Button Component
```tsx
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, PublicKey } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token';

export function PaymentButton() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const payUsdc = async () => {
    if (!publicKey) return;
    const mint = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
    const merchant = new PublicKey('MERCHANT_WALLET');
    
    const ix = createTransferInstruction(
      getAssociatedTokenAddressSync(mint, publicKey),
      getAssociatedTokenAddressSync(mint, merchant),
      publicKey,
      100_000_000
    );
    
    const tx = new Transaction().add(ix);
    const sig = await sendTransaction(tx, connection);
    await connection.confirmTransaction(sig, 'confirmed');
  };

  return <button onClick={payUsdc} disabled={!publicKey}>Pay 100 USDC</button>;
}
```

---

## 4. Devnet Setup

| Resource | URL / Command |
|---|---|
| Devnet RPC | `https://api.devnet.solana.com` |
| Set CLI | `solana config set --url devnet` |
| CLI Airdrop | `solana airdrop 2 <ADDRESS>` |
| Web Faucet | https://faucet.solana.com/ |
| Alt Faucet | https://solfaucet.com/ |

**Devnet USDC Strategy:**
- Circle's devnet mint is authority-controlled — cannot mint yourself.
- **Recommended:** Create your own 6-decimal SPL mint and treat as test USDC.
- **Alternative:** Swap devnet SOL → devnet USDC on Orca/Jupiter devnet.

---

## 5. Latency, Cost & RPC Provider Recommendations

### Transaction Economics
| Metric | Value |
|---|---|
| Base signature fee | **5,000 lamports** (0.000005 SOL) |
| Typical SPL transfer cost | **~5,000 lamports** |
| Compute Unit default | 200,000 per tx |
| SPL transfer CU usage | ~3,000–4,500 CU |
| Cost at $150 SOL | **~$0.00075** per standard transfer |
| Cost with priority | Still **<$0.01** |

### Confirmation Times
| Commitment | Latency | Use Case |
|---|---|---|
| `processed` | ~400–800 ms | UI feedback only |
| `confirmed` | ~1–3 slots (~1–2 s) | Standard UX |
| `finalized` | ~32 slots (~12–13 s) | Irreversible settlement |

### RPC Providers
| Provider | Free Tier | Devnet? |
|---|---|---|
| **Helius** | 10M credits/mo, 1 webhook | Yes |
| **QuickNode** | Developer plan | Yes |
| **Alchemy** | Generous free tier | Yes |
| **Ironforge** | Free dev tier | Yes |
| **Public Cluster** | N/A (strict limits) | Yes |

**Recommendation:** Sign up for **Helius** immediately.

---

## Quick-Start `package.json` Dependencies Block

```json
{
  "dependencies": {
    "@coral-xyz/anchor": "^0.29.0",
    "@solana/spl-token": "^0.4.0",
    "@solana/wallet-adapter-base": "^0.9.23",
    "@solana/wallet-adapter-react": "^0.15.35",
    "@solana/wallet-adapter-react-ui": "^0.9.35",
    "@solana/wallet-adapter-phantom": "^0.9.24",
    "@solana/wallet-adapter-solflare": "^0.6.28",
    "@solana/wallet-adapter-backpack": "^0.1.14",
    "@solana/web3.js": "^1.95.0",
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

## Build Order for the Hackathon
1. Configure Helius devnet RPC in `.env.local`.
2. Fund deployer wallet via faucet.
3. Deploy a test SPL mint (your own USDC) and mint tokens to team wallets.
4. Scaffold Next.js with wallet adapter providers (dynamic import for SSR safety).
5. Implement core flow: Wallet Adapter → Escrow Program → USDC SPL Transfer.
