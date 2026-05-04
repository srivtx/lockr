import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import {
  buildRefundTx,
  signAndSendTransaction,
  getExplorerUrl,
} from '@/src/lib/solana';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const escrow = await prisma.escrow.findUnique({
      where: { id: params.id },
      include: { milestones: true },
    });

    if (!escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }

    if (escrow.status === 'REFUNDED' || escrow.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Escrow already finalized' },
        { status: 400 }
      );
    }

    const escrowPda = new PublicKey(escrow.solanaPda);
    const freelancerWallet = new PublicKey(escrow.freelancerWallet);
    const seed = new BN(escrow.seed.toString());

    const tx = await buildRefundTx(
      escrow.escrowId,
      seed,
      escrowPda,
      freelancerWallet
    );
    const signature = await signAndSendTransaction(tx);

    await prisma.$transaction([
      prisma.escrow.update({
        where: { id: escrow.id },
        data: { status: 'REFUNDED' },
      }),
      prisma.milestone.updateMany({
        where: { escrowId: escrow.id, status: { not: 'RELEASED' } },
        data: { status: 'REFUNDED' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      signature,
      explorer: getExplorerUrl(signature),
    });
  } catch (error: any) {
    console.error('Refund failed', error);
    return NextResponse.json(
      { error: error?.message ?? 'Internal server error' },
      { status: 500 }
    );
  }
}
