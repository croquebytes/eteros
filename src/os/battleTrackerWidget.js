// ===== Battle Tracker Widget =====
// On-screen "sticky note" style battle tracker for desktop

import { onDungeonUpdate, getDungeonStats, setBattleNotification } from '../state/dungeonRunner.js';
import { gameState } from '../state/enhancedGameState.js';
import { windowManager } from './windowManager.js';
import { getDesktopState } from './desktopState.js';

export function createBattleTracker() {
  const tracker = document.createElement('div');
  tracker.id = 'battle-tracker';
  tracker.className = 'battle-tracker';

  // Set up notification callback
  setBattleNotification((message, type) => {
    showNotification(tracker, message, type);
  });

  // Check if mobile mode
  const settings = getDesktopState().settings;
  const isMobile = settings.isMobileMode;

  if (isMobile) {
    // Mobile: create drawer-style tracker
    tracker.classList.add('battle-tracker--mobile');
    createMobileDrawer(tracker);
  } else {
    // Desktop: create draggable widget
    tracker.classList.add('battle-tracker--desktop');
    createDesktopWidget(tracker);
  }

  // Initial render
  updateTracker(tracker);

  // Subscribe to dungeon updates
  onDungeonUpdate(() => {
    updateTracker(tracker);
  });

  return tracker;
}

/**
 * Create mobile drawer with pull-up handle
 */
function createMobileDrawer(tracker) {
  let isExpanded = false;

  // Create handle/tab
  const handle = document.createElement('div');
  handle.className = 'battle-tracker-mobile-handle';
  handle.innerHTML = `
    <div class="handle-bar"></div>
    <div class="handle-summary" id="battle-tracker-summary">
      <span>Wave 1 | Gold: 0</span>
    </div>
  `;

  handle.addEventListener('click', (e) => {
    e.stopPropagation();
    isExpanded = !isExpanded;
    tracker.classList.toggle('battle-tracker--expanded', isExpanded);

    const body = tracker.querySelector('.battle-tracker-body');
    if (body) {
      body.style.display = isExpanded ? 'flex' : 'none';
    }
  });

  tracker.appendChild(handle);

  // Position at bottom
  tracker.style.left = '0';
  tracker.style.bottom = '40px'; // Above taskbar
  tracker.style.width = '100%';
}

/**
 * Create desktop draggable widget
 */
function createDesktopWidget(tracker) {
  let isMinimized = false;

  // Create header with controls
  const headerEl = document.createElement('div');
  headerEl.className = 'battle-tracker-header';

  const titleEl = document.createElement('span');
  titleEl.textContent = 'Dungeon Progress';
  titleEl.className = 'tracker-title';
  titleEl.title = 'Click to open Quest Explorer';
  titleEl.addEventListener('click', (e) => {
    e.stopPropagation();
    windowManager.openWindow('questExplorer');
  });

  const minimizeBtn = document.createElement('button');
  minimizeBtn.className = 'tracker-minimize-btn';
  minimizeBtn.textContent = '−';
  minimizeBtn.title = 'Minimize';
  minimizeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isMinimized = !isMinimized;
    const body = tracker.querySelector('.battle-tracker-body');
    if (body) {
      body.style.display = isMinimized ? 'none' : 'flex';
    }
    minimizeBtn.textContent = isMinimized ? '+' : '−';
    minimizeBtn.title = isMinimized ? 'Expand' : 'Minimize';
    tracker.classList.toggle('minimized', isMinimized);
  });

  headerEl.appendChild(titleEl);
  headerEl.appendChild(minimizeBtn);
  tracker.appendChild(headerEl);

  // Make draggable
  makeDraggable(tracker);

  // Set initial position (bottom right)
  setTimeout(() => {
    const x = window.innerWidth - 320;
    const y = window.innerHeight - 450;
    tracker.style.left = x + 'px';
    tracker.style.top = y + 'px';
  }, 100);
}

function updateTracker(tracker) {
  const stats = getDungeonStats();
  const bodyEl = tracker.querySelector('.battle-tracker-body') || document.createElement('div');

  if (!bodyEl.className) {
    bodyEl.className = 'battle-tracker-body';
  }

  // Wave and resources
  bodyEl.innerHTML = `
    <div class="tracker-row tracker-wave">
      <span class="tracker-label">Wave:</span>
      <span class="tracker-value">${stats.wave}</span>
    </div>
    <div class="tracker-row tracker-gold">
      <span class="tracker-label">Gold:</span>
      <span class="tracker-value">${Math.floor(stats.gold)}</span>
    </div>
    <div class="tracker-row tracker-xp">
      <span class="tracker-label">XP:</span>
      <span class="tracker-value">${Math.floor(stats.xp)}</span>
    </div>
    <div class="tracker-divider"></div>
    <div class="tracker-enemies">
      <div class="tracker-enemy-header ${stats.isBossWave ? 'boss' : ''}">
        ${stats.isBossWave ? '👹 BOSS WAVE!' : `⚔️ ${stats.enemyCount} ${stats.enemyCount === 1 ? 'Enemy' : 'Enemies'}`}
      </div>
    </div>
    <div class="tracker-divider"></div>
    <div class="tracker-heroes">
      ${gameState.heroes.slice(0, 4).map(hero => {
        const hpPercent = Math.floor((hero.currentHp / hero.currentStats.hp) * 100);
        const hpColor = hpPercent > 50 ? '#10b981' : hpPercent > 25 ? '#f59e0b' : '#ef4444';
        return `
          <div class="tracker-hero">
            <div class="tracker-hero-name">${hero.name.substring(0, 12)} <span class="tracker-hero-level">Lv${hero.level}</span></div>
            <div class="tracker-hero-hp-bar">
              <div class="tracker-hero-hp-fill" style="width: ${hpPercent}%; background: ${hpColor};"></div>
            </div>
            <div class="tracker-hero-hp-text">${hero.currentHp}/${hero.currentStats.hp}</div>
          </div>
        `;
      }).join('')}
    </div>
    <div class="tracker-status">
      ${stats.running ? `<span class="status-running">⚔ Exploring... ${stats.progress}%</span>` : '<span class="status-idle">💤 Idle</span>'}
    </div>
  `;

  if (!tracker.contains(bodyEl)) {
    tracker.appendChild(bodyEl);
  }

  // Update mobile summary if in mobile mode
  const summary = document.getElementById('battle-tracker-summary');
  if (summary) {
    summary.innerHTML = `<span>Wave ${stats.wave} | Gold: ${Math.floor(stats.gold)}</span>`;
  }

  // Show level-up notification if any hero just leveled up
  checkForLevelUps(tracker);
}

let lastHeroLevels = {};

function checkForLevelUps(tracker) {
  for (const hero of gameState.heroes) {
    const lastLevel = lastHeroLevels[hero.id] || hero.level;
    if (hero.level > lastLevel) {
      showNotification(tracker, `${hero.name} leveled up to ${hero.level}!`, 'level-up');
      lastHeroLevels[hero.id] = hero.level;
    } else {
      lastHeroLevels[hero.id] = hero.level;
    }
  }
}

function showNotification(tracker, message, type = 'info') {
  const notif = document.createElement('div');
  notif.className = `tracker-notification tracker-notification-${type}`;
  notif.textContent = message;
  tracker.appendChild(notif);

  // Remove after 3 seconds
  setTimeout(() => {
    notif.classList.add('fade-out');
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

function makeDraggable(tracker) {
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  tracker.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);

  // Set initial position (bottom right)
  setTimeout(() => {
    const x = window.innerWidth - 320;
    const y = window.innerHeight - 450;
    tracker.style.left = x + 'px';
    tracker.style.top = y + 'px';
    xOffset = x;
    yOffset = y;
  }, 100);

  function dragStart(e) {
    // Only drag from header or empty space
    if (e.target.classList.contains('battle-tracker') ||
        e.target.classList.contains('battle-tracker-header')) {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      isDragging = true;
      tracker.style.cursor = 'grabbing';
    }
  }

  function drag(e) {
    if (!isDragging) return;

    e.preventDefault();
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;

    // Constrain to viewport
    const maxX = window.innerWidth - 280;
    const maxY = window.innerHeight - 100;

    currentX = Math.max(0, Math.min(currentX, maxX));
    currentY = Math.max(0, Math.min(currentY, maxY));

    xOffset = currentX;
    yOffset = currentY;

    tracker.style.left = currentX + 'px';
    tracker.style.top = currentY + 'px';
  }

  function dragEnd() {
    if (isDragging) {
      isDragging = false;
      tracker.style.cursor = 'move';
    }
  }
}

// Export function to show notifications from outside
export function showBattleNotification(message, type = 'info') {
  const tracker = document.getElementById('battle-tracker');
  if (tracker) {
    showNotification(tracker, message, type);
  }
}
