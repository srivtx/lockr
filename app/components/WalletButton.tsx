"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export default function WalletButton({ className = "" }: { className?: string }) {
  const { publicKey, wallet, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const [copied, setCopied] = useState(false);
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const base58 = publicKey?.toBase58();
  const content = base58 ? `${base58.slice(0, 4)}...${base58.slice(-4)}` : "Connect Wallet";

  const copyAddress = useCallback(async () => {
    if (base58) {
      await navigator.clipboard.writeText(base58);
      setCopied(true);
      setTimeout(() => setCopied(false), 400);
    }
  }, [base58]);

  const closeDropdown = useCallback(() => {
    setActive(false);
  }, []);

  const openModal = useCallback(() => {
    setVisible(true);
    closeDropdown();
  }, [setVisible, closeDropdown]);

  const handleDisconnect = useCallback(() => {
    disconnect().catch(() => {
      // Silently catch - errors handled by WalletProvider
    });
    closeDropdown();
  }, [disconnect, closeDropdown]);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const node = ref.current;
      if (!node || node.contains(event.target as Node)) return;
      closeDropdown();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [closeDropdown]);

  if (!wallet || !base58) {
    return (
      <button
        type="button"
        className={`bg-white text-black text-xs font-medium px-4 py-2 hover:bg-white/90 transition-colors cursor-pointer ${className}`}
        onClick={openModal}
      >
        {connecting ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        className={`bg-white text-black text-xs font-medium px-4 py-2 hover:bg-white/90 transition-colors flex items-center gap-2 cursor-pointer ${className}`}
        onClick={() => setActive((prev) => !prev)}
        aria-expanded={active}
        title="Wallet"
      >
        <span>{content}</span>
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={`transition-transform duration-200 ${active ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {active && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-black border border-white/[0.12] shadow-2xl z-[100] py-1">
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <p className="text-xs text-white/40 mb-1">Connected</p>
            <p className="text-sm font-mono text-white/80">{content}</p>
          </div>
          <button
            type="button"
            className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.05] hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
            onClick={copyAddress}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {copied ? "Copied!" : "Copy Address"}
          </button>
          <button
            type="button"
            className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.05] hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
            onClick={openModal}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Change Wallet
          </button>
          <div className="border-t border-white/[0.06] mt-1 pt-1">
            <button
              type="button"
              className="w-full text-left px-4 py-2.5 text-sm text-red-400/80 hover:bg-white/[0.05] hover:text-red-400 transition-colors flex items-center gap-2 cursor-pointer"
              onClick={handleDisconnect}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
