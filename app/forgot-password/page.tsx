'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError('Something went wrong. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background: '#f8f7ff'}}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-6xl">🦉</span>
          <h1 className="text-2xl font-black mt-3" style={{color: '#1a1a2e'}}>Forgot password?</h1>
          <p className="text-gray-400 text-sm mt-2">No worries, we'll send you a reset link</p>
        </div>

        {!sent ? (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">Your email</label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {error && (
                <div className="alert alert-error text-sm py-2">
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn w-full text-white font-bold"
                style={{background: '#7F77DD', borderColor: '#7F77DD'}}
                disabled={loading}
              >
                {loading ? <span className="loading loading-spinner"></span> : 'Send reset link →'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-purple-50 text-center">
            <div className="text-5xl mb-4">📬</div>
            <h2 className="text-xl font-black mb-2" style={{color: '#1a1a2e'}}>Check your inbox!</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              We've sent a password reset link to <strong>{email}</strong>. 
              It expires in 1 hour.
            </p>
          </div>
        )}

        <p className="text-center text-sm text-gray-400 mt-6">
          Remember it?{' '}
          <Link href="/login" className="font-semibold" style={{color: '#7F77DD'}}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
