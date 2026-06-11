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
    if (!token) { router.push('/login'); return; }
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));

    // Init socket
    const socket = io(window.location.origin);
    socketRef.current = socket;

    socket.on('room_created', ({ code, room }) => {
      setRoomCode(code);
      setRoom(room);
      setView('lobby');
    });

    socket.on('room_joined', ({ code, room }) => {
      setRoomCode(code);
      setRoom(room);
      setView('lobby');
    });

    socket.on('room_updated', ({ room }) => setRoom(room));

    socket.on('game_started', ({ timeLeft }) => {
      setTimer(timeLeft);
      setRoomWord('');
      setRoomWordSubmitted(false);
      setWordError('');
      setView('playing');
    });

    socket.on('timer_tick', ({ timeLeft }) => setTimer(timeLeft));

    socket.on('guessing_phase', ({ players, words, timeLeft }) => {
      setGuessingData({ players, words });
      setGuesses({});
      setGuessesSubmitted(false);
      setTimer(timeLeft);
      setView('guessing');
    });

    socket.on('guess_timer_tick', ({ timeLeft }) => setTimer(timeLeft));
    socket.on('guesses_confirmed', () => setGuessesSubmitted(true));

    socket.on('special_results', (data) => {
      setResults({ type: 'bigbrains', ...data });
      setView('results');
    });

    socket.on('thriller_results', (data) => {
      setResults({ type: 'guessme', ...data });
      setView('results');
    });

    socket.on('room_error', ({ message }) => setRoomError(message));

    return () => socket.disconnect();
  }, []);

  const createRoom = (t) => {
    setRoomError('');
    setRoomType(t);
    const stored = localStorage.getItem('user');
    const u = stored ? JSON.parse(stored) : user;
    socketRef.current.emit('create_room', { type: t, user: u });
  };

  const joinRoom = () => {
    setRoomError('');
    if (!joinCode.trim()) return;
    const stored = localStorage.getItem('user');
    const u = stored ? JSON.parse(stored) : user;
    socketRef.current.emit('join_room', { code: joinCode.trim().toUpperCase(), user: u });
  };

  const startGame = () => socketRef.current.emit('start_game', { code: roomCode });

  const submitRoomWord = () => {
    if (!roomWord.trim()) return;
    setWordError('');
    socketRef.current.emit('submit_room_word', { code: roomCode, word: roomWord.trim(), userId: user?.user_id });
    setRoomWordSubmitted(true);
  };

  const submitGuesses = () => {
    socketRef.current.emit('submit_guesses', { code: roomCode, userId: user?.user_id, guesses });
  };

  const leaveRoom = () => {
    router.push('/home');
  };

  // ─── SELECT ROOM TYPE ────────────────────────────────
  if (view === 'select') {
    return (
      <div className="min-h-screen flex items-start justify-center pt-10 px-4" style={{background: '#f8f7ff'}}>
        <div className="w-full max-w-lg">
          <button onClick={() => router.push('/home')} className="btn btn-ghost btn-sm mb-6" style={{color: '#7F77DD'}}>
            ← Back
          </button>
          <h1 className="text-3xl font-black mb-2" style={{color: '#1a1a2e'}}>🎮 Game Rooms</h1>
          <p className="text-gray-400 mb-8">Pick your battle mode</p>

          <div className="flex flex-col gap-4">
            <div onClick={() => createRoom('guessme')}
              className="p-6 rounded-3xl cursor-pointer border-2 border-purple-100 hover:border-purple-300 transition-all hover:shadow-lg"
              style={{background: '#faf8ff'}}>
              <div className="text-4xl mb-3">🕵️</div>
              <h3 className="text-xl font-black mb-2" style={{color: '#1a1a2e'}}>Guess Me</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-3">
                Everyone enters a secret word. Then guess who typed what. The best detective wins!
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="badge text-white badge-sm" style={{background: '#7F77DD'}}>Multiplayer</span>
                <span className="badge badge-ghost badge-sm">Up to 20 players</span>
                <span className="badge badge-ghost badge-sm">60s entry</span>
              </div>
            </div>

            <div onClick={() => createRoom('bigbrains')}
              className="p-6 rounded-3xl cursor-pointer border-2 border-amber-100 hover:border-amber-300 transition-all hover:shadow-lg"
              style={{background: '#fffdf5'}}>
              <div className="text-4xl mb-3">🧠</div>
              <h3 className="text-xl font-black mb-2" style={{color: '#1a1a2e'}}>Big Brains</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-3">
                Enter the rarest word you can think of. Originality is scored. The most unique mind wins!
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="badge text-white badge-sm" style={{background: '#F59E0B'}}>Multiplayer</span>
                <span className="badge badge-ghost badge-sm">Up to 20 players</span>
                <span className="badge badge-ghost badge-sm">Rarity scored</span>
              </div>
            </div>
          </div>
          {roomError && <div className="mt-4 alert alert-error text-sm">{roomError}</div>}
        </div>
      </div>
    );
  }

  // ─── JOIN ROOM ───────────────────────────────────────
  if (view === 'join') {
    return (
      <div className="min-h-screen flex items-start justify-center pt-10 px-4" style={{background: '#f8f7ff'}}>
        <div className="w-full max-w-sm">
          <button onClick={() => router.push('/home')} className="btn btn-ghost btn-sm mb-6" style={{color: '#7F77DD'}}>
            ← Back
          </button>
          <h1 className="text-3xl font-black mb-2" style={{color: '#1a1a2e'}}>🔑 Join a Room</h1>
          <p className="text-gray-400 mb-8">Enter the room code from your friend</p>

          <input
            type="text"
            placeholder="XXXXXX"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="input input-bordered w-full text-center text-3xl font-black tracking-widest mb-4"
            style={{letterSpacing: '0.3em'}}
          />
          <button
            onClick={joinRoom}
            className="btn w-full text-white font-bold"
            style={{background: '#7F77DD', borderColor: '#7F77DD'}}
          >
            Join Room →
          </button>
          {roomError && <div className="mt-4 alert alert-error text-sm">{roomError}</div>}
        </div>
      </div>
    );
  }

  // ─── LOBBY ───────────────────────────────────────────
  if (view === 'lobby') {
    const isCreator = room?.creator === user?.user_id;
    const players = room?.players || [];
    const cx = 130, cy = 130, r = 100;

    const getOwlPos = (index, total) => {
      const angle = (2 * Math.PI * index / Math.max(total, 1)) - Math.PI / 2;
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle)
      };
    };

    return (
      <div className="min-h-screen flex items-start justify-center pt-6 px-4" style={{background: '#f8f7ff'}}>
        <div className="w-full max-w-md">
          <button onClick={leaveRoom} className="btn btn-ghost btn-sm mb-4" style={{color: '#7F77DD'}}>
            ← Leave Room
          </button>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50 mb-4">
            <div className="text-center mb-4">
              <div className="inline-block px-4 py-1 rounded-full text-sm font-semibold text-white mb-3"
                style={{background: '#7F77DD'}}>
                {room?.type === 'guessme' ? '🕵️ Guess Me' : '🧠 Big Brains'}
              </div>
              <div className="text-xs text-gray-400 mb-1">Room Code</div>
              <div className="text-4xl font-black tracking-widest mb-2" style={{color: '#7F77DD', letterSpacing: '0.2em'}}>{roomCode}</div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Join my Unique Owl room! Code: ${roomCode} — uniqueowl.com/room?action=join`);
                  alert('Invite link copied!');
                }}
                className="btn btn-sm btn-ghost text-xs"
                style={{color: '#7F77DD'}}
              >
                📋 Copy invite link
              </button>
            </div>
          </div>

          {/* Owl nest - branch style */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50 mb-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-gray-700">The nest</span>
              <span className="text-sm text-gray-400">{players.length} / 20 owls</span>
            </div>

            <div className="flex justify-center">
              <svg width="260" height="200" viewBox="0 0 260 200">
                {/* Branch */}
                <path d="M20,150 Q130,110 240,140" stroke="#8B6F47" strokeWidth="10" fill="none" strokeLinecap="round"/>
                <path d="M60,150 Q65,125 70,110" stroke="#8B6F47" strokeWidth="5" fill="none" strokeLinecap="round"/>
                <path d="M130,122" stroke="#8B6F47" strokeWidth="5" fill="none" strokeLinecap="round"/>
                <path d="M190,138 Q195,115 200,100" stroke="#8B6F47" strokeWidth="5" fill="none" strokeLinecap="round"/>
                {/* Leaves */}
                <ellipse cx="68" cy="105" rx="12" ry="8" fill="#4a7c4e" opacity="0.7" transform="rotate(-20 68 105)"/>
                <ellipse cx="198" cy="95" rx="12" ry="8" fill="#4a7c4e" opacity="0.7" transform="rotate(15 198 95)"/>

                {/* Owls on branch */}
                {players.map((p, i) => {
                  // Distribute owls along the branch
                  const positions = [
                    {x: 55, y: 105}, {x: 100, y: 118}, {x: 130, y: 112},
                    {x: 160, y: 118}, {x: 195, y: 95}, {x: 220, y: 132},
                    {x: 40, y: 142}, {x: 75, y: 138}, {x: 110, y: 130},
                    {x: 145, y: 128}, {x: 175, y: 130}, {x: 210, y: 118}
                  ];
                  const pos = positions[i % positions.length];
                  return (
                    <g key={i}>
                      <text x={pos.x} y={pos.y} textAnchor="middle" fontSize="22" style={{userSelect: 'none'}}>🦉</text>
                      {p.user_id === room?.creator && (
                        <text x={pos.x + 12} y={pos.y - 10} textAnchor="middle" fontSize="10">👑</text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {players.length === 0 && (
              <div className="text-center text-gray-300 text-sm pb-2">Waiting for owls to join...</div>
            )}
          </div>

          {/* Players list */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50 mb-4">
            <h3 className="font-bold text-gray-600 text-sm mb-3">Players in room</h3>
            <div className="flex flex-col gap-2">
              {players.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl" style={{background: '#f8f7ff'}}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{background: '#7F77DD'}}>
                    {p.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{p.name} {p.user_id === room?.creator && '👑'}</div>
                    <div className="text-xs text-gray-400 font-mono">{p.user_id}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isCreator ? (
            <button
              onClick={startGame}
              disabled={players.length < 2}
              className="btn w-full text-white font-bold text-lg h-14 rounded-2xl"
              style={{background: players.length < 2 ? '#ccc' : '#1D9E75', borderColor: players.length < 2 ? '#ccc' : '#1D9E75'}}
            >
              {players.length < 2 ? 'Waiting for at least 2 players...' : '🚀 Start Game'}
            </button>
          ) : (
            <div className="p-4 rounded-2xl text-center text-gray-400 text-sm" style={{background: '#f8f7ff'}}>
              ⏳ Waiting for {players.find(p => p.user_id === room?.creator)?.name} to start...
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── PLAYING PHASE ───────────────────────────────────
  if (view === 'playing') {
    const urgent = timer <= 10;
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{background: '#f8f7ff'}}>
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-purple-50 text-center">
            <div className={`text-8xl font-black mb-2 transition-colors ${urgent ? 'text-red-500' : ''}`}
              style={{color: urgent ? '#ef4444' : '#7F77DD', fontVariantNumeric: 'tabular-nums'}}>
              {timer}
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
              <div className="h-2 rounded-full transition-all duration-1000"
                style={{width: `${(timer/60)*100}%`, background: urgent ? '#ef4444' : '#7F77DD'}}/>
            </div>
            <h2 className="text-2xl font-black mb-2" style={{color: '#1a1a2e'}}>⚡ Enter Your Word</h2>
            <p className="text-gray-400 text-sm mb-6">Nobody can see what you're typing. Be original!</p>

            {!roomWordSubmitted ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Type your word..."
                  value={roomWord}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^a-zA-Z ]/g, '');
                    setRoomWord(val);
                  }}
                  maxLength={20}
                  className="input input-bordered w-full text-center font-medium text-lg"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
                {wordError && <div className="text-red-500 text-xs">{wordError}</div>}
                <button
                  onClick={submitRoomWord}
                  disabled={!roomWord.trim()}
                  className="btn w-full text-white font-bold"
                  style={{background: '#1D9E75', borderColor: '#1D9E75'}}
                >
                  Lock it in ✓
                </button>
              </div>
            ) : (
              <div className="p-6 rounded-2xl" style={{background: '#f0fdf4'}}>
                <div className="text-4xl mb-2">✅</div>
                <div className="font-bold text-green-700">Word locked in!</div>
                <div className="text-sm text-green-600 mt-1">Waiting for other players...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── GUESSING PHASE ──────────────────────────────────
  if (view === 'guessing' && guessingData) {
    const urgent = timer <= 15;
    const totalTime = guessingData.players.length * 15;
    return (
      <div className="min-h-screen flex items-start justify-center pt-6 px-4" style={{background: '#f8f7ff'}}>
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
            <div className={`text-6xl font-black text-center mb-2`}
              style={{color: urgent ? '#ef4444' : '#7F77DD'}}>
              {timer}s
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
              <div className="h-2 rounded-full transition-all duration-1000"
                style={{width: `${(timer/totalTime)*100}%`, background: urgent ? '#ef4444' : '#a29bfe'}}/>
            </div>
            <h2 className="text-2xl font-black mb-1 text-center" style={{color: '#1a1a2e'}}>🕵️ Who typed what?</h2>
            <p className="text-gray-400 text-sm text-center mb-6">Match each word to the player. Your guesses are private!</p>

            <div className="flex flex-col gap-3 mb-6">
              {guessingData.words.map((w, i) => {
                const selectedPlayerId = Object.keys(guesses).find(pid => guesses[pid] === w);
                const selectedPlayer = guessingData.players.find(p => p.user_id === selectedPlayerId);
                return (
                  <div key={i} className="p-4 rounded-2xl border border-purple-50" style={{background: '#faf8ff'}}>
                    <div className="font-bold text-sm mb-2" style={{color: '#7F77DD'}}>"{w}"</div>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedPlayerId || ''}
                        onChange={(e) => {
                          const newGuesses = { ...guesses };
                          Object.keys(newGuesses).forEach(pid => { if (newGuesses[pid] === w) delete newGuesses[pid]; });
                          if (e.target.value) newGuesses[e.target.value] = w;
                          setGuesses(newGuesses);
                        }}
                        className="select select-bordered select-sm flex-1"
                      >
                        <option value="">Select player...</option>
                        {guessingData.players.map((p, j) => (
                          <option key={j} value={p.user_id}>{p.name}</option>
                        ))}
                      </select>
                      {selectedPlayer && (
                        <span className="badge badge-sm text-white" style={{background: '#1D9E75'}}>
                          ✓ {selectedPlayer.name}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {!guessesSubmitted ? (
              <button
                onClick={submitGuesses}
                className="btn w-full text-white font-bold"
                style={{background: '#7F77DD', borderColor: '#7F77DD'}}
              >
                Submit Guesses ✓
              </button>
            ) : (
              <div className="p-4 rounded-2xl text-center" style={{background: '#f0fdf4'}}>
                <div className="text-2xl mb-1">✅</div>
                <div className="font-bold text-green-700 text-sm">Guesses submitted!</div>
                <div className="text-xs text-green-600 mt-1">Waiting for others or timer to end...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULTS ─────────────────────────────────────────
  if (view === 'results' && results) {
    const handleShare = () => {
      const text = results.type === 'bigbrains'
        ? `I won Big Brains on Unique Owl with "${results.winner?.word}" 🧠🦉 Think you can beat me? uniqueowl.com`
        : `I got ${results.results?.[0]?.correct}/${results.results?.[0]?.total} correct in Guess Me on Unique Owl 🕵️🦉 Can you beat me? uniqueowl.com`;
      if (navigator.share) navigator.share({ title: 'Unique Owl', text });
      else { navigator.clipboard.writeText(text); alert('Copied! Paste it anywhere to challenge friends.'); }
    };

    return (
      <div className="min-h-screen flex items-start justify-center pt-6 px-4" style={{background: '#f8f7ff'}}>
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
            <h2 className="text-3xl font-black text-center mb-6" style={{color: '#1a1a2e'}}>🏆 Results</h2>

            {results.type === 'bigbrains' && (
              <>
                <div className="p-6 rounded-2xl text-center mb-6 border-2 border-yellow-200" style={{background: '#fffbeb'}}>
                  <div className="text-5xl mb-2">🏆</div>
                  <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Biggest Brain</div>
                  <div className="text-2xl font-black" style={{color: '#1a1a2e'}}>{results.winner?.name}</div>
                  <div className="text-gray-400 italic mt-1">"{results.winner?.word}"</div>
                  <div className="text-sm mt-2" style={{color: '#7F77DD'}}>Rarity score: {results.winner?.score}</div>
                </div>
                <h3 className="text-xs text-gray-400 uppercase tracking-widest mb-3">All entries ranked</h3>
                {results.players?.map((p, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl mb-2 ${i === 0 ? 'border-2 border-yellow-200' : 'border border-purple-50'}`}
                    style={{background: i === 0 ? '#fffbeb' : '#f8f7ff'}}>
                    <span className="text-lg w-8 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{p.name}</div>
                      <div className="text-xs text-gray-400 italic">"{p.word || 'No entry'}"</div>
                    </div>
                    <div className="font-black text-sm" style={{color: '#7F77DD'}}>{p.rarityScore} pts</div>
                  </div>
                ))}
              </>
            )}

            {results.type === 'guessme' && (
              <>
                <div className="p-6 rounded-2xl text-center mb-6 border-2 border-yellow-200" style={{background: '#fffbeb'}}>
                  <div className="text-5xl mb-2">🕵️</div>
                  <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Best Detective</div>
                  <div className="text-2xl font-black" style={{color: '#1a1a2e'}}>{results.results?.[0]?.name}</div>
                  <div className="text-sm mt-2" style={{color: '#7F77DD'}}>
                    {results.results?.[0]?.correct}/{results.results?.[0]?.total} correct
                  </div>
                </div>
                <h3 className="text-xs text-gray-400 uppercase tracking-widest mb-3">The answers were</h3>
                {results.correctAnswers?.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl mb-2 border border-purple-50" style={{background: '#f8f7ff'}}>
                    <div className="font-semibold text-sm flex-1">{p.name}</div>
                    <div className="text-gray-400 text-sm">→</div>
                    <div className="text-sm italic text-gray-500">"{p.word || 'No entry'}"</div>
                  </div>
                ))}
                <h3 className="text-xs text-gray-400 uppercase tracking-widest mb-3 mt-4">Scoreboard</h3>
                {results.results?.map((p, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl mb-2 ${i === 0 ? 'border-2 border-yellow-200' : 'border border-purple-50'}`}
                    style={{background: i === 0 ? '#fffbeb' : '#f8f7ff'}}>
                    <span className="text-lg w-8 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}</span>
                    <div className="flex-1 font-semibold text-sm">{p.name}</div>
                    <div className="font-black text-sm" style={{color: '#7F77DD'}}>{p.correct}/{p.total}</div>
                  </div>
                ))}
              </>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={handleShare} className="btn flex-1 text-white font-bold"
                style={{background: '#7F77DD', borderColor: '#7F77DD'}}>
                🎯 Challenge friends
              </button>
              <button onClick={leaveRoom} className="btn btn-ghost flex-1 font-bold">
                Home
              </button>
            </div>
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
      <div className="min-h-screen flex items-center justify-center" style={{background: '#f8f7ff'}}>
        <span className="loading loading-dots loading-lg" style={{color: '#7F77DD'}}></span>
      </div>
    }>
      <RoomContent />
    </Suspense>
  );
}
