'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.replace('/home');
    } catch { setError('Something went wrong. Try again.'); setLoading(false); }
  };

  const inp = { width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: 'white', fontSize: '16px', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0f0f14' }}>

      {/* Left hero - desktop only */}
      <div style={{ flex: 1, display: 'none', flexDirection: 'column', justifyContent: 'center', padding: '60px', background: 'linear-gradient(135deg, #1a0f3c, #0f0f14)' }} className="desktop-hero">
        <div style={{ maxWidth: '440px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <span style={{ fontSize: '48px' }}>🦉</span>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>Unique Owl</span>
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: 900, color: 'white', lineHeight: 1.15, marginBottom: '20px' }}>
            Think you're one of a kind?
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '40px' }}>
            Millions of people think they think differently. Only a few actually do. Prove it.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[['🧠','Submit unique words','Nobody else can have thought of it'],['🏆','Climb the leaderboard','Compete with players worldwide'],['🎮','Play with friends','Guess Me & Big Brains rooms']].map(([icon,title,sub]) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '24px' }}>{icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: 'white', fontSize: '15px' }}>{title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '2px' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px', justifyContent: 'center' }}>
            <span style={{ fontSize: '36px' }}>🦉</span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'white' }}>Unique Owl</span>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'white', marginBottom: '6px' }}>Welcome back</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '28px' }}>Sign in to prove your originality</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px' }}>Email</label>
              <input type="email" placeholder="you@email.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={inp} required />
            </div>
            <div>
              <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px' }}>Password</label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={inp} required />
            </div>

            {error && (
              <div style={{ padding: '12px 14px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', color: '#f87171', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? 'rgba(127,119,221,0.5)' : 'linear-gradient(135deg,#7F77DD,#5a52b8)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px' }}>
              {loading ? 'Signing in...' : 'Sign in to prove it →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link href="/forgot-password" style={{ color: 'rgba(127,119,221,0.8)', fontSize: '13px', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>

          <p style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
            New here?{' '}
            <Link href="/signup" style={{ color: '#7F77DD', fontWeight: 600, textDecoration: 'none' }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
