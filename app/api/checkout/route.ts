import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dodoClient } from '@/src/lib/dodo';

const checkoutSchema = z.object({
  escrow_id: z.string(),
  solana_pda_address: z.string(),
  product_id: z.string(),
  amount: z.number().int().positive(),
  customer_email: z.string().email(),
  customer_name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      escrow_id,
      solana_pda_address,
      amount,
      customer_email,
      customer_name,
    } = parsed.data;

    const session = await (dodoClient as any).checkoutSessions.create({
      product_cart: [
        {
          product_id: process.env.DODO_PRODUCT_ID,
          quantity: 1,
          amount,
        },
      ],
      metadata: {
        escrow_id,
        solana_pda_address,
      },
      customer: {
        email: customer_email,
        name: customer_name,
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
      confirm: false,
    });

    return NextResponse.json({
      session_id: session.session_id,
      checkout_url: session.checkout_url,
    });
  } catch (error: any) {
    console.error('Checkout creation failed', error);
    return NextResponse.json(
      { error: error?.message ?? 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
