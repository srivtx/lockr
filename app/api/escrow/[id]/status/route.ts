import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getExplorerUrl } from '@/src/lib/solana';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const escrow = await prisma.escrow.findUnique({
      where: { id: params.id },
      include: { milestones: true, paymentEvents: true },
    });

    if (!escrow) {
      return NextResponse.json(
        { error: 'Escrow not found' },
        { status: 404 }
      );
    }

    const solanaSignatures = [];

    if (escrow.fundingSignature) {
      solanaSignatures.push({
        type: 'funding',
        signature: escrow.fundingSignature,
        explorer: getExplorerUrl(escrow.fundingSignature),
      });
    }

    for (const event of escrow.paymentEvents) {
      if (event.signature) {
        solanaSignatures.push({
          type: 'payment_event',
          signature: event.signature,
          explorer: getExplorerUrl(event.signature),
        });
      }
    }

    return NextResponse.json({
      escrow: {
        id: escrow.id,
        paymentId: escrow.paymentId,
        solanaPda: escrow.solanaPda,
        freelancerWallet: escrow.freelancerWallet,
        clientEmail: escrow.clientEmail,
        totalAmount: escrow.totalAmount.toString(),
        status: escrow.status,
        deadline: escrow.deadline,
        fundingSignature: escrow.fundingSignature,
        createdAt: escrow.createdAt,
        updatedAt: escrow.updatedAt,
      },
      milestones: escrow.milestones.map((m) => ({
        id: m.id,
        index: m.index,
        description: m.description,
        amount: m.amount.toString(),
        status: m.status,
        deliverableUrl: m.deliverableUrl,
        completedAt: m.completedAt,
        releasedAt: m.releasedAt,
      })),
      solanaSignatures,
    });
  } catch (error: any) {
    console.error('Escrow status fetch failed', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
