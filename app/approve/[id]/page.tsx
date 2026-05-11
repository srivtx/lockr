"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import StatusBadge from "../../components/StatusBadge";

interface Milestone {
  id: string;
  index: number;
  description: string;
  amount: string;
  status: string;
}

interface EscrowStatusResponse {
  escrow: { id: string; status: string };
  milestones: Milestone[];
}

export default function ApprovePage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const secret = searchParams.get("secret") || "";

  const [data, setData] = useState<EscrowStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/escrow/${id}/status`)
      .then((res) => res.json())
      .then((result) => {
        if (result.error) setError(result.error);
        else setData(result);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load"); setLoading(false); });
  }, [id]);

  const releasableMilestone = useMemo(() => {
    if (!data) return null;
    return data.milestones.find((m) => m.status === "COMPLETED") || data.milestones.find((m) => m.status === "FUNDED") || null;
  }, [data]);

  const handleApprove = async () => {
    if (!id || !releasableMilestone || !secret) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/escrow/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestone_index: releasableMilestone.index, secret }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      const result = await res.json();
      setTxSignature(result.signature || null);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin" />
      </div>
    );
  }

  if (!data || !secret) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/40">Invalid link</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

      <header className="relative z-50 border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-lg items-center justify-center px-6 h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded border border-white/20 flex items-center justify-center">
              <div className="h-2 w-2 bg-white rounded-sm" />
            </div>
            <span className="text-sm font-medium tracking-tight">LOCKR</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-lg px-6 py-16">
        {success ? (
          <div className="text-center">
            <div className="h-12 w-12 rounded-full border border-white/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Released</h2>
            <p className="mt-3 text-sm text-white/40">Funds have been released to the freelancer.</p>
            {txSignature && (
              <a href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors border-b border-white/10 pb-0.5">
                View transaction
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M7 7h10v10" /></svg>
              </a>
            )}
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <p className="text-xs text-white/40 font-medium tracking-wide uppercase mb-3">Approval required</p>
              <h1 className="text-2xl font-semibold tracking-tight">Release funds</h1>
              <p className="mt-2 text-sm text-white/40">Review and approve milestone completion</p>
            </div>

            {releasableMilestone ? (
              <div className="border border-white/[0.06] p-6 space-y-6 mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40 uppercase tracking-wide">Escrow</span>
                  <span className="text-xs font-mono text-white/30">#{data.escrow.id.slice(0, 8)}</span>
                </div>
                <div className="h-px bg-white/[0.06]" />
                <div>
                  <span className="text-xs text-white/40 uppercase tracking-wide">Milestone</span>
                  <p className="text-base font-medium mt-1">{releasableMilestone.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-white/40 uppercase tracking-wide">Amount</span>
                    <p className="text-xl font-semibold mt-0.5">${(Number(releasableMilestone.amount) / 1_000_000).toLocaleString()}</p>
                  </div>
                  <StatusBadge status={releasableMilestone.status} />
                </div>
                <div className="border border-white/[0.06] p-4 bg-white/[0.02]">
                  <p className="text-xs text-white/40 leading-relaxed">
                    This action is irreversible. Once approved, USDC will be transferred to the freelancer's wallet.
                  </p>
                </div>
              </div>
            ) : (
              <div className="border border-white/[0.06] p-8 text-center text-white/40">
                No releasable milestone found.
              </div>
            )}

            {error && <p className="text-xs text-white/40 text-center mb-4">{error}</p>}

            <button
              onClick={handleApprove}
              disabled={submitting || !releasableMilestone}
              className="w-full bg-white text-black py-3 text-sm font-medium hover:bg-white/90 disabled:opacity-30 transition-colors"
            >
              {submitting ? "Processing..." : "Approve release"}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
