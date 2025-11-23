// ===== Start Menu with Progress Tracker =====
// Integrated progress tracker in start menu panel

import { getDungeonStats, onDungeonUpdate } from '../state/dungeonRunner.js';
import { gameState } from '../state/enhancedGameState.js';
import { windowManager } from './windowManager.js';

let startMenuEl = null;
let startButtonEl = null;
let isOpen = false;

/**
 * Create and attach start button to taskbar
 */
export function createStartButton(taskbarEl) {
  startButtonEl = document.createElement('button');
  startButtonEl.className = 'start-button';
  startButtonEl.innerHTML = `
    <span>⚔</span>
    <span>Start</span>
  `;

  startButtonEl.addEventListener('click', toggleStartMenu);

  return startButtonEl;
}

/**
 * Create start menu panel
 */
export function createStartMenu() {
  startMenuEl = document.createElement('div');
  startMenuEl.className = 'start-menu';
  startMenuEl.innerHTML = `
    <div class="start-menu-header">
      <div class="start-menu-title">ReincarnOS</div>
      <div class="start-menu-subtitle">Dungeon Operating System</div>
    </div>

    <div class="start-menu-section">
      <div class="start-menu-section-title">Progress</div>
      <div class="start-menu-progress" id="start-menu-progress">
        <!-- Progress stats will be injected here -->
      </div>
    </div>

    <div class="start-menu-section">
      <div class="start-menu-section-title">Quick Actions</div>
      <div class="start-menu-quick-actions" id="start-menu-actions">
        <!-- Quick action buttons will be injected here -->
      </div>
    </div>
  `;

  // Setup quick action buttons
  const actionsContainer = startMenuEl.querySelector('#start-menu-actions');
  const quickActions = [
    { label: 'Quest Explorer', appId: 'questExplorer', icon: '⚔' },
    { label: 'Resource Tracker', appId: 'resourceTracker', icon: '📊' },
    { label: 'Loot Downloads', appId: 'lootDownloads', icon: '📦' },
    { label: 'Soulware Store', appId: 'soulwareStore', icon: '🛒' },
    { label: 'Summon Heroes', appId: 'soulSummoner', icon: '✨' }
  ];

  quickActions.forEach(action => {
    const btn = document.createElement('button');
    btn.className = 'start-menu-action-btn';
    btn.textContent = `${action.icon} ${action.label}`;
    btn.addEventListener('click', () => {
      windowManager.openWindow(action.appId);
      closeStartMenu();
    });
    actionsContainer.appendChild(btn);
  });

  // Close menu when clicking outside
  document.addEventListener('click', handleOutsideClick);

  // Update progress on game state changes
  updateProgress();
  onDungeonUpdate(() => {
    if (isOpen) {
      updateProgress();
    }
  });

  return startMenuEl;
}

/**
 * Update progress section with current game state
 */
function updateProgress() {
  if (!startMenuEl) return;

  const progressContainer = startMenuEl.querySelector('#start-menu-progress');
  if (!progressContainer) return;

  const stats = getDungeonStats();
  const resourceManager = window.resourceManager;

  // Get resource amounts
  const codeFragments = resourceManager ? Math.floor(resourceManager.getResourceAmount('codeFragments')) : (gameState.codeFragments || 0);
  const memoryBlocks = resourceManager ? Math.floor(resourceManager.getResourceAmount('memoryBlocks')) : (gameState.memoryBlocks || 0);
  const cpuCycles = resourceManager ? Math.floor(resourceManager.getResourceAmount('cpuCycles')) : (gameState.cpuCycles || 0);

  progressContainer.innerHTML = `
    <div class="start-menu-stat">
      <span class="start-menu-stat-label">💰 Gold</span>
      <span class="start-menu-stat-value">${formatNumber(Math.floor(stats.gold))}</span>
    </div>
    <div class="start-menu-stat">
      <span class="start-menu-stat-label">📜 Fragments</span>
      <span class="start-menu-stat-value">${formatNumber(codeFragments)}</span>
    </div>
    <div class="start-menu-stat">
      <span class="start-menu-stat-label">🧱 Memory</span>
      <span class="start-menu-stat-value">${formatNumber(memoryBlocks)}</span>
    </div>
    <div class="start-menu-stat">
      <span class="start-menu-stat-label">⚡ CPU</span>
      <span class="start-menu-stat-value">${formatNumber(cpuCycles)}</span>
    </div>
    <div class="start-menu-stat start-menu-stat-wide">
      <span class="start-menu-stat-label">Status</span>
      <span class="start-menu-stat-value">${stats.running ? `⚔ Wave ${stats.wave}` : '💤 Idle'}</span>
    </div>
  `;
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return Math.floor(num).toString();
}

/**
 * Toggle start menu open/closed
 */
export function toggleStartMenu() {
  if (isOpen) {
    closeStartMenu();
  } else {
    openStartMenu();
  }
}

/**
 * Open start menu
 */
export function openStartMenu() {
  if (!startMenuEl) return;

  isOpen = true;
  startMenuEl.classList.add('open');
  startButtonEl?.classList.add('active');
  updateProgress();
}

/**
 * Close start menu
 */
export function closeStartMenu() {
  if (!startMenuEl) return;

  isOpen = false;
  startMenuEl.classList.remove('open');
  startButtonEl?.classList.remove('active');
}

/**
 * Handle clicks outside the start menu
 */
function handleOutsideClick(e) {
  if (!isOpen) return;

  // Don't close if clicking on the start button or menu itself
  if (e.target.closest('.start-button') || e.target.closest('.start-menu')) {
    return;
  }

  closeStartMenu();
}
