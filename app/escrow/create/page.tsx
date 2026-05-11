"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, Transaction } from "@solana/web3.js";
import { z } from "zod";
import PaymentLinkModal from "../../components/PaymentLinkModal";

const milestoneSchema = z.object({
  description: z.string().min(1, "Required").max(100, "Max 100 chars"),
  amount: z.number().positive("Must be > 0"),
});

const formSchema = z.object({
  clientEmail: z.string().email("Invalid email"),
  milestones: z.array(milestoneSchema).min(1, "At least 1").max(5, "Max 5"),
  deadline: z.string().min(1, "Required"),
});

function getDefaultDeadline(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}

async function waitForSignatureConfirmation(
  connection: Connection,
  signature: string,
  opts?: { blockhash: string; lastValidBlockHeight: number; timeoutMs?: number }
): Promise<void> {
  const timeoutMs = opts?.timeoutMs ?? 120_000;
  if (opts) {
    try {
      await connection.confirmTransaction({ signature, blockhash: opts.blockhash, lastValidBlockHeight: opts.lastValidBlockHeight }, "confirmed");
      return;
    } catch {}
  }
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const { value } = await connection.getSignatureStatuses([signature], { searchTransactionHistory: true });
    const st = value[0];
    if (st?.confirmationStatus === "processed" || st?.confirmationStatus === "confirmed" || st?.confirmationStatus === "finalized") return;
    if (st?.err) throw new Error(JSON.stringify(st.err));
    const landed = await connection.getTransaction(signature, { maxSupportedTransactionVersion: 0 });
    if (landed) return;
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error(`Not confirmed in ${timeoutMs / 1000}s`);
}

export default function CreateEscrowPage() {
  const router = useRouter();
  const { publicKey, connected, sendTransaction } = useWallet();

  const [clientEmail, setClientEmail] = useState("");
  const [milestones, setMilestones] = useState([{ description: "", amount: "" }]);
  const [deadline, setDeadline] = useState(getDefaultDeadline());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);

  const addMilestone = () => {
    if (milestones.length >= 5) return;
    setMilestones((prev) => [...prev, { description: "", amount: "" }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: "description" | "amount", value: string) => {
    setMilestones((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const totalAmount = milestones.reduce((sum, m) => {
    const val = parseFloat(m.amount);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!publicKey || !sendTransaction) {
      setErrors({ wallet: "Connect wallet first" });
      return;
    }

    const payload = {
      clientEmail,
      milestones: milestones.map((m) => ({ description: m.description, amount: parseFloat(m.amount) || 0 })),
      deadline: new Date(deadline).toISOString(),
      freelancerWallet: publicKey.toBase58(),
    };

    const result = formSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path.join(".")] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const createRes = await fetch("/api/escrow/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!createRes.ok) throw new Error((await createRes.json()).error || "Failed");

      const { serializedTransaction, escrowId, solanaPda, seed, totalAmount: totalAmountBase, clientEmailHash } = await createRes.json();

      const tx = Transaction.from(Buffer.from(serializedTransaction, "base64"));
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com", "confirmed");
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = blockhash;
      const signature = await sendTransaction(tx, connection);
      await waitForSignatureConfirmation(connection, signature, { blockhash, lastValidBlockHeight });

      const confirmRes = await fetch("/api/escrow/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ escrowId, solanaPda, freelancerWallet: publicKey.toBase58(), clientEmail, clientEmailHash, totalAmount: totalAmountBase, seed, deadline: new Date(deadline).toISOString(), milestones: payload.milestones, signature }),
      });
      if (!confirmRes.ok) throw new Error((await confirmRes.json()).error || "Failed");

      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ escrow_id: escrowId, solana_pda_address: solanaPda, product_id: "prod_escrow_payment", amount: Math.round(totalAmount * 100), customer_email: clientEmail }),
      });
      if (!checkoutRes.ok) throw new Error("Checkout failed");

      const { checkout_url } = await checkoutRes.json();
      setPaymentLink(checkout_url);
    } catch (err: any) {
      console.error(err);
      setErrors({ submit: err.message || "Failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

      <header className="relative z-50 border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded border border-white/20 flex items-center justify-center">
              <div className="h-2 w-2 bg-white rounded-sm" />
            </div>
            <span className="text-sm font-medium tracking-tight">LOCKR</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-white/40 hover:text-white/70 transition-colors">Back</Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl px-6 py-12">
        <div className="mb-10">
          <p className="text-xs text-white/40 font-medium tracking-wide uppercase mb-2">New Escrow</p>
          <h1 className="text-3xl font-semibold tracking-tight">Create escrow</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Client */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Client email</label>
              <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="client@company.com" className="w-full" />
              {errors["clientEmail"] && <p className="mt-2 text-xs text-white/40">{errors["clientEmail"]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Deadline</label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full" />
              {errors["deadline"] && <p className="mt-2 text-xs text-white/40">{errors["deadline"]}</p>}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.06]" />

          {/* Milestones */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white/60">Milestones</label>
              <span className="text-xs text-white/25">{milestones.length}/5</span>
            </div>

            <div className="space-y-3">
              {milestones.map((m, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex-1">
                    <input value={m.description} onChange={(e) => updateMilestone(i, "description", e.target.value)} placeholder={`Milestone ${i + 1}`} className="w-full" />
                  </div>
                  <div className="w-28">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-sm">$</span>
                      <input type="number" min="0" step="0.01" value={m.amount} onChange={(e) => updateMilestone(i, "amount", e.target.value)} placeholder="0" className="w-full pl-6" />
                    </div>
                  </div>
                  {milestones.length > 1 && (
                    <button type="button" onClick={() => removeMilestone(i)} className="mt-3 text-white/20 hover:text-white/50 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {milestones.length < 5 && (
              <button type="button" onClick={addMilestone} className="w-full border border-white/[0.08] py-3 text-sm text-white/40 hover:text-white/70 hover:border-white/[0.20] transition-all">
                + Add milestone
              </button>
            )}
            {errors["milestones"] && <p className="text-xs text-white/40">{errors["milestones"]}</p>}
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.06]" />

          {/* Summary */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wide">Total</p>
              <p className="text-2xl font-semibold mt-1">${totalAmount.toLocaleString()}</p>
            </div>
          </div>

          {errors["wallet"] && <p className="text-xs text-white/40">{errors["wallet"]}</p>}
          {errors["submit"] && <p className="text-xs text-white/40">{errors["submit"]}</p>}

          <button
            type="submit"
            disabled={submitting || !connected}
            className="w-full bg-white text-black py-3 text-sm font-medium hover:bg-white/90 disabled:opacity-30 disabled:hover:bg-white transition-colors"
          >
            {submitting ? "Creating..." : "Create escrow & generate link"}
          </button>
        </form>
      </main>

      {paymentLink && <PaymentLinkModal paymentLink={paymentLink} onClose={() => router.push("/dashboard")} />}
    </div>
  );
}
