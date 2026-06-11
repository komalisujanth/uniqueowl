import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import pool from '@/lib/db';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    // Check if user exists
    const result = await pool.query('SELECT id, name FROM users WHERE email = $1', [email]);
    
    // Always return success even if email not found (security best practice)
    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to database
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [resetToken, resetExpiry, user.id]
    );

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"Unique Owl 🦉" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Reset your Unique Owl password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <span style="font-size: 60px;">🦉</span>
            <h1 style="color: #7F77DD; font-size: 24px;">Unique Owl</h1>
          </div>
          <h2 style="color: #1a1a2e;">Hi ${user.name},</h2>
          <p style="color: #555; line-height: 1.6;">
            We received a request to reset your password. Click the button below to set a new one.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
              style="background: #7F77DD; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Reset My Password
            </a>
          </div>
          <p style="color: #999; font-size: 13px;">
            This link expires in 1 hour. If you didn't request this, ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #ccc; font-size: 12px; text-align: center;">
            Unique Owl — Think you're one of a kind? Prove it.
          </p>
        </div>
      `
    });

    return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to send email. Try again.' }, { status: 500 });
  }
}
