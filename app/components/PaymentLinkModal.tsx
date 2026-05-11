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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-700/50 bg-slate-900/95 p-8 shadow-2xl shadow-black/50">
        <div className="text-center mb-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 mb-4">
            <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-100">Payment Link Ready</h3>
          <p className="text-sm text-slate-400 mt-2">
            Share this link with your client. They can pay via card, UPI, or 40+ fiat methods.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Payment Link</label>
          <div className="flex gap-2">
            <input
              readOnly
              value={paymentLink}
              className="flex-1 bg-slate-800/60 border-slate-700/50 text-sm font-mono text-slate-300"
            />
            <button
              onClick={handleCopy}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all shrink-0"
            >
              {copied ? (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Copied!
                </span>
              ) : (
                "Copy"
              )}
            </button>
          </div>
        </div>

        {/* QR Code Placeholder */}
        <div className="flex justify-center mb-8">
          <div className="rounded-2xl border border-slate-700/50 bg-white p-5">
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
            className="rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
