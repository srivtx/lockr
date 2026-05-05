import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/src/lib/prisma';
import { getExplorerUrl } from '@/src/lib/solana';

const confirmSchema = z.object({
  escrowId: z.string().min(1),
  solanaPda: z.string().min(32),
  freelancerWallet: z.string().min(32),
  clientEmail: z.string().email(),
  clientEmailHash: z.string().min(1),
  totalAmount: z.number().int().positive(),
  seed: z.string().min(1),
  deadline: z.string().datetime(),
  milestones: z.array(
    z.object({
      description: z.string().min(1).max(100),
      amount: z.number().positive(),
    })
  ).min(1).max(5),
  signature: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = confirmSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      escrowId,
      solanaPda,
      freelancerWallet,
      clientEmail,
      clientEmailHash,
      totalAmount,
      seed,
      deadline,
      milestones,
      signature,
    } = parsed.data;
    const clientSecretKey = crypto.randomUUID();

    // Save to database
    const escrow = await prisma.escrow.create({
      data: {
        escrowId,
        solanaPda,
        freelancerWallet,
        clientEmail,
        clientEmailHash,
        totalAmount: BigInt(totalAmount),
        status: 'CREATED',
        deadline: new Date(deadline),
        seed: BigInt(seed),
        fundingSignature: signature,
        clientSecretKey,
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
        milestones: escrow.milestones.map(m => ({
          ...m,
          amount: m.amount.toString(),
        })),
      },
      signature,
      explorer: getExplorerUrl(signature),
    });
  } catch (error: any) {
    console.error('Confirm escrow failed', error);
    return NextResponse.json(
      { error: error?.message ?? 'Internal server error' },
      { status: 500 }
    );
  }
}
