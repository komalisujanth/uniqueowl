import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import pool from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      } catch (err) {
        console.error('Webhook signature failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      event = JSON.parse(body);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { userId, attemptsToAdd } = session.metadata;

      // Add attempts to user
      await pool.query(
        'UPDATE users SET bonus_attempts = COALESCE(bonus_attempts, 0) + $1 WHERE id = $2',
        [parseInt(attemptsToAdd), parseInt(userId)]
      );

      console.log(`Added ${attemptsToAdd} attempts to user ${userId}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
