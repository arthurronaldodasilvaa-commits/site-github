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
  spotifyPlaylistLink: '#',

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
