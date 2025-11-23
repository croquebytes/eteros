// ===== E-Buy App =====
// Trade gold for resources with daily purchase limits

import { gameState, saveGame } from '../../state/enhancedGameState.js';

export const eBuyApp = {
  id: 'eBuy',
  title: 'E-Buy – Resource Exchange',

  // Exchange rates (gold → resource)
  exchangeRates: {
    codeFragments: { cost: 100, amount: 10, dailyLimit: 10 },
    memoryBlocks: { cost: 200, amount: 5, dailyLimit: 5 },
    cpuCycles: { cost: 150, amount: 50, dailyLimit: 20 },
    entropyDust: { cost: 500, amount: 2, dailyLimit: 3 }
  },

  resourceManager: null,

  createContent(rootEl) {
    this.initDailyState();
    this.render(rootEl);

    // Auto-refresh every 5 seconds
    setInterval(() => {
      if (rootEl.isConnected) {
        this.render(rootEl);
      }
    }, 5000);
  },

  setResourceManager(rm) {
    this.resourceManager = rm;
  },

  initDailyState() {
    // Initialize eBuy state if not present
    if (!gameState.eBuyState) {
      gameState.eBuyState = {
        lastReset: Date.now(),
        dailyPurchases: {}
      };
    }

    // Check if daily reset needed (24 hours passed)
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (now - gameState.eBuyState.lastReset >= oneDayMs) {
      gameState.eBuyState.dailyPurchases = {};
      gameState.eBuyState.lastReset = now;
      saveGame();
    }
  },

  render(rootEl) {
    const currentGold = gameState.gold || 0;
    const timeToReset = this.getTimeToReset();

    rootEl.innerHTML = `
      <div class="window-content ebuy-app">
        <div class="ebuy-header">
          <h2 class="window-subtitle">💰 E-Buy Resource Exchange</h2>
          <p class="ebuy-description">Trade gold for essential resources. Daily purchase limits reset every 24 hours.</p>
          <div class="ebuy-stats">
            <div class="stat-box">
              <span class="stat-label">Your Gold:</span>
              <span class="stat-value gold">${Math.floor(currentGold).toLocaleString()}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Daily Reset In:</span>
              <span class="stat-value">${timeToReset}</span>
            </div>
          </div>
        </div>

        <div class="ebuy-offers">
          ${this.renderOffers()}
        </div>

        <div class="ebuy-footer">
          <p class="small-text">
            💡 <strong>Tip:</strong> Purchase limits prevent resource inflation. Plan your purchases wisely!
          </p>
        </div>
      </div>
    `;

    // Attach event listeners
    this.attachEventListeners(rootEl);
  },

  renderOffers() {
    const offers = [];
    const resourceInfo = {
      codeFragments: { icon: '📜', name: 'Code Fragments', color: '#60a5fa' },
      memoryBlocks: { icon: '💾', name: 'Memory Blocks', color: '#8b5cf6' },
      cpuCycles: { icon: '⚙️', name: 'CPU Cycles', color: '#10b981' },
      entropyDust: { icon: '✨', name: 'Entropy Dust', color: '#f59e0b' }
    };

    for (const [resourceKey, exchange] of Object.entries(this.exchangeRates)) {
      const info = resourceInfo[resourceKey];
      const purchased = gameState.eBuyState.dailyPurchases[resourceKey] || 0;
      const remaining = exchange.dailyLimit - purchased;
      const canAfford = gameState.gold >= exchange.cost;
      const canPurchase = remaining > 0 && canAfford;

      offers.push(`
        <div class="ebuy-offer ${!canPurchase ? 'ebuy-offer-disabled' : ''}">
          <div class="ebuy-offer-header">
            <span class="ebuy-icon" style="color: ${info.color}">${info.icon}</span>
            <span class="ebuy-name">${info.name}</span>
          </div>
          <div class="ebuy-exchange">
            <div class="ebuy-cost">
              <span class="cost-label">Cost:</span>
              <span class="cost-value">${exchange.cost} Gold</span>
            </div>
            <div class="ebuy-arrow">→</div>
            <div class="ebuy-reward">
              <span class="reward-label">Get:</span>
              <span class="reward-value" style="color: ${info.color}">${exchange.amount} ${info.icon}</span>
            </div>
          </div>
          <div class="ebuy-limits">
            <span class="limit-label">Daily Limit:</span>
            <span class="limit-value ${remaining === 0 ? 'limit-exhausted' : ''}">
              ${remaining} / ${exchange.dailyLimit} remaining
            </span>
          </div>
          <button
            class="btn-purchase ${!canPurchase ? 'btn-disabled' : 'btn-primary'}"
            data-resource="${resourceKey}"
            ${!canPurchase ? 'disabled' : ''}
          >
            ${!canAfford ? 'Not Enough Gold' : remaining === 0 ? 'Limit Reached' : 'Purchase'}
          </button>
        </div>
      `);
    }

    return offers.join('');
  },

  attachEventListeners(rootEl) {
    const purchaseButtons = rootEl.querySelectorAll('.btn-purchase');
    purchaseButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const resourceKey = btn.dataset.resource;
        this.handlePurchase(resourceKey, rootEl);
      });
    });
  },

  handlePurchase(resourceKey, rootEl) {
    const exchange = this.exchangeRates[resourceKey];
    if (!exchange) return;

    const purchased = gameState.eBuyState.dailyPurchases[resourceKey] || 0;
    const remaining = exchange.dailyLimit - purchased;

    // Validate purchase
    if (remaining <= 0) {
      alert('Daily purchase limit reached for this resource!');
      return;
    }

    if (gameState.gold < exchange.cost) {
      alert(`Not enough gold! You need ${exchange.cost} but only have ${Math.floor(gameState.gold)}.`);
      return;
    }

    // Process purchase
    gameState.gold -= exchange.cost;

    // Add resource
    if (this.resourceManager) {
      this.resourceManager.add(resourceKey, exchange.amount, 'eBuy');
    } else {
      // Fallback if resource manager not available
      if (!gameState.resources[resourceKey]) {
        gameState.resources[resourceKey] = 0;
      }
      gameState.resources[resourceKey] += exchange.amount;
    }

    // Update daily purchases
    gameState.eBuyState.dailyPurchases[resourceKey] = purchased + 1;

    // Save state
    saveGame();

    // Show success message
    const resourceNames = {
      codeFragments: 'Code Fragments',
      memoryBlocks: 'Memory Blocks',
      cpuCycles: 'CPU Cycles',
      entropyDust: 'Entropy Dust'
    };
    alert(`Purchase successful! You received ${exchange.amount} ${resourceNames[resourceKey]}.`);

    // Re-render
    this.render(rootEl);
  },

  getTimeToReset() {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const timeToReset = oneDayMs - (now - gameState.eBuyState.lastReset);

    if (timeToReset <= 0) {
      return 'Resetting...';
    }

    const hours = Math.floor(timeToReset / (60 * 60 * 1000));
    const minutes = Math.floor((timeToReset % (60 * 60 * 1000)) / (60 * 1000));

    return `${hours}h ${minutes}m`;
  }
};
