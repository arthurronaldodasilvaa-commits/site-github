/* ===========================
   LETTERS — Cartinhas
   =========================== */

if (sessionStorage.getItem('quiz_passed') !== 'true') {
  window.location.replace('../index.html');
}

/* ── Cartas ──────────────────────────────────────────
   Para adicionar uma carta, copie o bloco abaixo e
   preencha title, date e content:

   {
     title:   'Título da cartinha',
     date:    'Data',
     emoji:   '💌',
     content: `Mari,

Escreva aqui o conteúdo da carta...

— Arthur 🌷`,
   },
   ─────────────────────────────────────────────────── */
const LETTERS = [
  // Adicione as cartinhas aqui quando quiser, Arthur!
];

/* ── Renderizar ──────────────────────────────────── */
function render() {
  const main = document.getElementById('letters-main');

  if (LETTERS.length === 0) {
    main.innerHTML = `
      <div class="letters-empty">
        <span class="letters-empty-icon">💌</span>
        <p class="letters-empty-title">em breve...</p>
        <p class="letters-empty-sub">As cartinhas ainda estão sendo escritas com muito carinho. 🌷</p>
      </div>
    `;
    return;
  }

  const list = document.createElement('div');
  list.className = 'letters-list';

  LETTERS.forEach((letter, i) => {
    const card = document.createElement('div');
    card.className = 'envelope-card';
    card.innerHTML = `
      <span class="envelope-icon">${letter.emoji || '💌'}</span>
      <div class="envelope-info">
        <p class="envelope-title">${letter.title}</p>
        <p class="envelope-date">${letter.date || ''}</p>
      </div>
      <span class="envelope-arrow">›</span>
    `;
    card.addEventListener('click', () => openLetter(i));
    list.appendChild(card);
  });

  main.appendChild(list);
}

/* ── Abrir carta ─────────────────────────────────── */
function openLetter(i) {
  const letter = LETTERS[i];
  const modal  = document.getElementById('letter-modal');
  const inner  = document.getElementById('letter-inner');

  inner.innerHTML = `<span class="letter-greeting">Mari,</span>${escapeHtml(letter.content)}<span class="letter-sign">— Arthur 🌷</span>`;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLetter() {
  document.getElementById('letter-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLetter();
});

document.getElementById('letter-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('letter-modal')) closeLetter();
});

/* ── Init ────────────────────────────────────────── */
document.body.style.opacity = '0';

window.addEventListener('load', () => {
  render();
  document.body.style.transition = 'opacity .6s ease';
  document.body.style.opacity    = '1';
});
