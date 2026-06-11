const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

const COMMON_WORDS = new Set(['the','be','to','of','and','a','in','that','have','it','for','not','on','with','he','as','you','do','at','this','but','his','by','from','they','we','say','her','she','or','an','will','my','one','all','would','there','their','what','so','up','out','if','about','who','get','which','go','me','when','make','can','like','time','no','just','him','know','take','people','into','year','your','good','some','could','them','see','other','than','then','now','look','only','come','its','over','think','also','back','after','use','two','how','our','work','first','well','way','even','new','want','because','any','these','give','day','most','us','apple','cat','dog','run','walk','talk','eat','drink','sleep','happy','sad','big','small','old','new','red','blue','green','black','white']);

const scoreWordRarity = (word) => {
  const lower = word.toLowerCase().trim();
  if (COMMON_WORDS.has(lower)) return 1;
  if (lower.length <= 3) return 3;
  if (lower.length <= 5) return 6;
  if (lower.length <= 8) return 10;
  return 15;
};

const isValidEntry = (input) => {
  if (!input || input.trim().length === 0) return false;
  const trimmed = input.trim();
  if (!/^[a-zA-Z ]+$/.test(trimmed)) return false;
  const tokens = trimmed.match(/[a-zA-Z]+/g) || [];
  const vowels = /[aeiouAEIOU]/;
  for (const token of tokens) {
    if (token.length > 3 && !vowels.test(token)) return false;
    if (/[^aeiouAEIOU]{5,}/i.test(token)) return false;
  }
  return true;
};

const rooms = {};

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server);

  io.on('connection', (socket) => {
    socket.on('create_room', ({ type, user }) => {
      let code = generateRoomCode();
      while (rooms[code]) code = generateRoomCode();
      rooms[code] = {
        code, type, creator: user.user_id,
        players: [{ ...user, socketId: socket.id, word: null, ready: false, guesses: null, guessSubmitted: false }],
        phase: 'waiting', timer: null, resultsRevealed: false
      };
      socket.join(code);
      socket.emit('room_created', { code, room: sanitizeRoom(rooms[code]) });
    });

    socket.on('join_room', ({ code, user }) => {
      const room = rooms[code];
      if (!room) return socket.emit('room_error', { message: 'Room not found. Check the code!' });
      if (room.phase !== 'waiting') return socket.emit('room_error', { message: 'Game already in progress' });
      const alreadyIn = room.players.find(p => p.user_id === user.user_id);
      if (!alreadyIn) room.players.push({ ...user, socketId: socket.id, word: null, ready: false, guesses: null, guessSubmitted: false });
      else alreadyIn.socketId = socket.id;
      socket.join(code);
      io.to(code).emit('room_updated', { room: sanitizeRoom(room) });
      socket.emit('room_joined', { code, room: sanitizeRoom(room) });
    });

    socket.on('start_game', ({ code }) => {
      const room = rooms[code];
      if (!room) return;
      room.players.forEach(p => { p.word = null; p.ready = false; p.guesses = null; p.guessSubmitted = false; });
      room.phase = 'playing';
      room.resultsRevealed = false;
      let timeLeft = 60;
      io.to(code).emit('game_started', { timeLeft });
      room.timer = setInterval(() => {
        timeLeft--;
        io.to(code).emit('timer_tick', { timeLeft });
        if (timeLeft <= 0) { clearInterval(room.timer); room.timer = null; endEntryPhase(code, io); }
      }, 1000);
    });

    socket.on('submit_room_word', ({ code, word, userId }) => {
      const room = rooms[code];
      if (!room || room.phase !== 'playing') return;
      if (!isValidEntry(word)) { socket.emit('room_error', { message: 'Please enter a real word!' }); return; }
      const player = room.players.find(p => p.user_id === userId);
      if (player && !player.ready) { player.word = word; player.ready = true; }
      io.to(code).emit('room_updated', { room: sanitizeRoom(room) });
      if (room.players.every(p => p.ready)) {
        if (room.timer) { clearInterval(room.timer); room.timer = null; }
        endEntryPhase(code, io);
      }
    });

    socket.on('submit_guesses', ({ code, userId, guesses }) => {
      const room = rooms[code];
      if (!room || room.phase !== 'guessing') return;
      const player = room.players.find(p => p.user_id === userId);
      if (player && !player.guessSubmitted) { player.guesses = guesses; player.guessSubmitted = true; socket.emit('guesses_confirmed'); }
      if (room.players.every(p => p.guessSubmitted) && !room.resultsRevealed) {
        if (room.timer) { clearInterval(room.timer); room.timer = null; }
        revealGuessResults(code, io);
      }
    });

    socket.on('disconnect', () => {});
  });

  function sanitizeRoom(room) {
    return {
      code: room.code, type: room.type, creator: room.creator, phase: room.phase,
      players: room.players.map(p => ({ user_id: p.user_id, name: p.name, country: p.country, ready: p.ready, guessSubmitted: p.guessSubmitted }))
    };
  }

  function endEntryPhase(code, io) {
    const room = rooms[code];
    if (!room || room.resultsRevealed) return;
    if (room.type === 'bigbrains') {
      const playerScores = room.players.map(p => ({ ...p, rarityScore: p.word ? scoreWordRarity(p.word) : 0 }));
      playerScores.sort((a, b) => b.rarityScore - a.rarityScore);
      room.phase = 'results'; room.resultsRevealed = true;
      io.to(code).emit('special_results', {
        winner: playerScores[0] ? { name: playerScores[0].name, user_id: playerScores[0].user_id, word: playerScores[0].word, score: playerScores[0].rarityScore } : null,
        players: playerScores.map(p => ({ name: p.name, user_id: p.user_id, word: p.word || '(no entry)', rarityScore: p.rarityScore }))
      });
    } else {
      const playersWithWords = room.players.filter(p => p.word && p.word.trim());
      const shuffledWords = playersWithWords.map(p => p.word).sort(() => Math.random() - 0.5);
      room.phase = 'guessing';
      room.players.forEach(p => { p.guesses = null; p.guessSubmitted = false; });
      const guessingTime = Math.max(room.players.length * 15, 60);
      io.to(code).emit('guessing_phase', {
        players: room.players.map(p => ({ name: p.name, user_id: p.user_id })),
        words: shuffledWords, timeLeft: guessingTime
      });
      let timeLeft = guessingTime;
      room.timer = setInterval(() => {
        timeLeft--;
        io.to(code).emit('guess_timer_tick', { timeLeft });
        if (timeLeft <= 0) { if (room.timer) { clearInterval(room.timer); room.timer = null; } revealGuessResults(code, io); }
      }, 1000);
    }
  }

  function revealGuessResults(code, io) {
    const room = rooms[code];
    if (!room || room.resultsRevealed) return;
    room.phase = 'results'; room.resultsRevealed = true;
    const results = room.players.map(player => {
      const guesses = player.guesses || {};
      let correct = 0;
      room.players.forEach(p => { if (p.word && guesses[p.user_id] === p.word) correct++; });
      return { name: player.name, user_id: player.user_id, correct, total: room.players.filter(p => p.word).length, word: player.word || '(no entry)' };
    });
    results.sort((a, b) => b.correct - a.correct);
    io.to(code).emit('thriller_results', { results, correctAnswers: room.players.map(p => ({ user_id: p.user_id, name: p.name, word: p.word || '(no entry)' })) });
  }

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => console.log(`> Ready on http://localhost:${PORT}`));
});
