import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/src/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet parameter is required' },
        { status: 400 }
      );
    }

    const escrows = await prisma.escrow.findMany({
      where: { freelancerWallet: wallet },
      include: { milestones: { orderBy: { index: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ escrows });
  } catch (error: any) {
    console.error('Failed to fetch escrows', error);
    return NextResponse.json(
      { error: error?.message ?? 'Internal server error' },
      { status: 500 }
    );
  }
}
