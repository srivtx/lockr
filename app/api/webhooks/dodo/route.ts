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

    // Enqueue job to fund escrow on Solana
    await solanaTxQueue.add(
      'fund-escrow',
      {
        paymentId,
        escrowId,
        solanaPda,
      },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 5000 },
      }
    );

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
