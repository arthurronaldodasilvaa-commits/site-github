/* ===========================
   GAMES — Jogos
   =========================== */

if (sessionStorage.getItem('quiz_passed') !== 'true') {
  window.location.replace('../index.html');
}

/* ── Opções da roleta ────────────────────────────────
   Adicione, remova ou troque as opções aqui, Arthur!
   ─────────────────────────────────────────────────── */
const WHEEL_OPTIONS = [
  { label: 'Cinema 🎬',     color: '#c0392b' },
  { label: 'Sorvete 🍦',    color: '#8e44ad' },
  { label: 'Parque 🌿',     color: '#27ae60' },
  { label: 'Jantar ✨',     color: '#d35400' },
  { label: 'Netflix 🍿',    color: '#c77dff' },
  { label: 'Karaokê 🎤',    color: '#2980b9' },
  { label: 'Picnic 🧺',     color: '#16a085' },
  { label: 'Surpresa 🎁',   color: '#ff6b9d' },
];

/* ── Canvas ──────────────────────────────────────── */
const canvas = document.getElementById('wheel-canvas');
const ctx    = canvas.getContext('2d');
const cx     = canvas.width / 2;
const cy     = canvas.height / 2;
const R      = Math.min(cx, cy) - 8;
const N      = WHEEL_OPTIONS.length;
const SLICE  = (2 * Math.PI) / N;

let currentAngle = -Math.PI / 2; // ponteiro aponta pro topo
let isSpinning   = false;

/* ── Desenhar roleta ─────────────────────────────── */
function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < N; i++) {
    const start = currentAngle + i * SLICE;
    const end   = start + SLICE;
    const opt   = WHEEL_OPTIONS[i];

    // Fatia
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, start, end);
    ctx.closePath();
    ctx.fillStyle   = opt.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.18)';
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // Texto
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + SLICE / 2);
    ctx.textAlign    = 'right';
    ctx.fillStyle    = '#fff';
    ctx.shadowColor  = 'rgba(0,0,0,.5)';
    ctx.shadowBlur   = 3;
    ctx.font         = `bold 12px 'Nunito', sans-serif`;
    ctx.fillText(opt.label, R - 12, 5);
    ctx.restore();
  }

  // Círculo central
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
  ctx.fillStyle   = '#1a0a2e';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.25)';
  ctx.lineWidth   = 2;
  ctx.stroke();
}

/* ── Resultado: opção sob o ponteiro (topo) ──────── */
function getResult() {
  // O ponteiro está no topo = ângulo -π/2 no sistema de referência fixo
  // O ângulo da fatia i começa em: currentAngle + i * SLICE
  // A fatia que cobre o topo: encontrar i onde o topo cai dentro da fatia
  const pointer = ((-Math.PI / 2 - currentAngle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
  const idx = Math.floor(pointer / SLICE) % N;
  return WHEEL_OPTIONS[idx];
}

/* ── Girar ───────────────────────────────────────── */
function spin() {
  if (isSpinning) return;
  isSpinning = true;

  const btn = document.getElementById('spin-btn');
  btn.disabled = true;

  const extraSpins  = 6 + Math.random() * 6;        // 6–12 voltas
  const extraAngle  = Math.random() * 2 * Math.PI;   // parada aleatória
  const totalAngle  = extraSpins * 2 * Math.PI + extraAngle;
  const duration    = 3500 + Math.random() * 1500;   // 3.5–5s
  const startTime   = performance.now();
  const startAngle  = currentAngle;

  function animate(now) {
    const elapsed = now - startTime;
    const t       = Math.min(elapsed / duration, 1);
    const eased   = 1 - Math.pow(1 - t, 4); // ease-out quartic

    currentAngle = startAngle + totalAngle * eased;
    drawWheel();

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning   = false;
      btn.disabled = false;
      showResult(getResult());
    }
  }

  requestAnimationFrame(animate);
}

/* ── Modal ───────────────────────────────────────── */
function showResult(option) {
  document.getElementById('result-text').textContent = option.label;
  document.getElementById('result-modal').classList.remove('hidden');
}

function closeResult() {
  document.getElementById('result-modal').classList.add('hidden');
}

document.getElementById('result-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('result-modal')) closeResult();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeResult();
  if (e.key === ' ' && !isSpinning) { e.preventDefault(); spin(); }
});

/* ── Init ────────────────────────────────────────── */
document.body.style.opacity = '0';

window.addEventListener('load', () => {
  drawWheel();

  document.body.style.transition = 'opacity .6s ease';
  document.body.style.opacity    = '1';
});
