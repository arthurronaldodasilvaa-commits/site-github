/* ===========================
   VIAGEM — Mensagens da Viagem
   =========================== */

if (sessionStorage.getItem('quiz_passed') !== 'true') {
  window.location.replace('../index.html');
}

// ?test=1 na URL desbloqueia tudo (para testar antes da viagem)
const TEST_MODE = new URLSearchParams(location.search).get('test') === '1';

// ── Dias da viagem (25–28 de junho) ──────────────
const DAYS = [
  {
    date:  new Date(2026, 5, 25),   // quinta, 25/06
    label: 'Quinta · 25/06',
    emoji: '💌',
    audio: '../assets/viagem-dia-1.m4a',
  },
  {
    date:  new Date(2026, 5, 26),   // sexta, 26/06
    label: 'Sexta · 26/06',
    emoji: '💕',
    audio: '../assets/viagem-dia-2.m4a',
  },
  {
    date:  new Date(2026, 5, 27),   // sábado, 27/06
    label: 'Sábado · 27/06',
    emoji: '🌷',
    audio: '../assets/viagem-dia-3.m4a',
  },
  {
    date:  new Date(2026, 5, 28),   // domingo, 28/06
    label: 'Domingo · 28/06',
    emoji: '💖',
    audio: '../assets/viagem-dia-4.m4a',
  },
];

// ── Helpers ───────────────────────────────────────

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isUnlocked(day) {
  if (TEST_MODE) return true;
  return new Date() >= startOfDay(day.date);
}

function todayIdx() {
  const today = +startOfDay(new Date());
  return DAYS.findIndex(d => +startOfDay(d.date) === today);
}

function countdownStr(targetDate) {
  const diff = startOfDay(targetDate) - new Date();
  if (diff <= 0) return null;

  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000)  / 60000);

  if (days > 0)  return `abre em ${days}d ${hours}h`;
  if (hours > 0) return `abre em ${hours}h ${mins}min`;
  if (mins > 0)  return `abre em ${mins}min`;
  return 'abrindo em instantes…';
}

function fmtTime(sec) {
  if (!sec || !isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = String(Math.floor(sec % 60)).padStart(2, '0');
  return `${m}:${s}`;
}

// ── Player state ──────────────────────────────────
const players = {};

// ── Build card ────────────────────────────────────
function buildCard(day, idx) {
  const unlocked = isUnlocked(day);
  const card     = document.createElement('div');
  card.className = `day-card ${unlocked ? 'unlocked' : 'locked'}`;
  card.id        = `card-day-${idx}`;

  if (!unlocked) {
    const cd = countdownStr(day.date);
    card.innerHTML = `
      <span class="lock-emoji-wrap">${day.emoji}</span>
      <div class="lock-info">
        <span class="lock-label">${day.label}</span>
        <span class="lock-countdown" id="cd-${idx}">${cd || ''}</span>
      </div>
      <span class="lock-icon">🔒</span>
    `;
    return card;
  }

  const isToday   = todayIdx() === idx;
  const badgeHtml = isToday ? '<span class="day-new-badge">hoje ✨</span>' : '';

  card.innerHTML = `
    <div class="day-card-top">
      <span class="day-emoji">${day.emoji}</span>
      <span class="day-label">${day.label}</span>
      ${badgeHtml}
    </div>
    <div class="day-player">
      <button
        class="play-circle"
        id="play-${idx}"
        onclick="togglePlay(${idx})"
        aria-label="Reproduzir mensagem — ${day.label}"
      >▶</button>
      <div class="player-right">
        <div class="prog-track" id="track-${idx}" onclick="seekDay(event,${idx})">
          <div class="prog-fill" id="fill-${idx}"></div>
        </div>
        <div class="prog-times">
          <span id="cur-${idx}">0:00</span>
          <span id="dur-${idx}">–:––</span>
        </div>
      </div>
    </div>
    <audio id="audio-${idx}" src="${day.audio}" preload="metadata"></audio>
  `;

  players[idx] = { playing: false, rafId: null };

  requestAnimationFrame(() => {
    const audio = document.getElementById(`audio-${idx}`);
    if (!audio) return;
    const setDur = () => {
      if (audio.duration && isFinite(audio.duration)) {
        document.getElementById(`dur-${idx}`).textContent = fmtTime(audio.duration);
      }
    };
    audio.addEventListener('loadedmetadata', setDur, { once: true });
    audio.addEventListener('canplay',        setDur, { once: true });
    audio.addEventListener('ended', () => pauseDay(idx));

    audio.addEventListener('error', () => {
      const btn = document.getElementById(`play-${idx}`);
      const dur = document.getElementById(`dur-${idx}`);
      if (btn) { btn.disabled = true; btn.style.opacity = '.3'; }
      if (dur) dur.textContent = 'em breve…';
    }, { once: true });
  });

  return card;
}

// ── Playback ──────────────────────────────────────
function togglePlay(idx) {
  if (!players[idx]) return;
  players[idx].playing ? pauseDay(idx) : playDay(idx);
}

function playDay(idx) {
  Object.keys(players).forEach(i => {
    if (+i !== idx && players[i]?.playing) pauseDay(+i);
  });

  const audio = document.getElementById(`audio-${idx}`);
  const btn   = document.getElementById(`play-${idx}`);
  if (!audio || !btn) return;

  players[idx].playing = true;
  btn.innerHTML        = '⏸';
  btn.classList.add('playing');

  audio.play().catch(() => pauseDay(idx));

  const tick = () => {
    if (!players[idx]?.playing) return;
    updateFill(idx);
    players[idx].rafId = requestAnimationFrame(tick);
  };
  players[idx].rafId = requestAnimationFrame(tick);
}

function pauseDay(idx) {
  const audio = document.getElementById(`audio-${idx}`);
  const btn   = document.getElementById(`play-${idx}`);
  if (!players[idx]) return;

  players[idx].playing = false;
  if (players[idx].rafId) { cancelAnimationFrame(players[idx].rafId); players[idx].rafId = null; }
  if (btn)   { btn.innerHTML = '▶'; btn.classList.remove('playing'); }
  if (audio) audio.pause();
}

function updateFill(idx) {
  const audio = document.getElementById(`audio-${idx}`);
  const fill  = document.getElementById(`fill-${idx}`);
  const curEl = document.getElementById(`cur-${idx}`);
  if (!audio || !fill) return;

  const pct = audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0;
  fill.style.width = pct + '%';
  if (curEl) curEl.textContent = fmtTime(audio.currentTime);
}

function seekDay(event, idx) {
  const audio = document.getElementById(`audio-${idx}`);
  const track = document.getElementById(`track-${idx}`);
  if (!audio || !track || !audio.duration) return;

  const rect = track.getBoundingClientRect();
  const pct  = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  audio.currentTime = pct * audio.duration;
  updateFill(idx);
  if (!players[idx]?.playing) playDay(idx);
}

// ── Pause tudo quando a aba some (economiza bateria) ──
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    Object.keys(players).forEach(i => {
      if (players[i]?.playing) pauseDay(+i);
    });
  }
});

// ── Atualiza contagem regressiva a cada minuto ────
function refreshCountdowns() {
  DAYS.forEach((day, idx) => {
    if (isUnlocked(day)) return;
    const el = document.getElementById(`cd-${idx}`);
    if (el) el.textContent = countdownStr(day.date) || '';
  });
}

// ── Init ──────────────────────────────────────────
document.body.style.opacity = '0';

window.addEventListener('load', () => {
  const list = document.getElementById('days-list');
  DAYS.forEach((day, idx) => list.appendChild(buildCard(day, idx)));

  setInterval(refreshCountdowns, 60000);

  document.body.style.transition = 'opacity .6s ease';
  document.body.style.opacity    = '1';
});
