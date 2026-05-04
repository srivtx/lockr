import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { milestone_index } = body;

    const escrow = await prisma.escrow.findUnique({
      where: { id: params.id },
      include: { milestones: true },
    });

    if (!escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }

    const milestone = escrow.milestones.find((m) => m.index === milestone_index);
    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    await prisma.milestone.update({
      where: { id: milestone.id },
      data: { status: 'COMPLETED' },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Mark delivered failed', error);
    return NextResponse.json(
      { error: error?.message ?? 'Internal server error' },
      { status: 500 }
    );
  }
}
