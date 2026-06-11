'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const pack = searchParams.get('pack');
  const [status, setStatus] = useState('processing');
  const [attemptsAdded, setAttemptsAdded] = useState(0);

  useEffect(() => {
    if (!sessionId) { router.push('/home'); return; }
    verifyPayment();
  }, [sessionId]);

  const verifyPayment = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/stripe/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });

      const data = await res.json();

      if (res.ok) {
        setAttemptsAdded(data.attemptsAdded || (pack === 'pack1' ? 100 : 500));
        setStatus('success');
        setTimeout(() => router.push('/home'), 4000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'processing') return (
    <div className="text-center">
      <div className="text-6xl mb-4">🦉</div>
      <h2 className="text-xl font-black mb-2" style={{color: '#1a1a2e'}}>Processing payment...</h2>
      <span className="loading loading-dots loading-lg" style={{color: '#7F77DD'}}></span>
    </div>
  );

  if (status === 'error') return (
    <div className="text-center">
      <div className="text-6xl mb-4">❌</div>
      <h2 className="text-xl font-black mb-2" style={{color: '#1a1a2e'}}>Something went wrong</h2>
      <button onClick={() => router.push('/home')} className="btn text-white mt-4"
        style={{background: '#7F77DD'}}>Go home</button>
    </div>
  );

  return (
    <div className="text-center">
      <div className="text-7xl mb-4">🎉</div>
      <h1 className="text-3xl font-black mb-3" style={{color: '#1a1a2e'}}>Payment successful!</h1>
      <p className="text-gray-400 mb-2">
        <strong>{attemptsAdded} extra attempts</strong> have been added to your account!
      </p>
      <p className="text-gray-300 text-sm">Redirecting you back to the game...</p>
      <div className="mt-6">
        <span className="loading loading-dots loading-lg" style={{color: '#7F77DD'}}></span>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background: '#f8f7ff'}}>
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-purple-50 max-w-sm w-full">
        <Suspense fallback={<div className="loading loading-spinner"></div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
