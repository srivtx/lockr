import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/src/lib/prisma';
import {
  buildCreateEscrowTx,
  connection,
  getExplorerUrl,
} from '@/src/lib/solana';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import crypto from 'crypto';

const createSchema = z.object({
  clientEmail: z.string().email(),
  milestones: z.array(
    z.object({
      description: z.string().min(1).max(100),
      amount: z.number().positive(),
    })
  ).min(1).max(5),
  deadline: z.string().datetime(),
  freelancerWallet: z.string().min(32),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { clientEmail, milestones, deadline, freelancerWallet } = parsed.data;

    // Generate unique escrow ID (32 hex chars = 32 bytes, fits Solana PDA seed limit)
    const escrowId = crypto.randomBytes(16).toString('hex');
    const seed = new BN(Math.floor(Math.random() * 1000000));
    const freelancerPubkey = new PublicKey(freelancerWallet);

    // Calculate total amount in USDC base units (6 decimals)
    const totalAmount = milestones.reduce(
      (sum, m) => sum + Math.round(m.amount * 1_000_000),
      0
    );

    // Hash client email
    const clientEmailHash = crypto
      .createHash('sha256')
      .update(clientEmail)
      .digest('hex');

    // Build Solana transaction
    const milestoneBns = milestones.map((m) => ({
      description: m.description,
      amount: new BN(Math.round(m.amount * 1_000_000)),
    }));

    const deadlineBn = new BN(Math.floor(new Date(deadline).getTime() / 1000));
    const totalAmountBn = new BN(totalAmount);

    const { tx, pda, bump } = await buildCreateEscrowTx(
      escrowId,
      clientEmail,
      totalAmountBn,
      deadlineBn,
      milestoneBns,
      seed,
      freelancerPubkey
    );

    // Set fee payer to freelancer and add recent blockhash
    tx.feePayer = freelancerPubkey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    // Return serialized unsigned transaction for the frontend to sign with the wallet
    const serializedTx = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    }).toString('base64');

    return NextResponse.json({
      serializedTransaction: serializedTx,
      escrowId,
      solanaPda: pda.toBase58(),
      seed: seed.toString(),
      totalAmount,
      clientEmailHash,
    });
  } catch (error: any) {
    console.error('Create escrow failed', error);
    return NextResponse.json(
      { error: error?.message ?? 'Internal server error' },
      { status: 500 }
    );
  }
}
