"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import with SSR disabled — wallet adapter requires browser APIs
const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
) as React.ComponentType<any>;

export default function WalletButton({ className = "" }: { className?: string }) {
  return <WalletMultiButton className={`lockr-wallet-btn ${className}`} />;
}
