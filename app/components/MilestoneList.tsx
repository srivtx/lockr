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
  const releasedTotal = milestones.filter((m) => m.status === "RELEASED").reduce((sum, m) => sum + m.amount, 0);
  const progress = totalAmount > 0 ? (releasedTotal / totalAmount) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-white/40 mb-2">
          <span>Progress</span>
          <span>${releasedTotal.toLocaleString()} / ${totalAmount.toLocaleString()}</span>
        </div>
        <div className="h-[2px] w-full bg-white/[0.06]">
          <div className="h-full bg-white transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* List */}
      <div className="space-y-px bg-white/[0.06]">
        {milestones.map((milestone, index) => (
          <div key={milestone.id} className="bg-black p-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              <div className="h-6 w-6 border border-white/[0.12] flex items-center justify-center text-xs font-medium text-white/50 shrink-0 mt-0.5">
                {index + 1}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">{milestone.description}</p>
                <p className="text-xs text-white/30 mt-0.5">${milestone.amount.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <StatusBadge status={milestone.status} />

              {isFreelancerView && milestone.status === "FUNDED" && onMarkDelivered && (
                <button
                  onClick={() => onMarkDelivered(index)}
                  className="border border-white/[0.12] px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white hover:border-white/30 transition-colors"
                >
                  Mark delivered
                </button>
              )}

              {isClientView && milestone.status === "COMPLETED" && onApproveRelease && (
                <button
                  onClick={() => onApproveRelease(index)}
                  className="bg-white text-black px-3 py-1.5 text-xs font-medium hover:bg-white/90 transition-colors"
                >
                  Approve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
