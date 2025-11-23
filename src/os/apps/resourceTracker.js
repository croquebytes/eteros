// ===== Resource Tracker App =====
// Comprehensive resource monitoring and tracking

import { gameState } from '../../state/enhancedGameState.js';
import { RESOURCE_INFO } from '../../state/resourceManager.js';

export const resourceTrackerApp = {
  id: 'resourceTracker',
  title: 'Resource Tracker – ResMonitor.exe',

  createContent(rootEl) {
    render(rootEl);

    // Auto-refresh every second
    setInterval(() => {
      if (rootEl.isConnected) {
        render(rootEl);
      }
    }, 1000);
  }
};

function render(rootEl) {
  // Get resource manager instance if available
  const resourceManager = window.resourceManager;

  rootEl.innerHTML = `
    <div class="window-content resource-tracker-app">
      <div class="resource-tracker-header">
        <h1 class="window-title">Resource Tracker</h1>
        <div class="resource-tracker-subtitle">Monitor all your resources and rates</div>
      </div>

      <div class="resource-grid">
        ${renderResourceCards(resourceManager)}
      </div>

      <div class="resource-stats-panel">
        <h2 class="window-subtitle">Game Stats</h2>
        <div class="stats-grid">
          ${renderGameStats()}
        </div>
      </div>
    </div>
  `;
}

function renderResourceCards(resourceManager) {
  // Core resources to track
  const coreResources = ['gold', 'codeFragments', 'memoryBlocks', 'cpuCycles', 'entropyDust'];

  return coreResources.map(resKey => {
    const info = RESOURCE_INFO[resKey];
    if (!info) return '';

    // Get current amount from various sources
    let currentAmount = 0;
    let rate = 0;
    let capacity = Infinity;

    if (resourceManager) {
      currentAmount = resourceManager.getResourceAmount(resKey);
      rate = resourceManager.getResourceRate(resKey);
      capacity = resourceManager.getResourceCapacity(resKey);
    } else {
      // Fallback to gameState
      if (resKey === 'gold') currentAmount = gameState.gold || 0;
      if (resKey === 'codeFragments') currentAmount = gameState.codeFragments || 0;
      if (resKey === 'memoryBlocks') currentAmount = gameState.memoryBlocks || 0;
      if (resKey === 'cpuCycles') currentAmount = gameState.cpuCycles || 0;
      if (resKey === 'entropyDust') currentAmount = gameState.entropyDust || 0;
    }

    const displayAmount = Math.floor(currentAmount);
    const displayRate = rate.toFixed(1);
    const hasCapacity = capacity !== Infinity;
    const capacityPercent = hasCapacity ? Math.floor((currentAmount / capacity) * 100) : 0;

    return `
      <div class="resource-card" style="border-color: ${info.color}">
        <div class="resource-card-header">
          <span class="resource-icon" style="color: ${info.color}">${info.icon}</span>
          <div class="resource-info">
            <div class="resource-name">${info.name}</div>
            <div class="resource-description">${info.description}</div>
          </div>
        </div>

        <div class="resource-amount" style="color: ${info.color}">
          ${formatNumber(displayAmount)}
          ${hasCapacity ? `<span class="resource-capacity">/ ${formatNumber(capacity)}</span>` : ''}
        </div>

        ${hasCapacity ? `
          <div class="resource-capacity-bar">
            <div class="resource-capacity-fill" style="width: ${capacityPercent}%; background: ${info.color}"></div>
          </div>
        ` : ''}

        ${rate !== 0 ? `
          <div class="resource-rate" style="color: ${rate > 0 ? '#10b981' : '#ef4444'}">
            ${rate > 0 ? '+' : ''}${displayRate}/s
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function renderGameStats() {
  return `
    <div class="stat-item">
      <span class="stat-label">Wave</span>
      <span class="stat-value">${gameState.wave || 0}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Total XP</span>
      <span class="stat-value">${formatNumber(gameState.xp || 0)}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Heroes</span>
      <span class="stat-value">${gameState.heroes?.length || 0}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Lifetime Gold</span>
      <span class="stat-value">${formatNumber(gameState.lifetimeGold || 0)}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Items</span>
      <span class="stat-value">${gameState.inventory?.length || 0}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Prestige</span>
      <span class="stat-value">${gameState.prestigeLevel || 0}</span>
    </div>
  `;
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return Math.floor(num).toString();
}
