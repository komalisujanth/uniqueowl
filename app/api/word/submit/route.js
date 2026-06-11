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

    // Validate word
    const validation = await isValidWord(word);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    const cleanWord = word.trim().toLowerCase();

    // Check attempts
    const userResult = await pool.query(
      'SELECT attempts_used, last_reset, total_attempts FROM users WHERE id = $1',
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

    if (attemptsUsed >= 100) {
      return NextResponse.json({ error: 'Daily limit reached! Come back tomorrow 🦉' }, { status: 400 });
    }

    // Check if word exists and get attempt count
    const wordCheck = await pool.query('SELECT id, attempt_count FROM words WHERE word = $1', [cleanWord]);
    const isUnique = wordCheck.rows.length === 0;
    const scoreChange = isUnique ? 1 : -1;

    // Get total words count
    const totalWordsResult = await pool.query('SELECT COUNT(*) as count FROM words');
    const totalWords = parseInt(totalWordsResult.rows[0].count);

    let attemptCount = 0;

    if (isUnique) {
      // Add new word
      await pool.query('INSERT INTO words (word, attempt_count) VALUES ($1, 1)', [cleanWord]);
    } else {
      // Increment attempt count
      attemptCount = wordCheck.rows[0].attempt_count + 1;
      await pool.query('UPDATE words SET attempt_count = attempt_count + 1 WHERE word = $1', [cleanWord]);
    }

    // Update user score and attempts
    await pool.query(
      'UPDATE users SET score = score + $1, attempts_used = attempts_used + 1, total_attempts = total_attempts + 1 WHERE id = $2',
      [scoreChange, decoded.id]
    );

    const updatedUser = await pool.query(
      'SELECT score, attempts_used, total_attempts FROM users WHERE id = $1',
      [decoded.id]
    );

    return NextResponse.json({
      isUnique,
      scoreChange,
      newScore: updatedUser.rows[0].score,
      attemptsRemaining: 100 - updatedUser.rows[0].attempts_used,
      totalAttempts: updatedUser.rows[0].total_attempts,
      totalWords: isUnique ? totalWords + 1 : totalWords,
      attemptCount: isUnique ? 0 : attemptCount
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
