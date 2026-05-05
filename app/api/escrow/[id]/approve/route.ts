import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/src/lib/prisma';
import {
  buildApproveReleaseTx,
  signAndSendTransaction,
  getExplorerUrl,
} from '@/src/lib/solana';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

const approveSchema = z.object({
  milestone_index: z.number().int().nonnegative(),
  secret: z.string().min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const parsed = approveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { milestone_index, secret } = parsed.data;

    const escrow = await prisma.escrow.findUnique({
      where: { id: params.id },
      include: { milestones: true },
    });

    if (!escrow) {
      return NextResponse.json(
        { error: 'Escrow not found' },
        { status: 404 }
      );
    }

    const milestone = escrow.milestones.find(
      (m) => m.index === milestone_index
    );

    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    if (milestone.status !== 'FUNDED' && milestone.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Milestone not ready for approval' },
        { status: 400 }
      );
    }

    if (!escrow.clientSecretKey || secret !== escrow.clientSecretKey) {
      return NextResponse.json(
        { error: 'Invalid approval secret' },
        { status: 403 }
      );
    }

    // Build and send Solana tx calling release_milestone
    const escrowPda = new PublicKey(escrow.solanaPda);
    const freelancerWallet = new PublicKey(escrow.freelancerWallet);
    const seed = new BN(escrow.seed.toString());

    const tx = await buildApproveReleaseTx(
      escrow.escrowId,
      milestone_index,
      seed,
      escrowPda,
      freelancerWallet,
      Buffer.alloc(64, 0)
    );
    const signature = await signAndSendTransaction(tx);

    // Update milestone status
    await prisma.milestone.update({
      where: { id: milestone.id },
      data: {
        status: 'RELEASED',
        releasedAt: new Date(),
      },
    });

    // Update escrow status if all milestones released
    const remaining = await prisma.milestone.count({
      where: {
        escrowId: escrow.id,
        status: { not: 'RELEASED' },
      },
    });

    if (remaining === 0) {
      await prisma.escrow.update({
        where: { id: escrow.id },
        data: { status: 'COMPLETED' },
      });
    }

    return NextResponse.json({
      success: true,
      signature,
      explorer: getExplorerUrl(signature),
    });
  } catch (error: any) {
    console.error('Approval failed', error);
    return NextResponse.json(
      { error: error?.message ?? 'Internal server error' },
      { status: 500 }
    );
  }
}
