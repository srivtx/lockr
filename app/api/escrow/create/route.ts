import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/src/lib/prisma';
import {
  buildCreateEscrowTx,
  signAndSendTransaction,
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

    // Generate unique escrow ID and seed
    const escrowId = crypto.randomUUID();
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

    const signature = await signAndSendTransaction(tx);

    // Save to database
    const escrow = await prisma.escrow.create({
      data: {
        escrowId,
        solanaPda: pda.toBase58(),
        freelancerWallet,
        clientEmail,
        clientEmailHash,
        totalAmount: BigInt(totalAmount),
        status: 'CREATED',
        deadline: new Date(deadline),
        seed: BigInt(seed.toString()),
        fundingSignature: signature,
        milestones: {
          create: milestones.map((m, index) => ({
            index,
            description: m.description,
            amount: BigInt(Math.round(m.amount * 1_000_000)),
            status: 'PENDING',
          })),
        },
      },
      include: { milestones: true },
    });

    return NextResponse.json({
      success: true,
      escrow: {
        id: escrow.id,
        escrowId: escrow.escrowId,
        solanaPda: escrow.solanaPda,
        status: escrow.status,
        milestones: escrow.milestones,
      },
      signature,
      explorer: getExplorerUrl(signature),
    });
  } catch (error: any) {
    console.error('Create escrow failed', error);
    return NextResponse.json(
      { error: error?.message ?? 'Internal server error' },
      { status: 500 }
    );
  }
}
