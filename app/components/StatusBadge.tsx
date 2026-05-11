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

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  CREATED: {
    label: "Created",
    className: "text-white/40 border-white/[0.08]",
  },
  FUNDING: {
    label: "Funding",
    className: "text-white/60 border-white/[0.12]",
  },
  FUNDED: {
    label: "Funded",
    className: "text-white border-white/20",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "text-white/60 border-white/[0.12]",
  },
  COMPLETED: {
    label: "Completed",
    className: "text-white border-white/20",
  },
  DISPUTED: {
    label: "Disputed",
    className: "text-white/40 border-white/[0.08]",
  },
  REFUNDED: {
    label: "Refunded",
    className: "text-white/30 border-white/[0.06]",
  },
  FAILED: {
    label: "Failed",
    className: "text-white/40 border-white/[0.08]",
  },
  PENDING: {
    label: "Pending",
    className: "text-white/40 border-white/[0.08]",
  },
  COMPLETE: {
    label: "Complete",
    className: "text-white/60 border-white/[0.12]",
  },
  RELEASED: {
    label: "Released",
    className: "text-white border-white/20",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "text-white/40 border-white/[0.08]",
  };

  return (
    <span
      className={`inline-flex items-center border px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase ${config.className}`}
    >
      {config.label}
    </span>
  );
}
