'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PremiumPage() {
  const router = useRouter();
  const [loading, setLoading] = useState('');

  const handlePurchase = async (pack) => {
    setLoading(pack);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ pack })
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Something went wrong. Try again.');
        setLoading('');
      }
    } catch {
      alert('Something went wrong. Try again.');
      setLoading('');
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center pt-10 px-4" style={{background: '#f8f7ff'}}>
      <div className="w-full max-w-lg">
        <button onClick={() => router.push('/home')} className="btn btn-ghost btn-sm mb-6" style={{color: '#7F77DD'}}>
          ← Back
        </button>

        <div className="text-center mb-10">
          <span className="text-6xl">🦉</span>
          <h1 className="text-3xl font-black mt-3 mb-2" style={{color: '#1a1a2e'}}>Get More Attempts</h1>
          <p className="text-gray-400">Run out of daily attempts? Top up and keep proving your originality.</p>
        </div>

        <div className="flex flex-col gap-4">

          {/* Pack 1 */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-purple-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-black text-xl" style={{color: '#1a1a2e'}}>Pack 1</div>
                <div className="text-gray-400 text-sm">+100 extra attempts today</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black" style={{color: '#7F77DD'}}>£1.99</div>
                <div className="text-xs text-gray-400">one-time</div>
              </div>
            </div>
            <div className="flex flex-col gap-2 mb-5">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>✅</span><span>100 extra attempts added instantly</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>✅</span><span>Valid for today only</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>✅</span><span>No subscription, pay once</span>
              </div>
            </div>
            <button
              onClick={() => handlePurchase('pack1')}
              className="btn w-full text-white font-bold"
              style={{background: '#7F77DD', borderColor: '#7F77DD'}}
              disabled={loading === 'pack1'}
            >
              {loading === 'pack1' ? <span className="loading loading-spinner"></span> : 'Buy Pack 1 — £1.99 →'}
            </button>
          </div>

          {/* Pack 2 */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-purple-300 relative overflow-hidden">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white" style={{background: '#7F77DD'}}>
              Best value
            </div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-black text-xl" style={{color: '#1a1a2e'}}>Pack 2</div>
                <div className="text-gray-400 text-sm">+500 extra attempts today</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black" style={{color: '#7F77DD'}}>£4.99</div>
                <div className="text-xs text-gray-400">one-time</div>
              </div>
            </div>
            <div className="flex flex-col gap-2 mb-5">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>✅</span><span>500 extra attempts added instantly</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>✅</span><span>Valid for today only</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>✅</span><span>No subscription, pay once</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>🔥</span><span><strong>5x more attempts</strong> for 2.5x the price</span>
              </div>
            </div>
            <button
              onClick={() => handlePurchase('pack2')}
              className="btn w-full text-white font-bold"
              style={{background: '#7F77DD', borderColor: '#7F77DD'}}
              disabled={loading === 'pack2'}
            >
              {loading === 'pack2' ? <span className="loading loading-spinner"></span> : 'Buy Pack 2 — £4.99 →'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">
          Secure payment by Stripe. No card details stored by Unique Owl.
        </p>
      </div>
    </div>
  );
}
