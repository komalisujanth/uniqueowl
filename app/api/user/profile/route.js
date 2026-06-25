import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 403 });

    const result = await pool.query(
      'SELECT id, user_id, name, email, country, score, attempts_used, total_attempts, last_reset, COALESCE(bonus_attempts, 0) as bonus_attempts FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const user = result.rows[0];

    // Reset ONLY free attempts every 24 hours
    const now = new Date();
    const lastReset = new Date(user.last_reset);
    const hoursSince = (now - lastReset) / (1000 * 60 * 60);

    let attemptsUsed = user.attempts_used;
    if (hoursSince >= 24) {
      await pool.query('UPDATE users SET attempts_used = 0, last_reset = $1 WHERE id = $2', [now, user.id]);
      attemptsUsed = 0;
    }

    const wordCountResult = await pool.query('SELECT COUNT(*) as count FROM words');
    const totalWords = parseInt(wordCountResult.rows[0].count);

    const freeRemaining = Math.max(0, 100 - attemptsUsed);
    const bonusRemaining = parseInt(user.bonus_attempts) || 0;

    return NextResponse.json({
      ...user,
      attempts_used: attemptsUsed,
      free_remaining: freeRemaining,
      bonus_remaining: bonusRemaining,
      attempts_remaining: freeRemaining + bonusRemaining,
      total_attempts: user.total_attempts || 0,
      totalWords
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
