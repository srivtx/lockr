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
        if (data.error) setError(data.error);
        else setData(data);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load"); setLoading(false); });
  }, [id]);

  const isFreelancer = publicKey && data ? data.escrow.freelancerWallet === publicKey.toBase58() : false;

  const handleMarkDelivered = async (milestoneIndex: number) => {
    try {
      const res = await fetch(`/api/escrow/${id}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestone_index: milestoneIndex }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = typeof body.error === "string" ? body.error : `Failed (${res.status})`;
        throw new Error(msg);
      }
      alert("Milestone marked delivered. Client notified.");
      window.location.reload();
    } catch (err: any) {
      alert(err?.message || "Failed");
    }
  };

  const handleTriggerRefund = async () => {
    try {
      const res = await fetch(`/api/escrow/${id}/refund`, { method: "POST" });
      if (!res.ok) throw new Error("Refund failed");
      alert("Refund triggered.");
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/40">{error || "Not found"}</p>
      </div>
    );
  }

  const escrow = data.escrow;
  const milestones = data.milestones;
  const deadlinePassed = new Date(escrow.deadline) < new Date();
  const totalAmountNum = Number(escrow.totalAmount) / 1_000_000;

  return (
    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

      <header className="relative z-10 border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded border border-white/20 flex items-center justify-center">
              <div className="h-2 w-2 bg-white rounded-sm" />
            </div>
            <span className="text-sm font-medium tracking-tight">LOCKR</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-white/40 hover:text-white/70 transition-colors">Back</Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs text-white/40 font-medium tracking-wide uppercase mb-2">Escrow</p>
            <h1 className="text-2xl font-semibold tracking-tight">#{escrow.id.slice(0, 8)}</h1>
            <p className="text-sm text-white/30 mt-1">{escrow.clientEmail}</p>
          </div>
          <StatusBadge status={escrow.status} />
        </div>

        {/* Info grid */}
        <div className="grid gap-px bg-white/[0.06] mb-10">
          <div className="grid sm:grid-cols-3">
            <InfoItem label="Client" value={escrow.clientEmail} />
            <InfoItem label="Total" value={`$${totalAmountNum.toLocaleString()}`} />
            <InfoItem label="Deadline" value={new Date(escrow.deadline).toLocaleDateString()} warning={deadlinePassed} />
          </div>
        </div>

        {/* Funding tx */}
        {escrow.fundingSignature && (
          <div className="border border-white/[0.06] p-4 mb-10">
            <p className="text-xs text-white/40 uppercase tracking-wide">Funding transaction</p>
            <a
              href={`https://explorer.solana.com/tx/${escrow.fundingSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm font-mono text-white/50 hover:text-white/80 transition-colors border-b border-white/10"
            >
              {escrow.fundingSignature.slice(0, 16)}...{escrow.fundingSignature.slice(-8)}
            </a>
          </div>
        )}

        {/* Milestones */}
        <div className="mb-10">
          <p className="text-xs text-white/40 font-medium tracking-wide uppercase mb-4">Milestones</p>
          <MilestoneList
            milestones={milestones.map(m => ({ id: m.id, description: m.description, amount: Number(m.amount) / 1_000_000, status: m.status }))}
            totalAmount={totalAmountNum}
            onMarkDelivered={isFreelancer ? (idx) => handleMarkDelivered(idx) : undefined}
            isFreelancerView={isFreelancer}
          />
        </div>

        {/* Refund */}
        {isFreelancer && deadlinePassed && escrow.status !== "REFUNDED" && escrow.status !== "COMPLETED" && (
          <div className="border border-white/[0.08] p-6">
            <p className="text-sm font-medium">Deadline passed</p>
            <p className="text-xs text-white/40 mt-1">Client did not approve releases. You can trigger a refund.</p>
            <button onClick={handleTriggerRefund} className="mt-4 border border-white/[0.12] px-4 py-2 text-sm text-white/60 hover:text-white hover:border-white/30 transition-colors">
              Trigger refund
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function InfoItem({ label, value, warning }: { label: string; value: string; warning?: boolean }) {
  return (
    <div className="bg-black p-5">
      <p className="text-xs text-white/40 uppercase tracking-wide">{label}</p>
      <p className={`text-base font-medium mt-1 ${warning ? "text-white" : "text-white"}`}>{value}</p>
    </div>
  );
}
