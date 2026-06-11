'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const UNIQUE_MESSAGES = [
  "Nobody in the world thought of that! You're one of a kind 🎉",
  "First in the world to think of that. Absolute legend! 🔥",
  "That's original thinking. The world hadn't seen that one! 🌍",
  "You just made history! That word was never submitted before 🏆",
  "Fresh as it gets! Nobody thought of that before you ✨",
  "Your mind works differently — and that's a good thing! 🧠",
  "Uncharted territory! You went where no one has gone before 🚀",
];

const DUPLICATE_MESSAGES = [
  "Someone already thought of it. Dig deeper! 💪",
  "That one's taken. Your best idea is still out there! 🔍",
  "Someone beat you to it! Try something more original 😄",
  "The world already knows that one. Surprise us! 🎯",
  "Already in the books! Push the boundaries a little more 🌟",
];

const randomMsg = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetchProfile();
    fetchLeaderboard();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) { localStorage.removeItem('token'); router.push('/login'); return; }
      const data = await res.json();
      setUser(data);
    } catch { router.push('/login'); }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      setLeaderboard(data);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!word.trim()) return;
    setLoading(true);
    setResult(null);
    setError('');

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/word/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ word: word.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setResult(data);
      setUser(prev => ({
        ...prev,
        score: data.newScore,
        attempts_remaining: data.attemptsRemaining,
        total_attempts: data.totalAttempts
      }));
      setWord('');
      fetchLeaderboard();
    } catch {
      setError('Something went wrong. Try again.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleShare = () => {
    const text = `My Unique Owl score is ${user?.score} 🦉 Think you can beat me? uniqueowl.com`;
    if (navigator.share) {
      navigator.share({ title: 'Unique Owl', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Challenge copied! Paste it anywhere to share.');
    }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{background: '#f8f7ff'}}>
      <div className="flex flex-col items-center gap-4">
        <span className="text-6xl">🦉</span>
        <span className="loading loading-dots loading-lg" style={{color: '#7F77DD'}}></span>
      </div>
    </div>
  );

  const attemptsRemaining = user.attempts_remaining ?? 100;
  const totalAttempts = user.total_attempts ?? 0;

  return (
    <div className="min-h-screen" style={{background: '#f8f7ff'}}>

      {/* Top bar */}
      <div className="sticky top-0 z-50 shadow-sm" style={{background: '#7F77DD'}}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🦉</span>
            <div>
              <div className="text-white font-bold text-sm">{user.name}</div>
              <div className="text-purple-200 text-xs font-mono">{user.user_id}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/premium')}
              className="btn btn-sm text-white font-bold"
              style={{background: 'rgba(255,255,255,0.25)', borderColor: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.4)'}}
            >
              ⚡ Get more attempts
            </button>
            <div className="text-center">
              <div className="text-white font-black text-2xl">{user.score}</div>
              <div className="text-purple-200 text-xs">score</div>
            </div>
            <button onClick={handleLogout} className="btn btn-sm btn-ghost text-white opacity-70 hover:opacity-100">
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left - Game */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Stats */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-black" style={{color: '#7F77DD'}}>{attemptsRemaining}</div>
                <div className="text-xs text-gray-400 mt-1">left today</div>
                <div className="text-xs text-gray-300">of 100</div>
              </div>
              <div className="text-center border-x border-purple-50">
                <div className="text-3xl font-black text-gray-700">{totalAttempts}</div>
                <div className="text-xs text-gray-400 mt-1">all time</div>
                <div className="text-xs text-gray-300">attempts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-gray-700">{user.totalWords || 0}</div>
                <div className="text-xs text-gray-400 mt-1">words in</div>
                <div className="text-xs text-gray-300">database</div>
              </div>
            </div>
          </div>

          {/* Word input */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50">
            <h2 className="font-black text-xl mb-1" style={{color: '#1a1a2e'}}>Think <span style={{color: '#7F77DD'}}>Unique</span></h2>
            <p className="text-gray-400 text-sm mb-4">Enter a word nobody has ever submitted</p>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a word or phrase..."
                value={word}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z ]/g, '');
                  setWord(val);
                }}
                maxLength={20}
                className="input input-bordered flex-1 font-medium"
                disabled={attemptsRemaining === 0 || loading}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              <button
                type="submit"
                className="btn text-white font-bold px-6"
                style={{background: '#7F77DD', borderColor: '#7F77DD'}}
                disabled={attemptsRemaining === 0 || loading || !word.trim()}
              >
                {loading ? <span className="loading loading-spinner loading-sm"></span> : '→'}
              </button>
            </form>

            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-300">Letters only • Max 20 characters</span>
              <span className="text-xs text-gray-300">{word.length}/20</span>
            </div>

            {error && (
              <div className="mt-3 p-3 rounded-2xl text-sm font-medium" style={{background: '#fef2f2', color: '#dc2626'}}>
                {error}
              </div>
            )}

            {result && (
              <div className={`mt-3 p-4 rounded-2xl ${result.isUnique ? 'border border-green-100' : 'border border-orange-100'}`}
                style={{background: result.isUnique ? '#f0fdf4' : '#fff7ed'}}>
                <div className={`font-bold text-sm mb-1 ${result.isUnique ? 'text-green-700' : 'text-orange-700'}`}>
                  {result.isUnique ? `+1 point` : `-1 point`}
                </div>
                <div className={`text-sm ${result.isUnique ? 'text-green-600' : 'text-orange-600'}`}>
                  {result.isUnique
                    ? `${randomMsg(UNIQUE_MESSAGES)} Out of ${result.totalWords.toLocaleString()} words ever submitted, yours was the first!`
                    : `${randomMsg(DUPLICATE_MESSAGES)} This word has been tried ${result.attemptCount.toLocaleString()} times before.`
                  }
                </div>
              </div>
            )}

            {attemptsRemaining === 0 && (
              <div className="mt-3 p-4 rounded-2xl text-center" style={{background: '#f8f7ff'}}>
                <div className="text-2xl mb-1">🦉</div>
                <div className="font-bold text-sm text-gray-600">Daily limit reached!</div>
                <div className="text-xs text-gray-400 mb-3">Come back tomorrow or get more attempts now</div>
                <button
                  onClick={() => router.push('/premium')}
                  className="btn btn-sm text-white font-bold"
                  style={{background: '#7F77DD', borderColor: '#7F77DD'}}
                >
                  Get more attempts →
                </button>
              </div>
            )}

            {attemptsRemaining <= 10 && attemptsRemaining > 0 && (
              <div className="mt-2 text-center">
                <button
                  onClick={() => router.push('/premium')}
                  className="btn btn-xs btn-ghost text-xs"
                  style={{color: '#7F77DD'}}
                >
                  Running low — get more attempts
                </button>
              </div>
            )}
          </div>

          {/* Game Rooms */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-xl" style={{color: '#1a1a2e'}}>Game Rooms</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push('/room?action=join')}
                  className="btn btn-sm btn-ghost text-sm font-semibold"
                  style={{color: '#7F77DD'}}
                >
                  🔑 Join
                </button>
                <button
                  onClick={() => router.push('/room?action=create')}
                  className="btn btn-sm text-white text-sm font-semibold"
                  style={{background: '#7F77DD', borderColor: '#7F77DD'}}
                >
                  🎮 Create
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div
                onClick={() => router.push('/room?type=guessme&action=create')}
                className="flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:shadow-md border border-purple-50 hover:border-purple-200"
                style={{background: '#faf8ff'}}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{background: '#EEEDFE'}}>
                  🕵️
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800 mb-1">Guess Me</div>
                  <div className="text-xs text-gray-400 leading-relaxed mb-2">
                    Play with friends — everyone enters a secret word, then guess who typed what. Best detective wins!
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="badge badge-sm text-white" style={{background: '#7F77DD'}}>Multiplayer</span>
                    <span className="badge badge-sm badge-ghost">Up to 20 players</span>
                    <span className="badge badge-sm badge-ghost">60s rounds</span>
                  </div>
                </div>
                <div className="text-gray-300 text-lg">›</div>
              </div>

              <div
                onClick={() => router.push('/room?type=bigbrains&action=create')}
                className="flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:shadow-md border border-amber-50 hover:border-amber-200"
                style={{background: '#fffdf5'}}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{background: '#FEF3C7'}}>
                  🧠
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800 mb-1">Big Brains</div>
                  <div className="text-xs text-gray-400 leading-relaxed mb-2">
                    Challenge friends to out-think you. Enter the rarest word you can — originality is scored!
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="badge badge-sm text-white" style={{background: '#F59E0B'}}>Multiplayer</span>
                    <span className="badge badge-sm badge-ghost">Up to 20 players</span>
                    <span className="badge badge-sm badge-ghost">Rarity scored</span>
                  </div>
                </div>
                <div className="text-gray-300 text-lg">›</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right - Leaderboard */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-xl" style={{color: '#1a1a2e'}}>🏆 Leaderboard</h2>
              <button onClick={handleShare} className="btn btn-sm btn-ghost text-xs font-semibold" style={{color: '#7F77DD'}}>
                Challenge friends
              </button>
            </div>

            {leaderboard.length > 0 ? (
              <div className="flex flex-col gap-2">
                {leaderboard.map((p, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl ${i === 0 ? 'border border-yellow-200' : ''}`}
                    style={{background: i === 0 ? '#fffbeb' : '#f8f7ff'}}>
                    <div className="text-xl w-8 text-center">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.country}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black" style={{color: '#7F77DD'}}>{p.score}</div>
                      <div className="text-xs text-gray-300">{p.total_attempts} tries</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">🦉</div>
                <div className="text-sm">No players yet. Be the first!</div>
              </div>
            )}
          </div>

          {/* Rules */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50">
            <h3 className="font-bold mb-3 text-gray-700">How to play</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>✅</span><span>Unique word = <strong className="text-gray-700">+1 point</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>❌</span><span>Already exists = <strong className="text-gray-700">-1 point</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>🎯</span><span>100 attempts per day</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>🔤</span><span>Letters only, max 20 chars</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
