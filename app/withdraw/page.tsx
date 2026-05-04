"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";

interface INRRate {
  rate: number;
  source: string;
}

export default function WithdrawPage() {
  const { publicKey, connected } = useWallet();
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
      // Mock CoinDCX API call
      fetch("https://api.coindcx.com/exchange/ticker")
        .then((res) => res.json())
        .then((data: any[]) => {
          const usdcPair = data.find((t) => t.market === "USDCINR");
          if (usdcPair && usdcPair.last_price) {
            setInrRate({ rate: parseFloat(usdcPair.last_price), source: "CoinDCX" });
          } else {
            // Fallback mock rate
            setInrRate({ rate: 83.5, source: "Mock Rate" });
          }
        })
        .catch(() => {
          setInrRate({ rate: 83.5, source: "Mock Rate" });
        })
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
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-emerald-400" />
            <span className="text-lg font-bold text-slate-100">LOCKR</span>
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-slate-200">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-100">Withdraw to Bank</h1>
        <p className="mt-1 text-sm text-slate-400">Convert USDC to INR and withdraw to your Indian bank account.</p>

        {!connected ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
            <p className="text-slate-400">Connect your wallet to view your balance and withdraw.</p>
          </div>
        ) : success ? (
          <div className="mt-8 rounded-2xl border border-emerald-800/40 bg-emerald-900/20 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-2xl">✅</div>
            <h2 className="mt-4 text-xl font-bold text-emerald-100">Withdrawal Initiated</h2>
            <p className="mt-2 text-sm text-emerald-200/80">
              Your INR withdrawal is being processed. You will receive an email confirmation shortly.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-block rounded-lg bg-emerald-500 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-400"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <form onSubmit={handleWithdraw} className="mt-8 space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">USDC Balance</p>
              <p className="mt-1 text-2xl font-bold text-emerald-400">${balance.toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount to Withdraw (USDC)</label>
              <input
                type="number"
                step="0.01"
                max={balance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
              {amountNum > balance && <p className="mt-1 text-xs text-red-400">Amount exceeds balance.</p>}
            </div>

            {amountNum > 0 && inrRate && (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <div className="flex justify-between text-sm text-slate-300">
                  <span>Rate</span>
                  <span>
                    1 USDC = ₹{inrRate.rate.toFixed(2)} ({inrRate.source})
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-base font-semibold text-slate-100">
                  <span>Estimated INR</span>
                  <span>₹{estimatedINR.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Bank Account Number</label>
              <input
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">IFSC Code</label>
              <input
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                placeholder="HDFC0001234"
              />
            </div>

            <button
              type="submit"
              disabled={withdrawing || amountNum <= 0 || amountNum > balance || !bankAccount || !ifsc}
              className="w-full rounded-xl bg-emerald-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 disabled:opacity-60"
            >
              {withdrawing ? "Processing..." : "Confirm Withdrawal"}
            </button>

            <p className="text-center text-xs text-slate-500">
              This is a simulated flow. Real INR off-ramp integration is coming post-hackathon.
            </p>
          </form>
        )}
      </main>
    </div>
  );
}
