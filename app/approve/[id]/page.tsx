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
  escrow: {
    id: string;
    status: string;
  };
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
        if (result.error) {
          setError(result.error);
        } else {
          setData(result);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load approval details.");
        setLoading(false);
      });
  }, [id]);

  const releasableMilestone = useMemo(() => {
    if (!data) return null;
    return (
      data.milestones.find((m) => m.status === "COMPLETED") ||
      data.milestones.find((m) => m.status === "FUNDED") ||
      null
    );
  }, [data]);

  const handleApprove = async () => {
    if (!id || !releasableMilestone || !secret) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/escrow/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestone_index: releasableMilestone.index,
          secret,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Approval failed");
      }

      const result = await res.json();
      setTxSignature(result.signature || null);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data || !secret) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-slate-400">Invalid or expired approval link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <header className="relative z-10 border-b border-slate-800/50 glass">
        <div className="mx-auto flex max-w-lg items-center justify-center px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500" />
            <span className="text-xl font-bold text-slate-100">LOCKR</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-lg px-6 py-12">
        {success ? (
          <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 p-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 mb-6">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-emerald-100">Release Approved</h2>
            <p className="mt-3 text-slate-400 leading-relaxed">
              The milestone has been approved and USDC is being released to the freelancer.
            </p>
            {txSignature && (
              <a
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
              >
                View on Solana Explorer
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            )}
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 mb-4">
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-100">Approve Release</h1>
              <p className="mt-2 text-slate-400 text-sm">
                Review the milestone and confirm to release funds to the freelancer.
              </p>
            </div>

            {releasableMilestone ? (
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 space-y-5 mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Escrow</span>
                  <span className="text-sm font-mono text-slate-300">#{data.escrow.id.slice(0, 8)}</span>
                </div>

                <div className="h-px bg-slate-800/60" />

                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Milestone</span>
                  <p className="text-lg font-medium text-slate-100 mt-1">{releasableMilestone.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Amount</span>
                    <p className="text-2xl font-bold text-emerald-400 mt-0.5">
                      ${(Number(releasableMilestone.amount) / 1_000_000).toLocaleString()}
                    </p>
                  </div>
                  <StatusBadge status={releasableMilestone.status} />
                </div>

                <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <p className="text-sm text-amber-200/80">
                    This action is irreversible. Once approved, the funds will be released to the freelancer's wallet.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-8 text-center text-slate-400">
                No releasable milestone found for this escrow.
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleApprove}
              disabled={submitting || !releasableMilestone}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 text-lg font-semibold text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 transition-all"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                "Approve Release"
              )}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
