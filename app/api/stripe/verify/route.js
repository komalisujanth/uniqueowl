import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 403 });

    const { sessionId } = await req.json();
    if (!sessionId) return NextResponse.json({ error: 'Session ID required' }, { status: 400 });

    // Verify payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const attemptsToAdd = session.metadata?.attemptsToAdd
      ? parseInt(session.metadata.attemptsToAdd)
      : 100;

    // Check if already processed
    const alreadyProcessed = await pool.query(
      'SELECT id FROM processed_payments WHERE session_id = $1',
      [sessionId]
    );

    if (alreadyProcessed.rows.length > 0) {
      return NextResponse.json({ message: 'Already processed', attemptsAdded: 0 });
    }

    // Add attempts to user
    await pool.query(
      'UPDATE users SET bonus_attempts = COALESCE(bonus_attempts, 0) + $1 WHERE id = $2',
      [attemptsToAdd, decoded.id]
    );

    // Mark as processed
    await pool.query(
      'INSERT INTO processed_payments (session_id, user_id) VALUES ($1, $2)',
      [sessionId, decoded.id]
    );

    return NextResponse.json({ message: 'Attempts added!', attemptsAdded: attemptsToAdd });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
