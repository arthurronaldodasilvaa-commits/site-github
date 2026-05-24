/* ===========================
   BOARD — Interatividade
   =========================== */

// ── Proteção do quiz ──────────────────────────────
if (sessionStorage.getItem('quiz_passed') !== 'true') {
  window.location.replace('index.html');
}

// ── Navegação com efeito de fade ──────────────────
function navigate(url) {
  document.body.style.transition = 'opacity .4s ease';
  document.body.style.opacity = '0';
  setTimeout(() => window.location.href = url, 400);
}

// ── Luzes de varalzinho ───────────────────────────
const BULB_COLORS = [
  '#ff6b9d', // rosa
  '#c77dff', // roxo
  '#6b9dff', // azul
  '#ffd700', // dourado
  '#ff8fab', // rosa claro
  '#4ade80', // verde
];

function createLights() {
  const bar    = document.getElementById('lights');
  const total  = Math.floor(window.innerWidth / 60);

  for (let i = 0; i < total; i++) {
    const bulb = document.createElement('div');
    bulb.className = 'light-bulb';

    const color = BULB_COLORS[i % BULB_COLORS.length];
    bulb.style.setProperty('--bulb-color', color);
    bulb.style.background = color;
    bulb.style.left        = (i * (100 / total)) + '%';
    bulb.style.setProperty('--dur',   (1.5 + Math.random() * 2.5) + 's');
    bulb.style.setProperty('--delay', (Math.random() * 3) + 's');

    bar.appendChild(bulb);
  }
}

// ── Cordas SVG entre os cartões ───────────────────
// Cada entrada: [fromId, toId, cor, espessura]
const CONNECTIONS = [
  ['card-title',    'card-spotify',   '#ff6b9d', 1.8],
  ['card-title',    'card-timer',     '#ff6b9d', 1.8],
  ['card-spotify',  'card-foiassim',  '#c77dff', 1.5],
  ['card-spotify',  'card-album',     '#c77dff', 1.4],
  ['card-album',    'card-letters',   '#ff8fab', 1.4],
  ['card-timer',    'card-games',     '#6b9dff', 1.4],
  ['card-album',    'card-games',     '#ffb3c6', 1.2],
  ['card-title',    'card-letters',   '#c77dff', 1.1],
  ['card-title',    'card-playlist',  '#9b5de5', 1.6],
  ['card-foiassim', 'card-playlist',  '#c77dff', 1.2],
];

// Droop: quanto a corda "afunda" no meio (simula gravidade)
const DROOP = 36;

function getCenter(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function drawStrings() {
  const svg  = document.getElementById('strings-svg');
  svg.innerHTML = ''; // limpa antes de redesenhar

  // Só desenha em desktop
  if (window.innerWidth <= 768) return;

  CONNECTIONS.forEach(([fromId, toId, color, width]) => {
    const fromEl = document.getElementById(fromId);
    const toEl   = document.getElementById(toId);
    if (!fromEl || !toEl) return;

    const p1 = getCenter(fromEl);
    const p2 = getCenter(toEl);

    // Ponto de controle quadrático: meio + droop pra baixo
    const cx = (p1.x + p2.x) / 2;
    const cy = (p1.y + p2.y) / 2 + DROOP;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`);
    path.setAttribute('stroke',       color);
    path.setAttribute('stroke-width', width);
    path.setAttribute('fill',         'none');
    path.setAttribute('opacity',      '0.65');
    path.setAttribute('stroke-linecap', 'round');

    svg.appendChild(path);
  });
}

// ── Partículas de poeira (fundo) ──────────────────
function initDust() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  let rafId, resizeTimer;

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      drawStrings();
      document.getElementById('lights').innerHTML = '';
      createLights();
    }, 150);
  });

  const particles = Array.from({ length: 60 }, () => ({
    x:     Math.random() * canvas.width,
    y:     Math.random() * canvas.height,
    r:     Math.random() * 1.2 + .2,
    vx:    (Math.random() - .5) * .18,
    vy:    (Math.random() - .5) * .18,
    alpha: Math.random() * .35 + .05,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x = (p.x + p.vx + canvas.width)  % canvas.width;
      p.y = (p.y + p.vy + canvas.height) % canvas.height;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,183,197,${p.alpha})`;
      ctx.fill();
    });
    rafId = requestAnimationFrame(draw);
  }
  draw();

  // Pausa o loop quando a aba está oculta (economiza bateria)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else draw();
  });
}

// ── Fade-in ao carregar ───────────────────────────
document.body.style.opacity = '0';
window.addEventListener('load', () => {
  document.body.style.transition = 'opacity .6s ease';
  document.body.style.opacity    = '1';

  createLights();
  drawStrings();
  initDust();
});

// Resize já é tratado dentro de initDust()
