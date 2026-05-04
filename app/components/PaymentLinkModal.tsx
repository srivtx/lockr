"use client";

import React, { useState } from "react";

interface PaymentLinkModalProps {
  paymentLink: string;
  onClose: () => void;
}

export default function PaymentLinkModal({ paymentLink, onClose }: PaymentLinkModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textArea = document.createElement("textarea");
      textArea.value = paymentLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <h3 className="text-xl font-semibold text-slate-100 mb-2">Payment Link Ready</h3>
        <p className="text-sm text-slate-400 mb-6">
          Share this link with your client. They will pay via Dodo Payments and funds will lock into the escrow on Solana.
        </p>

        <div className="mb-6">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Payment Link</label>
          <div className="flex gap-2">
            <input
              readOnly
              value={paymentLink}
              className="flex-1 bg-slate-800 border-slate-700 text-sm"
            />
            <button
              onClick={handleCopy}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400 shrink-0"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="rounded-xl border border-slate-700 bg-white p-4">
            {/* Simple inline SVG QR placeholder */}
            <svg width="160" height="160" viewBox="0 0 160 160" className="text-slate-900">
              <rect width="160" height="160" fill="white" />
              <rect x="10" y="10" width="50" height="50" fill="currentColor" />
              <rect x="20" y="20" width="30" height="30" fill="white" />
              <rect x="25" y="25" width="20" height="20" fill="currentColor" />
              <rect x="100" y="10" width="50" height="50" fill="currentColor" />
              <rect x="110" y="20" width="30" height="30" fill="white" />
              <rect x="115" y="25" width="20" height="20" fill="currentColor" />
              <rect x="10" y="100" width="50" height="50" fill="currentColor" />
              <rect x="20" y="110" width="30" height="30" fill="white" />
              <rect x="25" y="115" width="20" height="20" fill="currentColor" />
              <rect x="70" y="10" width="10" height="10" fill="currentColor" />
              <rect x="70" y="30" width="10" height="10" fill="currentColor" />
              <rect x="70" y="50" width="10" height="10" fill="currentColor" />
              <rect x="90" y="70" width="10" height="10" fill="currentColor" />
              <rect x="110" y="70" width="10" height="10" fill="currentColor" />
              <rect x="130" y="70" width="10" height="10" fill="currentColor" />
              <rect x="70" y="90" width="10" height="10" fill="currentColor" />
              <rect x="70" y="110" width="10" height="10" fill="currentColor" />
              <rect x="70" y="130" width="10" height="10" fill="currentColor" />
              <rect x="90" y="90" width="10" height="10" fill="currentColor" />
              <rect x="110" y="110" width="10" height="10" fill="currentColor" />
              <rect x="130" y="130" width="10" height="10" fill="currentColor" />
              <rect x="90" y="130" width="10" height="10" fill="currentColor" />
              <rect x="130" y="90" width="10" height="10" fill="currentColor" />
            </svg>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-5 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
