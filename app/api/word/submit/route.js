import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { isValidWord } from '@/lib/wordValidation';

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 403 });

    const { word } = await req.json();

    const validation = await isValidWord(word);
    if (!validation.valid) return NextResponse.json({ error: validation.reason }, { status: 400 });

    const cleanWord = word.trim().toLowerCase();

    const userResult = await pool.query(
      'SELECT attempts_used, last_reset, total_attempts, COALESCE(bonus_attempts, 0) as bonus_attempts FROM users WHERE id = $1',
      [decoded.id]
    );
    const user = userResult.rows[0];

    const now = new Date();
    const lastReset = new Date(user.last_reset);
    const hoursSince = (now - lastReset) / (1000 * 60 * 60);

    let attemptsUsed = user.attempts_used;
    if (hoursSince >= 24) {
      await pool.query('UPDATE users SET attempts_used = 0, last_reset = $1 WHERE id = $2', [now, decoded.id]);
      attemptsUsed = 0;
    }

    const freeRemaining = Math.max(0, 100 - attemptsUsed);
    const bonusRemaining = parseInt(user.bonus_attempts) || 0;
    const totalRemaining = freeRemaining + bonusRemaining;

    if (totalRemaining <= 0) {
      return NextResponse.json({ error: 'No attempts remaining! Come back tomorrow or get more attempts 🦉' }, { status: 400 });
    }

    // Use free attempts first, then bonus
    if (freeRemaining > 0) {
      await pool.query('UPDATE users SET attempts_used = attempts_used + 1, total_attempts = total_attempts + 1 WHERE id = $1', [decoded.id]);
    } else {
      // Use bonus attempt
      await pool.query('UPDATE users SET bonus_attempts = bonus_attempts - 1, total_attempts = total_attempts + 1 WHERE id = $1', [decoded.id]);
    }

    const wordCheck = await pool.query('SELECT id, attempt_count FROM words WHERE word = $1', [cleanWord]);
    const isUnique = wordCheck.rows.length === 0;
    const scoreChange = isUnique ? 1 : -1;
    let attemptCount = 0;

    if (isUnique) {
      await pool.query('INSERT INTO words (word, attempt_count) VALUES ($1, 1) ON CONFLICT (word) DO NOTHING', [cleanWord]);
    } else {
      attemptCount = (wordCheck.rows[0].attempt_count || 0) + 1;
      await pool.query('UPDATE words SET attempt_count = attempt_count + 1 WHERE word = $1', [cleanWord]);
    }

    await pool.query('UPDATE users SET score = score + $1 WHERE id = $2', [scoreChange, decoded.id]);

    const updatedUser = await pool.query(
      'SELECT score, attempts_used, total_attempts, COALESCE(bonus_attempts, 0) as bonus_attempts FROM users WHERE id = $1',
      [decoded.id]
    );
    const u = updatedUser.rows[0];

    const wordCountResult = await pool.query('SELECT COUNT(*) as count FROM words');
    const totalWords = parseInt(wordCountResult.rows[0].count);

    const newFreeRemaining = Math.max(0, 100 - u.attempts_used);
    const newBonusRemaining = parseInt(u.bonus_attempts) || 0;

    return NextResponse.json({
      isUnique,
      scoreChange,
      newScore: u.score,
      free_remaining: newFreeRemaining,
      bonus_remaining: newBonusRemaining,
      attemptsRemaining: newFreeRemaining + newBonusRemaining,
      totalAttempts: u.total_attempts,
      totalWords,
      attemptCount: isUnique ? 0 : attemptCount
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
