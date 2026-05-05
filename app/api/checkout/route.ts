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

    const payment = await dodoClient.payments.create({
      billing: {
        city: "San Francisco",
        country: "US",
        state: "CA",
        street: "123 Market St",
        zipcode: "94105",
      },
      customer: {
        create_new_customer: true,
        email: customer_email,
        name: customer_name || "Lockr Customer",
      },
      product_cart: [
        {
          product_id: process.env.DODO_PRODUCT_ID as string,
          quantity: 1,
          amount,
        },
      ],
      metadata: {
        escrow_id,
        solana_pda_address,
      },
      payment_link: true,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    });

    return NextResponse.json({
      session_id: payment.payment_id,
      checkout_url: payment.payment_link,
    });
  } catch (error: any) {
    console.error('Checkout creation failed', error);
    return NextResponse.json(
      { error: error?.message ?? 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
