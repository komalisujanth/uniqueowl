'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { io } from 'socket.io-client';

function RoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action') || 'create';
  const type = searchParams.get('type') || 'guessme';

  const [user, setUser] = useState(null);
  const [view, setView] = useState(action === 'join' ? 'join' : 'select');
  const [roomType, setRoomType] = useState(type);
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [room, setRoom] = useState(null);
  const [roomError, setRoomError] = useState('');
  const [timer, setTimer] = useState(60);
  const [roomWord, setRoomWord] = useState('');
  const [roomWordSubmitted, setRoomWordSubmitted] = useState(false);
  const [guessingData, setGuessingData] = useState(null);
  const [guesses, setGuesses] = useState({});
  const [guessesSubmitted, setGuessesSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [wordError, setWordError] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.replace('/login'); return; }
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    const socket = io(window.location.origin);
    socketRef.current = socket;
    socket.on('room_created', ({ code, room }) => { setRoomCode(code); setRoom(room); setView('lobby'); });
    socket.on('room_joined', ({ code, room }) => { setRoomCode(code); setRoom(room); setView('lobby'); });
    socket.on('room_updated', ({ room }) => setRoom(room));
    socket.on('game_started', ({ timeLeft }) => { setTimer(timeLeft); setRoomWord(''); setRoomWordSubmitted(false); setWordError(''); setView('playing'); });
    socket.on('timer_tick', ({ timeLeft }) => setTimer(timeLeft));
    socket.on('guessing_phase', ({ players, words, timeLeft }) => { setGuessingData({ players, words }); setGuesses({}); setGuessesSubmitted(false); setTimer(timeLeft); setView('guessing'); });
    socket.on('guess_timer_tick', ({ timeLeft }) => setTimer(timeLeft));
    socket.on('guesses_confirmed', () => setGuessesSubmitted(true));
    socket.on('special_results', (data) => { setResults({ type: 'bigbrains', ...data }); setView('results'); });
    socket.on('thriller_results', (data) => { setResults({ type: 'guessme', ...data }); setView('results'); });
    socket.on('room_error', ({ message }) => setRoomError(message));
    return () => socket.disconnect();
  }, []);

  const createRoom = (t) => { setRoomError(''); setRoomType(t); const u = JSON.parse(localStorage.getItem('user') || '{}'); socketRef.current.emit('create_room', { type: t, user: u }); };
  const joinRoom = () => { setRoomError(''); if (!joinCode.trim()) return; const u = JSON.parse(localStorage.getItem('user') || '{}'); socketRef.current.emit('join_room', { code: joinCode.trim().toUpperCase(), user: u }); };
  const startGame = () => socketRef.current.emit('start_game', { code: roomCode });
  const submitRoomWord = () => { if (!roomWord.trim()) return; setWordError(''); socketRef.current.emit('submit_room_word', { code: roomCode, word: roomWord.trim(), userId: user?.user_id }); setRoomWordSubmitted(true); };
  const submitGuesses = () => socketRef.current.emit('submit_guesses', { code: roomCode, userId: user?.user_id, guesses });
  const leaveRoom = () => router.replace('/home');

  const bg = '#0f0f14';
  const card = { background: '#1a1a24', borderRadius: '20px', padding: '20px', marginBottom: '12px' };
  const btn = (c='#7F77DD') => ({ background: c, border: 'none', color: 'white', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', width: '100%' });
  const backBtn = { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', marginBottom: '20px' };
  const inp = { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '14px 16px', color: 'white', fontSize: '16px', outline: 'none', width: '100%' };
  const page = { minHeight: '100vh', background: bg, color: 'white', fontFamily: 'system-ui,sans-serif', maxWidth: '430px', margin: '0 auto' };

  if (view === 'select') return (
    <div style={page}>
      <div style={{ padding: '20px 16px 40px' }}>
        <button style={backBtn} onClick={leaveRoom}>← Back</button>
        <div style={{ fontSize: '24px', fontWeight: 900, marginBottom: '6px' }}>🎮 Game Rooms</div>
        <div style={{ opacity: 0.5, fontSize: '14px', marginBottom: '24px' }}>Pick your battle mode</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div onClick={() => createRoom('guessme')} style={{ background: 'linear-gradient(135deg,#2d1b69,#1a0f3c)', borderRadius: '20px', padding: '24px', cursor: 'pointer', border: '1px solid rgba(127,119,221,0.3)' }}>
            <div style={{ fontSize: '44px', marginBottom: '12px' }}>🕵️</div>
            <div style={{ fontSize: '22px', fontWeight: 900, marginBottom: '8px' }}>Guess Me</div>
            <div style={{ fontSize: '14px', opacity: 0.7, lineHeight: 1.6, marginBottom: '14px' }}>Everyone enters a secret word. Then guess who typed what. The best detective wins!</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['Multiplayer','Up to 20','60s rounds'].map(t => <span key={t} style={{ background: 'rgba(127,119,221,0.3)', color: '#a29bfe', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>{t}</span>)}
            </div>
          </div>
          <div onClick={() => createRoom('bigbrains')} style={{ background: 'linear-gradient(135deg,#3d2800,#1f1400)', borderRadius: '20px', padding: '24px', cursor: 'pointer', border: '1px solid rgba(245,158,11,0.3)' }}>
            <div style={{ fontSize: '44px', marginBottom: '12px' }}>🧠</div>
            <div style={{ fontSize: '22px', fontWeight: 900, marginBottom: '8px' }}>Big Brains</div>
            <div style={{ fontSize: '14px', opacity: 0.7, lineHeight: 1.6, marginBottom: '14px' }}>Enter the rarest word you can think of. Originality is scored. The most unique mind wins!</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['Multiplayer','Up to 20','Rarity scored'].map(t => <span key={t} style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>{t}</span>)}
            </div>
          </div>
        </div>
        {roomError && <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(239,68,68,0.15)', borderRadius: '12px', color: '#f87171', fontSize: '14px' }}>{roomError}</div>}
      </div>
    </div>
  );

  if (view === 'join') return (
    <div style={page}>
      <div style={{ padding: '20px 16px' }}>
        <button style={backBtn} onClick={leaveRoom}>← Back</button>
        <div style={{ fontSize: '24px', fontWeight: 900, marginBottom: '6px' }}>🔑 Join a Room</div>
        <div style={{ opacity: 0.5, fontSize: '14px', marginBottom: '24px' }}>Enter the room code from your friend</div>
        <input type="text" placeholder="XXXXXX" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} maxLength={6}
          style={{ ...inp, textAlign: 'center', fontSize: '32px', fontWeight: 900, letterSpacing: '8px', marginBottom: '12px' }} />
        <button onClick={joinRoom} style={btn()}>Join Room →</button>
        {roomError && <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(239,68,68,0.15)', borderRadius: '12px', color: '#f87171', fontSize: '14px' }}>{roomError}</div>}
      </div>
    </div>
  );

  if (view === 'lobby') {
    const isCreator = room?.creator === user?.user_id;
    const players = room?.players || [];
    const positions = [{x:55,y:90},{x:100,y:102},{x:140,y:96},{x:175,y:102},{x:210,y:76},{x:235,y:115},{x:35,y:122},{x:80,y:118},{x:120,y:110},{x:155,y:108},{x:185,y:108},{x:225,y:98}];
    return (
      <div style={page}>
        <div style={{ padding: '20px 16px 40px' }}>
          <button style={backBtn} onClick={leaveRoom}>← Leave Room</button>
          <div style={{ ...card, textAlign: 'center' }}>
            <div style={{ display: 'inline-block', background: '#7F77DD', color: 'white', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
              {room?.type === 'guessme' ? '🕵️ Guess Me' : '🧠 Big Brains'}
            </div>
            <div style={{ fontSize: '11px', opacity: 0.4, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Room Code</div>
            <div style={{ fontSize: '38px', fontWeight: 900, color: '#7F77DD', letterSpacing: '8px', marginBottom: '12px' }}>{roomCode}</div>
            <button onClick={() => { navigator.clipboard.writeText(`Join my Unique Owl room! Code: ${roomCode} — uniqueowl.com/room?action=join`); alert('Invite link copied!'); }}
              style={{ background: 'rgba(127,119,221,0.15)', border: '1px solid rgba(127,119,221,0.3)', color: '#a29bfe', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer' }}>
              📋 Copy invite link
            </button>
          </div>
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontWeight: 700 }}>The nest 🌿</span>
              <span style={{ opacity: 0.5, fontSize: '13px' }}>{players.length} / 20</span>
            </div>
            <svg width="100%" height="150" viewBox="0 0 280 150" style={{ display: 'block' }}>
              <path d="M20,125 Q140,85 260,115" stroke="#8B6F47" strokeWidth="10" fill="none" strokeLinecap="round"/>
              <path d="M70,125 Q75,100 80,85" stroke="#8B6F47" strokeWidth="5" fill="none" strokeLinecap="round"/>
              <path d="M200,112 Q205,88 210,74" stroke="#8B6F47" strokeWidth="5" fill="none" strokeLinecap="round"/>
              <ellipse cx="78" cy="81" rx="14" ry="9" fill="#4a7c4e" opacity="0.8" transform="rotate(-20 78 81)"/>
              <ellipse cx="208" cy="70" rx="14" ry="9" fill="#4a7c4e" opacity="0.8" transform="rotate(15 208 70)"/>
              {players.map((p, i) => { const pos = positions[i % positions.length]; return (
                <g key={i}>
                  <text x={pos.x} y={pos.y} textAnchor="middle" fontSize="20" style={{ userSelect: 'none' }}>🦉</text>
                  {p.user_id === room?.creator && <text x={pos.x+10} y={pos.y-10} fontSize="10">👑</text>}
                </g>
              ); })}
            </svg>
            {players.length === 0 && <div style={{ textAlign: 'center', opacity: 0.3, fontSize: '13px' }}>Waiting for owls to join...</div>}
          </div>
          <div style={card}>
            <div style={{ fontSize: '12px', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Players</div>
            {players.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '6px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#7F77DD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{p.name[0].toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{p.name} {p.user_id === room?.creator && '👑'}</div>
                  <div style={{ fontSize: '11px', opacity: 0.4, fontFamily: 'monospace' }}>{p.user_id}</div>
                </div>
              </div>
            ))}
          </div>
          {isCreator
            ? <button onClick={startGame} disabled={players.length < 2} style={{ ...btn(players.length < 2 ? '#333' : '#1D9E75'), opacity: players.length < 2 ? 0.5 : 1 }}>
                {players.length < 2 ? '⏳ Waiting for at least 2 players...' : '🚀 Start Game'}
              </button>
            : <div style={{ textAlign: 'center', opacity: 0.5, fontSize: '14px', padding: '16px' }}>⏳ Waiting for {players.find(p => p.user_id === room?.creator)?.name} to start...</div>
          }
        </div>
      </div>
    );
  }

  if (view === 'playing') {
    const urgent = timer <= 10;
    return (
      <div style={{ ...page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ padding: '20px', width: '100%' }}>
          <div style={{ ...card, textAlign: 'center' }}>
            <div style={{ fontSize: '88px', fontWeight: 900, color: urgent ? '#ef4444' : '#7F77DD', lineHeight: 1, marginBottom: '8px' }}>{timer}</div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', marginBottom: '28px' }}>
              <div style={{ height: '100%', background: urgent ? '#ef4444' : '#7F77DD', width: `${(timer/60)*100}%`, transition: 'width 1s linear', borderRadius: '3px' }}/>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, marginBottom: '6px' }}>⚡ Enter Your Word</div>
            <div style={{ opacity: 0.5, fontSize: '13px', marginBottom: '24px' }}>Nobody can see what you're typing. Be original!</div>
            {!roomWordSubmitted
              ? <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" placeholder="Type your word or phrase..." value={roomWord} onChange={(e) => setRoomWord(e.target.value.replace(/[^a-zA-Z ]/g, ''))} maxLength={20} autoComplete="off" autoCorrect="off" spellCheck={false} style={{ ...inp, textAlign: 'center', fontSize: '18px' }}/>
                  {wordError && <div style={{ color: '#f87171', fontSize: '13px' }}>{wordError}</div>}
                  <button onClick={submitRoomWord} disabled={!roomWord.trim()} style={{ ...btn('#1D9E75'), opacity: !roomWord.trim() ? 0.4 : 1 }}>Lock it in ✓</button>
                </div>
              : <div style={{ padding: '24px', background: 'rgba(34,197,94,0.1)', borderRadius: '16px', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>✅</div>
                  <div style={{ fontWeight: 700, color: '#4ade80' }}>Word locked in!</div>
                  <div style={{ opacity: 0.5, fontSize: '13px', marginTop: '4px' }}>Waiting for other players...</div>
                </div>
            }
          </div>
        </div>
      </div>
    );
  }

  if (view === 'guessing' && guessingData) {
    const urgent = timer <= 15;
    const totalTime = guessingData.players.length * 15;
    return (
      <div style={page}>
        <div style={{ padding: '20px 16px 40px' }}>
          <div style={{ ...card, textAlign: 'center' }}>
            <div style={{ fontSize: '64px', fontWeight: 900, color: urgent ? '#ef4444' : '#7F77DD', lineHeight: 1, marginBottom: '8px' }}>{timer}s</div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ height: '100%', background: urgent ? '#ef4444' : '#a29bfe', width: `${(timer/totalTime)*100}%`, transition: 'width 1s linear', borderRadius: '2px' }}/>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, marginBottom: '4px' }}>🕵️ Who typed what?</div>
            <div style={{ opacity: 0.5, fontSize: '13px' }}>Match each word to the player. Your guesses are private!</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {guessingData.words.map((w, i) => {
              const selectedPlayerId = Object.keys(guesses).find(pid => guesses[pid] === w);
              const selectedPlayer = guessingData.players.find(p => p.user_id === selectedPlayerId);
              return (
                <div key={i} style={card}>
                  <div style={{ fontWeight: 700, color: '#7F77DD', marginBottom: '10px', fontSize: '16px' }}>"{w}"</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select value={selectedPlayerId || ''} onChange={(e) => { const n = {...guesses}; Object.keys(n).forEach(pid => { if (n[pid]===w) delete n[pid]; }); if (e.target.value) n[e.target.value]=w; setGuesses(n); }}
                      style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px', color: 'white', fontSize: '14px', outline: 'none' }}>
                      <option value="" style={{ background: '#1a1a24' }}>Select player...</option>
                      {guessingData.players.map((p, j) => <option key={j} value={p.user_id} style={{ background: '#1a1a24' }}>{p.name}</option>)}
                    </select>
                    {selectedPlayer && <span style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80', padding: '6px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>✓ {selectedPlayer.name}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          {!guessesSubmitted
            ? <button onClick={submitGuesses} style={btn()}>Submit Guesses ✓</button>
            : <div style={{ padding: '20px', background: 'rgba(34,197,94,0.1)', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(34,197,94,0.3)' }}>
                <div style={{ fontSize: '28px', marginBottom: '6px' }}>✅</div>
                <div style={{ fontWeight: 700, color: '#4ade80' }}>Guesses submitted!</div>
                <div style={{ opacity: 0.5, fontSize: '13px', marginTop: '4px' }}>Waiting for others or timer to end...</div>
              </div>
          }
        </div>
      </div>
    );
  }

  if (view === 'results' && results) {
    const handleShare = () => {
      const text = results.type === 'bigbrains'
        ? `I won Big Brains on Unique Owl with "${results.winner?.word}" 🧠🦉 Think you can beat me? uniqueowl.com`
        : `I got ${results.results?.[0]?.correct}/${results.results?.[0]?.total} correct in Guess Me on Unique Owl 🕵️🦉 Can you beat me? uniqueowl.com`;
      if (navigator.share) navigator.share({ title: 'Unique Owl', text });
      else { navigator.clipboard.writeText(text); alert('Copied! Paste it anywhere.'); }
    };
    return (
      <div style={page}>
        <div style={{ padding: '20px 16px 40px' }}>
          <div style={{ fontSize: '28px', fontWeight: 900, textAlign: 'center', marginBottom: '20px' }}>🏆 Results</div>
          {results.type === 'bigbrains' && <>
            <div style={{ ...card, textAlign: 'center', border: '2px solid rgba(255,215,0,0.3)', background: 'rgba(255,215,0,0.05)' }}>
              <div style={{ fontSize: '52px', marginBottom: '8px' }}>🏆</div>
              <div style={{ fontSize: '11px', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px' }}>Biggest Brain</div>
              <div style={{ fontSize: '24px', fontWeight: 900 }}>{results.winner?.name}</div>
              <div style={{ opacity: 0.6, fontStyle: 'italic', marginTop: '4px' }}>"{results.winner?.word}"</div>
              <div style={{ color: '#7F77DD', fontSize: '13px', marginTop: '6px' }}>Rarity score: {results.winner?.score}</div>
            </div>
            <div style={{ fontSize: '11px', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>All entries ranked</div>
            {results.players?.map((p, i) => (
              <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', gap: '12px', border: i===0?'1px solid rgba(255,215,0,0.3)':'1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '22px', width: '36px', textAlign: 'center' }}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</span>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{p.name}</div><div style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '13px' }}>"{p.word||'No entry'}"</div></div>
                <div style={{ fontWeight: 900, color: '#7F77DD' }}>{p.rarityScore} pts</div>
              </div>
            ))}
          </>}
          {results.type === 'guessme' && <>
            <div style={{ ...card, textAlign: 'center', border: '2px solid rgba(255,215,0,0.3)', background: 'rgba(255,215,0,0.05)' }}>
              <div style={{ fontSize: '52px', marginBottom: '8px' }}>🕵️</div>
              <div style={{ fontSize: '11px', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px' }}>Best Detective</div>
              <div style={{ fontSize: '24px', fontWeight: 900 }}>{results.results?.[0]?.name}</div>
              <div style={{ color: '#7F77DD', fontSize: '14px', marginTop: '6px' }}>{results.results?.[0]?.correct}/{results.results?.[0]?.total} correct</div>
            </div>
            <div style={{ fontSize: '11px', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>The answers were</div>
            {results.correctAnswers?.map((p, i) => (
              <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontWeight: 600, flex: 1 }}>{p.name}</div>
                <div style={{ opacity: 0.4 }}>→</div>
                <div style={{ opacity: 0.7, fontStyle: 'italic', fontSize: '13px' }}>"{p.word||'No entry'}"</div>
              </div>
            ))}
            <div style={{ fontSize: '11px', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '1px', margin: '16px 0 10px' }}>Scoreboard</div>
            {results.results?.map((p, i) => (
              <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', gap: '12px', border: i===0?'1px solid rgba(255,215,0,0.3)':'1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '22px', width: '36px', textAlign: 'center' }}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</span>
                <div style={{ flex: 1, fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontWeight: 900, color: '#7F77DD' }}>{p.correct}/{p.total}</div>
              </div>
            ))}
          </>}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={handleShare} style={{ ...btn(), flex: 1 }}>🎯 Challenge friends</button>
            <button onClick={leaveRoom} style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>🏠 Home</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function RoomPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f14' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🦉</div>
          <div>Loading...</div>
        </div>
      </div>
    }>
      <RoomContent />
    </Suspense>
  );
}
