"use client";

import React from "react";
import StatusBadge from "./StatusBadge";

interface Milestone {
  id: string;
  description: string;
  amount: number;
  status: string;
}

interface MilestoneListProps {
  milestones: Milestone[];
  totalAmount: number;
  onMarkDelivered?: (milestoneIndex: number) => void;
  onApproveRelease?: (milestoneIndex: number) => void;
  isClientView?: boolean;
  isFreelancerView?: boolean;
}

export default function MilestoneList({
  milestones,
  totalAmount,
  onMarkDelivered,
  onApproveRelease,
  isClientView = false,
  isFreelancerView = false,
}: MilestoneListProps) {
  const releasedTotal = milestones
    .filter((m) => m.status === "RELEASED")
    .reduce((sum, m) => sum + m.amount, 0);

  const progress = totalAmount > 0 ? (releasedTotal / totalAmount) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-300">
          <span>Overall Progress</span>
          <span>${releasedTotal.toLocaleString()} / ${totalAmount.toLocaleString()}</span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-800">
          <div
            className="h-3 rounded-full bg-emerald-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {milestones.map((milestone, index) => (
          <div
            key={milestone.id}
            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-5 py-4"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-emerald-400">
                {index + 1}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-100">{milestone.description}</p>
                <p className="text-xs text-slate-400 mt-0.5">${milestone.amount.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={milestone.status} />

              {isFreelancerView && milestone.status === "FUNDED" && onMarkDelivered && (
                <button
                  onClick={() => onMarkDelivered(index)}
                  className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-400"
                >
                  Mark Delivered
                </button>
              )}

              {isClientView && milestone.status === "COMPLETED" && onApproveRelease && (
                <button
                  onClick={() => onApproveRelease(index)}
                  className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-400"
                >
                  Approve Release
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
