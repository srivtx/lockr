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

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  CREATED: { bg: "bg-slate-700", text: "text-slate-300", label: "Created" },
  FUNDING: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Funding" },
  FUNDED: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Funded" },
  IN_PROGRESS: { bg: "bg-blue-500/10", text: "text-blue-400", label: "In Progress" },
  COMPLETED: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Completed" },
  DISPUTED: { bg: "bg-red-500/10", text: "text-red-400", label: "Disputed" },
  REFUNDED: { bg: "bg-slate-700", text: "text-slate-400", label: "Refunded" },
  FAILED: { bg: "bg-red-500/10", text: "text-red-400", label: "Failed" },
  PENDING: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Pending" },
  COMPLETE: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Complete" },
  RELEASED: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Released" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? { bg: "bg-slate-700", text: "text-slate-300", label: status };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  );
}
