"use client";

import React from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";

function ArrowUpRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function LandingPage() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid-pattern opacity-50 pointer-events-none" />
      
      {/* Subtle radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-white/[0.02] rounded-full blur-[150px] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-50 border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded border border-white/20 flex items-center justify-center">
              <div className="h-2 w-2 bg-white rounded-sm" />
            </div>
            <span className="text-sm font-medium tracking-tight">LOCKR</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-white/50 hover:text-white transition-colors duration-300"
          >
            {connected ? "Dashboard" : "Launch App"}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-32 pb-24">
        <div className="max-w-3xl">
          <p className="fade-in text-sm text-white/40 font-medium tracking-wide uppercase mb-6">
            Solana Frontier Hackathon
          </p>
          <h1 className="fade-in delay-100 text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] text-gradient">
            Get paid for every milestone.
          </h1>
          <p className="fade-in delay-200 mt-8 text-lg sm:text-xl text-white/50 leading-relaxed max-w-xl">
            Your client pays in fiat. Funds lock on-chain as USDC. 
            You deliver work. Client approves. Money hits your wallet in seconds.
          </p>
          <div className="fade-in delay-300 mt-10 flex items-center gap-6">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 bg-white text-black px-6 py-3 text-sm font-medium hover:bg-white/90 transition-colors duration-200"
            >
              {connected ? "Go to Dashboard" : "Create Your First Escrow"}
              <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                <ArrowUpRight />
              </span>
            </Link>
            <a
              href="https://github.com/srivtx/lockr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors duration-300"
            >
              View on GitHub
              <ArrowUpRight />
            </a>
          </div>
        </div>

        {/* Stats bar */}
        <div className="fade-in delay-400 mt-24 grid grid-cols-3 gap-px bg-white/[0.06]">
          {[
            { value: "3s", label: "Settlement time" },
            { value: "$0.001", label: "Transaction cost" },
            { value: "40+", label: "Fiat payment methods" },
          ].map((stat) => (
            <div key={stat.label} className="bg-black p-6 sm:p-8">
              <p className="text-2xl sm:text-3xl font-semibold tracking-tight">{stat.value}</p>
              <p className="mt-1 text-sm text-white/40">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The Journey - Storytelling Section */}
      <section className="relative z-10 border-y border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-6 py-32">
          <div className="max-w-2xl mb-20">
            <p className="text-sm text-white/40 font-medium tracking-wide uppercase mb-4">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Four steps. Zero trust required.
            </h2>
          </div>

          <div className="space-y-px bg-white/[0.06]">
            {[
              {
                num: "01",
                title: "Create the escrow",
                desc: "Set milestones, amounts, and deadlines. Generate a payment link. Your client doesn't need a wallet.",
                details: ["Up to 5 milestones", "Custom deadlines", "On-chain PDA"],
              },
              {
                num: "02", 
                title: "Client pays in fiat",
                desc: "They click the link and pay via Dodo — card, UPI, or 40+ methods. The USDC locks on Solana instantly.",
                details: ["Card, UPI, netbanking", "No wallet needed", "Instant on-chain funding"],
              },
              {
                num: "03",
                title: "Deliver and mark complete",
                desc: "Finish the milestone. Hit 'Mark Delivered'. An approval email goes to your client automatically.",
                details: ["One-click delivery", "Auto email notification", "Cryptographic proof"],
              },
              {
                num: "04",
                title: "Client approves, you get paid",
                desc: "They click the email link and approve. USDC releases to your wallet. No intermediaries. No delays.",
                details: ["Email-based approval", "On-chain release", "Seconds to settle"],
              },
            ].map((step, i) => (
              <div key={step.num} className="bg-black p-8 sm:p-12 group">
                <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-16">
                  <div className="flex items-center gap-4 lg:w-48 shrink-0">
                    <span className="text-4xl font-semibold text-white/10 group-hover:text-white/20 transition-colors duration-500">
                      {step.num}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-medium tracking-tight mb-3">{step.title}</h3>
                    <p className="text-white/50 leading-relaxed max-w-lg">{step.desc}</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      {step.details.map((d) => (
                        <span key={d} className="inline-flex items-center gap-1.5 text-xs text-white/40 border border-white/[0.08] px-3 py-1.5">
                          <Check />
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture / Why Solana */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-32">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <p className="text-sm text-white/40 font-medium tracking-wide uppercase mb-4">Why Solana</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-6">
              Built for speed.
            </h2>
            <p className="text-white/50 leading-relaxed mb-8">
              Traditional escrow takes 30+ days and charges 5-10%. Crypto escrow is fast but your clients don't have wallets. LOCKR bridges both worlds.
            </p>
            <div className="space-y-4">
              {[
                "Fiat payments via Dodo (40+ methods)",
                "USDC locked in program-owned escrow",
                "Sub-second finality on Solana",
                "Cryptographic email approvals",
                "No custody — you control your keys",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 text-white/30">
                    <Check />
                  </span>
                  <span className="text-white/60 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {[
              { name: "Solana", desc: "Fast, cheap settlement layer" },
              { name: "Dodo Payments", desc: "Fiat on-ramp for clients" },
              { name: "USDC", desc: "Stable value on-chain" },
              { name: "Helius", desc: "Reliable RPC infrastructure" },
              { name: "Supabase", desc: "PostgreSQL database" },
            ].map((tech) => (
              <div key={tech.name} className="surface px-6 py-5 flex items-center justify-between group">
                <div>
                  <p className="text-sm font-medium">{tech.name}</p>
                  <p className="text-xs text-white/40 mt-0.5">{tech.desc}</p>
                </div>
                <ArrowUpRight />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 border-t border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-6 py-32 text-center">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gradient">
            Stop chasing invoices.
          </h2>
          <p className="mt-6 text-lg text-white/50 max-w-lg mx-auto">
            Start getting paid on delivery, not on net-30 terms.
          </p>
          <div className="mt-10">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 bg-white text-black px-8 py-4 text-sm font-medium hover:bg-white/90 transition-colors duration-200"
            >
              {connected ? "Go to Dashboard" : "Create Your First Escrow"}
              <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                <ArrowUpRight />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-5 w-5 rounded border border-white/20 flex items-center justify-center">
              <div className="h-1.5 w-1.5 bg-white rounded-sm" />
            </div>
            <span className="text-sm font-medium">LOCKR</span>
          </div>
          <p className="text-xs text-white/30">
            Solana Frontier Hackathon — Superteam India × Dodo Payments
          </p>
        </div>
      </footer>
    </div>
  );
}
