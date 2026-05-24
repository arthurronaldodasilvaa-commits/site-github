/* ===========================
   SPOTIFY — Lógica dos slides
   =========================== */

// ── Proteção do quiz ──────────────────────────────
if (sessionStorage.getItem('quiz_passed') !== 'true') {
  window.location.replace('../index.html');
}

// ── Estado ────────────────────────────────────────
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots   = document.querySelectorAll('.dot');
const TOTAL  = slides.length;

// ── Cálculo de tempo juntos ───────────────────────
function timeTogether() {
  const start = CONFIG.firstMet;
  const now   = new Date();
  const ms    = now - start;

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours   / 24);
  const weeks   = Math.floor(days    / 7);
  const months  = Math.floor(days    / 30.44);

  return { seconds, minutes, hours, days, weeks, months };
}

// ── Renderiza os songs da config ──────────────────
function renderSongs() {
  const list = document.getElementById('songs-list');
  if (!list) return;

  list.innerHTML = '';
  CONFIG.songs.forEach((song, i) => {
    const a = document.createElement('a');
    // Links internos (mesma pasta pages/) ficam na mesma aba
    const isInternal = song.link && !song.link.startsWith('http') && song.link !== '#';
    a.className = 'song-card' + (song.special ? ' song-special' : '');
    a.href      = song.link || '#';
    a.target    = (!isInternal && song.link && song.link !== '#') ? '_blank' : '_self';
    a.rel       = 'noopener';

    a.innerHTML = `
      <span class="song-rank">${i + 1}</span>
      <div class="song-cover">${song.emoji || '🎵'}</div>
      <div class="song-info">
        <div class="song-title">${song.title}${song.special ? ' <span class="song-badge">✦</span>' : ''}</div>
        <div class="song-artist">${song.artist}</div>
      </div>
      <span class="song-play">▶</span>
    `;
    list.appendChild(a);
  });
}

// ── Preenche estatísticas ─────────────────────────
function renderStats() {
  const t = timeTogether();

  // Slide de início
  const dateEl = document.getElementById('first-met-date');
  if (dateEl) {
    const d = CONFIG.firstMet;
    const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    dateEl.textContent = `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
  }

  // Dias juntos (destaque)
  const daysEl = document.getElementById('days-count');
  if (daysEl) daysEl.textContent = t.days;

  // Grid de stats
  const sWeeks   = document.getElementById('s-weeks');
  const sHours   = document.getElementById('s-hours');
  const sMinutes = document.getElementById('s-minutes');
  const sSeconds = document.getElementById('s-seconds');
  if (sWeeks)   sWeeks.textContent   = t.weeks;
  if (sHours)   sHours.textContent   = t.hours.toLocaleString('pt-BR');
  if (sMinutes) sMinutes.textContent = t.minutes.toLocaleString('pt-BR');
  if (sSeconds) sSeconds.textContent = t.seconds.toLocaleString('pt-BR');
}

// Atualiza segundos em tempo real no slide de stats
function startLiveTimer() {
  setInterval(() => {
    const t = timeTogether();
    const sSeconds = document.getElementById('s-seconds');
    const sMinutes = document.getElementById('s-minutes');
    if (sSeconds) sSeconds.textContent = t.seconds.toLocaleString('pt-BR');
    if (sMinutes) sMinutes.textContent = t.minutes.toLocaleString('pt-BR');
  }, 1000);
}

// ── Navegação entre slides ────────────────────────
function goTo(index) {
  if (index < 0 || index >= TOTAL) return;

  const prev = slides[currentSlide];
  const next = slides[index];

  // Anima saída
  prev.classList.add('exit-left');
  prev.classList.remove('active');
  setTimeout(() => prev.classList.remove('exit-left'), 500);

  // Anima entrada
  next.style.transform = index > currentSlide ? 'translateX(60px)' : 'translateX(-60px)';
  next.classList.add('active');
  // Força reflow antes de resetar transform
  next.getBoundingClientRect();
  next.style.transform = '';

  currentSlide = index;
  updateUI();
}

function nextSlide() { goTo(currentSlide + 1); }
function prevSlide() { goTo(currentSlide - 1); }

function updateUI() {
  // Barra de progresso
  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.width = ((currentSlide + 1) / TOTAL * 100) + '%';

  // Pontos
  dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));

  // Botões
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  if (btnPrev) btnPrev.disabled = currentSlide === 0;
  if (btnNext) btnNext.disabled = currentSlide === TOTAL - 1;
}

// ── Teclado ───────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextSlide(); }
  if (e.key === 'ArrowLeft')                    { e.preventDefault(); prevSlide(); }
});

// ── Touch / swipe ─────────────────────────────────
let touchStartX = 0;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) {
    dx < 0 ? nextSlide() : prevSlide();
  }
});

// ── Dots clicáveis ────────────────────────────────
dots.forEach((dot, i) => {
  dot.addEventListener('click', () => goTo(i));
});

// ── Init ──────────────────────────────────────────
document.body.style.opacity = '0';
window.addEventListener('load', () => {
  renderSongs();
  renderStats();
  startLiveTimer();
  updateUI();

  document.body.style.transition = 'opacity .6s ease';
  document.body.style.opacity    = '1';
});
