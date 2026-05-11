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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-md border border-white/[0.08] bg-black p-8">
        <div className="text-center mb-8">
          <div className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 className="text-lg font-semibold tracking-tight">Payment link ready</h3>
          <p className="text-sm text-white/40 mt-2">Share this with your client</p>
        </div>

        <div className="flex gap-2 mb-8">
          <input readOnly value={paymentLink} className="flex-1 text-xs font-mono text-white/50" />
          <button
            onClick={handleCopy}
            className="bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition-colors shrink-0"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="flex justify-center mb-8">
          <div className="border border-white/[0.08] bg-white p-4">
            <svg width="140" height="140" viewBox="0 0 160 160" className="text-black">
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

        <button onClick={onClose} className="w-full border border-white/[0.08] py-2.5 text-sm text-white/50 hover:text-white/80 hover:border-white/[0.15] transition-colors">
          Done
        </button>
      </div>
    </div>
  );
}
