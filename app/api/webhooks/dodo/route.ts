import { NextRequest, NextResponse } from 'next/server';
import { dodoClient } from '@/src/lib/dodo';
import { prisma } from '@/src/lib/prisma';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

const redisConnection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

const solanaTxQueue = new Queue('solana-tx', { connection: redisConnection });

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const webhookId = req.headers.get('webhook-id') ?? '';
  const webhookSignature = req.headers.get('webhook-signature') ?? '';
  const webhookTimestamp = req.headers.get('webhook-timestamp') ?? '';

  try {
    // Parse the webhook payload
    // Note: In production, verify the webhook signature using the 'svix' package
    const unwrapped = JSON.parse(rawBody);

    if (unwrapped.type !== 'payment.succeeded') {
      return NextResponse.json({ received: true });
    }

    const data = unwrapped.data as {
      payment_id: string;
      status: string;
      metadata?: { escrow_id?: string; solana_pda_address?: string };
      checkout_session_id?: string;
    };

    const paymentId = data.payment_id;
    const escrowId = data.metadata?.escrow_id;
    const solanaPda = data.metadata?.solana_pda_address;
    const checkoutSessionId = data.checkout_session_id ?? '';

    // Idempotency check via unique constraint on dodoPaymentId
    try {
      await prisma.paymentEvent.create({
        data: {
          dodoPaymentId: paymentId,
          dodoCheckoutSessionId: checkoutSessionId,
          status: data.status,
          metadata: data.metadata as any,
          escrowId: escrowId ?? null,
        },
      });
    } catch (err: any) {
      // Unique constraint violation = already processed
      if (err.code === 'P2002') {
        return NextResponse.json({ received: true, idempotent: true });
      }
      throw err;
    }

    // Update escrow status if found
    if (escrowId) {
      await prisma.escrow.updateMany({
        where: { id: escrowId },
        data: { status: 'FUNDING' },
      });
    }

    // Execute Solana transaction directly in the webhook (Vercel serverless doesn't support persistent workers)
    const escrowRecord = await prisma.escrow.findUnique({
      where: { id: escrowId },
      include: { milestones: true },
    });

    if (escrowRecord && solanaPda) {
      const pendingMilestones = escrowRecord.milestones
        .sort((a, b) => a.index - b.index)
        .filter((m) => m.status === 'PENDING');

      if (pendingMilestones.length > 0) {
        try {
          const { buildFundMilestoneTx, signAndSendTransaction } = await import('@/src/lib/solana');
          const { PublicKey } = await import('@solana/web3.js');
          const anchor = await import('@coral-xyz/anchor');

          const escrowPdaPubkey = new PublicKey(solanaPda);
          const freelancerWallet = new PublicKey(escrowRecord.freelancerWallet);
          const seedBn = new anchor.BN(escrowRecord.seed.toString());

          const signatures: string[] = [];

          for (const milestone of pendingMilestones) {
            const tx = await buildFundMilestoneTx(
              escrowRecord.escrowId,
              milestone.index,
              seedBn,
              escrowPdaPubkey,
              freelancerWallet
            );

            const signature = await signAndSendTransaction(tx);
            signatures.push(signature);

            await prisma.milestone.update({
              where: { id: milestone.id },
              data: { status: 'FUNDED' },
            });
          }

          // Update final status
          await prisma.$transaction([
            prisma.escrow.update({
              where: { id: escrowId },
              data: {
                status: 'FUNDED',
                fundingSignature: signatures[0],
              },
            }),
            prisma.paymentEvent.updateMany({
              where: { dodoPaymentId: paymentId },
              data: { signature: signatures[0], completedAt: new Date() },
            }),
          ]);
        } catch (err) {
          console.error(`Funding failed for escrow ${escrowId}:`, err);
          // In production, you would want to implement a retry mechanism or alert
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook processing failed', err);
    // Distinguish signature errors (401) from internal errors (500)
    if (err.message?.includes('signature') || err.message?.includes('webhook')) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Internal processing error' },
      { status: 500 }
    );
  }
}
