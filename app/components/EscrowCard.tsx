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
}

export default function EscrowCard({
  id,
  escrowId,
  clientEmail,
  totalAmount,
  status,
  milestones,
  deadline,
}: EscrowCardProps) {
  const funded = milestones.filter((m) => m.status !== "PENDING").length;
  const released = milestones.filter((m) => m.status === "RELEASED").length;
  const total = milestones.length;
  const progress = total > 0 ? (released / total) * 100 : 0;

  const daysLeft = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;

  return (
    <Link href={`/escrow/${id}`}>
      <div className="group bg-black p-6 sm:p-8 hover:bg-white/[0.02] transition-colors duration-300 cursor-pointer border-b border-white/[0.04]">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* Left: Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-1.5">
              <h3 className="text-sm font-medium text-white/80 truncate">Escrow #{escrowId.slice(0, 8)}</h3>
              <StatusBadge status={status} />
            </div>
            <p className="text-xs text-white/25 truncate">{clientEmail}</p>
          </div>

          {/* Right: Amount + Deadline */}
          <div className="text-left sm:text-right shrink-0">
            <p className="text-sm font-medium text-white/70">${totalAmount.toLocaleString()}</p>
            <p className={`text-[11px] mt-0.5 ${isOverdue ? "text-white/40" : "text-white/20"}`}>
              {isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
            </p>
          </div>
        </div>

        {/* Minimal progress */}
        <div className="mt-5 flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-white/[0.06] relative">
            <div
              className="absolute h-full bg-white/30 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-white/20 tabular-nums">
            {released}/{total}
          </span>
        </div>
      </div>
    </Link>
  );
}
