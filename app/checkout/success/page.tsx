import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Payment Successful!</h1>
        <p className="text-slate-400 mb-8">
          Your payment has been securely processed by Dodo Payments. The funds will be locked in the Solana escrow until the milestones are approved.
        </p>

        <Link
          href="/dashboard"
          className="block w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
