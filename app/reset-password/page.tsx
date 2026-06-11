'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      setError('Something went wrong. Try again.');
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-xl font-black mb-2" style={{color: '#1a1a2e'}}>Invalid link</h2>
        <p className="text-gray-400 text-sm mb-4">This reset link is invalid or has expired.</p>
        <Link href="/forgot-password" className="btn text-white font-bold"
          style={{background: '#7F77DD', borderColor: '#7F77DD'}}>
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
      {!success ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">New password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">Confirm password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
            {loading ? <span className="loading loading-spinner"></span> : 'Reset password →'}
          </button>
        </form>
      ) : (
        <div className="text-center py-4">
          <div className="text-5xl mb-3">✅</div>
          <h2 className="text-xl font-black mb-2" style={{color: '#1a1a2e'}}>Password reset!</h2>
          <p className="text-gray-400 text-sm">Redirecting you to sign in...</p>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background: '#f8f7ff'}}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-6xl">🦉</span>
          <h1 className="text-2xl font-black mt-3" style={{color: '#1a1a2e'}}>Set new password</h1>
          <p className="text-gray-400 text-sm mt-2">Choose a strong password</p>
        </div>
        <Suspense fallback={<div className="loading loading-spinner"></div>}>
          <ResetContent />
        </Suspense>
        <p className="text-center text-sm text-gray-400 mt-6">
          <Link href="/login" className="font-semibold" style={{color: '#7F77DD'}}>
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
