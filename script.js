// Main website behavior. Search for PHASE names to find each celebration step.
// =========================================================
//  UTILS
// =========================================================
const $ = id => document.getElementById(id);
const rand = (a, b) => Math.random() * (b - a) + a;
const randInt = (a, b) => Math.floor(rand(a, b));

// const celebrationUnlockAt = Date.UTC(2026, 4, 15, 18, 30, 0); // 16 May 2026, 12:00 AM IST
// Testing bypass: comment the line above and uncomment this line to open the site instantly.
 const celebrationUnlockAt = Date.now() - 1000;
let celebrationGateTimer = null;

const isLowMotionDevice = window.matchMedia('(max-width: 640px)').matches || navigator.hardwareConcurrency <= 4;
const motion = {
  touchTrailDelay: isLowMotionDevice ? 180 : 85,
  heartSparkles: isLowMotionDevice ? 10 : 26,
  maxBackgroundDecorations: isLowMotionDevice ? 18 : 42,
  backgroundDecorInterval: isLowMotionDevice ? 2600 : 1800,
  confettiBurst: isLowMotionDevice ? 18 : 36,
  confettiInterval: isLowMotionDevice ? 420 : 260,
  confettiDuration: isLowMotionDevice ? 3600 : 5600,
  musicNoteInterval: isLowMotionDevice ? 360 : 220,
  balloonCount: isLowMotionDevice ? 9 : 13,
  popBurstParticles: isLowMotionDevice ? 6 : 10,
  finalConfettiInterval: isLowMotionDevice ? 220 : 130,
  finalConfettiDuration: isLowMotionDevice ? 6500 : 10000
};

function formatLockCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  return `${hours}h ${minutes}m ${seconds}s`;
}

function updateCelebrationGate() {
  const countdown = $('lockCountdown');
  const remaining = celebrationUnlockAt - Date.now();
  if (remaining > 0) {
    if (countdown) countdown.textContent = formatLockCountdown(remaining);
    return;
  }
  if (celebrationGateTimer) clearInterval(celebrationGateTimer);
  showPhase('landing');
  requestAnimationFrame(resizeHeartCanvas);
}

function initCelebrationGate() {
  updateCelebrationGate();
  if (celebrationUnlockAt > Date.now()) {
    celebrationGateTimer = setInterval(updateCelebrationGate, 1000);
  }
}

// Cute touch / click effects
const trailEmojis = ['✨','💖','💫','💕','🎉'];
let lastTrail = 0;

function spawnTouchSparkle(x, y) {
  const el = document.createElement('div');
  el.className = 'touch-sparkle';
  el.textContent = trailEmojis[randInt(0, trailEmojis.length)];
  el.style.cssText = `left:${x}px;top:${y}px;--tx:${rand(-34,34)}px;--ty:${rand(-52,-18)}px;--rot:${rand(-120,120)}deg;font-size:${rand(1,1.55)}rem`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

function spawnTapRing(x, y) {
  const el = document.createElement('div');
  el.className = 'tap-ring';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 600);
}

document.addEventListener('pointermove', e => {
  const now = Date.now();
  if (now - lastTrail < motion.touchTrailDelay) return;
  lastTrail = now;
  spawnTouchSparkle(e.clientX, e.clientY);
});

document.addEventListener('pointerdown', e => {
  spawnTapRing(e.clientX, e.clientY);
});

document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('pointerdown', e => {
    btn.classList.add('pressed');
    const r = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = `${e.clientX - r.left}px`;
    ripple.style.top = `${e.clientY - r.top}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
  btn.addEventListener('pointerup', () => btn.classList.remove('pressed'));
  btn.addEventListener('pointerleave', () => btn.classList.remove('pressed'));
});

// Heart drawing gate for the landing screen
const heartCanvas = $('heartCanvas');
const heartDraw = $('heartDraw');
const drawHint = $('drawHint');
const startBtn = $('startBtn');
const heartCtx = heartCanvas.getContext('2d');
let drawingHeart = false;
let heartUnlocked = false;
let heartPoints = [];

function resizeHeartCanvas() {
  const rect = heartCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  heartCanvas.width = Math.max(1, Math.round(rect.width * dpr));
  heartCanvas.height = Math.max(1, Math.round(rect.height * dpr));
  heartCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  heartCtx.lineCap = 'round';
  heartCtx.lineJoin = 'round';
}

function clearHeartCanvas() {
  heartCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
}

function drawHeartLine(point) {
  heartCtx.lineWidth = 8;
  heartCtx.strokeStyle = 'rgba(255, 105, 180, .95)';
  heartCtx.shadowColor = '#ff69b4';
  heartCtx.shadowBlur = 18;
  if (heartPoints.length === 1) {
    heartCtx.beginPath();
    heartCtx.moveTo(point.x, point.y);
  } else {
    heartCtx.lineTo(point.x, point.y);
    heartCtx.stroke();
  }
}

function heartDrawPoint(e) {
  const rect = heartCanvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function revealStartButton() {
  if (heartUnlocked) return;
  heartUnlocked = true;
  heartDraw.classList.add('complete');
  drawHint.textContent = 'Perfect! Now start the celebration 💖';
  startBtn.classList.remove('locked');
  startBtn.classList.add('ready');
  for (let i = 0; i < motion.heartSparkles; i++) setTimeout(() => spawnTouchSparkle(innerWidth / 2 + rand(-90, 90), innerHeight / 2 + rand(-90, 90)), i * 45);
  startConfetti();
}

function checkHeartDrawing() {
  if (heartUnlocked || heartPoints.length < 18) return;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, distance = 0;
  for (let i = 0; i < heartPoints.length; i++) {
    const p = heartPoints[i];
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
    if (i > 0) distance += Math.hypot(p.x - heartPoints[i - 1].x, p.y - heartPoints[i - 1].y);
  }
  const w = maxX - minX;
  const h = maxY - minY;
  const enoughShape = w > 90 && h > 80 && distance > 260;
  const notJustLine = distance > (w + h) * 1.45;
  if (enoughShape && notJustLine) revealStartButton();
  else {
    drawHint.textContent = 'Draw a bigger heart shape 💖';
    setTimeout(() => {
      if (!heartUnlocked) drawHint.textContent = 'Draw a heart to unlock...';
    }, 1300);
  }
}

resizeHeartCanvas();
window.addEventListener('resize', resizeHeartCanvas);
initCelebrationGate();

heartCanvas.addEventListener('pointerdown', e => {
  if (heartUnlocked) return;
  e.preventDefault();
  heartCanvas.setPointerCapture(e.pointerId);
  clearHeartCanvas();
  heartPoints = [heartDrawPoint(e)];
  drawingHeart = true;
  drawHint.textContent = 'Keep drawing the heart...';
  drawHeartLine(heartPoints[0]);
});

heartCanvas.addEventListener('pointermove', e => {
  if (!drawingHeart || heartUnlocked) return;
  e.preventDefault();
  const point = heartDrawPoint(e);
  heartPoints.push(point);
  drawHeartLine(point);
});

function finishHeartDrawing(e) {
  if (!drawingHeart) return;
  drawingHeart = false;
  try { heartCanvas.releasePointerCapture(e.pointerId); } catch {}
  checkHeartDrawing();
}

heartCanvas.addEventListener('pointerup', finishHeartDrawing);
heartCanvas.addEventListener('pointercancel', finishHeartDrawing);

// Stars
(function createStars() {
  const bg = $('stars-bg');
  for (let i = 0; i < 160; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const sz = rand(.5, 3);
    s.style.cssText = `width:${sz}px;height:${sz}px;top:${rand(0,100)}%;left:${rand(0,100)}%;--d:${rand(1,4)}s;animation-delay:${rand(0,4)}s`;
    bg.appendChild(s);
  }
})();

// =========================================================
//  AUDIO CONTEXT
// =========================================================
let audioCtx;
function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

// Play a tone
function playTone(freq, start, duration, type = 'sine', vol = .3) {
  const ctx = getAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
  gain.gain.setValueAtTime(vol, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + start + duration);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration + .05);
}

// Pop sound
function playPop() {
  popTrack.currentTime = 0;
  popTrack.volume = .9;
  popTrack.muted = audioMuted;
  const popPromise = popTrack.play();
  if (popPromise) {
    popPromise.catch(playGeneratedPop);
    return;
  }
  playGeneratedPop();
}

function playGeneratedPop() {
  const ctx = getAudio();
  const buf = ctx.createBuffer(1, ctx.sampleRate * .15, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(.6, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .15);
  src.connect(gain); gain.connect(ctx.destination);
  src.start();
}

// Happy Birthday melody  (simplified)
function playHappyBirthday() {
  const ctx = getAudio();
  // C D E F G A B C5
  const N = { C4:261.6, D4:293.7, E4:329.6, F4:349.2, G4:392, A4:440, Bb4:466.2, C5:523.3, F5:698.5, G5:784 };
  const melody = [
    [N.C4,.0,.35],[N.C4,.38,.15],[N.D4,.55,.5],
    [N.C4,1.15,.5],[N.F4,1.65,.5],[N.E4,2.15,1.0],
    [N.C4,3.3,.35],[N.C4,3.65,.15],[N.D4,3.85,.5],
    [N.C4,4.5,.5],[N.G4,5.0,.5],[N.F4,5.5,1.0],
    [N.C4,6.6,.35],[N.C4,6.95,.15],[N.C5,7.1,.5],
    [N.A4,7.7,.5],[N.F4,8.2,.35],[N.E4,8.55,.2],[N.D4,8.8,.5],
    [N.Bb4,9.3,.35],[N.Bb4,9.65,.15],[N.A4,9.85,.5],
    [N.F4,10.35,.5],[N.G4,10.85,.5],[N.F4,11.35,1.2],
  ];
  melody.forEach(([f, s, d]) => playTone(f, s, d, 'triangle', .28));
}

const musicTrack = new Audio('song1.mp3');
const finalMessageTrack = new Audio('song2.mp3');
const flashbackTrack = new Audio('song3.mp3');
const popTrack = new Audio('pop.mp3');
musicTrack.preload = 'auto';
finalMessageTrack.preload = 'auto';
flashbackTrack.preload = 'auto';
popTrack.preload = 'auto';
musicTrack.loop = true;
finalMessageTrack.loop = true;
flashbackTrack.loop = true;
let activeAudioTrack = null;
let audioMuted = false;
const audioFadeTimers = new WeakMap();

function updateAudioToggle() {
  const btn = $('audioToggle');
  btn.textContent = audioMuted ? '🔇' : '🔊';
  btn.title = audioMuted ? 'Sound off' : 'Sound on';
  btn.setAttribute('aria-label', audioMuted ? 'Unmute sound' : 'Mute sound');
  btn.classList.toggle('muted', audioMuted);
}

function clearAudioFade(track) {
  const timer = audioFadeTimers.get(track);
  if (timer) clearInterval(timer);
  audioFadeTimers.delete(track);
}

function fadeTrackVolume(track, toVolume, duration = 900, onDone) {
  clearAudioFade(track);
  const fromVolume = track.volume || 0;
  const steps = Math.max(1, Math.round(duration / 50));
  let step = 0;
  const timer = setInterval(() => {
    step++;
    const progress = Math.min(1, step / steps);
    track.volume = fromVolume + (toVolume - fromVolume) * progress;
    if (progress >= 1) {
      clearAudioFade(track);
      if (onDone) onDone();
    }
  }, 50);
  audioFadeTimers.set(track, timer);
}

function stopAudioTrack(track, fade = true) {
  clearAudioFade(track);
  if (track.paused) return;
  const finish = () => {
    track.pause();
    track.currentTime = 0;
    if (activeAudioTrack === track) activeAudioTrack = null;
  };
  if (fade) fadeTrackVolume(track, 0, 850, finish);
  else finish();
}

function playAudioTrack(track, volume = .85) {
  $('audioToggle').classList.remove('hidden');
  [musicTrack, finalMessageTrack, flashbackTrack].forEach(activeTrack => {
    if (activeTrack !== track) stopAudioTrack(activeTrack);
  });
  activeAudioTrack = track;
  track.currentTime = 0;
  track.volume = 0;
  track.muted = audioMuted;
  const playPromise = track.play();
  if (playPromise) {
    playPromise
      .then(() => {
        if (!audioMuted) fadeTrackVolume(track, volume, 1100);
      })
      .catch(() => playHappyBirthday());
  } else if (!audioMuted) {
    fadeTrackVolume(track, volume, 1100);
  }
}

function playOurSong() {
  playAudioTrack(musicTrack, .85);
}

function playFlashbackSong() {
  playAudioTrack(flashbackTrack, .82);
}

function playFinalMessageSong() {
  playAudioTrack(finalMessageTrack, .78);
}

$('audioToggle').addEventListener('click', () => {
  audioMuted = !audioMuted;
  [musicTrack, finalMessageTrack, flashbackTrack, popTrack].forEach(track => {
    track.muted = audioMuted;
  });
  updateAudioToggle();
});
updateAudioToggle();

// =========================================================
//  PHASE MANAGEMENT
// =========================================================
function showPhase(id) {
  document.querySelectorAll('.phase').forEach(p => p.classList.add('hidden'));
  $(id).classList.remove('hidden');
  if (id !== 'balloon-phase') $('balloonHint').classList.remove('show');
  if (id === 'balloon-phase') clearFloatingDecorations();
  if (id === 'countdown-phase' || id === 'cake-phase') removeDecorTitle();
}

function clearFloatingDecorations() {
  activeConfettiIntervals.splice(0).forEach(id => clearInterval(id));
  document.querySelectorAll('.float-item').forEach(el => el.remove());
  document.querySelectorAll('.birthday-decor').forEach(el => el.remove());
  document.querySelectorAll('.confetti').forEach(el => el.remove());
  persistentDecorations = 0;
}

function removeDecorTitle() {
  document.querySelectorAll('.decor-title').forEach(el => el.remove());
}

// =========================================================
//  PHASE 1 → 2: START
// =========================================================
$('startBtn').addEventListener('click', () => {
  showPhase('decorate-phase');
});

// =========================================================
//  PHASE 2: DECORATE
// =========================================================
const floatEmojis = ['🌸','🌺','💖','💕','🌷','💗','🌼','💝','🌹','✨','💫','🦋','🌻','💐'];
let decorateInterval;
let persistentDecorations = 0;

function spawnFloatItem(stay = false) {
  const el = document.createElement('div');
  el.className = stay ? 'float-item stay' : 'float-item';
  el.textContent = floatEmojis[randInt(0, floatEmojis.length)];
  if (stay) {
    el.style.cssText = `left:${rand(4,92)}%;top:${rand(8,88)}%;--dur:${rand(2.2,4.8)}s;--rot:${rand(-24,24)}deg;font-size:${rand(1.4,3)}rem`;
    persistentDecorations++;
  } else {
    el.style.cssText = `left:${rand(0,95)}%;bottom:-60px;--dur:${rand(4,8)}s;--rot:${rand(-40,40)}deg;font-size:${rand(1.5,3.5)}rem`;
  }
  document.body.appendChild(el);
  if (!stay) setTimeout(() => el.remove(), 9000);
}

function createBirthdayBackdrop() {
  clearFloatingDecorations();
  const decor = document.createElement('div');
  decor.className = 'birthday-decor';
  if (isLowMotionDevice) decor.classList.add('mobile-decor');

  const rope = document.createElement('div');
  rope.className = 'birthday-rope';
  decor.appendChild(rope);

  const colors = [
    ['#ff72bd', '#c70f75'],
    ['#ffc3df', '#f77db7'],
    ['#f8f5f6', '#c9c6c8'],
    ['#ef4c9a', '#a9085f'],
    ['#ffffff', '#d7d5d5'],
    ['#f2c2ce', '#bfb7bb']
  ];
  const desktopPoints = [
    [10, 36, 64, -12, 3.1], [15, 27, 52, 8, 2.8], [22, 20, 72, -7, 3.4],
    [31, 15, 56, 12, 3], [41, 12, 76, -5, 3.5], [51, 11, 58, 7, 2.9],
    [61, 12, 74, -2, 3.2], [71, 16, 56, 9, 3.5], [80, 23, 72, -10, 3],
    [87, 32, 58, 7, 3.3], [92, 43, 66, -8, 2.9], [7, 48, 54, 13, 3.5],
    [18, 42, 46, 8, 3.6], [83, 44, 48, -6, 3.1], [28, 13, 42, 11, 3.3],
    [74, 13, 44, -9, 3.2], [8, 62, 50, -8, 3.7], [15, 74, 42, 10, 3.9],
    [25, 86, 54, -13, 3.4], [75, 84, 52, 11, 3.6], [86, 72, 44, -9, 3.8],
    [94, 60, 56, 8, 3.5], [4, 83, 38, 7, 4.1], [96, 88, 40, -10, 4]
  ];
  const mobilePoints = [
    [10, 26, 42, -12, 3.2], [19, 15, 34, 8, 3.6], [30, 8, 46, -6, 3.4],
    [42, 5, 34, 5, 3.8], [54, 6, 48, -4, 3.3], [66, 9, 34, 8, 3.7],
    [78, 16, 44, -9, 3.2], [90, 28, 38, 11, 3.5], [12, 50, 32, 7, 3.9],
    [88, 52, 32, -7, 3.9], [50, 28, 30, 4, 4.1], [9, 66, 34, -8, 4],
    [20, 80, 30, 9, 4.2], [82, 78, 32, -10, 4.1], [92, 66, 34, 8, 4],
    [50, 84, 28, 5, 4.4]
  ];
  const points = isLowMotionDevice ? mobilePoints : desktopPoints;

  points.forEach(([x, y, s, r, dur], index) => {
    const b = document.createElement('span');
    const [c, d] = colors[index % colors.length];
    b.className = `decor-balloon${index === 0 || index === 4 || (!isLowMotionDevice && index === 11) ? ' heart' : ''}${s < 52 ? ' small' : ''}`;
    b.style.cssText = `--x:${x}%;--y:${y}%;--s:${s}px;--r:${r}deg;--dur:${dur}s;--delay:${index * .045}s;--c:${c};--d:${d}`;
    decor.appendChild(b);
  });

  const banner = document.createElement('div');
  banner.className = 'birthday-banner';
  const bannerText = isLowMotionDevice ? 'HAPPYBDAY' : 'HAPPYBIRTHDAY';
  bannerText.split('').forEach(letter => {
    const flag = document.createElement('span');
    flag.textContent = letter;
    flag.style.setProperty('--delay', `${.35 + banner.children.length * .035}s`);
    banner.appendChild(flag);
  });
  decor.appendChild(banner);

  const birthdayTitle = document.createElement('div');
  birthdayTitle.className = 'decor-title';
  birthdayTitle.innerHTML = '<span>Happy 18th Birthday</span><strong>fineshyyt</strong>';
  decor.appendChild(birthdayTitle);

  const flowers = isLowMotionDevice ? [
    [13, 34, '🌸', 1.18], [24, 19, '💗', 1.08], [36, 12, '✨', 1],
    [50, 9, '🌺', 1.12], [64, 12, '✨', 1], [76, 20, '💗', 1.08],
    [87, 35, '🌸', 1.18], [20, 58, '💕', 1.05], [50, 48, '🌷', 1.08],
    [80, 60, '💕', 1.05]
  ] : [
    [17, 37, '🌸', 1.6], [24, 18, '🌺', 1.3], [36, 13, '🌷', 1.2],
    [48, 10, '🌸', 1.4], [63, 13, '🌺', 1.25], [76, 20, '🌷', 1.35],
    [84, 38, '🌸', 1.55], [12, 49, '🌺', 1.2], [90, 49, '🌺', 1.2]
  ];
  flowers.forEach(([x, y, flower, size], index) => {
    const el = document.createElement('span');
    el.className = 'decor-flower';
    el.textContent = flower;
    el.style.cssText = `--x:${x}%;--y:${y}%;--s:${size}rem;--dur:${rand(2.6, 3.6)}s;--delay:${.25 + index * .04}s`;
    decor.appendChild(el);
  });

  if (isLowMotionDevice) {
    ['♡', '✦', '♡', '✧', '♡', '✦', '♡', '✧'].forEach((petal, index) => {
      const el = document.createElement('span');
      el.className = 'mobile-petal';
      el.textContent = petal;
      el.style.cssText = `--x:${rand(12,88)}%;--delay:${index * .28}s;--dur:${rand(4.5,6.2)}s;--drift:${rand(-28,28)}px`;
      decor.appendChild(el);
    });
  }

  document.body.appendChild(decor);
}

$('decorateBtn').addEventListener('click', () => {
  $('decorateBtn').closest('.phase-card').classList.add('decor-card-done');
  createBirthdayBackdrop();
  startConfetti();
  setTimeout(() => {
    showPhase('music-phase');
  }, 3500);
});

// keep a few floating in background
function keepFloating() {
  setInterval(() => {
    if (!$('balloon-phase').classList.contains('hidden') || !$('msg-phase').classList.contains('hidden')) return;
    if (persistentDecorations < motion.maxBackgroundDecorations) spawnFloatItem(true);
  }, motion.backgroundDecorInterval);
}

// =========================================================
//  CONFETTI
// =========================================================
const confettiColors = ['#ff69b4','#ff1493','#ffd700','#ff6347','#7b68ee','#00ced1','#adff2f','#fff'];
const activeConfettiIntervals = [];
function spawnConfetti() {
  const el = document.createElement('div');
  el.className = 'confetti';
  el.style.cssText = `left:${rand(0,100)}%;top:0;background:${confettiColors[randInt(0,confettiColors.length)]};--dur:${rand(2.5,5)}s;--rot:${rand(-360,360)}deg;--br:${Math.random()>.5?'50%':'3px'};animation-delay:${rand(0,.5)}s`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 6000);
}
function startConfetti() {
  for (let i = 0; i < motion.confettiBurst; i++) setTimeout(spawnConfetti, i * 55);
  const ci = setInterval(spawnConfetti, motion.confettiInterval);
  activeConfettiIntervals.push(ci);
  setTimeout(() => clearInterval(ci), motion.confettiDuration);
}

// =========================================================
//  PHASE 3: MUSIC
// =========================================================
const musicNotes = ['🎵','🎶','🎼','♪','♫'];
let musicNoteInterval;

function spawnMusicNote() {
  const el = document.createElement('div');
  el.className = 'music-note';
  el.textContent = musicNotes[randInt(0, musicNotes.length)];
  const tx = rand(-200, 200);
  const ty = rand(-300, -100);
  el.style.cssText = `left:${rand(10,90)}%;bottom:${rand(10,50)}%;--tx:${tx}px;--ty:${ty}px;--dur:${rand(1.5,3)}s;--rot:${rand(-60,60)}deg;font-size:${rand(1.4,2.8)}rem`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

$('musicBtn').addEventListener('click', () => {
  $('musicBtn').closest('.phase-card').classList.add('decor-card-done');
  $('soundTip').classList.remove('hidden');
  requestAnimationFrame(() => $('soundTip').classList.add('show'));
  setTimeout(() => $('soundTip').classList.remove('show'), 2500);
  setTimeout(() => $('soundTip').classList.add('hidden'), 3000);
  setTimeout(() => {
    playOurSong();
    musicNoteInterval = setInterval(spawnMusicNote, motion.musicNoteInterval);
    startConfetti();
  }, 1200);
  setTimeout(() => {
    startCountdown('cake-phase');
  }, 2000);
  setTimeout(() => {
    if (musicNoteInterval) clearInterval(musicNoteInterval);
  }, 4000);
});

// =========================================================
//  FINAL MESSAGE MEMORIES
// =========================================================
const flashbackPhotoFiles = Array.from({ length: 15 }, (_, index) => `photo${index + 1}.jpg`);
let flashbackPhotos = [];
let flashbackTimer;

function revealGiftStep() {
  stopAudioTrack(flashbackTrack);
  $('giftReveal').classList.add('show');
  $('giftCheck').classList.remove('hidden');
  setTimeout(() => {
    $('giftOpenBtn').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 250);
}

function preloadFlashbackPhotos() {
  return Promise.all(flashbackPhotoFiles.map(src => new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(null);
    img.src = src;
  }))).then(files => files.filter(Boolean));
}

function showFlashbackFrame(index) {
  const photo = $('flashbackPhoto');
  const card = $('flashbackCard');
  const counter = $('flashbackCounter');
  const src = flashbackPhotos[index];

  card.classList.remove('show');
  setTimeout(() => {
    photo.src = src;
    counter.textContent = `${index + 1} / ${flashbackPhotos.length}`;
    card.style.setProperty('--flash-rot', `${rand(-5, 5)}deg`);
    card.classList.add('show');
  }, 120);
}

async function startFlashback() {
  clearInterval(flashbackTimer);
  $('memoryStartBtn').classList.add('hidden');
  $('memoryStage').classList.remove('hidden');
  $('giftReveal').classList.remove('show');
  playFlashbackSong();

  if (!flashbackPhotos.length) flashbackPhotos = await preloadFlashbackPhotos();
  if (!flashbackPhotos.length) {
    $('flashbackCounter').textContent = 'Add photo1.jpg to photo15.jpg here';
    revealGiftStep();
    return;
  }

  let index = 0;
  showFlashbackFrame(index);
  flashbackTimer = setInterval(() => {
    index++;
    if (index >= flashbackPhotos.length) {
      clearInterval(flashbackTimer);
      setTimeout(revealGiftStep, 900);
      return;
    }
    showFlashbackFrame(index);
  }, 1700);
}

$('memoryStartBtn').addEventListener('click', startFlashback);

// =========================================================
//  GIFT UNBOX VERIFICATION
// =========================================================
const supabaseConfig = {
  url: 'https://tujjwkxkordwxnegrarb.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1amp3a3hrb3Jkd3huZWdyYXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NzU2MDAsImV4cCI6MjA5NDA1MTYwMH0.rXvQaPe5nl-7w-pBuf6lQZC1yIYleMv9L9Ot2ERPB9M',
  bucket: 'gift-photos',
  table: 'gift_reviews'
};

let giftStream = null;
let giftCapturedBlob = null;
let giftSubmitting = false;
const ratingOptions = [
  [1, '😭'], [2, '😢'], [3, '😕'], [4, '🙂'], [5, '😊'],
  [6, '😄'], [7, '😍'], [8, '🥰'], [9, '🤩'], [10, '💖']
];

function isSupabaseConfigured() {
  return supabaseConfig.url.startsWith('https://') && supabaseConfig.anonKey.length > 20;
}

function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function setGiftSubmitStatus(message, type = '') {
  const status = $('giftSubmitStatus');
  status.textContent = message;
  status.dataset.type = type;
}

async function submitGiftReview(score, emoji) {
  if (giftSubmitting) return;

  if (!isSupabaseConfigured()) {
    setGiftSubmitStatus('Supabase config add karne ke baad photo/rating Aditya ke dashboard me save hogi.', 'warn');
    return;
  }

  giftSubmitting = true;
  setGiftSubmitStatus('Sending photo and rating to Aditya...', 'loading');

  try {
    const safeTime = new Date().toISOString().replace(/[:.]/g, '-');
    const photoPath = giftCapturedBlob ? `ragini-gift-${safeTime}.jpg` : null;
    let photoUrl = '';

    if (giftCapturedBlob) {
      const uploadUrl = `${supabaseConfig.url}/storage/v1/object/${supabaseConfig.bucket}/${photoPath}`;
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          apikey: supabaseConfig.anonKey,
          Authorization: `Bearer ${supabaseConfig.anonKey}`,
          'Content-Type': 'image/jpeg',
          'x-upsert': 'false'
        },
        body: giftCapturedBlob
      });
      if (!uploadResponse.ok) throw new Error('Photo upload failed');
      photoUrl = `${supabaseConfig.url}/storage/v1/object/public/${supabaseConfig.bucket}/${photoPath}`;
    }

    const saveResponse = await fetch(`${supabaseConfig.url}/rest/v1/${supabaseConfig.table}`, {
      method: 'POST',
      headers: {
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${supabaseConfig.anonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({
        rating: score,
        emoji,
        photo_path: photoPath,
        photo_url: photoUrl,
        user_agent: navigator.userAgent
      })
    });
    if (!saveResponse.ok) throw new Error('Rating save failed');

    setGiftSubmitStatus('Sent to Aditya. Ab woh photo aur rating dekh payega 💖', 'success');
  } catch {
    setGiftSubmitStatus('Unable to send. Internet/config check karke dobara rating tap karo.', 'error');
  } finally {
    giftSubmitting = false;
  }
}

ratingOptions.forEach(([score, emoji]) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'rating-btn';
  btn.textContent = `${emoji} ${score}`;
  btn.setAttribute('aria-label', `${score} out of 10`);
  btn.addEventListener('click', () => {
    document.querySelectorAll('.rating-btn').forEach(item => item.classList.remove('selected'));
    btn.classList.add('selected');
    $('ratingThanks').textContent = `${emoji} ${score}/10 selected. Thank you, cutie.`;
    submitGiftReview(score, emoji);
    startConfetti();
  });
  $('ratingRow').appendChild(btn);
});

async function openGiftCamera() {
  $('giftOpenBtn').classList.add('hidden');
  $('giftCamera').classList.remove('hidden');
  $('giftVideo').classList.remove('hidden');
  $('giftPhoto').classList.add('hidden');
  $('captureGiftBtn').classList.remove('hidden');
  $('ratingThanks').textContent = '';
  setGiftSubmitStatus('');
  giftCapturedBlob = null;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    $('giftCamera').querySelector('p').textContent = 'Camera available nahi hai. Chrome/Edge me open karke permission allow karo, ya sirf rating de do.';
    $('giftVideo').classList.add('hidden');
    $('captureGiftBtn').classList.add('hidden');
    $('giftReview').classList.remove('hidden');
    return;
  }

  try {
    giftStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    $('giftVideo').srcObject = giftStream;
  } catch {
    $('giftCamera').querySelector('p').textContent = 'Camera permission nahi mili, but rating de sakti ho.';
    $('giftVideo').classList.add('hidden');
    $('captureGiftBtn').classList.add('hidden');
    $('giftReview').classList.remove('hidden');
  }
}

function captureGiftPhoto() {
  const video = $('giftVideo');
  const canvas = $('giftCanvas');
  const photo = $('giftPhoto');
  const width = video.videoWidth || 640;
  const height = video.videoHeight || 480;

  if (video.readyState < 2) {
    $('giftCamera').querySelector('p').textContent = 'Camera ready ho rahi hai, ek second baad photo lo.';
    return;
  }

  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(video, 0, 0, width, height);
  photo.src = canvas.toDataURL('image/jpeg', .9);
  giftCapturedBlob = dataUrlToBlob(photo.src);
  photo.classList.remove('hidden');
  video.classList.add('hidden');
  $('captureGiftBtn').classList.add('hidden');
  $('giftReview').classList.remove('hidden');

  if (giftStream) {
    giftStream.getTracks().forEach(track => track.stop());
    giftStream = null;
  }
  startConfetti();
}

$('giftOpenBtn').addEventListener('click', openGiftCamera);
$('captureGiftBtn').addEventListener('click', captureGiftPhoto);

// =========================================================
//  FLOATING WISHES AFTER CANDLES
// =========================================================
const wishes = [
  'Endless smiles for you',
  'Your dreams coming true',
  'May Mahadev bless you',
  'make proud your parents',
  'Happiness in every moment',
  'Success in all you do',
];

function launchFloatingWishes() {
  $('cakeNextBtn').textContent = 'Wishes floating...';
  $('cakeNextBtn').classList.add('locked');
  $('cakeNextBtn').classList.remove('ready');

  wishes.forEach((wish, index) => {
    setTimeout(() => {
      const note = document.createElement('div');
      note.className = 'floating-wish';
      note.textContent = wish;
      note.style.cssText = `--x:${rand(18,82)}%;--dur:${rand(4.8,6.2)}s;--rot:${rand(-8,8)}deg;--drift:${rand(-42,42)}px`;
      document.body.appendChild(note);
      setTimeout(() => note.remove(), 6800);
      if (!isLowMotionDevice || index % 2 === 0) {
        spawnTouchSparkle(rand(innerWidth * .22, innerWidth * .78), innerHeight - 70);
      }
    }, index * 650);
  });

  setTimeout(() => {
    $('cakeHint').textContent = 'All my wishes are flying to you.';
    $('cakeNextBtn').textContent = 'Balloons are coming...';
    startConfetti();
    setTimeout(() => showPhase('balloon-phase'), 1200);
  }, wishes.length * 650 + 2600);
}

// =========================================================
//  PHASE 4: CAKE
// =========================================================
let cakeBlown = false;
let cakeBreeze = 0;
let cakePointerActive = false;
let lastCakePoint = null;
let floatingWishesStarted = false;

function initCakePhase() {
  cakeBlown = false;
  cakeBreeze = 0;
  cakePointerActive = false;
  lastCakePoint = null;
  floatingWishesStarted = false;
  $('cake').classList.remove('blown', 'fanning');
  document.querySelectorAll('#cake .candle').forEach(candle => candle.classList.remove('out'));
  $('micMeter').style.width = '0%';
  $('cakeHint').textContent = 'Make a wish, then swipe gently over the candles.';
  $('cakeNextBtn').textContent = 'Swipe Candles';
  $('cakeNextBtn').classList.add('locked');
  $('cakeNextBtn').classList.remove('ready');
}

function blowOutCandles() {
  if (cakeBlown) return;
  cakeBlown = true;
  $('cake').classList.add('blown');
  document.querySelectorAll('#cake .candle').forEach(candle => candle.classList.add('out'));
  $('cakeHint').textContent = 'Look up... your wishes are floating in.';
  if (!floatingWishesStarted) {
    floatingWishesStarted = true;
    launchFloatingWishes();
  }
  startConfetti();
}

function addCakeBreeze(amount) {
  if (cakeBlown) return;
  cakeBreeze = Math.min(100, cakeBreeze + amount);
  $('micMeter').style.width = `${cakeBreeze}%`;
  $('cakeNextBtn').textContent = cakeBreeze < 100 ? 'Keep swiping...' : 'Final Countdown';
  if (cakeBreeze > 12 && cakeBreeze < 100) $('cakeHint').textContent = 'A little more... the candles are listening.';

  const candles = document.querySelectorAll('#cake .candle');
  const outCount = Math.floor(cakeBreeze / 34);
  candles.forEach((candle, index) => {
    if (index < outCount) candle.classList.add('out');
  });

  $('cake').classList.add('fanning');
  clearTimeout($('cake').fanTimer);
  $('cake').fanTimer = setTimeout(() => $('cake').classList.remove('fanning'), 220);

  if (cakeBreeze >= 100) blowOutCandles();
}

function handleCakeTap(e) {
  e.preventDefault();
  cakePointerActive = false;
  lastCakePoint = null;
  spawnTouchSparkle(e.clientX, e.clientY);
  addCakeBreeze(8);
}

$('cake').addEventListener('pointerdown', e => {
  e.preventDefault();
  cakePointerActive = true;
  lastCakePoint = { x: e.clientX, y: e.clientY };
  $('cake').setPointerCapture(e.pointerId);
  $('cakeNextBtn').textContent = 'Swipe over candles';
});

$('cake').addEventListener('pointermove', e => {
  if (!cakePointerActive || !lastCakePoint) return;
  const dx = e.clientX - lastCakePoint.x;
  const dy = e.clientY - lastCakePoint.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 8) return;
  addCakeBreeze(Math.min(12, distance / 4));
  lastCakePoint = { x: e.clientX, y: e.clientY };
});

$('cake').addEventListener('pointerup', e => {
  try { $('cake').releasePointerCapture(e.pointerId); } catch {}
  handleCakeTap(e);
});

$('cake').addEventListener('pointercancel', () => {
  cakePointerActive = false;
  lastCakePoint = null;
});

$('cake').addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  e.preventDefault();
  const r = $('cake').getBoundingClientRect();
  spawnTouchSparkle(r.left + r.width / 2, r.top + r.height / 2);
  addCakeBreeze(35);
});

$('cakeNextBtn').addEventListener('click', () => {
  if ($('cakeNextBtn').classList.contains('locked')) {
    addCakeBreeze(10);
    return;
  }
  startCountdown();
});

function startCountdown(nextPhase = 'balloon-phase') {
  if (nextPhase !== 'cake-phase') stopAudioTrack(musicTrack);
  showPhase('countdown-phase');
  const nums = ['3', '2', '1'];
  let index = 0;
  const tick = () => {
    $('countdownNumber').textContent = nums[index];
    $('countdownNumber').style.animation = 'none';
    void $('countdownNumber').offsetWidth;
    $('countdownNumber').style.animation = 'countdownPop .8s ease-out';
    index++;
    if (index < nums.length) setTimeout(tick, 1000);
    else setTimeout(() => {
      showPhase(nextPhase);
      if (nextPhase === 'cake-phase') initCakePhase();
    }, 650);
  };
  tick();
}

// =========================================================
//  PHASE 6: BALLOONS
// =========================================================
const balloonColors = [
  '#ff6b6b','#ff69b4','#ffd93d','#6bcbff','#a78bfa','#34d399','#fb923c','#f472b6'
];
let balloonsLeft = 0;
let balloonInterval;
const balloonEmojis = ['🎉'];

function spawnBalloon() {
  const wrap = document.createElement('div');
  wrap.className = 'balloon-wrap';
  const color = balloonColors[randInt(0, balloonColors.length)];
  const dur = rand(5, 10);
  wrap.style.cssText = `left:${rand(3,88)}%;--dur:${dur}s`;

  const b = document.createElement('div');
  b.className = 'balloon';
  b.style.background = `radial-gradient(circle at 35% 35%, ${color}ee, ${color}88)`;
  b.textContent = balloonEmojis[randInt(0, balloonEmojis.length)];
  wrap.appendChild(b);
  document.body.appendChild(wrap);
  balloonsLeft++;

  wrap.addEventListener('click', e => {
    if (wrap.dataset.popped === 'true') return;
    wrap.dataset.popped = 'true';
    wrap.style.pointerEvents = 'none';
    const rect = b.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    playPop();
    b.classList.add('pop');
    spawnTouchSparkle(cx, cy);
    spawnTapRing(cx, cy);
    const label = document.createElement('div');
    label.className = 'pop-label';
    label.textContent = 'Pop! 🎉';
    label.style.left = `${cx}px`;
    label.style.top = `${cy}px`;
    document.body.appendChild(label);
    setTimeout(() => label.remove(), 800);
    // burst particles
    for (let i = 0; i < motion.popBurstParticles; i++) {
      const burst = document.createElement('div');
      burst.className = 'pop-burst';
      burst.textContent = '🎉';
      const angle = (i / motion.popBurstParticles) * Math.PI * 2;
      const dist = rand(50, 100);
      burst.style.cssText = `left:${cx}px;top:${cy}px;--bx:${Math.cos(angle)*dist}px;--by:${Math.sin(angle)*dist}px`;
      document.body.appendChild(burst);
      setTimeout(() => burst.remove(), 600);
    }
    setTimeout(() => { wrap.remove(); balloonsLeft--; checkAllPopped(); }, 350);
  });

  // auto remove if not popped
  setTimeout(() => {
    if (wrap.parentNode) { wrap.remove(); balloonsLeft--; checkAllPopped(); }
  }, (dur + 1) * 1000);
}

let allLaunched = false;
let totalLaunched = 0;

function checkAllPopped() {
  if (allLaunched && balloonsLeft <= 0) {
    setTimeout(() => {
      startConfetti();
      showPhase('msg-phase');
      startTypewriterMessage();
      startFinalConfetti();
    }, 500);
  }
}

$('balloonBtn').addEventListener('click', () => {
  $('balloon-phase').querySelector('.phase-card').style.opacity = '0';
  $('balloon-phase').querySelector('.phase-card').style.pointerEvents = 'none';
  $('balloonHint').classList.add('show');

  const count = motion.balloonCount;
  totalLaunched = count;
  allLaunched = false;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      spawnBalloon();
      if (i === count - 1) { allLaunched = true; checkAllPopped(); }
    }, i * 500);
  }
});

// =========================================================
//  PHASE 7: MESSAGE + final confetti
// =========================================================
const finalMessageText = `Happy 18th Birthday, Ragini.

Aaj tum officially 18 ki ho gayi, but mere liye tum aaj bhi wahi ho jiski smile dekh ke mera din best ho jata hai.

I don't know perfect words kaise likhte hain, par itna sach hai ki tum meri life ka bahut hi special part ho. Tumhari chhoti chhoti baatein, tumhara mood, tumhari hansi, sab ek special moment hai mere liye jo hamesha mere khayalo mai rehti hai.

Is new year me bas yahi wish hai ki tum khud ko hamesha pyaar se dekho, apne dreams ke liye confident raho khub mehnat karo, aur tumhe woh happiness mile jo tum deserve karti ho hope us se jyada hi.

18th birthday sirf ek number nahi hai, Ye tumhari ek new beginning hai. Aur main genuinely chahta hoon ki is beginning me tumhare saath sirf good memories, soft moments, aur bahut saari cheeje create karu.

haa pichle 2.5 months se hamare beech sab kuch utna acha nahi hai lekin mai sab bhula ke tumhare saath ek new start krna chahta hoon.

Happy Birthday, meri fineshyyt💘.
Love you so much, and ever ever and forver🫀.
Tum ho to sab kuch thoda zyada beautiful lagta hai.`;

let typewriterTimer;
function startTypewriterMessage() {
  const el = $('finalMessage');
  const giftReveal = $('giftReveal');
  const memoryStartBtn = $('memoryStartBtn');
  clearInterval(typewriterTimer);
  playFinalMessageSong();
  el.textContent = '';
  el.classList.add('type-cursor');
  giftReveal.classList.remove('show');
  $('giftCheck').classList.add('hidden');
  memoryStartBtn.classList.add('hidden');
  $('memoryStage').classList.add('hidden');
  let i = 0;
  typewriterTimer = setInterval(() => {
    el.textContent += finalMessageText[i] || '';
    i++;
    if (i >= finalMessageText.length) {
      clearInterval(typewriterTimer);
      setTimeout(() => el.classList.remove('type-cursor'), 700);
      setTimeout(() => memoryStartBtn.classList.remove('hidden'), 900);
    }
  }, 28);
}

function startFinalConfetti() {
  const ci = setInterval(spawnConfetti, motion.finalConfettiInterval);
  setTimeout(() => clearInterval(ci), motion.finalConfettiDuration);
}
