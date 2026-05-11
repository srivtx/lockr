"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";

interface INRRate {
  rate: number;
  source: string;
}

export default function WithdrawPage() {
  const { connected } = useWallet();
  const [balance, setBalance] = useState(1250.0);
  const [bankAccount, setBankAccount] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [amount, setAmount] = useState("");
  const [inrRate, setInrRate] = useState<INRRate | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [success, setSuccess] = useState(false);

  const amountNum = parseFloat(amount) || 0;
  const estimatedINR = inrRate ? Math.floor(amountNum * inrRate.rate) : 0;

  useEffect(() => {
    if (amountNum > 0) {
      setLoadingRate(true);
      fetch("https://api.coindcx.com/exchange/ticker")
        .then((res) => res.json())
        .then((data: any[]) => {
          const usdcPair = data.find((t) => t.market === "USDCINR");
          if (usdcPair?.last_price) {
            setInrRate({ rate: parseFloat(usdcPair.last_price), source: "CoinDCX" });
          } else {
            setInrRate({ rate: 83.5, source: "Mock" });
          }
        })
        .catch(() => setInrRate({ rate: 83.5, source: "Mock" }))
        .finally(() => setLoadingRate(false));
    }
  }, [amountNum]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankAccount || !ifsc || amountNum <= 0 || amountNum > balance) return;
    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      setSuccess(true);
      setBalance((prev) => prev - amountNum);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

      <header className="relative z-50 border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-xl items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded border border-white/20 flex items-center justify-center">
              <div className="h-2 w-2 bg-white rounded-sm" />
            </div>
            <span className="text-sm font-medium tracking-tight">LOCKR</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-white/40 hover:text-white/70 transition-colors">Dashboard</Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-xl px-6 py-12">
        <div className="mb-10">
          <p className="text-xs text-white/40 font-medium tracking-wide uppercase mb-2">Withdraw</p>
          <h1 className="text-3xl font-semibold tracking-tight">Withdraw to bank</h1>
          <p className="text-sm text-white/40 mt-2">Convert USDC to INR and withdraw to your Indian bank account.</p>
        </div>

        {!connected ? (
          <div className="border border-dashed border-white/[0.08] py-20 text-center">
            <p className="text-white/40">Connect your wallet to withdraw.</p>
          </div>
        ) : success ? (
          <div className="border border-white/[0.08] p-10 text-center">
            <div className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-xl font-semibold">Withdrawal initiated</h2>
            <p className="text-sm text-white/40 mt-2">You will receive an email confirmation shortly.</p>
            <Link href="/dashboard" className="mt-6 inline-flex bg-white text-black px-5 py-2.5 text-sm font-medium hover:bg-white/90 transition-colors">
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <form onSubmit={handleWithdraw} className="space-y-8">
            <div className="border border-white/[0.06] p-5">
              <p className="text-xs text-white/40 uppercase tracking-wide">USDC Balance</p>
              <p className="text-2xl font-semibold mt-1">${balance.toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Amount (USDC)</label>
              <input type="number" step="0.01" max={balance} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full" />
              {amountNum > balance && <p className="mt-2 text-xs text-white/40">Exceeds balance.</p>}
            </div>

            {amountNum > 0 && inrRate && (
              <div className="border border-white/[0.06] p-4 space-y-2">
                <div className="flex justify-between text-sm text-white/50">
                  <span>Rate</span>
                  <span>1 USDC = ₹{inrRate.rate.toFixed(2)}</span>
                </div>
                <div className="h-px bg-white/[0.06]" />
                <div className="flex justify-between text-base font-medium">
                  <span>Estimated INR</span>
                  <span>₹{estimatedINR.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Account Number</label>
              <input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="1234567890" className="w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">IFSC Code</label>
              <input value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} placeholder="HDFC0001234" className="w-full" />
            </div>

            <button
              type="submit"
              disabled={withdrawing || amountNum <= 0 || amountNum > balance || !bankAccount || !ifsc}
              className="w-full bg-white text-black py-3 text-sm font-medium hover:bg-white/90 disabled:opacity-30 transition-colors"
            >
              {withdrawing ? "Processing..." : "Confirm withdrawal"}
            </button>

            <p className="text-center text-xs text-white/20">Simulated flow. Real off-ramp coming post-hackathon.</p>
          </form>
        )}
      </main>
    </div>
  );
}
