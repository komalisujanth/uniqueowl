import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 403 });

    const { pack } = await req.json();

    // Get user
    const userResult = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [decoded.id]);
    if (userResult.rows.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const user = userResult.rows[0];

    const priceId = pack === 'pack1'
      ? process.env.STRIPE_PACK1_PRICE_ID
      : process.env.STRIPE_PACK2_PRICE_ID;

    const attemptsToAdd = pack === 'pack1' ? 100 : 500;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      customer_email: user.email,
      success_url: `${appUrl}/premium/success?session_id={CHECKOUT_SESSION_ID}&pack=${pack}`,
      cancel_url: `${appUrl}/premium`,
      metadata: {
        userId: decoded.id.toString(),
        pack,
        attemptsToAdd: attemptsToAdd.toString()
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
