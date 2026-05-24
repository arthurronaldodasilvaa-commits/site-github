/* ===========================
   QUIZ — Lógica de validação
   =========================== */

// Respostas corretas (formato DD/MM/AAAA)
const ANSWERS = {
  1: '17/07/2009', // Aniversário do Arthur
  2: '28/03/2026', // Data que se conheceram
  3: '21/11/2007', // Aniversário da Mariana
};

// Normaliza a entrada do usuário: remove traços e pontos, deixa só dígitos e /
function normalize(str) {
  return str.replace(/[-.\s]/g, '/').trim();
}

// ── Controle de telas ──────────────────────────────

let transitioning = false;

function showScreen(id) {
  if (transitioning) return;
  transitioning = true;

  const current = document.querySelector('.quiz-screen.active');

  if (current) {
    current.classList.add('exit');
    setTimeout(() => {
      current.classList.remove('active', 'exit');
      openScreen(id);
    }, 420);
  } else {
    openScreen(id);
  }
}

function openScreen(id) {
  const next = document.getElementById('screen-' + id);
  next.classList.add('active');

  const input = next.querySelector('.answer-input');
  if (input) input.focus();

  transitioning = false;
}

// ── Ações dos botões ──────────────────────────────

function startQuiz() {
  showScreen('q1');
}

function checkAnswer(n) {
  const input    = document.getElementById('answer-q' + n);
  const feedback = document.getElementById('feedback-q' + n);
  const value    = normalize(input.value);

  clearFeedback(input, feedback);

  if (value === ANSWERS[n]) {
    // ✅ Certo
    input.classList.add('correct');
    feedback.textContent = '✓ Certo! 💕';
    feedback.className   = 'input-feedback correct';

    setTimeout(() => {
      if (n < 3) {
        showScreen('q' + (n + 1));
      } else {
        // Todas as 3 corretas → sucesso
        sessionStorage.setItem('quiz_passed', 'true');
        showScreen('success');
        setTimeout(() => {
          window.location.href = 'board.html';
        }, 2600);
      }
    }, 700);

  } else {
    // ❌ Errado
    input.classList.add('wrong');
    feedback.textContent = '✗ Hmm, tenta de novo 🤔';
    feedback.className   = 'input-feedback wrong';

    setTimeout(() => {
      clearFeedback(input, feedback);
      input.value = '';
      input.focus();
    }, 1800);
  }
}

function clearFeedback(input, feedback) {
  input.classList.remove('correct', 'wrong');
  feedback.textContent = '';
  feedback.className   = 'input-feedback';
}

// ── Auto-format DD/MM/AAAA ────────────────────────

function setupDateInput(id) {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener('input', (e) => {
    let raw = e.target.value.replace(/\D/g, '');       // só números
    if (raw.length > 2) raw = raw.slice(0,2) + '/' + raw.slice(2);
    if (raw.length > 5) raw = raw.slice(0,5) + '/' + raw.slice(5, 9);
    e.target.value = raw;
  });
}

setupDateInput('answer-q1');
setupDateInput('answer-q2');
setupDateInput('answer-q3');

// ── Enter como atalho ─────────────────────────────

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const active = document.querySelector('.quiz-screen.active');
  if (!active) return;
  const id = active.id;
  if      (id === 'screen-welcome') startQuiz();
  else if (id === 'screen-q1')      checkAnswer(1);
  else if (id === 'screen-q2')      checkAnswer(2);
  else if (id === 'screen-q3')      checkAnswer(3);
});

// ── Partículas (estrelas no fundo) ───────────────

function initStars() {
  const canvas = document.getElementById('particles');
  const ctx    = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const stars = Array.from({ length: 130 }, () => ({
    x:       Math.random() * window.innerWidth,
    y:       Math.random() * window.innerHeight,
    r:       Math.random() * 1.4 + 0.3,
    phase:   Math.random() * Math.PI * 2,
    speed:   Math.random() * 0.018 + 0.005,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.phase += s.speed;
      const alpha = 0.25 + Math.sin(s.phase) * 0.45;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 200, 230, ${alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ── Pétalas flutuantes ────────────────────────────

function createPetals() {
  const container = document.getElementById('petals');
  const emojis    = ['🌸', '🌺', '🌷', '🌹', '💮'];

  for (let i = 0; i < 18; i++) {
    const el        = document.createElement('div');
    el.className    = 'petal';
    el.textContent  = emojis[i % emojis.length];
    el.style.left   = Math.random() * 100 + 'vw';
    el.style.animationDuration  = (9 + Math.random() * 10) + 's';
    el.style.animationDelay     = (-Math.random() * 18)    + 's';
    el.style.fontSize           = (.75 + Math.random() * .7) + 'rem';
    container.appendChild(el);
  }
}

// ── Init ─────────────────────────────────────────

// Se já passou do quiz nessa sessão, vai direto pro board
if (sessionStorage.getItem('quiz_passed') === 'true') {
  window.location.replace('board.html');
}

initStars();
createPetals();
