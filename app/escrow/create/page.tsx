"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, Transaction } from "@solana/web3.js";
import { z } from "zod";
import PaymentLinkModal from "../../components/PaymentLinkModal";

const milestoneSchema = z.object({
  description: z.string().min(1, "Description is required").max(100, "Max 100 characters"),
  amount: z.number().positive("Amount must be greater than 0"),
});

const formSchema = z.object({
  clientEmail: z.string().email("Valid email required"),
  milestones: z.array(milestoneSchema).min(1, "At least one milestone is required").max(5, "Max 5 milestones"),
  deadline: z.string().min(1, "Deadline is required"),
});

function getDefaultDeadline(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}

async function waitForSignatureConfirmation(
  connection: Connection,
  signature: string,
  opts?: {
    blockhash: string;
    lastValidBlockHeight: number;
    timeoutMs?: number;
  }
): Promise<void> {
  const timeoutMs = opts?.timeoutMs ?? 120_000;

  if (opts) {
    try {
      await connection.confirmTransaction(
        {
          signature,
          blockhash: opts.blockhash,
          lastValidBlockHeight: opts.lastValidBlockHeight,
        },
        "confirmed"
      );
      return;
    } catch {
      // Fall through to polling
    }
  }

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const { value } = await connection.getSignatureStatuses([signature], {
      searchTransactionHistory: true,
    });
    const st = value[0];
    const confirmation = st?.confirmationStatus;
    if (
      confirmation === "processed" ||
      confirmation === "confirmed" ||
      confirmation === "finalized"
    ) {
      return;
    }
    if (st?.err) {
      throw new Error(JSON.stringify(st.err));
    }
    const landed = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
    if (landed) {
      return;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error(
    `Transaction was not confirmed in ${timeoutMs / 1000}s. Check signature ${signature} on Solana Explorer.`
  );
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
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const totalAmount = milestones.reduce((sum, m) => {
    const val = parseFloat(m.amount);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!publicKey || !sendTransaction) {
      setErrors({ wallet: "Please connect your wallet first." });
      return;
    }

    const payload = {
      clientEmail,
      milestones: milestones.map((m) => ({
        description: m.description,
        amount: parseFloat(m.amount) || 0,
      })),
      deadline: new Date(deadline).toISOString(),
      freelancerWallet: publicKey.toBase58(),
    };

    const result = formSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        fieldErrors[path] = issue.message;
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

      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err.error || "Failed to create escrow");
      }

      const createData = await createRes.json();
      const {
        serializedTransaction,
        escrowId,
        solanaPda,
        seed,
        totalAmount: totalAmountBase,
        clientEmailHash,
      } = createData;

      const tx = Transaction.from(Buffer.from(serializedTransaction, "base64"));
      const connection = new Connection(
        process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com",
        "confirmed"
      );
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = blockhash;
      const signature = await sendTransaction(tx, connection);
      await waitForSignatureConfirmation(connection, signature, {
        blockhash,
        lastValidBlockHeight,
      });

      const confirmRes = await fetch("/api/escrow/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          escrowId,
          solanaPda,
          freelancerWallet: publicKey.toBase58(),
          clientEmail,
          clientEmailHash,
          totalAmount: totalAmountBase,
          seed,
          deadline: new Date(deadline).toISOString(),
          milestones: payload.milestones,
          signature,
        }),
      });

      if (!confirmRes.ok) {
        const err = await confirmRes.json();
        throw new Error(err.error || "Failed to save escrow");
      }

      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          escrow_id: escrowId,
          solana_pda_address: solanaPda,
          product_id: "prod_escrow_payment",
          amount: Math.round(totalAmount * 100),
          customer_email: clientEmail,
        }),
      });

      if (!checkoutRes.ok) {
        throw new Error("Failed to create checkout session");
      }

      const checkoutData = await checkoutRes.json();
      setPaymentLink(checkoutData.checkout_url);
    } catch (err: any) {
      console.error(err);
      setErrors({ submit: err.message || "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/50 glass sticky top-0">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20" />
            <span className="text-lg font-bold text-slate-100">LOCKR</span>
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Create New Escrow</h1>
          <p className="mt-2 text-slate-400">
            Define milestones and deadlines. We will generate a payment link for your client.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-10">
          {["Details", "Milestones", "Confirm"].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                i === 0 ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white" : "bg-slate-800 text-slate-500"
              }`}>
                {i + 1}
              </div>
              <span className={`text-sm font-medium ${i === 0 ? "text-slate-200" : "text-slate-600"}`}>
                {step}
              </span>
              {i < 2 && <div className="h-px w-8 bg-slate-800" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Client Info */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <h2 className="text-lg font-semibold text-slate-200">Client Information</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Client Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="client@company.com"
                className="w-full"
              />
              {errors["clientEmail"] && <p className="mt-1.5 text-xs text-red-400">{errors["clientEmail"]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Project Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full"
              />
              {errors["deadline"] && <p className="mt-1.5 text-xs text-red-400">{errors["deadline"]}</p>}
            </div>
          </div>

          {/* Milestones */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-lg font-semibold text-slate-200">Milestones</h2>
              </div>
              <span className="text-xs text-slate-500">{milestones.length}/5 max</span>
            </div>

            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start gap-3 group">
                  <div className="flex-1 space-y-2">
                    <input
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, "description", e.target.value)}
                      placeholder={`Milestone ${index + 1} description`}
                      className="w-full"
                    />
                  </div>
                  <div className="w-36">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={milestone.amount}
                        onChange={(e) => updateMilestone(index, "amount", e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-7"
                      />
                    </div>
                  </div>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      className="mt-3 p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {milestones.length < 5 && (
              <button
                type="button"
                onClick={addMilestone}
                className="flex items-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-900/30 px-4 py-3 text-sm font-medium text-slate-400 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all w-full justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Milestone
              </button>
            )}

            {errors["milestones"] && <p className="text-xs text-red-400">{errors["milestones"]}</p>}
          </div>

          {/* Total Summary */}
          <div className="rounded-2xl border border-slate-800/60 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Escrow Amount</p>
                <p className="text-3xl font-bold text-slate-100 mt-1">${totalAmount.toLocaleString()}</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {errors["wallet"] && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {errors["wallet"]}
            </div>
          )}
          {errors["submit"] && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {errors["submit"]}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !connected}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 text-lg font-semibold text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 transition-all"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Escrow...
              </span>
            ) : (
              "Create Escrow & Generate Payment Link"
            )}
          </button>
        </form>
      </main>

      {paymentLink && <PaymentLinkModal paymentLink={paymentLink} onClose={() => router.push("/dashboard")} />}
    </div>
  );
}
