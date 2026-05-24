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

let fbError = null; // guarda mensagem de erro do Firebase (null = sem erro)

/* ── storageGet ──────────────────────────────────── */
async function storageGet() {
  if (USE_FIREBASE) {
    try {
      const r    = await fetch(FB_URL + '.json');
      const data = await r.json();

      // Firebase retorna { "error": "..." } quando as regras bloqueiam acesso
      if (data && data.error) {
        fbError = 'Regras bloqueadas no Firebase. Vá em: Firebase Console → Realtime Database → Rules e mude ".read" e ".write" para true.';
        return { mariToArthur: {}, arthurToMari: {} };
      }

      fbError = null;
      return data && typeof data === 'object'
        ? data
        : { mariToArthur: {}, arthurToMari: {} };
    } catch (e) {
      fbError = 'Sem conexão com Firebase: ' + e.message;
      return { mariToArthur: {}, arthurToMari: {} };
    }
  }
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) ||
           { mariToArthur: {}, arthurToMari: {} };
  } catch { return { mariToArthur: {}, arthurToMari: {} }; }
}

/* ── storageAdd ──────────────────────────────────── */
async function storageAdd(envelope, letter) {
  if (USE_FIREBASE) {
    try {
      const r = await fetch(`${FB_URL}/${envelope}.json`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(letter),
      });
      const data = await r.json();
      // Firebase bloqueado → cai no localStorage como fallback
      if (!r.ok || (data && data.error)) {
        fbError = data?.error || 'Erro Firebase ' + r.status;
        throw new Error(fbError);
      }
      fbError = null;
      return; // sucesso no Firebase
    } catch (e) {
      fbError = fbError || e.message;
      // Fallback: salva localmente para não perder a carta
      const d = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
      if (!d[envelope]) d[envelope] = {};
      d[envelope][Date.now()] = { ...letter, _pendingSync: true };
      localStorage.setItem(LS_KEY, JSON.stringify(d));
      // Re-lança para o saveLetter mostrar aviso ao usuário
      throw e;
    }
  } else {
    const d = await storageGet();
    if (!d[envelope]) d[envelope] = {};
    d[envelope][Date.now()] = letter;
    localStorage.setItem(LS_KEY, JSON.stringify(d));
  }
}

/* ── storageDelete ───────────────────────────────── */
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

/* ── Sync automático ─────────────────────────────── */
async function syncNow(silent = false) {
  if (!USE_FIREBASE) return;
  if (!silent) updateSyncIndicator('syncing');
  allLetters = await storageGet();
  renderAll();
  updateSyncIndicator(fbError ? 'error' : 'ok');
}

function updateSyncIndicator(state) {
  const el = document.getElementById('storage-indicator');
  if (!el || !USE_FIREBASE) return;

  const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (state === 'syncing') {
    el.textContent = '↺ sincronizando...';
    el.className   = 'storage-ind storage-firebase';
    el.title       = '';
  } else if (state === 'error') {
    el.textContent = '⚠️ sem acesso';
    el.className   = 'storage-ind storage-error';
    el.title       = fbError || 'Erro Firebase';
  } else {
    el.textContent = `☁️ ${now}`;
    el.className   = 'storage-ind storage-firebase';
    el.title       = 'Toque para sincronizar agora';
  }
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
    // Firebase OK: lê de lá
    allLetters = await storageGet();
    renderAll();
    if (USE_FIREBASE) updateSyncIndicator(fbError ? 'error' : 'ok');
    closeWrite();
  } catch (e) {
    if (USE_FIREBASE) {
      // Carta já foi salva no localStorage como fallback — exibe ela na tela
      const local = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
      allLetters  = local;
      renderAll();
      updateSyncIndicator('error');
      closeWrite();
      // Toast discreto em vez de alert bloqueante
      showToast('⚠️ Salvo só aqui por enquanto. Firebase bloqueado — arrume as regras.');
    } else {
      alert('Erro ao salvar. Tente novamente.');
    }
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
    el.style.cursor = 'pointer';
    el.onclick      = () => syncNow();
    updateSyncIndicator(fbError ? 'error' : 'ok');
  } else {
    el.textContent = '💾 só neste celular';
    el.className   = 'storage-ind storage-local';
    el.title       = 'Configure firebaseUrl em js/config.js para sincronizar com a Mari';
  }
}

/* ── Toast de aviso ─────────────────────────────── */
function showToast(msg) {
  let t = document.getElementById('letters-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'letters-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 4000);
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

  if (USE_FIREBASE) {
    // Sincroniza a cada 30 segundos automaticamente
    setInterval(() => syncNow(true), 30000);

    // Sincroniza ao voltar para a aba (ex: Mari abre o site e Arthur já escreveu)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) syncNow(true);
    });
  }

  document.body.style.transition = 'opacity .6s ease';
  document.body.style.opacity    = '1';
});
