import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

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

    if (!escrow.clientSecretKey) {
      return NextResponse.json(
        { error: 'Escrow is missing approval secret key' },
        { status: 500 }
      );
    }

    await prisma.milestone.update({
      where: { id: milestone.id },
      data: { status: 'COMPLETED' },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const approveUrl = `${appUrl}/approve/${escrow.id}?secret=${encodeURIComponent(
      escrow.clientSecretKey
    )}`;

    if (!resend) {
      console.warn('RESEND_API_KEY not configured. Skipping client approval email.');
    } else {
      await resend.emails.send({
        from: 'LOCKR <onboarding@resend.dev>',
        to: escrow.clientEmail,
        subject: 'Milestone delivered - approve release in LOCKR',
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
            <h2 style="margin:0 0 12px">Milestone ready for approval</h2>
            <p style="margin:0 0 8px">
              The freelancer marked milestone #${milestone.index + 1} as delivered.
            </p>
            <p style="margin:0 0 16px">
              Description: <strong>${milestone.description}</strong>
            </p>
            <a
              href="${approveUrl}"
              style="display:inline-block;padding:10px 16px;background:#10b981;color:#fff;text-decoration:none;border-radius:8px;font-weight:600"
            >
              Review and Approve Release
            </a>
            <p style="margin:16px 0 0;font-size:12px;color:#64748b">
              If you did not expect this, you can ignore this email.
            </p>
          </div>
        `,
        text: `A milestone was marked delivered.\n\nReview and approve release:\n${approveUrl}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Mark delivered failed', error);
    return NextResponse.json(
      { error: error?.message ?? 'Internal server error' },
      { status: 500 }
    );
  }
}
