# CONTEXTO — Projeto Shawty
> Cole esse arquivo inteiro no início de uma nova conversa para continuar o projeto.

---

## O que é esse projeto

Site romântico pessoal feito pelo **Arthur** para a **Mariana** (estão "ficando", ainda não namoram oficialmente).
Inspirado num produto pago de R$30 (lovepanda.com.br), mas 100% personalizado e melhor.
Será hospedado no **GitHub Pages** (site estático — sem backend em produção).

**Rodar localmente:** `python server.py` → abre em http://localhost:8080
**Stack:** HTML + CSS + JavaScript (frontend) · Python (server local e scripts utilitários)

---

## Datas e dados pessoais

| Campo               | Valor           |
|---------------------|-----------------|
| Nome dele           | Arthur          |
| Aniversário Arthur  | 17/07/2009      |
| Nome dela           | Mariana ("Mari")|
| Aniversário Mariana | 21/11/2007      |
| Data que se conheceram | 28/03/2026   |

**Quiz de entrada** (3 perguntas nessa ordem):
1. Quando o Arthur nasceu? → `17/07/2009`
2. Quando a gente se conheceu? → `28/03/2026`
3. Quando a Mariana nasceu? → `21/11/2007`

---

## O que a Mariana gosta (para usar no design)

- **Flores:** tulipas rosas, lírios laranja e rosa, rosas brancas
- **Princesas Disney:** Rapunzel e Merida
- **Doces:** Haribo melancia, Fini tubes morango azedo, tutti-frutti azedo, banana
- **Chocolate:** 5star, Twix, Snickers, KitKat
- **Bolo favorito:** cenoura com cobertura dura
- **Livro de poesia**
- **Cores:** rosa, azul, preto (se não tem, roxo)
- **Gloss (ordem de preferência):** uva/roxo, morango, melancia
- **Ama marrom**
- **Filme:** Matilda | **Série:** Grey's Anatomy

---

## Estrutura de arquivos

```
shawty/
├── index.html              ← Quiz de entrada (PRONTO)
├── board.html              ← Board "criminal" navegação (PRONTO)
├── server.py               ← Flask-like local dev server Python (PRONTO)
│
├── pages/
│   ├── spotify.html        ← Retrospectiva estilo Spotify Wrapped (PRONTO)
│   ├── foi-assim.html      ← Player de música estilo Spotify (PRONTO)
│   ├── album.html          ← Álbum de polaroides (EM BREVE)
│   ├── letters.html        ← Cartinhas digitais (EM BREVE)
│   ├── timer.html          ← Contador de tempo juntos (EM BREVE)
│   └── games.html          ← Jogos (roleta de date etc.) (EM BREVE)
│
├── css/
│   ├── base.css            ← Design system: cores, fontes, animações globais
│   ├── quiz.css            ← Estilos do quiz
│   ├── board.css           ← Estilos do board
│   ├── spotify.css         ← Estilos da retrospectiva
│   └── foi-assim.css       ← Estilos do player de música
│
├── js/
│   ├── config.js           ← ARQUIVO PRINCIPAL DE CONFIGURAÇÃO (músicas, datas)
│   ├── quiz.js             ← Lógica do quiz
│   ├── board.js            ← Board: luzes, cordas SVG, partículas
│   ├── spotify.js          ← Slides da retrospectiva, stats de tempo
│   └── foi-assim.js        ← Player: karaokê, sync com MP3, progress bar
│
└── assets/
    └── images/             ← Fotos das polaroides vão aqui
    └── foi-assim.mp3       ← ← COLOCAR AQUI o MP3 da música "Foi Assim" de Sotam
```

---

## Design System (base.css)

**Paleta de cores (CSS variables):**
```css
--pink:       #ff6b9d   /* rosa principal */
--pink-light: #ff8fab
--pink-pale:  #ffb3c6
--blue:       #6b9dff
--purple:     #c77dff
--navy:       #1a1a2e   /* fundo escuro principal */
--brown:      #8d6e63
--cream:      #fff8f0
--gold:       #ffd700
--green-ok:   #4ade80
--red-err:    #ef4444
```

**Fontes (Google Fonts):**
- `Dancing Script` → títulos românticos, labels de polaroid
- `Nunito` → corpo do texto, botões
- `Playfair Display` → números grandes, display

**Animações disponíveis (via @keyframes):** `float`, `fadeIn`, `fadeInScale`, `pulse`, `shake`, `heartbeat`, `twinkle`, `slideUp`, `bounceIn`, `petalFall`, `ropeSwing`, `gradientShift`

---

## Páginas prontas — detalhes técnicos

### 1. Quiz (`index.html` + `css/quiz.css` + `js/quiz.js`)
- 3 telas sequenciais (welcome → q1 → q2 → q3 → success)
- Auto-formato DD/MM/AAAA enquanto digita
- Validação por string normalizada (remove traços, espaços)
- Ao acertar: `sessionStorage.setItem('quiz_passed', 'true')` → redireciona para `board.html`
- Todas as outras páginas verificam `quiz_passed` e redirecionam para `index.html` se falso
- Fundo: estrelas animadas via canvas + pétalas caindo (CSS)

### 2. Board (`board.html` + `css/board.css` + `js/board.js`)
- Layout: cards absolutamente posicionados (desktop) / grid 2 colunas (mobile)
- Cada card tem: pin rosa, área de foto/emoji, label estilo polaroid
- Varalzinho de luzes coloridas no topo (gerado por JS)
- Cordas SVG conectando os cards (quadratic bezier com droop)
- Partículas de poeira flutuando (canvas)
- Cards oscilam levemente (CSS animation `ropeSwing`)

**Posições dos cards:**
| Card | --x | --y | --rot |
|------|-----|-----|-------|
| Título (Arthur & Mariana) | 40% | 9% | -1.5deg |
| Spotify | 11% | 33% | 2.5deg |
| Foi Assim 🌷 | 9% | 60% | -2deg |
| Álbum | 37% | 46% | -3deg |
| Timer | 67% | 37% | 1.8deg |
| Cartinhas | 22% | 70% | -2.2deg |
| Jogos | 62% | 68% | 2.8deg |

**Conexões SVG (board.js → CONNECTIONS array):**
```js
['card-title',   'card-spotify',  '#ff6b9d', 1.8],
['card-title',   'card-timer',    '#ff6b9d', 1.8],
['card-spotify', 'card-foiassim', '#c77dff', 1.5],
['card-spotify', 'card-album',    '#c77dff', 1.4],
['card-album',   'card-letters',  '#ff8fab', 1.4],
['card-timer',   'card-games',    '#6b9dff', 1.4],
['card-album',   'card-games',    '#ffb3c6', 1.2],
['card-title',   'card-letters',  '#c77dff', 1.1],
```

### 3. Spotify Wrapped (`pages/spotify.html` + `css/spotify.css` + `js/spotify.js`)
- 8 slides tipo "stories" (full screen, gradient background único por slide)
- Navegação: setas ‹ ›, dots clicáveis, teclado (←→ e Space), swipe touch
- Barra de progresso estilo stories no topo
- **Slide 2:** conta dias desde `CONFIG.firstMet` até hoje (automático)
- **Slide 4:** lista de músicas renderizada a partir de `CONFIG.songs`
  - Músicas com `link: 'foi-assim.html'` navegam internamente
  - Músicas com `special: true` têm destaque rosa com badge ✦
- **Slide 7:** grid de stats em tempo real (semanas, horas, minutos, segundos)

### 4. Foi Assim (`pages/foi-assim.html` + `css/foi-assim.css` + `js/foi-assim.js`)
- Simula a página de música do Spotify
- Layout 2 colunas: esquerda (player) / direita (letra ou créditos)
- **Artwork do álbum:** CSS puro, gradiente roxo/rosa, tulipa animada, brilhos
- **Karaokê:** letra avança com highlight na linha ativa (branco grande), passadas dimmed
  - Timestamps definidos em `LYRICS[]` em `foi-assim.js` (array com `{ dur, text, type }`)
  - `type: 'section'` → label [REFRÃO] etc. · `type: 'empty'` → espaço
- **MP3 real:** colocar `assets/foi-assim.mp3` (música "Foi Assim" de Sotam)
  - O `<audio id="song-audio">` detecta automaticamente
  - Fallback silencioso: se não tiver MP3, usa timer interno
  - Quando o MP3 carrega, a duração real sobrescreve a duração calculada
- **Créditos:** painel alternativo com os créditos da "música"
- Teclado: `Space` play/pause, `←` -5s, `→` +5s

---

## config.js — Como personalizar

```js
CONFIG.songs[0] = {
  title:   'Nome da música',
  artist:  'Artista',
  link:    'foi-assim.html',  // interno (mesma pasta pages/)
  // link: 'https://open.spotify.com/...',  // externo
  emoji:   '🌷',
  special: true,  // destaque rosa no Wrapped
}
```

---

## Páginas a construir (próximas)

### 📸 Álbum de Polaroides (`pages/album.html`)
- Grid de fotos estilo polaroid (rotações aleatórias, pino, label manuscrito)
- Ao clicar na polaroid: abre em fullscreen com animação
- Arthur adiciona fotos em `assets/images/` e lista no `config.js`
- Efeito de revelar: fade in + shake como polaroid desenvolvendo
- Filtro CSS sepia/vintage opcional por foto

### 💌 Cartinhas Digitais (`pages/letters.html`)
- Lista de "envelopes" fechados
- Clicar abre o envelope com animação e mostra a carta
- Cada carta: fundo de papel, fonte manuscrita, possível decoração (florzinha, coração)
- Arthur escreve as cartas no `config.js` (array de `{ title, date, content }`)

### ⏱️ Timer (`pages/timer.html`)
- Contador em tempo real desde 28/03/2026
- Mostrar: anos, meses, semanas, dias, horas, minutos, segundos
- Design big e impactante (números grandes)
- Opção de mostrar marcos próximos (ex: "faltam X dias para 3 meses")

### 🎲 Jogos (`pages/games.html`)
- **Roleta de date:** roda que sorteia programas (cinema, sorvete, passeio, etc.)
  - Arthur pode configurar as opções no `config.js`
  - Animação de giro com CSS/Canvas
- **Verdade ou desafio romântico** (opcional)
- **Quiz "Quanto você me conhece?"** (opcional)

---

## GitHub Pages — Deploy

1. Criar repositório público no GitHub
2. `git init` na pasta `shawty/`
3. Não commitar `assets/*.mp3` (arquivos grandes) — adicionar ao `.gitignore`
4. `git add .` · `git commit -m "primeiro commit"` · `git push`
5. Settings → Pages → Source: main branch, pasta / (root)
6. URL: `https://seuusuario.github.io/shawty`

**Atenção:** o `server.py` é só para desenvolvimento local, não vai pro GitHub Pages.

---

## Estilo de comunicação com o Claude

- Arthur não escreve código — o Claude faz tudo
- Arthur revisa os arquivos para aprender
- Código limpo, sem comentários desnecessários, bem organizado
- Sem emojis nas respostas de texto (só no código quando faz sentido)
- Perguntar antes de tomar decisões de design grandes
- Sempre verificar no preview antes de confirmar que está pronto
