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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (!data || !secret) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
        Invalid or expired approval link.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-emerald-400" />
            <span className="text-lg font-bold text-slate-100">LOCKR</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 py-12">
        {success ? (
          <div className="rounded-2xl border border-emerald-800/40 bg-emerald-900/20 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-2xl">
              <span className="text-emerald-400">&#10003;</span>
            </div>
            <h2 className="mt-4 text-xl font-bold text-emerald-100">Release Approved</h2>
            <p className="mt-2 text-sm text-emerald-200/80">
              The milestone has been approved and USDC is being released to the freelancer.
            </p>
            {txSignature && (
              <a
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-lg bg-emerald-500 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-400"
              >
                View on Solana Explorer
              </a>
            )}
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-100 text-center">Approve Release</h1>
            <p className="mt-2 text-center text-sm text-slate-400">
              Review the milestone below and confirm to release funds to the freelancer.
            </p>

            {releasableMilestone ? (
              <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Escrow</span>
                  <span className="text-sm font-mono text-slate-200">#{data.escrow.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Milestone</span>
                  <span className="text-sm font-medium text-slate-200">{releasableMilestone.description}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Amount</span>
                  <span className="text-sm font-semibold text-emerald-400">
                    ${(Number(releasableMilestone.amount) / 1_000_000).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Status</span>
                  <StatusBadge status={releasableMilestone.status} />
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6 text-center text-slate-400">
                No releasable milestone found for this escrow.
              </div>
            )}

            {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}

            <button
              onClick={handleApprove}
              disabled={submitting || !releasableMilestone}
              className="mt-6 w-full rounded-xl bg-emerald-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 disabled:opacity-60"
            >
              {submitting ? "Processing..." : "Approve Release"}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
