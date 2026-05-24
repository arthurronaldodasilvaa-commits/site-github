/* ====================================================
   CONFIG.JS — Personalize o site aqui, Arthur! 🎵
   Edite as músicas, datas e mensagens neste arquivo.
   ==================================================== */

const CONFIG = {

  // ── Nomes ──────────────────────────────────────────
  him: {
    name: 'Arthur',
    birthday: new Date(2009, 6, 17), // 17 de Julho de 2009
  },
  her: {
    name: 'Mariana',
    birthday: new Date(2007, 10, 21), // 21 de Novembro de 2007
  },

  // ── Data especial ──────────────────────────────────
  firstMet: new Date(2026, 2, 28), // 28 de Março de 2026

  // ── Playlist ───────────────────────────────────────
  // Adicione ou troque as músicas aqui.
  // 'link': use 'foi-assim.html' para páginas internas ou um link do Spotify.
  songs: [
    {
      title:  'Foi Assim',
      artist: 'Sotam',
      link:   'foi-assim.html',
      emoji:  '🌷',
      special: true,
    },
    {
      title:  'em breve...',
      artist: '—',
      link:   '#',
      emoji:  '🎵',
    },
    {
      title:  'Campari',
      artist: 'yunk vino',
      link:   '#',
      emoji:  '🍹',
    },
    {
      title:  'em breve...',
      artist: '—',
      link:   '#',
      emoji:  '🎵',
    },
    {
      title:  'Baby Cê é Gata',
      artist: 'Kyan, Mu540',
      link:   '#',
      emoji:  '🔥',
    },
  ],

  // ── Link da playlist no Spotify (opcional) ─────────
  spotifyPlaylistLink: 'https://open.spotify.com/playlist/37i9dQZF1EJtxr2qucxD1r?si=e8ec6f91d9d34d73',

  // ── Firebase Realtime Database (Cartinhas) ─────────
  // Para as cartas sincronizarem entre o celular da Mari e o seu:
  //   1. Acesse: console.firebase.google.com
  //   2. "Criar projeto" → nome: shawty
  //   3. Realtime Database → "Criar banco de dados" → Modo de teste
  //   4. Copie a URL (ex.: https://shawty-12345-default-rtdb.firebaseio.com)
  //   5. Cole abaixo, sem "/" no final
  firebaseUrl: '', // ← Cole aqui a URL do Firebase

  // ── Memórias / momentos especiais ─────────────────
  // Aparecem na timeline do Spotify e no álbum.
  memories: [
    {
      date:        new Date(2026, 2, 28),
      title:       'A gente se conheceu 🌟',
      description: 'O dia que mudou tudo',
      emoji:       '🌟',
    },
    // Adicione mais memórias aqui!
    // { date: new Date(2026, 3, 15), title: 'Primeiro passeio', description: '...', emoji: '☕' },
  ],

  // ── Mensagens da Spotify Wrapped ──────────────────
  spotifyMessages: {
    intro:   'Esse ano teve de tudo... mas você foi a melhor parte 💕',
    closing: 'Obrigado por existir, Mari 🌸',
    quote:   'Você apareceu sem aviso e ficou no coração sem pedir licença.',
  },

  // ── Stats da Wrapped (pode personalizar) ──────────
  spotifyStats: {
    minutesListened: 2026,
    topGenre:        'Amor',
    topMoment:       '28 de Março',
  },

};
