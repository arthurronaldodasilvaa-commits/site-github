/* ===========================
   TIMER — Tempo Juntos
   =========================== */

if (sessionStorage.getItem('quiz_passed') !== 'true') {
  window.location.replace('../index.html');
}

const START = new Date(2026, 2, 28, 0, 0, 0); // 28 de Março de 2026, meia-noite

/* ── Marcos ──────────────────────────────────────── */
const MILESTONES = [
  { days: 7,   label: '1 semana juntos 🎉' },
  { days: 30,  label: '1 mês juntos 🌸'    },
  { days: 50,  label: '50 dias 💫'          },
  { days: 100, label: '100 dias 💕'         },
  { days: 150, label: '150 dias ✨'         },
  { days: 200, label: '200 dias 🌷'         },
  { days: 365, label: '1 ano juntos 🎊'     },
  { days: 500, label: '500 dias 💞'         },
  { days: 730, label: '2 anos juntos 💍'    },
];

/* ── Cálculo hierárquico ─────────────────────────────
   Exibe: anos | meses (0–11) | semanas (0–4) | dias (0–6)
           horas (0–23) | minutos (0–59) | segundos (0–59)
   ─────────────────────────────────────────────────── */
function getElapsed() {
  const now = new Date();
  const ms  = Math.max(0, now - START);

  // Horas, minutos e segundos a partir do total acumulado
  const totalSecs = Math.floor(ms / 1000);
  const secs  = totalSecs % 60;
  const mins  = Math.floor(totalSecs / 60) % 60;
  const hours = Math.floor(totalSecs / 3600) % 24;

  // Anos e meses usando calendário
  let years  = now.getFullYear() - START.getFullYear();
  let months = now.getMonth()    - START.getMonth();
  if (months < 0) { years--; months += 12; }
  if (now.getDate() < START.getDate()) {
    months--;
    if (months < 0) { years--; months += 12; }
  }

  // Última data de aniversário mensal
  const lastAnniv = new Date(
    START.getFullYear() + years,
    START.getMonth()    + months,
    START.getDate(),
    0, 0, 0
  );
  const daysSinceAnniv = Math.floor((now - lastAnniv) / 86400000);
  const weeks = Math.floor(daysSinceAnniv / 7);
  const days  = daysSinceAnniv % 7;

  return { anos: years, meses: months, semanas: weeks, dias: days, horas: hours, minutos: mins, segundos: secs };
}

/* ── Atualiza DOM ────────────────────────────────── */
function updateCounters() {
  const e = getElapsed();
  document.getElementById('n-anos').textContent     = e.anos;
  document.getElementById('n-meses').textContent    = e.meses;
  document.getElementById('n-semanas').textContent  = e.semanas;
  document.getElementById('n-dias').textContent     = e.dias;
  document.getElementById('n-horas').textContent    = e.horas;
  document.getElementById('n-minutos').textContent  = e.minutos;
  document.getElementById('n-segundos').textContent = e.segundos;
}

/* ── Milestones ──────────────────────────────────── */
function renderMilestones() {
  const now  = new Date();
  const list = document.getElementById('milestones-list');

  MILESTONES.forEach(m => {
    const target   = new Date(START.getTime() + m.days * 86400000);
    const diff     = target - now;
    const reached  = diff <= 0;
    const daysLeft = Math.ceil(diff / 86400000);

    const dateStr  = target.toLocaleDateString('pt-BR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

    const item = document.createElement('div');
    item.className = 'milestone-item' + (reached ? ' reached' : '');
    item.innerHTML = `
      <span class="milestone-icon">${reached ? '✓' : '🌸'}</span>
      <div class="milestone-info">
        <span class="milestone-label">${m.label}</span>
        <span class="milestone-date">${dateStr}</span>
      </div>
      <span class="milestone-countdown">${
        reached
          ? 'alcançado! 🎉'
          : `faltam ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`
      }</span>
    `;
    list.appendChild(item);
  });
}

/* ── Init ────────────────────────────────────────── */
document.body.style.opacity = '0';

window.addEventListener('load', () => {
  renderMilestones();
  updateCounters();
  setInterval(updateCounters, 1000);

  document.body.style.transition = 'opacity .6s ease';
  document.body.style.opacity    = '1';
});
