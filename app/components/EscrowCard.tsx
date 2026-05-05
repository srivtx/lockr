"use client";

import React from "react";
import Link from "next/link";
import StatusBadge from "./StatusBadge";

interface Milestone {
  description: string;
  amount: number;
  status: string;
}

interface EscrowCardProps {
  id: string;
  escrowId: string;
  clientEmail: string;
  totalAmount: number;
  status: string;
  milestones: Milestone[];
  deadline: string;
  solanaPda: string;
}

export default function EscrowCard({
  id,
  escrowId,
  clientEmail,
  totalAmount,
  status,
  milestones,
  deadline,
  solanaPda,
}: EscrowCardProps) {
  const funded = milestones.filter((m) => m.status !== "PENDING").length;
  const released = milestones.filter((m) => m.status === "RELEASED").length;
  const total = milestones.length;
  const progress = total > 0 ? (released / total) * 100 : 0;

  return (
    <Link href={`/escrow/${id}`}>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 hover:border-emerald-400/40 transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Escrow #{id.slice(0, 8)}</h3>
            <p className="text-sm text-slate-400 mt-1">{clientEmail}</p>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="flex items-center justify-between text-sm text-slate-300 mb-4">
          <span>Total: ${totalAmount.toLocaleString()}</span>
          <span>Deadline: {new Date(deadline).toLocaleDateString()}</span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Milestone Progress</span>
            <span>
              {released}/{total} released
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800">
            <div
              className="h-2 rounded-full bg-emerald-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 pt-1">
            <span>{funded} funded</span>
            <span>{total - released} remaining</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
