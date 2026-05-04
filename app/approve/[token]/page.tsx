"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import nacl from "tweetnacl";
import StatusBadge from "../../components/StatusBadge";

interface MilestoneData {
  escrowId: string;
  milestoneIndex: number;
  milestoneDescription: string;
  amount: number;
  deadline: number;
}

function decodeToken(token: string): MilestoneData | null {
  try {
    const decoded = JSON.parse(atob(token));
    if (
      typeof decoded.escrowId === "string" &&
      typeof decoded.milestoneIndex === "number" &&
      typeof decoded.milestoneDescription === "string" &&
      typeof decoded.amount === "number" &&
      typeof decoded.deadline === "number"
    ) {
      return decoded as MilestoneData;
    }
    return null;
  } catch {
    return null;
  }
}

function deriveKeypairFromToken(token: string): nacl.SignKeyPair {
  const hash = new Uint8Array(64);
  for (let i = 0; i < token.length; i++) {
    hash[i % 64] ^= token.charCodeAt(i);
  }
  const seed = hash.slice(0, 32);
  return nacl.sign.keyPair.fromSeed(seed);
}

export default function ApprovePage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<MilestoneData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      const decoded = decodeToken(token);
      setData(decoded);
      setLoading(false);
    }
  }, [token]);

  const handleApprove = async () => {
    if (!data || !token) return;
    setSubmitting(true);
    setError(null);

    try {
      const message = `release:${data.escrowId}:${data.milestoneIndex}:${data.deadline}`;
      const messageBytes = new TextEncoder().encode(message);
      const keypair = deriveKeypairFromToken(token);
      const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
      const signatureBase64 = btoa(String.fromCharCode(...Array.from(signature)));
      const publicKeyBase64 = btoa(String.fromCharCode(...Array.from(keypair.publicKey)));

      // Note: The API expects milestone_index and client_signature / client_public_key
      const res = await fetch(`/api/escrow/${data.escrowId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestone_index: data.milestoneIndex,
          client_signature: signatureBase64,
          client_public_key: publicKeyBase64,
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

  if (!data) {
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

            <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Escrow</span>
                <span className="text-sm font-mono text-slate-200">#{data.escrowId.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Milestone</span>
                <span className="text-sm font-medium text-slate-200">{data.milestoneDescription}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Amount</span>
                <span className="text-sm font-semibold text-emerald-400">${data.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Status</span>
                <StatusBadge status="COMPLETE" />
              </div>
            </div>

            {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}

            <button
              onClick={handleApprove}
              disabled={submitting}
              className="mt-6 w-full rounded-xl bg-emerald-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 disabled:opacity-60"
            >
              {submitting ? "Processing..." : "Approve Release"}
            </button>

            <p className="mt-4 text-center text-xs text-slate-500">
              By clicking approve, you cryptographically sign a message authorizing the release of funds on Solana.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
