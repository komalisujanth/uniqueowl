'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function DeleteAccountPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Send deletion request email
    try {
      await fetch('/api/auth/delete-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
    } catch {}
    setSubmitted(true);
    setLoading(false);
  };

  const inp = {
    width: '100%', padding: '14px 16px', background: '#1e1e2e',
    border: '1px solid rgba(127,119,221,0.3)', borderRadius: '12px',
    color: '#ffffff', fontSize: '16px', outline: 'none',
    boxSizing: 'border-box' as const, WebkitTextFillColor: '#ffffff',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f14', padding: '40px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '48px' }}>🦉</span>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'white', marginTop: '12px', marginBottom: '6px' }}>Delete Your Account</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>We're sorry to see you go</p>
        </div>

        {!submitted ? (
          <div style={{ background: '#1a1a24', borderRadius: '20px', padding: '28px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
              Submitting this form will permanently delete your Unique Owl account and all associated data including your score, attempts, and game history. This action cannot be undone.
            </p>

            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
              <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>
                ⚠️ Your account and all data will be permanently deleted within 30 days of your request.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px' }}>Your account email</label>
                <input type="email" placeholder="you@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inp} required />
              </div>
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '14px', background: loading ? '#333' : '#ef4444', border: 'none', borderRadius: '12px', color: 'white', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Submitting...' : 'Request Account Deletion'}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ background: '#1a1a24', borderRadius: '20px', padding: '32px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '10px' }}>Request received</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.6 }}>
              We've received your deletion request for <strong style={{ color: 'white' }}>{email}</strong>. Your account and all associated data will be permanently deleted within 30 days.
            </p>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
          Changed your mind?{' '}
          <Link href="/" style={{ color: '#7F77DD', textDecoration: 'none' }}>Go back to Unique Owl</Link>
        </p>
      </div>
    </div>
  );
}
