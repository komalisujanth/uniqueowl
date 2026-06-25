'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const UNIQUE_MESSAGES = [
  { emoji: '🎉', title: 'Nobody thought of that!', sub: 'You\'re genuinely one of a kind.' },
  { emoji: '🔥', title: 'World first!', sub: 'Absolute legend. Keep going.' },
  { emoji: '🌍', title: 'Original thinking!', sub: 'The world hadn\'t seen that one.' },
  { emoji: '🏆', title: 'History made!', sub: 'That word was never submitted before.' },
  { emoji: '✨', title: 'Fresh as it gets!', sub: 'Nobody thought of that before you.' },
  { emoji: '🧠', title: 'Rare mind alert!', sub: 'Your thinking is different — keep it up.' },
  { emoji: '🚀', title: 'Uncharted territory!', sub: 'You went where no one has gone.' },
];

const DUPLICATE_MESSAGES = [
  { emoji: '💪', title: 'Someone beat you to it!', sub: 'Dig deeper — you can do better.' },
  { emoji: '🔍', title: 'Already taken!', sub: 'Your best idea is still out there.' },
  { emoji: '😄', title: 'Great minds think alike!', sub: 'Try something more original.' },
  { emoji: '🎯', title: 'The world knows that one!', sub: 'Surprise us!' },
  { emoji: '🌟', title: 'Already in the books!', sub: 'Push the boundaries more.' },
];

const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [resultMsg, setResultMsg] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('play');
  const inputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.replace('/login'); return; }
    fetchProfile();
    fetchLeaderboard();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (!res.ok) { localStorage.removeItem('token'); router.replace('/login'); return; }
      const data = await res.json();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch { router.replace('/login'); }
  };

  const fetchLeaderboard = async () => {
    try { const res = await fetch('/api/leaderboard'); setLeaderboard(await res.json()); } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!word.trim() || loading) return;
    setLoading(true); setResult(null); setError('');
    try {
      const res = await fetch('/api/word/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ word: word.trim() })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); inputRef.current?.focus(); return; }
      setResult(data);
      setResultMsg(data.isUnique ? rnd(UNIQUE_MESSAGES) : rnd(DUPLICATE_MESSAGES));
      setUser(prev => ({ ...prev, score: data.newScore, attempts_remaining: data.attemptsRemaining, total_attempts: data.totalAttempts, totalWords: data.totalWords }));
      setWord('');
      fetchLeaderboard();
    } catch { setError('Something went wrong. Try again.'); }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleShare = () => {
    const text = `My Unique Owl score is ${user?.score} 🦉 Think you can beat me? uniqueowl.com`;
    if (navigator.share) navigator.share({ title: 'Unique Owl', text });
    else { navigator.clipboard.writeText(text); alert('Copied! Paste it anywhere to challenge friends.'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user');
    router.replace('/login');
  };

  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f14' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🦉</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px' }}>Loading your nest...</div>
      </div>
    </div>
  );

  const attemptsRemaining = user.attempts_remaining ?? 100;
  const totalAttempts = user.total_attempts ?? 0;
  const pct = Math.max(0, Math.min(100, (attemptsRemaining / 100) * 100));

  // Stats cards
  const statsRow = (
    <div className="glass-card" style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1px 1fr 1px 1fr', alignItems: 'center', marginBottom: '12px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', fontWeight: 900, color: '#7F77DD' }}>{attemptsRemaining}</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>left today</div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>of 100</div>
      </div>
      <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.08)' }}/>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', fontWeight: 900 }}>{totalAttempts}</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>all time</div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>attempts</div>
      </div>
      <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.08)' }}/>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', fontWeight: 900 }}>{user.totalWords || 0}</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>words</div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>in database</div>
      </div>
    </div>
  );

  // Progress bar
  const progressBar = (
    <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden', marginBottom: '12px' }}>
      <div style={{ height: '100%', background: pct > 30 ? '#7F77DD' : '#ef4444', width: `${pct}%`, transition: 'width 0.5s ease', borderRadius: '2px' }}/>
    </div>
  );

  // Word input card — key prop ensures it never remounts
  const wordCard = (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '12px' }}>
      <div style={{ marginBottom: '18px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>
          Think <span className="gradient-text">Unique</span> 🦉
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Enter a word nobody has ever submitted</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a word or phrase..."
            value={word}
            onChange={(e) => setWord(e.target.value.replace(/[^a-zA-Z ]/g, ''))}
            maxLength={20}
            disabled={attemptsRemaining === 0 || loading}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
            
            className="input-owl"
            style={{ flex: 1, padding: '14px 16px', fontSize: '16px' }}
          />
          <button type="submit" className="btn-owl" disabled={!word.trim() || loading || attemptsRemaining === 0}
            style={{ padding: '14px 20px', fontSize: '18px', minWidth: '54px' }}>
            {loading ? '⏳' : '→'}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
          <span>Letters only • max 20 chars</span>
          <span>{word.length}/20</span>
        </div>
      </form>

      {error && (
        <div style={{ marginTop: '14px', padding: '14px 16px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', color: '#f87171', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {result && resultMsg && (
        <div style={{ marginTop: '14px', padding: '18px', background: result.isUnique ? 'rgba(34,197,94,0.08)' : 'rgba(251,191,36,0.08)', border: `1px solid ${result.isUnique ? 'rgba(34,197,94,0.25)' : 'rgba(251,191,36,0.25)'}`, borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <span style={{ fontSize: '32px' }}>{resultMsg.emoji}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: result.isUnique ? '#4ade80' : '#fbbf24' }}>
                {result.isUnique ? '+1 pt' : '-1 pt'} · {resultMsg.title}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{resultMsg.sub}</div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {result.isUnique
              ? `Out of ${result.totalWords?.toLocaleString()} words ever submitted — yours was the first! 🌍`
              : `This word has been tried ${result.attemptCount?.toLocaleString()} times before.`
            }
          </div>
        </div>
      )}

      {attemptsRemaining === 0 && (
        <div style={{ marginTop: '14px', padding: '18px', textAlign: 'center', background: 'rgba(127,119,221,0.08)', border: '1px solid rgba(127,119,221,0.2)', borderRadius: '14px' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🦉</div>
          <div style={{ fontWeight: 700, marginBottom: '4px' }}>Daily limit reached!</div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '14px' }}>Come back tomorrow or get more attempts now</div>
          <button onClick={() => router.replace('/premium')} className="btn-owl" style={{ padding: '10px 20px', fontSize: '13px' }}>⚡ Get more attempts</button>
        </div>
      )}

      {attemptsRemaining <= 15 && attemptsRemaining > 0 && (
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <button onClick={() => router.replace('/premium')} style={{ background: 'none', border: 'none', color: 'rgba(127,119,221,0.7)', fontSize: '12px', cursor: 'pointer' }}>
            ⚡ Running low — get more attempts
          </button>
        </div>
      )}
    </div>
  );

  // Rooms card
  const roomsCard = (
    <div className="glass-card" style={{ padding: '20px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Game Rooms</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => router.replace('/room?action=join')} className="btn-ghost-owl" style={{ padding: '7px 14px', fontSize: '12px' }}>🔑 Join</button>
          <button onClick={() => router.replace('/room?action=create')} className="btn-owl" style={{ padding: '7px 14px', fontSize: '12px' }}>🎮 Create</button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div onClick={() => router.replace('/room?type=guessme&action=create')}
          style={{ background: 'linear-gradient(135deg, rgba(45,27,105,0.6), rgba(26,15,60,0.6))', border: '1px solid rgba(127,119,221,0.2)', borderRadius: '14px', padding: '16px', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>🕵️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>Guess Me</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>Secret words. Then guess who typed what. Best detective wins!</div>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '18px' }}>›</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
            {['Multiplayer','Up to 20','60s rounds'].map(t => <span key={t} className="badge-owl" style={{ background: 'rgba(127,119,221,0.25)', color: '#a29bfe' }}>{t}</span>)}
          </div>
        </div>
        <div onClick={() => router.replace('/room?type=bigbrains&action=create')}
          style={{ background: 'linear-gradient(135deg, rgba(61,40,0,0.6), rgba(31,20,0,0.6))', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '14px', padding: '16px', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>🧠</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>Big Brains</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>Rarest word wins. Originality is scored. Most unique mind wins!</div>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '18px' }}>›</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
            {['Multiplayer','Up to 20','Rarity scored'].map(t => <span key={t} className="badge-owl" style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24' }}>{t}</span>)}
          </div>
        </div>
      </div>
    </div>
  );

  // How to play card
  const howToPlay = (
    <div className="glass-card" style={{ padding: '18px', marginBottom: '12px' }}>
      <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>How to play</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {[['✅','Unique word','+1 point'],['❌','Already exists','-1 point'],['🎯','100 attempts','per day'],['🔤','Letters only','max 20 chars']].map(([icon,label,val]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
            <span style={{ fontSize: '16px' }}>{icon}</span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{val}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Leaderboard card
  const leaderboardCard = (
    <div className="glass-card" style={{ padding: '20px', height: 'fit-content', position: 'sticky', top: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 800 }}>🏆 Leaderboard</h3>
        <button onClick={handleShare} style={{ background: 'none', border: 'none', color: '#7F77DD', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
          Challenge friends →
        </button>
      </div>
      {leaderboard.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {leaderboard.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: i === 0 ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.03)', border: i === 0 ? '1px solid rgba(255,215,0,0.2)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '14px' }}>
              <div style={{ fontSize: '20px', width: '32px', textAlign: 'center' }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{p.country}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#7F77DD' }}>{p.score}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{p.total_attempts} tries</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🦉</div>
          <div style={{ fontSize: '14px' }}>No players yet. Be the first!</div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f14' }}>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(15,15,20,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '28px' }}>🦉</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px' }}>{user.name}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{user.user_id}</div>
            </div>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', padding: '6px 16px', background: 'rgba(127,119,221,0.15)', borderRadius: '20px', border: '1px solid rgba(127,119,221,0.25)' }}>
              <span style={{ fontSize: '22px', fontWeight: 900, color: '#7F77DD' }}>{user.score}</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>pts</span>
            </div>
            <button onClick={() => router.replace('/premium')} className="btn-owl" style={{ padding: '8px 16px', fontSize: '13px' }}>⚡ More</button>
            <button onClick={handleLogout} className="btn-ghost-owl" style={{ padding: '8px 16px', fontSize: '13px' }}>Sign out</button>
          </nav>
        </div>
      </header>

      {/* Mobile tabs */}
      <div className="mobile-tabs" style={{ display: 'none', background: 'rgba(15,15,20,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: '64px', zIndex: 40 }}>
        {[['play','🎮 Play'],['rooms','🏠 Rooms'],['board','🏆 Board']].map(([id,label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{ flex: 1, padding: '12px 8px', border: 'none', background: 'transparent', color: activeTab === id ? '#7F77DD' : 'rgba(255,255,255,0.35)', fontWeight: activeTab === id ? 700 : 400, fontSize: '13px', cursor: 'pointer', borderBottom: activeTab === id ? '2px solid #7F77DD' : '2px solid transparent', transition: 'all 0.2s' }}>
            {label}
          </button>
        ))}
      </div>

      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Desktop layout — always visible on large screens */}
        <div className="home-grid">
          <div>
            {statsRow}
            {progressBar}
            {wordCard}
            {roomsCard}
            {howToPlay}
          </div>
          <div className="desktop-sidebar" style={{ display: 'none' }}>
            {leaderboardCard}
          </div>
        </div>

        {/* Mobile tab content */}
        <div className="mobile-tabs" style={{ display: 'none', padding: '16px', paddingBottom: '80px', flexDirection: 'column' }}>
          {activeTab === 'play' && <>
            {statsRow}
            {progressBar}
            {wordCard}
            {howToPlay}
          </>}
          {activeTab === 'rooms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '4px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => router.replace('/room?action=join')} className="btn-ghost-owl" style={{ flex: 1, padding: '13px' }}>🔑 Join Room</button>
                <button onClick={() => router.replace('/room?action=create')} className="btn-owl" style={{ flex: 1, padding: '13px' }}>🎮 Create Room</button>
              </div>
              <div onClick={() => router.replace('/room?type=guessme&action=create')} style={{ background: 'linear-gradient(135deg,rgba(45,27,105,0.8),rgba(26,15,60,0.8))', border: '1px solid rgba(127,119,221,0.3)', borderRadius: '18px', padding: '22px', cursor: 'pointer' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🕵️</div>
                <div style={{ fontSize: '20px', fontWeight: 900, marginBottom: '8px' }}>Guess Me</div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: '14px' }}>Everyone enters a secret word. Then guess who typed what. Best detective wins!</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['Multiplayer','Up to 20','60s rounds'].map(t => <span key={t} className="badge-owl" style={{ background: 'rgba(127,119,221,0.3)', color: '#a29bfe' }}>{t}</span>)}
                </div>
              </div>
              <div onClick={() => router.replace('/room?type=bigbrains&action=create')} style={{ background: 'linear-gradient(135deg,rgba(61,40,0,0.8),rgba(31,20,0,0.8))', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '18px', padding: '22px', cursor: 'pointer' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🧠</div>
                <div style={{ fontSize: '20px', fontWeight: 900, marginBottom: '8px' }}>Big Brains</div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: '14px' }}>Enter the rarest word you can think of. Originality is scored. Most unique mind wins!</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['Multiplayer','Up to 20','Rarity scored'].map(t => <span key={t} className="badge-owl" style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24' }}>{t}</span>)}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'board' && (
            <div style={{ paddingTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>🏆 Top Players</div>
                <button onClick={handleShare} style={{ background: 'none', border: 'none', color: '#7F77DD', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Challenge →</button>
              </div>
              {leaderboard.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: i===0?'rgba(255,215,0,0.06)':'rgba(255,255,255,0.03)', border: i===0?'1px solid rgba(255,215,0,0.2)':'1px solid rgba(255,255,255,0.05)', borderRadius: '14px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '22px', width: '36px', textAlign: 'center' }}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{p.country}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: '#7F77DD' }}>{p.score}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{p.total_attempts} tries</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Mobile bottom bar */}
      <div className="mobile-bottom-bar" style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(15,15,20,0.98)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '10px 16px 20px', alignItems: 'center', gap: '10px', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', background: 'rgba(127,119,221,0.15)', padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(127,119,221,0.2)' }}>
          <span style={{ fontSize: '20px', fontWeight: 900, color: '#7F77DD' }}>{user.score}</span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>pts</span>
        </div>
        <button onClick={() => router.replace('/premium')} className="btn-owl" style={{ flex: 1, padding: '12px', fontSize: '14px' }}>⚡ Get More Attempts</button>
      </div>
    </div>
  );
}
