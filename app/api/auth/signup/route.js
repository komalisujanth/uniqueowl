import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { generateToken, generateUserId } from '@/lib/auth';

export async function POST(req) {
  try {
    const { name, email, password, country } = await req.json();

    if (!name || !email || !password || !country) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Check if email exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique user ID
    let userId = generateUserId();
    let exists = await pool.query('SELECT id FROM users WHERE user_id = $1', [userId]);
    while (exists.rows.length > 0) {
      userId = generateUserId();
      exists = await pool.query('SELECT id FROM users WHERE user_id = $1', [userId]);
    }

    // Create user
    const result = await pool.query(
      `INSERT INTO users (user_id, name, email, password, country) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, user_id, name, email, country, score`,
      [userId, name, email, hashedPassword, country]
    );

    const user = result.rows[0];
    const token = generateToken(user.id);

    return NextResponse.json({ token, user });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
