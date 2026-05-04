import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const escrow = await prisma.escrow.findUnique({
      where: { id: params.id },
    });

    if (!escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }

    await prisma.escrow.update({
      where: { id: escrow.id },
      data: { status: 'DISPUTED' },
    });

    return NextResponse.json({ success: true, status: 'DISPUTED' });
  } catch (error: any) {
    console.error('Dispute failed', error);
    return NextResponse.json(
      { error: error?.message ?? 'Internal server error' },
      { status: 500 }
    );
  }
}
