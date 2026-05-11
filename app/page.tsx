"use client";

import React from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";

// Simple SVG icons as components
const ShieldIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const ZapIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

export default function LandingPage() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-[#0a0e1a] overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-[800px] h-[400px] bg-emerald-900/20 rounded-full blur-[150px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-slate-800/50 glass sticky top-0">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow" />
              <div className="absolute inset-0 h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 blur-md opacity-50 group-hover:opacity-70 transition-opacity" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">LOCKR</span>
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all"
          >
            {connected ? "Dashboard" : "Launch App"}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-24 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            Solana Frontier Hackathon Submission
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-100 leading-[1.1]">
            Milestone Escrow{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              for Indian Freelancers
            </span>
          </h1>

          <p className="mt-6 text-xl sm:text-2xl font-medium text-emerald-400/90">
            Fiat In, Trustless Out
          </p>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            Your international clients pay in fiat via card or UPI. Funds lock on Solana as USDC.
            You get paid in seconds — not days — with near-zero fees.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 transition-all"
            >
              {connected ? "Go to Dashboard" : "Connect Wallet to Start"}
              <ArrowRightIcon />
            </Link>
            <a
              href="https://github.com/srivtx/lockr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/50 px-8 py-4 text-lg font-semibold text-slate-300 hover:bg-slate-800/50 hover:border-slate-600 transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View on GitHub
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-100">3s</div>
              <div className="text-sm text-slate-500 mt-1">Settlement</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-100">&lt;$0.01</div>
              <div className="text-sm text-slate-500 mt-1">Per Tx</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-100">40+</div>
              <div className="text-sm text-slate-500 mt-1">Fiat Methods</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">How It Works</h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            From contract to cash in three simple steps. No crypto knowledge required from your clients.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <StepCard
            icon={<ShieldIcon />}
            step="01"
            title="Create Escrow"
            description="Connect your Phantom or Solflare wallet. Set milestones, amounts, and deadlines. Generate a payment link in seconds."
          />
          <StepCard
            icon={<GlobeIcon />}
            step="02"
            title="Client Pays Fiat"
            description="Your client clicks the link and pays via Dodo — card, UPI, or 40+ fiat methods. No wallet or crypto knowledge needed."
          />
          <StepCard
            icon={<ZapIcon />}
            step="03"
            title="Get Paid in USDC"
            description="Deliver your work. Client cryptographically approves release via email. USDC hits your wallet in 3 seconds."
          />
        </div>
      </section>

      {/* Architecture / Trust */}
      <section className="relative z-10 border-y border-slate-800/50 glass">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">Built on Battle-Tested Infrastructure</h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            <TrustBadge name="Solana" color="from-purple-500 to-blue-500" />
            <TrustBadge name="USDC" color="from-blue-500 to-cyan-500" />
            <TrustBadge name="Dodo Payments" color="from-orange-500 to-red-500" />
            <TrustBadge name="Helius RPC" color="from-emerald-500 to-teal-500" />
            <TrustBadge name="Supabase" color="from-green-500 to-emerald-500" />
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            title="Milestone-Based"
            description="Break projects into up to 5 milestones. Get paid incrementally as work is delivered and approved."
          />
          <FeatureCard
            title="Zero Client Onboarding"
            description="Clients pay with familiar methods. No wallet setup, no seed phrases, no crypto confusion."
          />
          <FeatureCard
            title="Email Approvals"
            description="Client approves release via secure email link with cryptographic verification on-chain."
          />
          <FeatureCard
            title="Dispute Resolution"
            description="Built-in dispute mechanism with cryptographic signatures for fair, transparent arbitration."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/20 p-12 sm:p-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">
            Ready to get paid faster?
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-xl mx-auto">
            Join freelancers who are ditching 30-day payment terms for instant USDC settlements.
          </p>
          <div className="mt-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 transition-all"
            >
              Start Your First Escrow
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500" />
            <span className="text-sm font-semibold text-slate-300">LOCKR</span>
          </div>
          <p className="text-sm text-slate-500">
            Built for the Solana Frontier Hackathon · Superteam India × Dodo Payments
          </p>
          <div className="flex gap-4">
            <a href="https://github.com/srivtx/lockr" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({
  icon,
  step,
  title,
  description,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative rounded-2xl border border-slate-800/60 bg-slate-900/40 p-8 hover:border-emerald-500/30 hover:bg-slate-900/60 transition-all duration-300">
      <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center justify-between mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
          {icon}
        </div>
        <span className="text-4xl font-bold text-slate-800 group-hover:text-slate-700 transition-colors">{step}</span>
      </div>
      <h3 className="text-xl font-semibold text-slate-100 mb-3">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}

function TrustBadge({ name, color }: { name: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-full glass px-5 py-2.5">
      <div className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${color}`} />
      <span className="text-sm font-medium text-slate-300">{name}</span>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-6 hover:bg-slate-900/50 hover:border-slate-700/60 transition-all">
      <div className="h-1 w-12 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 mb-4" />
      <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}
