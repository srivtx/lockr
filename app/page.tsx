"use client";

import React from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-400" />
            <span className="text-xl font-bold text-slate-100">LOCKR</span>
          </div>
          <Link
            href="/dashboard"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400"
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-100 sm:text-6xl">
          Milestone Escrow for Indian Freelancers
        </h1>
        <p className="mt-4 text-lg text-emerald-400 font-medium sm:text-xl">
          Fiat In, Trustless Out
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-base text-slate-400 sm:text-lg">
          Your international clients pay in fiat via card or UPI. Funds lock on Solana as USDC.
          You get paid in seconds — not days — with near-zero fees.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-xl bg-emerald-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
          >
            Connect Wallet to Start
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold text-slate-100 sm:text-3xl">How It Works</h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          <StepCard
            step="1"
            title="Create"
            description="Connect your Phantom or Solflare wallet. Set milestones, amounts, and deadlines. Generate a payment link."
          />
          <StepCard
            step="2"
            title="Client Pays"
            description="Your client clicks the link and pays via Dodo — card, UPI, or 40+ fiat methods. No crypto knowledge needed."
          />
          <StepCard
            step="3"
            title="Get Paid"
            description="Deliver your work. Client cryptographically approves release. USDC hits your wallet in 3 seconds."
          />
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-t border-slate-800 bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-center text-sm font-medium uppercase tracking-wider text-slate-500">
            Built on trusted infrastructure
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            <Badge name="Solana" />
            <Badge name="Dodo Payments" />
            <Badge name="USDC" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        LOCKR — Solana Frontier Hackathon
      </footer>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-lg font-bold text-emerald-400">
        {step}
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-100">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}

function Badge({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-5 py-2 text-sm font-medium text-slate-300">
      <div className="h-2 w-2 rounded-full bg-emerald-400" />
      {name}
    </div>
  );
}
