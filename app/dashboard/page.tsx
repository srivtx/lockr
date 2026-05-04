"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton as _WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import EscrowCard from "../components/EscrowCard";

// Cast to work around @types/react 18.3 JSX component type mismatch
const WalletMultiButton = _WalletMultiButton as React.ComponentType<any>;

interface Milestone {
  id: string;
  index: number;
  description: string;
  amount: bigint;
  status: string;
}

interface Escrow {
  id: string;
  escrowId: string;
  clientEmail: string;
  totalAmount: bigint;
  status: string;
  milestones: Milestone[];
  deadline: string;
  solanaPda: string;
}

export default function DashboardPage() {
  const { publicKey, connected } = useWallet();
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (connected && publicKey) {
      fetch(`/api/escrow?wallet=${publicKey.toBase58()}`)
        .then((res) => res.json())
        .then((data) => {
          setEscrows(data.escrows || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch escrows", err);
          setLoading(false);
        });
    } else {
      setEscrows([]);
      setLoading(false);
    }
  }, [connected, publicKey]);

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-emerald-400" />
            <span className="text-lg font-bold text-slate-100">LOCKR</span>
          </Link>
          <WalletMultiButton className="!rounded-lg !bg-emerald-500 !px-4 !py-2 !text-sm !font-medium !text-white hover:!bg-emerald-400" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {!connected ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <h2 className="text-2xl font-bold text-slate-100">Connect Your Wallet</h2>
            <p className="mt-3 max-w-md text-slate-400">
              Connect Phantom, Solflare, or Backpack to view your escrows and create new ones.
            </p>
            <div className="mt-6">
              <WalletMultiButton className="!rounded-xl !bg-emerald-500 !px-6 !py-3 !text-base !font-semibold !text-white hover:!bg-emerald-400" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
              <div>
                <h2 className="text-2xl font-bold text-slate-100">Your Escrows</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Wallet: {publicKey?.toBase58().slice(0, 6)}...{publicKey?.toBase58().slice(-4)}
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/withdraw"
                  className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
                >
                  Withdraw to Bank
                </Link>
                <Link
                  href="/escrow/create"
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400"
                >
                  Create New Escrow
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20 text-slate-500">Loading escrows...</div>
            ) : escrows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 py-20 text-center">
                <p className="text-slate-400">No escrows yet.</p>
                <Link
                  href="/escrow/create"
                  className="mt-4 inline-block rounded-lg bg-emerald-500 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-400"
                >
                  Create Your First Escrow
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {escrows.map((escrow) => (
                  <EscrowCard
                    key={escrow.id}
                    id={escrow.id}
                    escrowId={escrow.escrowId}
                    clientEmail={escrow.clientEmail}
                    totalAmount={Number(escrow.totalAmount) / 1_000_000}
                    status={escrow.status}
                    milestones={escrow.milestones.map((m) => ({
                      description: m.description,
                      amount: Number(m.amount) / 1_000_000,
                      status: m.status,
                    }))}
                    deadline={escrow.deadline}
                    solanaPda={escrow.solanaPda}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
