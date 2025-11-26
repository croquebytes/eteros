const pages = {
  '/news': {
    type: 'list',
    title: 'Astral Newswire',
    description: 'Simulated feed of OS-world happenings.',
    items: [
      'Patch Tuesday sacrifices a goblin bug to calm the kernel.',
      'Memory Leak Lake freezes over; ice fishing for pointers resumes.',
      'Quest Explorer reports runaway recursion reaching wave 999.',
      'Soulware Store flash sale on cursed drivers ends whenever it feels like it.'
    ]
  },
  '/weather': {
    type: 'weather',
    title: 'Packet Weather Grid',
    description: 'Forecasts for core regions.',
    regions: [
      { name: 'CPU Peaks', forecast: '95% utilization heat haze; consider underclocking familiars.' },
      { name: 'Packet Plains', forecast: 'Intermittent packet sprites; 40% chance of glittering latency.' },
      { name: 'Memory Marsh', forecast: 'Swap tides rising; bring floaties.' }
    ]
  },
  '/minigames/packet-pop': {
    type: 'minigame',
    mode: 'packetPop',
    title: 'Packet Pop Mini',
    description: 'Click the shimmering packets before they fade. Score is local only.'
  },
  '/minigames/hex-words': {
    type: 'minigame',
    mode: 'hexWords',
    title: 'Hex Words',
    description: 'Combine glyphs into a rune phrase and receive a flavorful response.'
  },
  '/system-advisories': {
    type: 'list',
    title: 'System Advisories',
    description: 'Patch notes and warnings from the SimNet authority.',
    items: [
      'Hotfix 0xDEAD: Sealed a breach where emoticons possessed the taskbar.',
      'Patch 1.4.2-fae: Reduced goblin bug spawn rate by 12.5%.',
      'Advisory: Spectral cache hit-rate up 3%. Expect brief shimmer.'
    ]
  }
};

const bookmarks = [
  { path: '/news', label: 'News' },
  { path: '/weather', label: 'Weather' },
  { path: '/minigames/packet-pop', label: 'Packet Pop' },
  { path: '/minigames/hex-words', label: 'Hex Words' },
  { path: '/system-advisories', label: 'Advisories' }
];

export const fakeBrowserApp = {
  id: 'fakeBrowser',
  title: 'NetSim Browser',
  createContent(rootEl) {
    const browserState = {
      history: ['/news'],
      index: 0,
      score: 0,
      lastRune: null
    };

    rootEl.innerHTML = `
      <div class="fake-browser">
        <div class="fake-browser-chrome">
          <div class="fake-browser-nav">
            <button class="fake-browser-btn" data-nav="back">◀</button>
            <button class="fake-browser-btn" data-nav="forward">▶</button>
            <button class="fake-browser-btn" data-nav="refresh">⟳</button>
          </div>
          <div class="fake-browser-url" id="fake-browser-url">n://${browserState.history[0]}</div>
          <div class="fake-browser-badge">Simulated Network</div>
        </div>
        <div class="fake-browser-body">
          <div class="fake-browser-sidebar" id="fake-browser-sidebar"></div>
          <div class="fake-browser-page" id="fake-browser-page"></div>
        </div>
      </div>
    `;

    const sidebarEl = rootEl.querySelector('#fake-browser-sidebar');
    const pageEl = rootEl.querySelector('#fake-browser-page');
    const urlEl = rootEl.querySelector('#fake-browser-url');

    renderSidebar();
    renderPage(browserState.history[browserState.index]);

    rootEl.querySelectorAll('.fake-browser-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const nav = btn.dataset.nav;
        if (nav === 'back' && browserState.index > 0) {
          browserState.index -= 1;
          syncUrl();
          renderPage(browserState.history[browserState.index]);
        } else if (nav === 'forward' && browserState.index < browserState.history.length - 1) {
          browserState.index += 1;
          syncUrl();
          renderPage(browserState.history[browserState.index]);
        } else if (nav === 'refresh') {
          renderPage(browserState.history[browserState.index]);
        }
      });
    });

    function renderSidebar() {
      sidebarEl.innerHTML = '';
      bookmarks.forEach(link => {
        const btn = document.createElement('button');
        btn.className = 'fake-browser-link';
        btn.textContent = link.label;
        btn.addEventListener('click', () => navigate(link.path));
        sidebarEl.appendChild(btn);
      });
    }

    function navigate(path) {
      browserState.history = browserState.history.slice(0, browserState.index + 1);
      browserState.history.push(path);
      browserState.index = browserState.history.length - 1;
      renderPage(path);
      syncUrl();
    }

    function syncUrl() {
      urlEl.textContent = `n://${browserState.history[browserState.index]}`;
    }

    function renderPage(path) {
      const page = pages[path];
      if (!page) {
        pageEl.innerHTML = `<div class="fake-browser-card">Unknown route: ${path}</div>`;
        return;
      }

      if (page.type === 'list') {
        pageEl.innerHTML = `
          <div class="fake-browser-card">
            <div class="fake-browser-title">${page.title}</div>
            <div class="fake-browser-desc">${page.description}</div>
            <ul class="fake-browser-list">
              ${page.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        `;
      } else if (page.type === 'weather') {
        pageEl.innerHTML = `
          <div class="fake-browser-card">
            <div class="fake-browser-title">${page.title}</div>
            <div class="fake-browser-desc">${page.description}</div>
            <div class="fake-browser-weather">
              ${page.regions.map(region => `
                <div class="fake-browser-weather-row">
                  <div class="fake-browser-weather-name">${region.name}</div>
                  <div class="fake-browser-weather-forecast">${region.forecast}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else if (page.type === 'minigame' && page.mode === 'packetPop') {
        renderPacketPop(page);
      } else if (page.type === 'minigame' && page.mode === 'hexWords') {
        renderHexWords(page);
      }
    }

    function renderPacketPop(page) {
      const packets = Array.from({ length: 6 }, (_, i) => `Packet ${i + 1}`);
      browserState.score = 0;
      pageEl.innerHTML = `
        <div class="fake-browser-card">
          <div class="fake-browser-title">${page.title}</div>
          <div class="fake-browser-desc">${page.description}</div>
          <div class="fake-browser-packets" id="fake-browser-packets">
            ${packets.map((p, i) => `<button class="fake-browser-packet" data-idx="${i}">${p}</button>`).join('')}
          </div>
          <div class="fake-browser-score" id="fake-browser-score">Score: 0</div>
        </div>
      `;

      const packetEls = pageEl.querySelectorAll('.fake-browser-packet');
      const scoreEl = pageEl.querySelector('#fake-browser-score');
      packetEls.forEach(btn => {
        btn.addEventListener('click', () => {
          btn.disabled = true;
          btn.classList.add('popped');
          browserState.score += 1;
          scoreEl.textContent = `Score: ${browserState.score}`;
        });
      });
    }

    function renderHexWords(page) {
      const glyphs = ['ether', 'lumen', 'sigil', 'root', 'pulse', 'veil'];
      browserState.lastRune = null;
      pageEl.innerHTML = `
        <div class="fake-browser-card">
          <div class="fake-browser-title">${page.title}</div>
          <div class="fake-browser-desc">${page.description}</div>
          <div class="fake-browser-glyphs" id="fake-browser-glyphs">
            ${glyphs.map(g => `<button class="fake-browser-glyph" data-glyph="${g}">${g}</button>`).join('')}
          </div>
          <div class="fake-browser-rune" id="fake-browser-rune">Select 3 glyphs.</div>
        </div>
      `;

      const runeEl = pageEl.querySelector('#fake-browser-rune');
      const selected = [];

      pageEl.querySelectorAll('.fake-browser-glyph').forEach(btn => {
        btn.addEventListener('click', () => {
          if (selected.length >= 3) return;
          selected.push(btn.dataset.glyph);
          btn.disabled = true;
          if (selected.length === 3) {
            const phrase = selected.join(' + ');
            browserState.lastRune = phrase;
            runeEl.textContent = `${phrase} → Conjures a luminous checksum sprite.`;
          } else {
            runeEl.textContent = `Selected: ${selected.join(' + ')}`;
          }
        });
      });
    }
  }
};
