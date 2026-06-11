'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const COUNTRIES = [
  'United Kingdom','United States','India','Canada','Australia','Germany','France','Spain','Italy',
  'China','Japan','South Korea','Brazil','Mexico','Argentina','Netherlands','Sweden','Norway',
  'Denmark','Finland','Belgium','Switzerland','Austria','Portugal','Greece','Poland','Ireland',
  'New Zealand','Singapore','Malaysia','Thailand','Indonesia','Philippines','Vietnam','South Africa',
  'Egypt','Nigeria','Kenya','Pakistan','Bangladesh','Russia','Ukraine','Turkey','Saudi Arabia',
  'UAE','Israel','Chile','Colombia','Peru'
].sort();

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

      if (!res.ok) {
        setError(data.error || 'Signup failed');
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
            <span className="text-2xl font-bold">Unique Owl</span>
          </div>
          <h1 className="text-5xl font-black leading-tight mb-6">
            Join thousands proving their originality
          </h1>
          <p className="text-xl opacity-80 mb-10 leading-relaxed">
            Every word you submit is checked against every word ever submitted. Only the truly original minds score high.
          </p>
          <div className="bg-white bg-opacity-10 rounded-2xl p-6">
            <div className="text-4xl font-black mb-1">100</div>
            <div className="opacity-70">free attempts every day</div>
            <div className="mt-4 text-4xl font-black mb-1">∞</div>
            <div className="opacity-70">possible words to discover</div>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-sm">

          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-4xl">🦉</span>
            <span className="text-xl font-bold" style={{color: '#7F77DD'}}>Unique Owl</span>
          </div>

          <h2 className="text-3xl font-black mb-2" style={{color: '#1a1a2e'}}>Create account</h2>
          <p className="text-gray-500 mb-8">Start proving your unique thinking</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Full name</label>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Country</label>
              <select
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="select select-bordered w-full"
                required
              >
                <option value="">Select your country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

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
              {loading ? <span className="loading loading-spinner"></span> : 'Create my account →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold" style={{color: '#7F77DD'}}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
