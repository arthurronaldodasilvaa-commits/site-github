/* ===========================
   PLAYLIST — Lógica do player
   =========================== */

if (sessionStorage.getItem('quiz_passed') !== 'true') {
  window.location.replace('../index.html');
}

/* ── Músicas ─────────────────────────────────────────
   Adicione os MP3 em assets/mp3/ com os nomes abaixo.
   ─────────────────────────────────────────────────── */
const SONGS = [
  {
    title:    'Foi Assim',
    artist:   'Sotam',
    cover:    '../assets/imagens/nossas-fotos/foi assim capa.mp4',
    coverType: 'video',
    audio:    '../assets/mp3/Foi assim.mp3',
    emoji:    '🌷',
    fullPage: 'foi-assim.html',
  },
  {
    title:    'Campari',
    artist:   'yunk vino',
    cover:    '../assets/imagens/nossas-fotos/campari.jpeg',
    coverType: 'image',
    audio:    '../assets/mp3/Campari.mp3',
    emoji:    '🍹',
  },
  {
    title:    'Baby Cê é Gata',
    artist:   'Kyan, Mu540',
    cover:    '../assets/imagens/nossas-fotos/bbgata.mp4',
    coverType: 'video',
    audio:    '../assets/mp3/bbgata.mp3',
    emoji:    '🔥',
  },
];

/* ── Estado ──────────────────────────────────────── */
let isPlaying     = false;
let currentTime   = 0;
let totalDuration = 0;
let lastTimestamp = null;
let rafId         = null;
let currentSong   = 0;
let coverVideo    = null;

/* ── DOM ─────────────────────────────────────────── */
const playBtn       = document.getElementById('play-btn');
const progressFill  = document.getElementById('prog-fill');
const progressThumb = document.getElementById('prog-thumb');
const timeCurrent   = document.getElementById('time-current');
const timeTotal     = document.getElementById('time-total');
const audioEl       = document.getElementById('song-audio');

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = String(Math.floor(sec % 60)).padStart(2, '0');
  return `${m}:${s}`;
}

/* ── Carregar música ─────────────────────────────── */
function loadSong(idx) {
  pausePlayer();
  currentSong   = idx;
  currentTime   = 0;
  totalDuration = 0;

  const song = SONGS[idx];

  // Cover
  const artEl = document.getElementById('album-art');
  if (song.coverType === 'video') {
    artEl.innerHTML = `
      <video class="cover-media" loop muted playsinline preload="auto">
        <source src="${song.cover}" type="video/mp4" />
      </video>`;
    coverVideo = artEl.querySelector('video');
  } else {
    artEl.innerHTML = `<img class="cover-media" src="${song.cover}" alt="" />`;
    coverVideo = null;
  }

  // Info
  document.getElementById('song-title').textContent  = song.title;
  document.getElementById('song-artist').textContent = song.artist;

  // Link para letra completa (só foi assim)
  const link = document.getElementById('full-page-link');
  if (song.fullPage) {
    link.href = song.fullPage;
    link.classList.remove('hidden');
  } else {
    link.classList.add('hidden');
  }

  // Áudio
  audioEl.src = song.audio;
  audioEl.load();
  timeTotal.textContent = '–:––';

  const onMeta = () => {
    if (audioEl.duration && isFinite(audioEl.duration)) {
      totalDuration = audioEl.duration;
      timeTotal.textContent = fmt(totalDuration);
    }
  };
  // { once: true } evita acúmulo de listeners ao trocar de música
  audioEl.addEventListener('loadedmetadata', onMeta, { once: true });
  audioEl.addEventListener('canplay',        onMeta, { once: true });

  updateProgress(0);
  renderSongList();
}

/* ── Progresso ───────────────────────────────────── */
function updateProgress(time) {
  const pct = totalDuration > 0 ? (time / totalDuration) * 100 : 0;
  progressFill.style.width = pct + '%';
  progressThumb.style.left = pct + '%';
  timeCurrent.textContent  = fmt(time);
}

/* ── Loop RAF ────────────────────────────────────── */
function tick(ts) {
  if (!isPlaying) return;

  if (!audioEl.paused) {
    currentTime = audioEl.currentTime;
  } else if (lastTimestamp !== null) {
    currentTime = Math.min(currentTime + (ts - lastTimestamp) / 1000, totalDuration);
  }
  lastTimestamp = ts;
  updateProgress(currentTime);

  if (totalDuration > 0 && currentTime >= totalDuration) {
    pausePlayer();
    setTimeout(() => seekToTime(0), 2000);
    return;
  }

  rafId = requestAnimationFrame(tick);
}

/* ── Controles ───────────────────────────────────── */
function playPlayer() {
  isPlaying     = true;
  lastTimestamp = null;
  playBtn.innerHTML = '⏸';
  playBtn.classList.add('playing');
  document.getElementById('album-art').classList.add('playing');

  audioEl.currentTime = currentTime;
  audioEl.play().catch(() => {});
  if (coverVideo) coverVideo.play().catch(() => {});

  rafId = requestAnimationFrame(tick);
}

function pausePlayer() {
  isPlaying     = false;
  lastTimestamp = null;
  if (rafId) cancelAnimationFrame(rafId);
  playBtn.innerHTML = '▶';
  playBtn.classList.remove('playing');
  document.getElementById('album-art').classList.remove('playing');

  audioEl.pause();
  if (coverVideo) coverVideo.pause();
}

function togglePlay() { isPlaying ? pausePlayer() : playPlayer(); }

function seekToTime(sec) {
  currentTime   = Math.max(0, Math.min(sec, totalDuration || 0));
  lastTimestamp = null;
  if (audioEl) audioEl.currentTime = currentTime;
  updateProgress(currentTime);
}

function seekTo(event) {
  const track = document.getElementById('prog-track');
  const rect  = track.getBoundingClientRect();
  const pct   = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  seekToTime(pct * (totalDuration || 0));
  if (!isPlaying) playPlayer();
}

/* ── Lista de músicas ────────────────────────────── */
function renderSongList() {
  const listEl = document.getElementById('songs-list');
  const label  = listEl.querySelector('.songs-side-label');

  // Manter o label
  listEl.innerHTML = '';
  if (label) listEl.appendChild(label);

  SONGS.forEach((song, i) => {
    const row = document.createElement('div');
    row.className = 'song-row' + (i === currentSong ? ' active' : '');
    row.innerHTML = `
      <span class="song-row-num">${i + 1}</span>
      <span class="song-row-emoji">${song.emoji}</span>
      <div class="song-row-info">
        <span class="song-row-title">${song.title}</span>
        <span class="song-row-artist">${song.artist}</span>
      </div>
      ${i === currentSong && isPlaying ? '<span class="song-row-playing">♪</span>' : ''}
    `;
    row.addEventListener('click', () => switchSong(i));
    listEl.appendChild(row);
  });
}

function switchSong(idx) {
  if (idx === currentSong) { togglePlay(); return; }
  loadSong(idx);
  playPlayer();
}

/* ── Teclado ─────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === ' ')          { e.preventDefault(); togglePlay(); }
  if (e.key === 'ArrowRight') seekToTime(currentTime + 5);
  if (e.key === 'ArrowLeft')  seekToTime(Math.max(0, currentTime - 5));
});

/* ── Fim natural da música ───────────────────────── */
audioEl.addEventListener('ended', () => {
  pausePlayer();
  updateProgress(totalDuration);
  // Avança para próxima música automaticamente (loop circular)
  const next = (currentSong + 1) % SONGS.length;
  setTimeout(() => { loadSong(next); playPlayer(); }, 800);
});

/* ── Init ────────────────────────────────────────── */
document.body.style.opacity = '0';

window.addEventListener('load', () => {
  // Suporta ?song=N para abrir direto numa música específica
  const params   = new URLSearchParams(window.location.search);
  const startIdx = Math.max(0, Math.min(SONGS.length - 1,
    parseInt(params.get('song') || '0', 10)
  ));
  loadSong(startIdx);

  document.body.style.transition = 'opacity .6s ease';
  document.body.style.opacity    = '1';
});
