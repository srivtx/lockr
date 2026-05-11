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
}: EscrowCardProps) {
  const funded = milestones.filter((m) => m.status !== "PENDING").length;
  const released = milestones.filter((m) => m.status === "RELEASED").length;
  const total = milestones.length;
  const progress = total > 0 ? (released / total) * 100 : 0;
  const fundedProgress = total > 0 ? (funded / total) * 100 : 0;

  const daysLeft = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;

  return (
    <Link href={`/escrow/${id}`}>
      <div className="group bg-black p-6 sm:p-8 hover:bg-white/[0.02] transition-colors duration-300 cursor-pointer">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* Left: Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-base font-medium text-white truncate">Escrow #{escrowId.slice(0, 8)}</h3>
              <StatusBadge status={status} />
            </div>
            <p className="text-sm text-white/30 truncate">{clientEmail}</p>
          </div>

          {/* Right: Amount + Deadline */}
          <div className="text-left sm:text-right shrink-0">
            <p className="text-lg font-medium">${totalAmount.toLocaleString()}</p>
            <p className={`text-xs mt-0.5 ${isOverdue ? "text-white/50" : "text-white/25"}`}>
              {isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-white/25 mb-2">
            <span>Milestone progress</span>
            <span>{released}/{total} released</span>
          </div>
          <div className="h-[2px] w-full bg-white/[0.06] relative overflow-hidden">
            <div
              className="absolute h-full bg-white/20 transition-all duration-700"
              style={{ width: `${fundedProgress}%` }}
            />
            <div
              className="absolute h-full bg-white transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-white/20 mt-2">
            <span>{funded} funded</span>
            <span>{total - released} remaining</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
