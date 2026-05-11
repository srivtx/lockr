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

function getStatusIcon(status: string) {
  switch (status) {
    case "CREATED":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "FUNDED":
    case "FUNDING":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "COMPLETED":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
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
      <div className="group relative rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 hover:border-emerald-500/30 hover:bg-slate-900/60 transition-all duration-300 cursor-pointer">
        {/* Top glow on hover */}
        <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-100 truncate">Escrow #{escrowId.slice(0, 8)}</h3>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <p className="text-sm text-slate-400 truncate">{clientEmail}</p>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Amount + Deadline */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Amount</p>
            <p className="text-xl font-bold text-slate-100 mt-0.5">${totalAmount.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Deadline</p>
            <p className={`text-sm font-medium mt-0.5 ${isOverdue ? "text-red-400" : daysLeft <= 3 ? "text-amber-400" : "text-slate-300"}`}>
              {isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Today" : `${daysLeft}d left`}
            </p>
          </div>
        </div>

        {/* Milestones Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Milestone Progress</span>
            <span className="text-slate-400">
              {released}/{total} released
            </span>
          </div>

          {/* Progress bar with funded + released states */}
          <div className="relative h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
            {/* Funded portion */}
            <div
              className="absolute h-full rounded-full bg-amber-500/40 transition-all duration-500"
              style={{ width: `${fundedProgress}%` }}
            />
            {/* Released portion */}
            <div
              className="absolute h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
              {funded} funded
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {released} released
            </span>
            <span>{total - released} remaining</span>
          </div>
        </div>

        {/* Quick Actions Preview */}
        <div className="mt-5 pt-4 border-t border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            {getStatusIcon(status)}
            <span className="capitalize">{status.toLowerCase().replace("_", " ")}</span>
          </div>
          <span className="text-xs text-emerald-400/70 group-hover:text-emerald-400 transition-colors flex items-center gap-1">
            View Details
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
