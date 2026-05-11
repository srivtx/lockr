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
    <div className="border border-white/[0.06] p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-white/[0.05] animate-pulse" />
          <div className="h-3 w-20 bg-white/[0.05] animate-pulse" />
        </div>
        <div className="h-5 w-14 bg-white/[0.05] animate-pulse" />
      </div>
      <div className="h-1 w-full bg-white/[0.03] mt-6" />
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
        .catch(() => setLoading(false));
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
    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded border border-white/20 flex items-center justify-center">
              <div className="h-2 w-2 bg-white rounded-sm" />
            </div>
            <span className="text-sm font-medium tracking-tight">LOCKR</span>
          </Link>
          <WalletMultiButton className="!bg-white !text-black !text-xs !font-medium !px-4 !py-2 !rounded-none hover:!bg-white/90 !border-0 !transition-colors" />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        {!connected ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="h-12 w-12 rounded border border-white/20 flex items-center justify-center mb-6">
              <div className="h-3 w-3 bg-white/50 rounded-sm" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Connect your wallet</h2>
            <p className="mt-3 text-sm text-white/40 max-w-sm">
              Connect Phantom or Solflare to view your escrows and create new ones.
            </p>
            <div className="mt-8">
              <WalletMultiButton className="!bg-white !text-black !text-sm !font-medium !px-6 !py-3 !rounded-none hover:!bg-white/90 !border-0 !transition-colors" />
            </div>
          </div>
        ) : (
          <>
            {/* Top bar */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
              <div>
                <p className="text-xs text-white/40 font-medium tracking-wide uppercase mb-2">Dashboard</p>
                <h1 className="text-3xl font-semibold tracking-tight">Your Escrows</h1>
                <p className="mt-1 text-sm text-white/30 font-mono">
                  {publicKey?.toBase58().slice(0, 6)}...{publicKey?.toBase58().slice(-4)}
                </p>
              </div>
              <Link
                href="/escrow/create"
                className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 text-sm font-medium hover:bg-white/90 transition-colors shrink-0"
              >
                Create Escrow
              </Link>
            </div>

            {/* Stats - minimal inline */}
            {!loading && escrows.length > 0 && (
              <div className="flex gap-8 mb-12 border-b border-white/[0.06] pb-8">
                <div>
                  <p className="text-2xl font-semibold">${stats.totalValue.toLocaleString()}</p>
                  <p className="text-xs text-white/40 mt-0.5">Total value</p>
                </div>
                <div className="w-px bg-white/[0.06]" />
                <div>
                  <p className="text-2xl font-semibold">{stats.active}</p>
                  <p className="text-xs text-white/40 mt-0.5">Active</p>
                </div>
                <div className="w-px bg-white/[0.06]" />
                <div>
                  <p className="text-2xl font-semibold">{stats.completed}</p>
                  <p className="text-xs text-white/40 mt-0.5">Completed</p>
                </div>
              </div>
            )}

            {/* Escrows */}
            {loading ? (
              <div className="grid gap-px bg-white/[0.06]">
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : escrows.length === 0 ? (
              <div className="border border-white/[0.06] py-24 text-center">
                <div className="h-10 w-10 rounded border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <div className="h-2 w-2 bg-white/20 rounded-sm" />
                </div>
                <p className="text-white/40">No escrows yet</p>
                <p className="text-xs text-white/25 mt-1 mb-6">Create your first milestone escrow</p>
                <Link
                  href="/escrow/create"
                  className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  Create Escrow
                </Link>
              </div>
            ) : (
              <div className="grid gap-px bg-white/[0.06]">
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
