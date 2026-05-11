"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import DodoBanner from "./components/DodoBanner";

function ArrowUpRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
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

// Scroll reveal hook
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function LandingPage() {
  const { connected } = useWallet();
  const [scrolled, setScrolled] = useState(false);
  useScrollReveal();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Film grain noise overlay */}
      <div className="noise-overlay" />
      
      {/* Grid background - fades at top */}
      <div className="absolute inset-0 grid-pattern opacity-50 pointer-events-none" 
           style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%)' }} />
      
      {/* Stronger radial glow behind hero */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-white/[0.025] rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-[5%] left-1/3 w-[600px] h-[400px] bg-white/[0.015] rounded-full blur-[150px] pointer-events-none" />

      {/* Sticky Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-black/80 backdrop-blur-xl border-b border-white/[0.06]" 
          : "bg-transparent border-b border-white/[0.06]"
      }`}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-6 w-6 rounded border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors">
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

      {/* Banner - hides on scroll */}
      <div className={`fixed top-16 left-0 right-0 z-40 transition-transform duration-300 ${
        scrolled ? "-translate-y-full" : "translate-y-0"
      }`}>
        <DodoBanner />
      </div>

      {/* Spacer for fixed header */}
      <div className="h-16" />
      <div className={`transition-all duration-300 ${scrolled ? "h-0" : "h-6"}`} />

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-24 pb-24">
        <div className="max-w-3xl">
          <p className="fade-in text-sm text-white/40 font-medium tracking-wide uppercase mb-6">
            Solana Frontier Hackathon
          </p>
          <h1 className="fade-in delay-100 text-6xl sm:text-7xl lg:text-[88px] font-semibold tracking-tight leading-[1.05] text-gradient">
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
            <div key={stat.label} className="bg-black p-6 sm:p-8 hover:bg-white/[0.02] transition-colors">
              <p className="text-2xl sm:text-3xl font-semibold tracking-tight">{stat.value}</p>
              <p className="mt-1 text-sm text-white/40">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Video Demo */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24 scroll-reveal">
        <div className="max-w-3xl mb-8">
          <p className="text-sm text-white/40 font-medium tracking-wide uppercase mb-4">See it in action</p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Watch how LOCKR works.
          </h2>
        </div>
        <div className="border border-white/[0.08] bg-white/[0.02] p-2 sm:p-3">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src="https://player.vimeo.com/video/1191304055?badge=0&autopause=0&player_id=0&app_id=58479"
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
              title="LOCKR Demo"
            />
          </div>
        </div>
      </section>

      {/* The Journey - Storytelling Section */}
      <section className="relative z-10 border-y border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-6 py-32">
          <div className="max-w-2xl mb-20 scroll-reveal">
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
            ].map((step) => (
              <div key={step.num} className="bg-black p-8 sm:p-12 group hover:bg-white/[0.02] transition-colors duration-500 scroll-reveal">
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
          <div className="scroll-reveal">
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
          <div className="space-y-4 scroll-reveal">
            {[
              { name: "Solana", desc: "Fast, cheap settlement layer" },
              { name: "Dodo Payments", desc: "Fiat on-ramp for clients" },
              { name: "USDC", desc: "Stable value on-chain" },
              { name: "Helius", desc: "Reliable RPC infrastructure" },
              { name: "Supabase", desc: "PostgreSQL database" },
            ].map((tech) => (
              <div key={tech.name} className="surface px-6 py-5 flex items-center justify-between group cursor-pointer">
                <div>
                  <p className="text-sm font-medium">{tech.name}</p>
                  <p className="text-xs text-white/40 mt-0.5">{tech.desc}</p>
                </div>
                <span className="text-white/20 group-hover:text-white/50 transition-colors">
                  <ArrowUpRight />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 border-t border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-6 py-32 text-center scroll-reveal">
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
        <div className="mx-auto max-w-5xl px-6 py-8">
          {/* Top row: brand left, X right */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="h-5 w-5 rounded border border-white/20 flex items-center justify-center">
                <div className="h-1.5 w-1.5 bg-white rounded-sm" />
              </div>
              <span className="text-sm font-medium">LOCKR</span>
            </div>
            <a
              href="https://x.com/lockr_sol"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-xs text-white/40 hover:text-white/80 transition-colors duration-300 border border-white/[0.08] hover:border-white/20 px-4 py-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Contact us
            </a>
          </div>
          {/* Bottom row: centered attribution */}
          <div className="text-center">
            <p className="text-[11px] text-white/20 tracking-wide">
              Solana Frontier Hackathon — Superteam India × Dodo Payments
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
