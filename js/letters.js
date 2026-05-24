/* ===========================
   LETTERS — Cartinhas
   =========================== */

if (sessionStorage.getItem('quiz_passed') !== 'true') {
  window.location.replace('../index.html');
}

/* ── Storage (Firebase ou localStorage) ─────────────
   Se CONFIG.firebaseUrl estiver preenchido → Firebase (sincroniza entre celulares!)
   Se não → localStorage (salva só neste dispositivo)
   ─────────────────────────────────────────────────── */
const USE_FIREBASE = !!(window.CONFIG && CONFIG.firebaseUrl && CONFIG.firebaseUrl.trim() !== '');
const LS_KEY       = 'shawty_letters_v2';
const FB_URL       = USE_FIREBASE ? CONFIG.firebaseUrl.replace(/\/$/, '') + '/letters' : null;

async function storageGet() {
  if (USE_FIREBASE) {
    try {
      const r    = await fetch(FB_URL + '.json');
      const data = await r.json();
      return data && typeof data === 'object'
        ? data
        : { mariToArthur: {}, arthurToMari: {} };
    } catch {
      return { mariToArthur: {}, arthurToMari: {} };
    }
  }
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) ||
           { mariToArthur: {}, arthurToMari: {} };
  } catch { return { mariToArthur: {}, arthurToMari: {} }; }
}

async function storageAdd(envelope, letter) {
  if (USE_FIREBASE) {
    await fetch(`${FB_URL}/${envelope}.json`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(letter),
    });
  } else {
    const d = await storageGet();
    if (!d[envelope]) d[envelope] = {};
    d[envelope][Date.now()] = letter;
    localStorage.setItem(LS_KEY, JSON.stringify(d));
  }
}

async function storageDelete(envelope, key) {
  if (USE_FIREBASE) {
    await fetch(`${FB_URL}/${envelope}/${key}.json`, { method: 'DELETE' });
  } else {
    const d = await storageGet();
    if (d[envelope]) delete d[envelope][key];
    localStorage.setItem(LS_KEY, JSON.stringify(d));
  }
}

/* ── Estado ──────────────────────────────────────── */
let allLetters  = { mariToArthur: {}, arthurToMari: {} };
let currentFrom = 'arthur'; // quem está escrevendo

/* ── Helpers ─────────────────────────────────────── */
function sorted(env) {
  const obj = allLetters[env] || {};
  return Object.entries(obj)
    .sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0));
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ── Renderizar envelopes ─────────────────────────── */
function renderEnvelope(env, listId, countId) {
  const listEl  = document.getElementById(listId);
  const countEl = document.getElementById(countId);
  const letters = sorted(env);

  countEl.textContent = letters.length;

  if (letters.length === 0) {
    listEl.innerHTML = `
      <div class="envelope-empty">
        <span class="envelope-empty-icon">💌</span>
        <p>Nenhuma cartinha ainda...</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = letters.map(([key, l]) => `
    <div class="letter-card" onclick="openLetter('${env}','${key}')">
      <div class="letter-card-top">
        <span class="letter-card-title">${esc(l.title)}</span>
        <button
          class="letter-card-del"
          onclick="event.stopPropagation(); deleteLetter('${env}','${key}')"
          title="Apagar"
        >✕</button>
      </div>
      <span class="letter-card-date">${fmtDate(l.date)}</span>
    </div>
  `).join('');
}

function renderAll() {
  renderEnvelope('mariToArthur', 'list-mari',   'count-mari');
  renderEnvelope('arthurToMari', 'list-arthur', 'count-arthur');
}

/* ── Ler carta ───────────────────────────────────── */
function openLetter(env, key) {
  const letter = (allLetters[env] || {})[key];
  if (!letter) return;

  const isMari = env === 'mariToArthur';
  document.getElementById('read-from').textContent    = isMari ? '🌷 Da Mari para o Arthur' : '🌸 Do Arthur para a Mari';
  document.getElementById('read-title').textContent   = letter.title   || '';
  document.getElementById('read-date').textContent    = fmtDate(letter.date);
  document.getElementById('read-content').textContent = letter.content || '';

  document.getElementById('modal-read').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeRead() {
  document.getElementById('modal-read').classList.add('hidden');
  document.body.style.overflow = '';
}

/* ── Apagar carta ────────────────────────────────── */
async function deleteLetter(env, key) {
  if (!confirm('Apagar essa cartinha? 🥺')) return;
  await storageDelete(env, key);
  if (allLetters[env]) delete allLetters[env][key];
  renderAll();
  closeRead();
}

/* ── Escrever carta ──────────────────────────────── */
function openWrite() {
  setFrom('arthur'); // padrão
  document.getElementById('form-title').value   = '';
  document.getElementById('form-date').value    = new Date().toISOString().slice(0, 10);
  document.getElementById('form-content').value = '';
  document.getElementById('modal-write').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('form-title').focus(), 80);
}

function closeWrite() {
  document.getElementById('modal-write').classList.add('hidden');
  document.body.style.overflow = '';
}

function setFrom(who) {
  currentFrom = who;
  document.getElementById('from-arthur-btn').classList.toggle('active', who === 'arthur');
  document.getElementById('from-mari-btn').classList.toggle('active',   who === 'mari');
}

async function saveLetter() {
  const title   = document.getElementById('form-title').value.trim();
  const date    = document.getElementById('form-date').value;
  const content = document.getElementById('form-content').value.trim();

  if (!title) {
    document.getElementById('form-title').focus();
    document.getElementById('form-title').classList.add('input-error');
    setTimeout(() => document.getElementById('form-title').classList.remove('input-error'), 1200);
    return;
  }
  if (!content) {
    document.getElementById('form-content').focus();
    document.getElementById('form-content').classList.add('input-error');
    setTimeout(() => document.getElementById('form-content').classList.remove('input-error'), 1200);
    return;
  }

  const envelope = currentFrom === 'mari' ? 'mariToArthur' : 'arthurToMari';
  const letter   = { title, date, content, createdAt: Date.now() };

  const btn = document.getElementById('btn-save');
  btn.disabled    = true;
  btn.textContent = 'Salvando... 💕';

  try {
    await storageAdd(envelope, letter);
    allLetters = await storageGet();
    renderAll();
    closeWrite();
  } catch (e) {
    alert('Erro ao salvar. Tente novamente.');
    console.error(e);
  }

  btn.disabled    = false;
  btn.textContent = 'Guardar Cartinha 💌';
}

/* ── Indicador de storage ────────────────────────── */
function showStorageIndicator() {
  const el = document.getElementById('storage-indicator');
  if (!el) return;
  if (USE_FIREBASE) {
    el.textContent = '☁️ sincronizado';
    el.className   = 'storage-ind storage-firebase';
    el.title       = 'As cartas sincronizam entre os dois celulares via Firebase';
  } else {
    el.textContent = '💾 só neste celular';
    el.className   = 'storage-ind storage-local';
    el.title       = 'Configure firebaseUrl em js/config.js para sincronizar com a Mari';
  }
}

/* ── Eventos ─────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeRead(); closeWrite(); }
});

document.getElementById('modal-read').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-read')) closeRead();
});

document.getElementById('modal-write').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-write')) closeWrite();
});

/* ── Init ────────────────────────────────────────── */
document.body.style.opacity = '0';

window.addEventListener('load', async () => {
  allLetters = await storageGet();
  renderAll();
  showStorageIndicator();

  document.body.style.transition = 'opacity .6s ease';
  document.body.style.opacity    = '1';
});
