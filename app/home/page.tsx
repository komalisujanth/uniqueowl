'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const UNIQUE_MESSAGES = [
  { emoji: '🎉', title: 'Nobody thought of that!', sub: 'You\'re one of a kind.' },
  { emoji: '🔥', title: 'First in the world!', sub: 'Absolute legend.' },
  { emoji: '🌍', title: 'Original thinking!', sub: 'The world hadn\'t seen that one.' },
  { emoji: '🏆', title: 'History made!', sub: 'That word was never submitted before.' },
  { emoji: '✨', title: 'Fresh as it gets!', sub: 'Nobody thought of that before you.' },
  { emoji: '🧠', title: 'Rare mind!', sub: 'Your thinking is different — keep it up.' },
  { emoji: '🚀', title: 'Uncharted territory!', sub: 'You went where no one has gone.' },
];

const DUPLICATE_MESSAGES = [
  { emoji: '💪', title: 'Someone beat you to it!', sub: 'Dig deeper — you can do better.' },
  { emoji: '🔍', title: 'Already taken!', sub: 'Your best idea is still out there.' },
  { emoji: '😄', title: 'Great minds think alike!', sub: 'Try something more original.' },
  { emoji: '🎯', title: 'The world knows that one!', sub: 'Surprise us!' },
  { emoji: '🌟', title: 'Already in the books!', sub: 'Push the boundaries a little more.' },
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
  const [activeTab, setActiveTab] = useState('play');
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
      localStorage.setItem('user', JSON.stringify(data));
    } catch { router.push('/login'); }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      setLeaderboard(await res.json());
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!word.trim() || loading) return;
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
      if (!res.ok) { setError(data.error); setLoading(false); return; }

      setResult(data);
      setUser(prev => ({
        ...prev,
        score: data.newScore,
        attempts_remaining: data.attemptsRemaining,
        total_attempts: data.totalAttempts,
        totalWords: data.totalWords
      }));
      setWord('');
      fetchLeaderboard();
    } catch { setError('Something went wrong. Try again.'); }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleShare = () => {
    const text = `My Unique Owl score is ${user?.score} 🦉 Think you can beat me? uniqueowl.com`;
    if (navigator.share) navigator.share({ title: 'Unique Owl', text });
    else { navigator.clipboard.writeText(text); alert('Copied! Paste it anywhere to challenge friends.'); }
  };

  if (!user) return (
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#7F77DD'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'64px', marginBottom:'16px'}}>🦉</div>
        <div style={{color:'white', fontSize:'18px', opacity:0.8}}>Loading...</div>
      </div>
    </div>
  );

  const attemptsRemaining = user.attempts_remaining ?? 100;
  const pct = Math.max(0, (attemptsRemaining / 100) * 100);
  const resultMsg = result ? (result.isUnique ? randomMsg(UNIQUE_MESSAGES) : randomMsg(DUPLICATE_MESSAGES)) : null;

  return (
    <div style={{minHeight:'100vh', background:'#0f0f14', color:'white', fontFamily:'system-ui, -apple-system, sans-serif', maxWidth:'430px', margin:'0 auto', position:'relative'}}>

      {/* Header */}
      <div style={{background:'linear-gradient(135deg, #7F77DD 0%, #5a52b8 100%)', padding:'16px 20px 20px', position:'sticky', top:0, zIndex:50}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <img src="/icon-192.png" style={{width:'36px', height:'36px', borderRadius:'50%'}} alt="owl" onError={(e) => e.target.style.display='none'} />
            <div>
              <div style={{fontWeight:700, fontSize:'15px'}}>{user.name}</div>
              <div style={{fontSize:'10px', opacity:0.7, fontFamily:'monospace'}}>{user.user_id}</div>
            </div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'26px', fontWeight:900, lineHeight:1}}>{user.score}</div>
              <div style={{fontSize:'10px', opacity:0.7}}>pts</div>
            </div>
            <button onClick={handleLogout} style={{background:'rgba(255,255,255,0.15)', border:'none', color:'white', padding:'6px 12px', borderRadius:'20px', fontSize:'12px', cursor:'pointer'}}>
              Out
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{display:'flex', background:'#1a1a24', borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        {[
          { id: 'play', label: '🎮 Play' },
          { id: 'rooms', label: '🏠 Rooms' },
          { id: 'board', label: '🏆 Board' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{flex:1, padding:'14px 8px', border:'none', background:'transparent', color: activeTab === tab.id ? '#7F77DD' : 'rgba(255,255,255,0.4)', fontWeight: activeTab === tab.id ? 700 : 400, fontSize:'13px', cursor:'pointer', borderBottom: activeTab === tab.id ? '2px solid #7F77DD' : '2px solid transparent', transition:'all 0.2s'}}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* PLAY TAB */}
      {activeTab === 'play' && (
        <div style={{padding:'20px 16px', paddingBottom:'100px'}}>

          {/* Attempts ring */}
          <div style={{background:'#1a1a24', borderRadius:'20px', padding:'20px', marginBottom:'16px', textAlign:'center'}}>
            <div style={{position:'relative', width:'100px', height:'100px', margin:'0 auto 12px'}}>
              <svg width="100" height="100" style={{transform:'rotate(-90deg)'}}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8"/>
                <circle cx="50" cy="50" r="42" fill="none" stroke="#7F77DD" strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
                  strokeLinecap="round" style={{transition:'stroke-dashoffset 0.5s ease'}}/>
              </svg>
              <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center'}}>
                <div style={{fontSize:'22px', fontWeight:900, color:'#7F77DD'}}>{attemptsRemaining}</div>
                <div style={{fontSize:'9px', opacity:0.5}}>left</div>
              </div>
            </div>
            <div style={{display:'flex', justifyContent:'center', gap:'24px'}}>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'18px', fontWeight:700}}>{user.total_attempts || 0}</div>
                <div style={{fontSize:'10px', opacity:0.5}}>all time</div>
              </div>
              <div style={{width:'1px', background:'rgba(255,255,255,0.1)'}}/>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'18px', fontWeight:700}}>{user.totalWords || 0}</div>
                <div style={{fontSize:'10px', opacity:0.5}}>in database</div>
              </div>
            </div>
          </div>

          {/* Word input */}
          <div style={{background:'#1a1a24', borderRadius:'20px', padding:'20px', marginBottom:'16px'}}>
            <div style={{marginBottom:'14px'}}>
              <div style={{fontSize:'20px', fontWeight:900, marginBottom:'4px'}}>Think <span style={{color:'#7F77DD'}}>Unique</span> 🦉</div>
              <div style={{fontSize:'13px', opacity:0.5}}>Enter a word nobody has ever submitted</div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{display:'flex', gap:'8px', marginBottom:'8px'}}>
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
                  spellCheck="false"
                  style={{flex:1, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'12px', padding:'14px 16px', color:'white', fontSize:'16px', outline:'none'}}
                />
                <button type="submit" disabled={!word.trim() || loading || attemptsRemaining === 0}
                  style={{background:'#7F77DD', border:'none', borderRadius:'12px', width:'52px', color:'white', fontSize:'20px', cursor:'pointer', opacity: (!word.trim() || loading || attemptsRemaining === 0) ? 0.4 : 1, transition:'opacity 0.2s'}}>
                  {loading ? '⏳' : '→'}
                </button>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'11px', opacity:0.4}}>
                <span>Letters only • max 20 chars</span>
                <span>{word.length}/20</span>
              </div>
            </form>

            {error && (
              <div style={{marginTop:'12px', padding:'12px 16px', background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'12px', color:'#f87171', fontSize:'14px'}}>
                {error}
              </div>
            )}

            {result && resultMsg && (
              <div style={{marginTop:'12px', padding:'16px', background: result.isUnique ? 'rgba(34,197,94,0.1)' : 'rgba(251,191,36,0.1)', border: `1px solid ${result.isUnique ? 'rgba(34,197,94,0.3)' : 'rgba(251,191,36,0.3)'}`, borderRadius:'14px'}}>
                <div style={{fontSize:'32px', marginBottom:'6px'}}>{resultMsg.emoji}</div>
                <div style={{fontWeight:700, fontSize:'16px', marginBottom:'4px', color: result.isUnique ? '#4ade80' : '#fbbf24'}}>
                  {result.isUnique ? '+1 pt' : '-1 pt'} · {resultMsg.title}
                </div>
                <div style={{fontSize:'13px', opacity:0.7, marginBottom:'10px'}}>{resultMsg.sub}</div>
                {result.isUnique
                  ? <div style={{fontSize:'12px', opacity:0.6}}>Out of {result.totalWords?.toLocaleString()} words ever submitted — yours was the first!</div>
                  : <div style={{fontSize:'12px', opacity:0.6}}>This word has been tried {result.attemptCount?.toLocaleString()} times before.</div>
                }
              </div>
            )}

            {attemptsRemaining === 0 && (
              <div style={{marginTop:'12px', textAlign:'center', padding:'16px', background:'rgba(127,119,221,0.1)', borderRadius:'14px', border:'1px solid rgba(127,119,221,0.2)'}}>
                <div style={{fontSize:'24px', marginBottom:'6px'}}>🦉</div>
                <div style={{fontWeight:700, marginBottom:'4px'}}>Daily limit reached!</div>
                <div style={{fontSize:'12px', opacity:0.6, marginBottom:'12px'}}>Come back tomorrow or get more attempts</div>
                <button onClick={() => router.replace('/premium')}
                  style={{background:'#7F77DD', border:'none', color:'white', padding:'10px 20px', borderRadius:'20px', fontSize:'13px', fontWeight:700, cursor:'pointer'}}>
                  ⚡ Get more attempts
                </button>
              </div>
            )}
          </div>

          {/* How to play */}
          <div style={{background:'#1a1a24', borderRadius:'16px', padding:'16px'}}>
            <div style={{fontSize:'13px', fontWeight:700, marginBottom:'12px', opacity:0.7, textTransform:'uppercase', letterSpacing:'1px'}}>How to play</div>
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              {[
                ['✅', 'Unique word', '+1 point'],
                ['❌', 'Already exists', '-1 point'],
                ['🎯', '100 attempts', 'per day'],
                ['🔤', 'Letters only', 'max 20 chars'],
              ].map(([icon, label, val]) => (
                <div key={label} style={{display:'flex', alignItems:'center', gap:'10px', fontSize:'13px'}}>
                  <span>{icon}</span>
                  <span style={{flex:1, opacity:0.7}}>{label}</span>
                  <span style={{fontWeight:600, opacity:0.9}}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ROOMS TAB */}
      {activeTab === 'rooms' && (
        <div style={{padding:'20px 16px', paddingBottom:'100px'}}>
          <div style={{display:'flex', gap:'8px', marginBottom:'20px'}}>
            <button onClick={() => router.replace('/room?action=join')}
              style={{flex:1, padding:'12px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'12px', color:'white', fontSize:'14px', fontWeight:600, cursor:'pointer'}}>
              🔑 Join Room
            </button>
            <button onClick={() => router.replace('/room?action=create')}
              style={{flex:1, padding:'12px', background:'#7F77DD', border:'none', borderRadius:'12px', color:'white', fontSize:'14px', fontWeight:600, cursor:'pointer'}}>
              🎮 Create Room
            </button>
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            <div onClick={() => router.replace('/room?type=guessme&action=create')}
              style={{background:'linear-gradient(135deg, #2d1b69 0%, #1a0f3c 100%)', borderRadius:'20px', padding:'20px', cursor:'pointer', border:'1px solid rgba(127,119,221,0.3)'}}>
              <div style={{fontSize:'40px', marginBottom:'12px'}}>🕵️</div>
              <div style={{fontSize:'20px', fontWeight:900, marginBottom:'6px'}}>Guess Me</div>
              <div style={{fontSize:'13px', opacity:0.7, lineHeight:1.5, marginBottom:'14px'}}>
                Everyone enters a secret word. Then guess who typed what. The best detective wins!
              </div>
              <div style={{display:'flex', gap:'6px', flexWrap:'wrap'}}>
                {['Multiplayer', 'Up to 20', '60s rounds'].map(t => (
                  <span key={t} style={{background:'rgba(127,119,221,0.3)', color:'#a29bfe', padding:'4px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:600}}>{t}</span>
                ))}
              </div>
            </div>

            <div onClick={() => router.replace('/room?type=bigbrains&action=create')}
              style={{background:'linear-gradient(135deg, #3d2800 0%, #1f1400 100%)', borderRadius:'20px', padding:'20px', cursor:'pointer', border:'1px solid rgba(245,158,11,0.3)'}}>
              <div style={{fontSize:'40px', marginBottom:'12px'}}>🧠</div>
              <div style={{fontSize:'20px', fontWeight:900, marginBottom:'6px'}}>Big Brains</div>
              <div style={{fontSize:'13px', opacity:0.7, lineHeight:1.5, marginBottom:'14px'}}>
                Challenge friends to out-think you. Enter the rarest word — originality is scored. Most unique mind wins!
              </div>
              <div style={{display:'flex', gap:'6px', flexWrap:'wrap'}}>
                {['Multiplayer', 'Up to 20', 'Rarity scored'].map(t => (
                  <span key={t} style={{background:'rgba(245,158,11,0.2)', color:'#fbbf24', padding:'4px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:600}}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEADERBOARD TAB */}
      {activeTab === 'board' && (
        <div style={{padding:'20px 16px', paddingBottom:'100px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
            <div style={{fontSize:'18px', fontWeight:900}}>🏆 Top Players</div>
            <button onClick={handleShare}
              style={{background:'rgba(127,119,221,0.2)', border:'1px solid rgba(127,119,221,0.3)', color:'#a29bfe', padding:'8px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:600, cursor:'pointer'}}>
              Challenge friends
            </button>
          </div>

          {leaderboard.length > 0 ? (
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              {leaderboard.map((p, i) => (
                <div key={i} style={{
                  background: i === 0 ? 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,165,0,0.05))' : '#1a1a24',
                  border: i === 0 ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius:'16px', padding:'14px 16px', display:'flex', alignItems:'center', gap:'12px'
                }}>
                  <div style={{fontSize:'24px', width:'36px', textAlign:'center'}}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600, fontSize:'15px'}}>{p.name}</div>
                    <div style={{fontSize:'12px', opacity:0.5}}>{p.country}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:'22px', fontWeight:900, color:'#7F77DD'}}>{p.score}</div>
                    <div style={{fontSize:'11px', opacity:0.4}}>{p.total_attempts} tries</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{textAlign:'center', padding:'60px 20px', opacity:0.4}}>
              <div style={{fontSize:'48px', marginBottom:'12px'}}>🦉</div>
              <div>No players yet. Be the first!</div>
            </div>
          )}
        </div>
      )}

      {/* Bottom bar */}
      <div style={{position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:'430px', background:'#1a1a24', borderTop:'1px solid rgba(255,255,255,0.08)', padding:'8px 16px 24px', display:'flex', justifyContent:'space-around'}}>
        <button onClick={() => router.replace('/premium')}
          style={{flex:1, background:'linear-gradient(135deg, #7F77DD, #5a52b8)', border:'none', color:'white', padding:'12px', borderRadius:'12px', fontSize:'13px', fontWeight:700, cursor:'pointer'}}>
          ⚡ More Attempts
        </button>
      </div>

    </div>
  );
}
