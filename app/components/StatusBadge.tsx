"use client";

import React from "react";

type Status =
  | "CREATED"
  | "FUNDING"
  | "FUNDED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DISPUTED"
  | "REFUNDED"
  | "FAILED"
  | "PENDING"
  | "COMPLETE"
  | "RELEASED"
  | string;

interface StatusBadgeProps {
  status: Status;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  CREATED: {
    bg: "bg-slate-800/60",
    text: "text-slate-300",
    label: "Created",
    dot: "bg-slate-400",
  },
  FUNDING: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    label: "Funding",
    dot: "bg-amber-400",
  },
  FUNDED: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    label: "Funded",
    dot: "bg-emerald-400",
  },
  IN_PROGRESS: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    label: "In Progress",
    dot: "bg-blue-400",
  },
  COMPLETED: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    label: "Completed",
    dot: "bg-emerald-400",
  },
  DISPUTED: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    label: "Disputed",
    dot: "bg-red-400",
  },
  REFUNDED: {
    bg: "bg-slate-800/60",
    text: "text-slate-400",
    label: "Refunded",
    dot: "bg-slate-500",
  },
  FAILED: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    label: "Failed",
    dot: "bg-red-400",
  },
  PENDING: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    label: "Pending",
    dot: "bg-amber-400",
  },
  COMPLETE: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    label: "Complete",
    dot: "bg-blue-400",
  },
  RELEASED: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    label: "Released",
    dot: "bg-emerald-400",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    bg: "bg-slate-800/60",
    text: "text-slate-300",
    label: status,
    dot: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border border-slate-700/30 ${config.bg} ${config.text}`}
    >
      <span className={`relative flex h-1.5 w-1.5`}>
        {status === "FUNDING" || status === "IN_PROGRESS" ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'currentColor' }} />
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dot}`} />
          </>
        ) : (
          <span className={`inline-flex rounded-full h-1.5 w-1.5 ${config.dot}`} />
        )}
      </span>
      {config.label}
    </span>
  );
}
