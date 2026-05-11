"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton as _WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import EscrowCard from "../components/EscrowCard";

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
  createdAt: string;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-slate-800 rounded-lg" />
          <div className="h-3 w-24 bg-slate-800 rounded-lg" />
        </div>
        <div className="h-6 w-16 bg-slate-800 rounded-full" />
      </div>
      <div className="h-4 w-full bg-slate-800 rounded-lg mb-4" />
      <div className="h-2 w-full bg-slate-800 rounded-full" />
    </div>
  );
}

function StatsCard({ label, value, subtext }: { label: string; value: string; subtext?: string }) {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-100">{value}</p>
      {subtext && <p className="mt-0.5 text-xs text-slate-600">{subtext}</p>}
    </div>
  );
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

  const stats = useMemo(() => {
    const totalValue = escrows.reduce((sum, e) => sum + Number(e.totalAmount), 0) / 1_000_000;
    const active = escrows.filter((e) => e.status === "FUNDED" || e.status === "IN_PROGRESS").length;
    const completed = escrows.filter((e) => e.status === "COMPLETED").length;
    return { totalValue, active, completed, total: escrows.length };
  }, [escrows]);

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/50 glass sticky top-0">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20" />
            <span className="text-lg font-bold text-slate-100">LOCKR</span>
          </Link>
          <WalletMultiButton className="!rounded-xl !bg-gradient-to-r !from-emerald-500 !to-teal-500 !px-5 !py-2.5 !text-sm !font-semibold !text-white !shadow-lg !shadow-emerald-500/20 hover:!shadow-emerald-500/40 !border-0" />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        {!connected ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-100">Connect Your Wallet</h2>
            <p className="mt-3 max-w-md text-slate-400">
              Connect Phantom, Solflare, or Backpack to view your escrows and create new ones.
            </p>
            <div className="mt-8">
              <WalletMultiButton className="!rounded-2xl !bg-gradient-to-r !from-emerald-500 !to-teal-500 !px-8 !py-4 !text-base !font-semibold !text-white !shadow-xl !shadow-emerald-500/25 hover:!shadow-emerald-500/40 !border-0" />
            </div>
          </div>
        ) : (
          <>
            {/* Welcome + Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
              <div>
                <h2 className="text-3xl font-bold text-slate-100">Your Escrows</h2>
                <p className="text-sm text-slate-500 mt-1 font-mono">
                  {publicKey?.toBase58().slice(0, 6)}...{publicKey?.toBase58().slice(-4)}
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/withdraw"
                  className="rounded-xl border border-slate-700 bg-slate-900/50 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800/50 hover:border-slate-600 transition-all"
                >
                  Withdraw
                </Link>
                <Link
                  href="/escrow/create"
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all"
                >
                  + Create Escrow
                </Link>
              </div>
            </div>

            {/* Stats */}
            {!loading && escrows.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                <StatsCard label="Total Value" value={`$${stats.totalValue.toLocaleString()}`} />
                <StatsCard label="Active" value={stats.active.toString()} subtext="Funded / In Progress" />
                <StatsCard label="Completed" value={stats.completed.toString()} />
                <StatsCard label="Total Escrows" value={stats.total.toString()} />
              </div>
            )}

            {/* Escrows Grid */}
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : escrows.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 py-24 text-center">
                <div className="h-16 w-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <p className="text-lg text-slate-400 font-medium">No escrows yet</p>
                <p className="text-sm text-slate-600 mt-1 mb-6">Create your first milestone escrow to get started</p>
                <Link
                  href="/escrow/create"
                  className="inline-flex items-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all"
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
                      status: m.status as string,
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
