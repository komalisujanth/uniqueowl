import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD }
    });

    await transporter.sendMail({
      from: `"Unique Owl" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `Account Deletion Request — ${email}`,
      html: `<p>User <strong>${email}</strong> has requested account deletion.</p><p>Please delete their account and all associated data within 30 days.</p>`
    });

    return NextResponse.json({ message: 'Request received' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Request received' }); // Always return success
  }
}
