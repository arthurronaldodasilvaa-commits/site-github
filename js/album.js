/* ===========================
   ALBUM — Nosso Álbum
   =========================== */

if (sessionStorage.getItem('quiz_passed') !== 'true') {
  window.location.replace('../index.html');
}

/* ── Spreads ─────────────────────────────────────────
   Para adicionar uma foto: coloque o arquivo em
     assets/imagens/nossas-fotos/nome.jpg
   e troque photo: null por photo: "nome.jpg".

   Para adicionar texto: edite chapter, date, lines[].
   ─────────────────────────────────────────────────── */
const SPREADS = [
  {
    chapter:    'Primeiro beijo 😘',
    date:       '',
    decoration: '💋',
    photo:      '1° bjo.jpeg',
    caption:    '07/04/2026',
    note:       '',
    lines: [
      'Antes mesmo do tocar de nossos lábios,',
      'eu já tinha certeza de que teria',
      'conhecido o amor...',
    ],
  },
];

/* ── Estado ──────────────────────────────────────── */
let currentIdx = 0;
let animating  = false;

/* ── Renderizar spread ───────────────────────────── */
function renderSpread(spread) {
  let photoHTML;
  if (spread.photo) {
    photoHTML = `<img src="../assets/imagens/nossas-fotos/${spread.photo}" alt="" />`;
  } else if (spread.note) {
    photoHTML = `
      <span class="polaroid-placeholder-icon">📷</span>
      <span class="polaroid-placeholder-text">${spread.note}</span>
    `;
  } else {
    photoHTML = '';
  }

  const captionHTML = spread.caption
    ? `<p class="polaroid-caption">${spread.caption}</p>`
    : '';

  const linesHTML = spread.lines.map(line => {
    const isPlaceholder = line.startsWith('(');
    return `<span class="page-line${isPlaceholder ? ' placeholder' : ''}">${line}</span>`;
  }).join('');

  const el = document.createElement('div');
  el.className = 'book-spread';
  el.innerHTML = `
    <div class="page-left">
      <div class="polaroid">
        <div class="polaroid-photo">${photoHTML}</div>
        ${captionHTML}
      </div>
    </div>
    <div class="page-right">
      ${spread.decoration ? `<span class="page-decoration">${spread.decoration}</span>` : ''}
      ${spread.chapter    ? `<h2 class="page-chapter">${spread.chapter}</h2>` : ''}
      ${spread.date       ? `<p class="page-date">${spread.date}</p>` : ''}
      ${linesHTML         ? `<div class="page-lines">${linesHTML}</div>` : ''}
    </div>
  `;
  return el;
}

/* ── Navegação ───────────────────────────────────── */
function goTo(newIdx, direction) {
  if (animating) return;
  animating = true;

  const container = document.getElementById('spread-container');
  const oldSpread = container.querySelector('.book-spread');
  const newSpread = renderSpread(SPREADS[newIdx]);

  const outClass = direction === 'next' ? 'slide-out-left'  : 'slide-out-right';
  const inClass  = direction === 'next' ? 'slide-in-right'  : 'slide-in-left';

  oldSpread.classList.add(outClass);
  oldSpread.addEventListener('animationend', () => {
    container.innerHTML = '';
    newSpread.classList.add(inClass);
    container.appendChild(newSpread);
    newSpread.addEventListener('animationend', () => {
      newSpread.classList.remove(inClass);
      animating = false;
    }, { once: true });
  }, { once: true });

  currentIdx = newIdx;
  updateNav();
}

function nextSpread() { if (currentIdx < SPREADS.length - 1) goTo(currentIdx + 1, 'next'); }
function prevSpread() { if (currentIdx > 0) goTo(currentIdx - 1, 'prev'); }

function updateNav() {
  document.getElementById('btn-prev').disabled = currentIdx === 0;
  document.getElementById('btn-next').disabled = currentIdx === SPREADS.length - 1;
  document.getElementById('spread-counter').textContent =
    `${currentIdx + 1} de ${SPREADS.length}`;
}

/* ── Abrir capa ──────────────────────────────────── */
function openBook() {
  const cover   = document.getElementById('book-cover');
  const wrapper = document.getElementById('book-wrapper');
  cover.classList.add('hidden');
  setTimeout(() => wrapper.classList.remove('hidden'), 300);
}

/* ── Teclado ─────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') nextSpread();
  if (e.key === 'ArrowLeft')  prevSpread();
  if (e.key === 'Enter' && !document.getElementById('book-cover').classList.contains('hidden')) {
    openBook();
  }
});

/* ── Init ────────────────────────────────────────── */
document.body.style.opacity = '0';

window.addEventListener('load', () => {
  const container = document.getElementById('spread-container');
  container.appendChild(renderSpread(SPREADS[0]));
  updateNav();

  document.body.style.transition = 'opacity .6s ease';
  document.body.style.opacity    = '1';
});
