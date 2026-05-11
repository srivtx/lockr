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

/** Devnet can exceed the default ~30s confirm window; poll until confirmed or timeout. */
async function waitForSignatureConfirmation(
  connection: Connection,
  signature: string,
  timeoutMs = 120_000
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const status = await connection.getSignatureStatus(signature);
    const confirmation = status.value?.confirmationStatus;
    if (confirmation === "confirmed" || confirmation === "finalized") {
      return;
    }
    if (status.value?.err) {
      throw new Error(JSON.stringify(status.value.err));
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
      // 1. Build unsigned transaction on the backend
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

      // 2. Deserialize and sign with wallet, then send to Solana
      const tx = Transaction.from(Buffer.from(serializedTransaction, "base64"));
      const connection = new Connection(
        process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com",
        "confirmed"
      );
      const signature = await sendTransaction(tx, connection);
      await waitForSignatureConfirmation(connection, signature);

      // 3. Save to database via confirm endpoint
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

      // 4. Create Dodo checkout session
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

  const inputClass = "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-emerald-400" />
            <span className="text-lg font-bold text-slate-100">LOCKR</span>
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-slate-200">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-100">Create New Escrow</h1>
        <p className="mt-1 text-sm text-slate-400">
          Define your project, milestones, and deadline. We will generate a payment link for your client.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Client Email</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="client@company.com"
              className={inputClass}
            />
            {errors["clientEmail"] && <p className="mt-1 text-xs text-red-400">{errors["clientEmail"]}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-300">Milestones</label>
              <button
                type="button"
                onClick={addMilestone}
                disabled={milestones.length >= 5}
                className="rounded-md bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-50"
              >
                + Add Milestone
              </button>
            </div>

            <div className="space-y-3">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-1">
                    <input
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, "description", e.target.value)}
                      placeholder={`Milestone ${index + 1} description`}
                      className={inputClass}
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={milestone.amount}
                      onChange={(e) => updateMilestone(index, "amount", e.target.value)}
                      placeholder="USD"
                      className={inputClass}
                    />
                  </div>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      className="mt-2 text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-right text-sm font-medium text-slate-300">
              Total: ${totalAmount.toLocaleString()}
            </div>
            {errors["milestones"] && <p className="mt-1 text-xs text-red-400">{errors["milestones"]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={inputClass}
            />
            {errors["deadline"] && <p className="mt-1 text-xs text-red-400">{errors["deadline"]}</p>}
          </div>

          {errors["wallet"] && <p className="text-sm text-red-400">{errors["wallet"]}</p>}
          {errors["submit"] && <p className="text-sm text-red-400">{errors["submit"]}</p>}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !connected}
              className="w-full rounded-xl bg-emerald-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 disabled:opacity-60"
            >
              {submitting ? "Creating Escrow..." : "Create Escrow & Generate Payment Link"}
            </button>
          </div>
        </form>
      </main>

      {paymentLink && <PaymentLinkModal paymentLink={paymentLink} onClose={() => router.push("/dashboard")} />}
    </div>
  );
}
