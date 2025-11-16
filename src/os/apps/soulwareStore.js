// ===== Soulware Store App =====
// Upgrade shop for permanent improvements

import { gameState, saveGame } from '../../state/gameState.js';
import { CONFIG } from '../../state/config.js';

export const soulwareStoreApp = {
  id: 'soulwareStore',
  title: 'Soulware Store – Upgrades.exe',

  createContent(rootEl) {
    render(rootEl);
  }
};

function render(rootEl) {
  rootEl.innerHTML = `
    <div class="window-content soulware-store">
      <div class="store-header">
        <div class="store-currency">
          <div class="currency-item">
            <span class="currency-icon">💰</span>
            <span class="currency-label">Gold:</span>
            <span class="currency-value">${Math.floor(gameState.gold)}</span>
          </div>
          <div class="currency-item">
            <span class="currency-icon">🔮</span>
            <span class="currency-label">Fragments:</span>
            <span class="currency-value">${gameState.fragments}</span>
          </div>
          <div class="currency-item">
            <span class="currency-icon">✨</span>
            <span class="currency-label">Sigils:</span>
            <span class="currency-value">${gameState.sigilPoints}</span>
          </div>
        </div>
      </div>
      <div class="store-upgrades" id="store-upgrades"></div>
    </div>
  `;

  renderUpgrades(rootEl);
}

function renderUpgrades(rootEl) {
  const upgradesContainer = rootEl.querySelector('#store-upgrades');
  if (!upgradesContainer) return;

  const upgradeEntries = Object.entries(CONFIG.upgrades);

  upgradesContainer.innerHTML = upgradeEntries.map(([upgradeId, upgradeConfig]) => {
    const currentLevel = gameState.upgrades[upgradeId] || 0;
    const cost = calculateUpgradeCost(upgradeId);
    const canAfford = gameState.gold >= cost;
    const isMaxLevel = currentLevel >= upgradeConfig.maxLevel;

    const effectText = getEffectText(upgradeId, upgradeConfig);
    const totalBonus = currentLevel * upgradeConfig.effect;

    return `
      <div class="upgrade-card ${isMaxLevel ? 'max-level' : ''}">
        <div class="upgrade-header">
          <div class="upgrade-name">${upgradeConfig.name}</div>
          <div class="upgrade-level">Lv ${currentLevel}/${upgradeConfig.maxLevel}</div>
        </div>
        <div class="upgrade-description">${effectText}</div>
        <div class="upgrade-bonus">
          <span class="bonus-label">Current Bonus:</span>
          <span class="bonus-value">+${formatBonus(totalBonus, upgradeId)}</span>
        </div>
        <div class="upgrade-footer">
          ${isMaxLevel ?
            '<div class="max-level-badge">MAX LEVEL</div>' :
            `
              <div class="upgrade-cost">
                <span class="cost-icon">💰</span>
                <span class="cost-value ${canAfford ? '' : 'cannot-afford'}">${cost}</span>
              </div>
              <button
                class="btn-purchase ${canAfford ? '' : 'disabled'}"
                ${canAfford ? `onclick="window.purchaseUpgrade('${upgradeId}')"` : 'disabled'}>
                ${canAfford ? 'Purchase' : 'Not Enough Gold'}
              </button>
            `
          }
        </div>
      </div>
    `;
  }).join('');

  // Expose purchase function
  window.purchaseUpgrade = (upgradeId) => purchaseUpgrade(upgradeId, rootEl);
}

function purchaseUpgrade(upgradeId, rootEl) {
  const cost = calculateUpgradeCost(upgradeId);
  const upgradeConfig = CONFIG.upgrades[upgradeId];
  const currentLevel = gameState.upgrades[upgradeId] || 0;

  if (gameState.gold < cost) {
    alert('Not enough gold!');
    return;
  }

  if (currentLevel >= upgradeConfig.maxLevel) {
    alert('Upgrade is already at max level!');
    return;
  }

  // Purchase upgrade
  gameState.gold -= cost;
  gameState.upgrades[upgradeId] = currentLevel + 1;

  console.log(`Purchased ${upgradeConfig.name} (Level ${currentLevel + 1})`);

  // Save and re-render
  saveGame();
  render(rootEl);
}

function calculateUpgradeCost(upgradeId) {
  const upgradeConfig = CONFIG.upgrades[upgradeId];
  const currentLevel = gameState.upgrades[upgradeId] || 0;
  return Math.floor(upgradeConfig.baseCost * Math.pow(upgradeConfig.costMultiplier, currentLevel));
}

function getEffectText(upgradeId, upgradeConfig) {
  const descriptions = {
    goldMultiplier: `Increase gold earned from all sources by ${formatPercent(upgradeConfig.effect)} per level`,
    xpMultiplier: `Increase XP earned from all sources by ${formatPercent(upgradeConfig.effect)} per level`,
    autoProgress: `Increase offline progress rate by ${formatPercent(upgradeConfig.effect)} per level`,
    heroDamage: `Increase all hero damage by ${formatPercent(upgradeConfig.effect)} per level`,
    heroDefense: `Increase all hero defense and HP by ${formatPercent(upgradeConfig.effect)} per level`,
    critChance: `Increase critical hit chance by ${formatPercent(upgradeConfig.effect)} per level`,
    heroSlots: `Add ${upgradeConfig.effect} hero slot per level (recruit more heroes!)`,
    inventorySlots: `Add ${upgradeConfig.effect} inventory slots per level`
  };
  return descriptions[upgradeId] || 'Unknown upgrade effect';
}

function formatBonus(value, upgradeId) {
  // Special handling for different upgrade types
  if (upgradeId === 'critChance') {
    return `${(value * 100).toFixed(1)}%`;
  }
  if (upgradeId === 'heroSlots' || upgradeId === 'inventorySlots') {
    return `${value} slots`;
  }
  return `${(value * 100).toFixed(0)}%`;
}

function formatPercent(value) {
  return `${(value * 100).toFixed(0)}%`;
}
