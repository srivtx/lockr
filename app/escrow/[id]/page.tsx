"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import MilestoneList from "../../components/MilestoneList";
import StatusBadge from "../../components/StatusBadge";

interface Milestone {
  id: string;
  index: number;
  description: string;
  amount: string;
  status: string;
}

interface EscrowData {
  id: string;
  paymentId: string | null;
  solanaPda: string;
  freelancerWallet: string;
  clientEmail: string;
  totalAmount: string;
  status: string;
  deadline: string;
  fundingSignature: string | null;
  createdAt: string;
  updatedAt: string;
}

interface EscrowResponse {
  escrow: EscrowData;
  milestones: Milestone[];
  solanaSignatures: { type: string; signature: string; explorer: string }[];
}

export default function EscrowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { publicKey } = useWallet();
  const [data, setData] = useState<EscrowResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/escrow/${id}/status`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setData(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load escrow");
        setLoading(false);
      });
  }, [id]);

  const isFreelancer = publicKey && data
    ? data.escrow.freelancerWallet === publicKey.toBase58()
    : false;

  const handleMarkDelivered = async (milestoneIndex: number) => {
    try {
      const res = await fetch(`/api/escrow/${id}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestone_index: milestoneIndex }),
      });
      if (!res.ok) throw new Error("Failed to mark delivered");
      alert("Milestone marked as delivered! Client will be notified.");
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTriggerRefund = async () => {
    try {
      const res = await fetch(`/api/escrow/${id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Refund failed");
      alert("Refund triggered.");
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
        Loading escrow...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
        {error || "Escrow not found."}
      </div>
    );
  }

  const escrow = data.escrow;
  const milestones = data.milestones;
  const deadlinePassed = new Date(escrow.deadline) < new Date();
  const totalAmountNum = Number(escrow.totalAmount) / 1_000_000;

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-emerald-400" />
            <span className="text-lg font-bold text-slate-100">LOCKR</span>
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-slate-200">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Escrow #{escrow.id.slice(0, 8)}</h1>
            <p className="mt-1 text-sm text-slate-400">{escrow.clientEmail}</p>
          </div>
          <StatusBadge status={escrow.status} />
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <InfoCard label="Client" value={escrow.clientEmail} />
          <InfoCard label="Total Amount" value={`$${totalAmountNum.toLocaleString()}`} />
          <InfoCard
            label="Deadline"
            value={new Date(escrow.deadline).toLocaleDateString()}
            highlight={deadlinePassed ? "text-red-400" : "text-slate-100"}
          />
        </div>

        {escrow.fundingSignature && (
          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Funding Transaction</p>
            <a
              href={`https://explorer.solana.com/tx/${escrow.fundingSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm font-mono text-emerald-400 hover:text-emerald-300"
            >
              {escrow.fundingSignature.slice(0, 20)}...{escrow.fundingSignature.slice(-8)}
            </a>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Milestones</h2>
          <MilestoneList
            milestones={milestones.map(m => ({
              id: m.id,
              description: m.description,
              amount: Number(m.amount) / 1_000_000,
              status: m.status,
            }))}
            totalAmount={totalAmountNum}
            onMarkDelivered={isFreelancer ? (idx) => handleMarkDelivered(idx) : undefined}
            isClientView={!isFreelancer}
            isFreelancerView={isFreelancer}
          />
        </div>

        {isFreelancer && deadlinePassed && escrow.status !== 'REFUNDED' && escrow.status !== 'COMPLETED' && (
          <div className="rounded-xl border border-red-800/40 bg-red-900/20 p-5">
            <h3 className="text-sm font-semibold text-red-300">Deadline Passed</h3>
            <p className="mt-1 text-xs text-red-400/80">
              The client did not approve releases before the deadline. You can trigger a refund.
            </p>
            <button
              onClick={handleTriggerRefund}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
            >
              Trigger Refund
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function InfoCard({
  label,
  value,
  highlight = "text-slate-100",
}: {
  label: string;
  value: string;
  highlight?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-1 text-base font-semibold ${highlight}`}>{value}</p>
    </div>
  );
}
