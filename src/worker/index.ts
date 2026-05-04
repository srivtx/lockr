import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import * as anchor from '@coral-xyz/anchor';
import { prisma } from '../lib/prisma';
import {
  buildFundMilestoneTx,
  signAndSendTransaction,
} from '../lib/solana';
import { PublicKey } from '@solana/web3.js';

const redisConnection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  'solana-tx',
  async (job: Job) => {
    const { paymentId, escrowId, solanaPda } = job.data as {
      paymentId: string;
      escrowId?: string;
      solanaPda?: string;
    };

    console.log(
      `Processing fund-escrow job ${job.id} for payment ${paymentId}`
    );

    if (!escrowId || !solanaPda) {
      throw new Error('Missing escrowId or solanaPda in job data');
    }

    const escrow = await prisma.escrow.findUnique({
      where: { id: escrowId },
      include: { milestones: true },
    });

    if (!escrow) {
      throw new Error(`Escrow ${escrowId} not found`);
    }

    // Fund ALL pending milestones (Dodo payment covers total amount)
    const pendingMilestones = escrow.milestones
      .sort((a, b) => a.index - b.index)
      .filter((m) => m.status === 'PENDING');

    if (pendingMilestones.length === 0) {
      console.log(`Escrow ${escrowId} already fully funded`);
      return { success: true, alreadyFunded: true };
    }

    try {
      const escrowPdaPubkey = new PublicKey(solanaPda);
      const freelancerWallet = new PublicKey(escrow.freelancerWallet);
      const seed = new anchor.BN(escrow.seed.toString());

      const signatures: string[] = [];

      for (const milestone of pendingMilestones) {
        // Milestone-level idempotency check
        const current = await prisma.milestone.findUnique({
          where: { id: milestone.id },
        });
        if (current?.status !== 'PENDING') {
          console.log(`Milestone ${milestone.index} already funded, skipping`);
          continue;
        }

        const tx = await buildFundMilestoneTx(
          escrow.escrowId,
          milestone.index,
          seed,
          escrowPdaPubkey,
          freelancerWallet
        );

        const signature = await signAndSendTransaction(tx);
        signatures.push(signature);

        await prisma.milestone.update({
          where: { id: milestone.id },
          data: { status: 'FUNDED' },
        });

        console.log(
          `Funded milestone ${milestone.index} for escrow ${escrowId}: ${signature}`
        );
      }

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

      return { success: true, signatures };
    } catch (err: any) {
      console.error(`Funding failed for escrow ${escrowId}:`, err);
      throw err; // Let BullMQ handle retry with exponential backoff
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

console.log('Solana transaction worker started');
