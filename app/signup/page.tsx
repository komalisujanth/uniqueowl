'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const COUNTRIES = ['United Kingdom','United States','India','Canada','Australia','Germany','France','Spain','Italy','China','Japan','South Korea','Brazil','Mexico','Argentina','Netherlands','Sweden','Norway','Denmark','Finland','Belgium','Switzerland','Austria','Portugal','Greece','Poland','Ireland','New Zealand','Singapore','Malaysia','Thailand','Indonesia','Philippines','Vietnam','South Africa','Egypt','Nigeria','Kenya','Pakistan','Bangladesh','Russia','Ukraine','Turkey','Saudi Arabia','UAE','Israel','Chile','Colombia','Peru'].sort();

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', country: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Signup failed'); setLoading(false); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.replace('/home');
    } catch { setError('Something went wrong. Try again.'); setLoading(false); }
  };

  const inp = { width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: 'white', fontSize: '16px', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f14', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px', justifyContent: 'center' }}>
          <span style={{ fontSize: '36px' }}>🦉</span>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'white' }}>Unique Owl</span>
        </div>

        <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'white', marginBottom: '6px' }}>Create account</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '28px' }}>Start proving your unique thinking</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px' }}>Full name</label>
            <input type="text" placeholder="Your name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={inp} required />
          </div>
          <div>
            <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px' }}>Country</label>
            <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
              style={{ ...inp, cursor: 'pointer' }} required>
              <option value="" style={{ background: '#1a1a24' }}>Select your country</option>
              {COUNTRIES.map(c => <option key={c} value={c} style={{ background: '#1a1a24' }}>{c}</option>)}
            </select>
          </div>
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
            {loading ? 'Creating account...' : 'Create my account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#7F77DD', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
