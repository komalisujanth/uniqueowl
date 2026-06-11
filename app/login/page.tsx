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

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/home');
    } catch {
      setError('Something went wrong. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{background: '#f8f7ff'}}>

      {/* Left side - hero */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16" style={{background: '#7F77DD'}}>
        <div className="text-white max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-5xl">🦉</span>
            <span className="text-2xl font-bold text-white">Unique Owl</span>
          </div>
          <h1 className="text-5xl font-black leading-tight mb-6 text-white">
            Think you're one of a kind?
          </h1>
          <p className="text-xl mb-10 leading-relaxed text-white" style={{opacity: 0.85}}>
            Millions of people think they think differently. Only a few actually do. Prove it.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 rounded-2xl p-4" style={{background: 'rgba(255,255,255,0.15)'}}>
              <span className="text-2xl">🧠</span>
              <div>
                <div className="font-semibold text-white">Submit unique words</div>
                <div className="text-sm text-white" style={{opacity: 0.75}}>Nobody else can have thought of it</div>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl p-4" style={{background: 'rgba(255,255,255,0.15)'}}>
              <span className="text-2xl">🏆</span>
              <div>
                <div className="font-semibold text-white">Climb the leaderboard</div>
                <div className="text-sm text-white" style={{opacity: 0.75}}>Compete with players worldwide</div>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl p-4" style={{background: 'rgba(255,255,255,0.15)'}}>
              <span className="text-2xl">🎮</span>
              <div>
                <div className="font-semibold text-white">Play with friends</div>
                <div className="text-sm text-white" style={{opacity: 0.75}}>Guess Me & Big Brains rooms</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-4xl">🦉</span>
            <span className="text-xl font-bold" style={{color: '#7F77DD'}}>Unique Owl</span>
          </div>

          <h2 className="text-3xl font-black mb-2" style={{color: '#1a1a2e'}}>Welcome back</h2>
          <p className="text-gray-500 mb-8">Sign in to prove your originality</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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
              className="btn w-full text-white font-bold mt-2"
              style={{background: '#7F77DD', borderColor: '#7F77DD'}}
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner"></span> : 'Sign in to prove it →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            <Link href="/forgot-password" className="font-semibold" style={{color: '#7F77DD'}}>
              Forgot password?
            </Link>
          </p>

          <p className="text-center text-sm text-gray-500 mt-3">
            New here?{' '}
            <Link href="/signup" className="font-semibold" style={{color: '#7F77DD'}}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
