import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency') || 'usd';
    const planName = searchParams.get('planName');
    const planPeriod = searchParams.get('planPeriod');
    const mode = searchParams.get('mode') || 'sandbox';

    if (!amount || !planName) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `${planName} Plan`,
              description: `${planName} subscription - ${planPeriod}`,
            },
            unit_amount: parseInt(amount),
            recurring: planPeriod === 'month' ? {
              interval: 'month',
            } : undefined,
          },
          quantity: 1,
        },
      ],
      mode: planPeriod === 'month' ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=true`,
      metadata: {
        planName,
        planPeriod,
        mode,
      },
    });

    return NextResponse.redirect(session.url!);
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
