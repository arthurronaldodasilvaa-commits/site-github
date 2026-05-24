/* ===========================
   FOI ASSIM — Player logic
   =========================== */

if (sessionStorage.getItem('quiz_passed') !== 'true') {
  window.location.replace('../index.html');
}

/* ── Letra — "Foi Assim" de Sotam ─────────────────── */
const LYRICS = [
  { text: '[Refrão]',                                                    type: 'section' },
  { text: 'E foi assim'                                                                  },
  { text: 'Quando eu te vi a primeira vez'                                               },
  { text: 'Você duvidava da minha cara, me chamava de canalha'                          },
  { text: 'Mas hoje o tempo passou e olha só o que a gente fez'                         },
  { text: 'E quando eu vi'                                                               },
  { text: 'Num piscar de olhos, me entreguei'                                           },
  { text: 'Agora não penso mais em nada além de te ter em casa'                         },
  { text: 'Virou minha namorada que me chama de meu bem'                                },

  { text: '',                                                            type: 'empty'   },

  { text: '[Bridge]',                                                    type: 'section' },
  { text: 'E eu fui'                                                                     },
  { text: 'Sem querer, mudei'                                                           },
  { text: 'Já não sou tão só'                                                           },
  { text: 'Sei que eu sou ruim, mas sem você eu já fui pior'                            },
  { text: 'Se eu esqueci de mim, foi pra conhecer nóis'                                 },
  { text: 'É simples assim'                                                              },
  { text: 'Se é amor, não dói'                                                           },

  { text: '',                                                            type: 'empty'   },

  { text: '[Verso]',                                                     type: 'section' },
  { text: 'Vou até à porta da tua casa, toco a campainha'                               },
  { text: 'Flores escondidas pra dar pra minha companhia'                               },
  { text: 'Minha companheira, minha prometida, quero todo dia'                          },
  { text: 'Te busco na sexta e te levo na quinta e volta a fita'                        },
  { text: 'Pela avenida, luzes brilham, só não mais que a sua'                          },
  { text: 'Só não mais que a cura que cê trouxe pra minha vida'                         },
  { text: 'Pega o beck e pila, a calcinha tira e vem por cima'                          },
  { text: 'Fala meu nome no ouvido com a voz fina, quem diria?'                         },
  { text: 'Logo eu que não valia nada, tenho tudo'                                      },
  { text: 'Uma mina foda com pensamento maduro'                                         },
  { text: 'Que não tem medo do mundo, mas me abraça no escuro'                          },
  { text: 'Que fala que a vida é linda e minha vida é te ter junto'                     },
  { text: 'Tem mó cara de malvada, mas tem o coração puro'                             },
  { text: 'Penso em você a cada segundo'                                                },
  { text: 'A cada mina que me cerca pela fama e pelo lucro'                             },
  { text: 'Encontrei você dizendo que não liga se eu for duro'                          },
  { text: 'Aí não deu'                                                                   },

  { text: '',                                                            type: 'empty'   },

  { text: '[Refrão]',                                                    type: 'section' },
  { text: 'E foi assim'                                                                  },
  { text: 'Quando eu te vi a primeira vez'                                               },
  { text: 'Você duvidava da minha cara, me chamava de canalha'                          },
  { text: 'Mas hoje o tempo passou e olha só o que a gente fez'                         },
  { text: 'E quando eu vi'                                                               },
  { text: 'Num piscar de olhos, me entreguei'                                           },
  { text: 'Agora não penso mais em nada além de te ter em casa'                         },
  { text: 'Virou minha namorada que me chama de meu bem'                                },

  { text: '',                                                            type: 'empty'   },

  { text: '[Bridge]',                                                    type: 'section' },
  { text: 'E eu fui'                                                                     },
  { text: 'Sem querer, mudei'                                                           },
  { text: 'Já não sou tão só'                                                           },
  { text: 'Sei que eu sou ruim, mas sem você eu fui pior'                               },
  { text: 'Se eu esqueci de mim, foi pra conhecer nóis'                                 },
  { text: 'É simples assim (é simples assim)'                                            },
  { text: 'Se é amor, não dói'                                                           },

  { text: '',                                                            type: 'empty'   },
  { text: '(Rob, desliga esse beat)'                                                     },
];

/* ── Áudio ───────────────────────────────────────── */
let audioEl       = null;
let totalDuration = 147; // fallback em segundos

function initAudio() {
  const el = document.getElementById('song-audio');
  if (!el) return;

  const syncDuration = () => {
    if (el.duration && isFinite(el.duration)) {
      totalDuration = el.duration;
      timeTotal.textContent = fmt(el.duration);
    }
  };

  el.addEventListener('loadedmetadata', syncDuration);
  el.addEventListener('canplay',        syncDuration);
  el.addEventListener('canplaythrough', syncDuration);

  audioEl = el;
}

/* ── Estado ──────────────────────────────────────── */
let isPlaying     = false;
let currentTime   = 0;
let lastTimestamp = null;
let rafId         = null;
let liked         = false;

/* ── DOM ─────────────────────────────────────────── */
const playBtn       = document.getElementById('play-btn');
const progressFill  = document.getElementById('prog-fill');
const progressThumb = document.getElementById('prog-thumb');
const timeCurrent   = document.getElementById('time-current');
const timeTotal     = document.getElementById('time-total');
const lyricsEl      = document.getElementById('lyrics-body');

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = String(Math.floor(sec % 60)).padStart(2, '0');
  return `${m}:${s}`;
}

/* ── Renderizar letra (estática) ─────────────────── */
function renderLyrics() {
  lyricsEl.innerHTML = '';

  LYRICS.forEach(line => {
    const div = document.createElement('div');

    if (line.type === 'empty') {
      div.className = 'lyric-line empty-line';
    } else if (line.type === 'section') {
      div.className = 'lyric-line section-tag';
      div.textContent = line.text;
    } else {
      div.className = 'lyric-line';
      div.textContent = line.text;
    }

    lyricsEl.appendChild(div);
  });
}

/* ── Progresso ───────────────────────────────────── */
function updateProgress(time) {
  const pct = (time / totalDuration) * 100;
  progressFill.style.width = pct + '%';
  progressThumb.style.left = pct + '%';
  timeCurrent.textContent  = fmt(time);
}

/* ── Loop ────────────────────────────────────────── */
function tick(ts) {
  if (!isPlaying) return;

  if (audioEl && !audioEl.paused) {
    currentTime = audioEl.currentTime;
  } else if (lastTimestamp !== null) {
    const delta = (ts - lastTimestamp) / 1000;
    currentTime = Math.min(currentTime + delta, totalDuration);
  }
  lastTimestamp = ts;

  updateProgress(currentTime);

  if (currentTime >= totalDuration) {
    pause();
    setTimeout(() => seekToTime(0), 2000);
    return;
  }

  rafId = requestAnimationFrame(tick);
}

/* ── Controles ───────────────────────────────────── */
const coverVideo = document.querySelector('.album-art video');

function play() {
  isPlaying     = true;
  lastTimestamp = null;
  playBtn.innerHTML = '⏸';
  playBtn.classList.add('playing');
  document.querySelector('.album-art').classList.add('playing');

  if (audioEl) {
    audioEl.currentTime = currentTime;
    audioEl.play().catch(() => {});
  }

  if (coverVideo) coverVideo.play().catch(() => {});

  rafId = requestAnimationFrame(tick);
}

function pause() {
  isPlaying     = false;
  lastTimestamp = null;
  if (rafId) cancelAnimationFrame(rafId);
  playBtn.innerHTML = '▶';
  playBtn.classList.remove('playing');
  document.querySelector('.album-art').classList.remove('playing');

  if (audioEl) audioEl.pause();
  if (coverVideo) coverVideo.pause();
}

function togglePlay() { isPlaying ? pause() : play(); }

function seekToTime(sec) {
  currentTime   = Math.max(0, Math.min(sec, totalDuration));
  lastTimestamp = null;

  if (audioEl) audioEl.currentTime = currentTime;

  updateProgress(currentTime);
}

function seekTo(event) {
  const track = document.getElementById('prog-track');
  const rect  = track.getBoundingClientRect();
  const pct   = (event.clientX - rect.left) / rect.width;
  seekToTime(pct * totalDuration);
  if (!isPlaying) play();
}

/* ── Like ────────────────────────────────────────── */
function toggleLike() {
  liked = !liked;
  document.querySelectorAll('.btn-like').forEach(btn => {
    btn.textContent = liked ? '♥' : '♡';
    btn.classList.toggle('liked', liked);
  });
}

/* ── Painéis ─────────────────────────────────────── */
function showView(view) {
  document.querySelectorAll('.side-panel').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + view).classList.remove('hidden');
  document.getElementById('btn-' + view).classList.add('active');
}

/* ── Teclado ─────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === ' ')          { e.preventDefault(); togglePlay(); }
  if (e.key === 'ArrowRight') seekToTime(currentTime + 5);
  if (e.key === 'ArrowLeft')  seekToTime(Math.max(0, currentTime - 5));
});

/* ── Init ────────────────────────────────────────── */
document.body.style.opacity = '0';

window.addEventListener('load', () => {
  initAudio();
  renderLyrics();
  timeTotal.textContent = fmt(totalDuration);
  updateProgress(0);

  document.body.style.transition = 'opacity .6s ease';
  document.body.style.opacity    = '1';
});
