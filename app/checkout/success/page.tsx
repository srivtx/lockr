import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      
      <div className="relative z-10 max-w-md w-full border border-white/[0.08] p-10 text-center">
        <div className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-semibold tracking-tight mb-3">Payment successful</h1>
        <p className="text-sm text-white/40 leading-relaxed mb-8">
          Your payment has been processed. Funds are now locked in the Solana escrow until milestones are approved.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex bg-white text-black px-6 py-3 text-sm font-medium hover:bg-white/90 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
