/**
 * Cosmetic Terminal
 * Gacha-style system for cosmetic-only rewards (wallpapers, themes, icons)
 * Pure gold sink - NO gameplay advantages
 */

import { themeManager } from '../../state/themeManager.js';

export const cosmeticTerminal = {
  id: 'cosmeticTerminal',
  title: 'Aesthetic Terminal',
  resourceManager: null,

  // Gacha config
  singleRollCost: 100,
  tenRollCost: 900, // 10% discount
  guaranteedRareAt: 10, // Pity system

  // State
  totalRolls: 0,
  rollsSinceRare: 0,
  ownedCosmetics: new Set(), // Track owned items

  // Cosmetic pool
  cosmetics: {
    common: [
      { id: 'wallpaper_grid', name: 'Grid Wallpaper', type: 'wallpaper', description: 'Classic grid pattern' },
      { id: 'wallpaper_waves', name: 'Wave Wallpaper', type: 'wallpaper', description: 'Flowing wave pattern' },
      { id: 'icon_minimal', name: 'Minimal Icons', type: 'iconPack', description: 'Clean minimal icon set' },
      { id: 'icon_retro', name: 'Retro Icons', type: 'iconPack', description: 'Old-school pixel icons' },
      { id: 'frame_blue', name: 'Blue Window Frame', type: 'windowFrame', description: 'Cool blue window borders' },
      { id: 'frame_green', name: 'Green Window Frame', type: 'windowFrame', description: 'Matrix green borders' }
    ],
    rare: [
      { id: 'wallpaper_nebula', name: 'Nebula Wallpaper', type: 'wallpaper', description: 'Cosmic nebula background', rarity: 'rare' },
      { id: 'wallpaper_circuit', name: 'Circuit Board', type: 'wallpaper', description: 'Intricate circuit pattern', rarity: 'rare' },
      { id: 'icon_neon', name: 'Neon Icons', type: 'iconPack', description: 'Glowing neon icon set', rarity: 'rare' },
      { id: 'frame_gold', name: 'Gold Window Frame', type: 'windowFrame', description: 'Luxurious gold borders', rarity: 'rare' }
    ],
    epic: [
      { id: 'wallpaper_matrix', name: 'Matrix Rain', type: 'wallpaper', description: 'Falling code animation', rarity: 'epic' },
      { id: 'wallpaper_galaxy', name: 'Galaxy Spiral', type: 'wallpaper', description: 'Animated galaxy', rarity: 'epic' },
      { id: 'icon_animated', name: 'Animated Icons', type: 'iconPack', description: 'Icons with subtle animations', rarity: 'epic' },
      { id: 'frame_rainbow', name: 'RGB Window Frame', type: 'windowFrame', description: 'Color-shifting borders', rarity: 'epic' }
    ]
  },

  createContent(rootEl) {
    // Load owned cosmetics from localStorage
    this.loadState();

    rootEl.innerHTML = `
      <div class="cosmetic-terminal-container">
        <!-- Header -->
        <div class="cosmetic-header">
          <h3>✨ Aesthetic Terminal</h3>
          <p class="cosmetic-subtitle">Customize your desktop experience</p>
        </div>

        <!-- Stats -->
        <div class="cosmetic-stats">
          <div class="stat-box">
            <span class="stat-label">Total Rolls:</span>
            <span class="stat-value">${this.totalRolls}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Owned:</span>
            <span class="stat-value">${this.ownedCosmetics.size} / ${this.getTotalCosmetics()}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Next Guaranteed:</span>
            <span class="stat-value">${10 - this.rollsSinceRare} rolls</span>
          </div>
        </div>

        <!-- Roll Section -->
        <div class="cosmetic-roll-section">
          <h4>🎲 Dispense Cosmetics</h4>
          <div class="roll-buttons">
            <div class="roll-option">
              <button id="btn-single-roll" class="btn btn-primary">
                <div class="roll-name">Single Roll</div>
                <div class="roll-cost small-text">${this.singleRollCost} Gold</div>
              </button>
            </div>
            <div class="roll-option">
              <button id="btn-ten-roll" class="btn btn-success">
                <div class="roll-name">10× Roll</div>
                <div class="roll-cost small-text">${this.tenRollCost} Gold</div>
                <div class="roll-discount small-text">Save 100 Gold!</div>
              </button>
            </div>
          </div>
          <div id="roll-message" class="roll-message"></div>
        </div>

        <!-- Results Display -->
        <div class="cosmetic-results" id="cosmetic-results" style="display: none;">
          <h4>🎁 You Received:</h4>
          <div id="results-list" class="results-list">
            <!-- Results will be rendered here -->
          </div>
          <button id="btn-close-results" class="btn btn-secondary btn-block">Close</button>
        </div>

        <!-- Collection -->
        <div class="cosmetic-collection">
          <h4>📦 Your Collection</h4>
          <div class="collection-tabs">
            <button class="collection-tab tab-active" data-type="all">All</button>
            <button class="collection-tab" data-type="wallpaper">Wallpapers</button>
            <button class="collection-tab" data-type="iconPack">Icons</button>
            <button class="collection-tab" data-type="windowFrame">Frames</button>
          </div>
          <div id="collection-grid" class="collection-grid">
            <!-- Collection will be rendered here -->
          </div>
        </div>

        <!-- Info -->
        <div class="cosmetic-info">
          <h5>💡 About Cosmetics</h5>
          <ul>
            <li>Cosmetics are <strong>visual only</strong> - no gameplay bonuses</li>
            <li>Guaranteed rare or better every 10 rolls (pity system)</li>
            <li><span class="rarity-common">Common</span>: 70% chance</li>
            <li><span class="rarity-rare">Rare</span>: 25% chance</li>
            <li><span class="rarity-epic">Epic</span>: 5% chance</li>
            <li>Duplicates are automatically converted to gold refund (50%)</li>
          </ul>
        </div>
      </div>
    `;

    this.renderCollection(rootEl, 'all');
    this.attachEventListeners(rootEl);
  },

  setResourceManager(rm) {
    this.resourceManager = rm;
  },

  attachEventListeners(rootEl) {
    // Single roll
    rootEl.querySelector('#btn-single-roll')?.addEventListener('click', () => {
      this.performRoll(rootEl, 1);
    });

    // Ten roll
    rootEl.querySelector('#btn-ten-roll')?.addEventListener('click', () => {
      this.performRoll(rootEl, 10);
    });

    // Close results
    rootEl.querySelector('#btn-close-results')?.addEventListener('click', () => {
      rootEl.querySelector('#cosmetic-results').style.display = 'none';
    });

    // Collection tabs
    rootEl.querySelectorAll('.collection-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        rootEl.querySelectorAll('.collection-tab').forEach(t => t.classList.remove('tab-active'));
        tab.classList.add('tab-active');
        const type = tab.dataset.type;
        this.renderCollection(rootEl, type);
      });
    });
  },

  performRoll(rootEl, count) {
    const cost = count === 1 ? this.singleRollCost : this.tenRollCost;

    // Check if can afford
    if (!this.resourceManager || !this.resourceManager.canAfford({ gold: cost })) {
      const msgEl = rootEl.querySelector('#roll-message');
      msgEl.textContent = `Not enough gold! Need ${cost}.`;
      msgEl.className = 'roll-message error';
      setTimeout(() => msgEl.textContent = '', 3000);
      return;
    }

    // Spend gold
    this.resourceManager.spend('gold', cost);

    // Perform rolls
    const results = [];
    for (let i = 0; i < count; i++) {
      const item = this.rollCosmetic();
      results.push(item);
    }

    // Update state
    this.totalRolls += count;
    this.saveState();

    // Update stats display
    this.updateStats(rootEl);

    // Show results
    this.showResults(rootEl, results);

    // Refresh collection
    const activeTab = rootEl.querySelector('.collection-tab.tab-active');
    const type = activeTab ? activeTab.dataset.type : 'all';
    this.renderCollection(rootEl, type);
  },

  rollCosmetic() {
    this.rollsSinceRare++;

    let rarity;

    // Pity system
    if (this.rollsSinceRare >= this.guaranteedRareAt) {
      rarity = Math.random() < 0.5 ? 'rare' : 'epic';
      this.rollsSinceRare = 0;
    } else {
      // Normal roll
      const roll = Math.random();
      if (roll < 0.05) {
        rarity = 'epic';
        this.rollsSinceRare = 0;
      } else if (roll < 0.30) {
        rarity = 'rare';
        this.rollsSinceRare = 0;
      } else {
        rarity = 'common';
      }
    }

    // Select random item from rarity pool
    const pool = this.cosmetics[rarity];
    const item = pool[Math.floor(Math.random() * pool.length)];

    // Check if duplicate
    const isDuplicate = this.ownedCosmetics.has(item.id);

    if (!isDuplicate) {
      this.ownedCosmetics.add(item.id);
    }

    return {
      ...item,
      isDuplicate,
      rarity: rarity
    };
  },

  showResults(rootEl, results) {
    const resultsEl = rootEl.querySelector('#cosmetic-results');
    const listEl = rootEl.querySelector('#results-list');

    listEl.innerHTML = '';

    results.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = `result-item rarity-${item.rarity}`;

      const refund = item.isDuplicate ? Math.floor(this.singleRollCost * 0.5) : 0;

      itemEl.innerHTML = `
        <div class="result-icon">${this.getTypeIcon(item.type)}</div>
        <div class="result-info">
          <div class="result-name">${item.name}</div>
          <div class="result-description">${item.description}</div>
          <div class="result-type">${item.type} • ${item.rarity}</div>
          ${item.isDuplicate ? `<div class="result-duplicate">Duplicate! +${refund} Gold refunded</div>` : '<div class="result-new">NEW!</div>'}
        </div>
      `;

      listEl.appendChild(itemEl);

      // Grant refund for duplicate
      if (item.isDuplicate && this.resourceManager) {
        this.resourceManager.add('gold', refund, 'cosmeticDuplicate');
      }
    });

    resultsEl.style.display = 'block';
  },

  renderCollection(rootEl, filterType) {
    const gridEl = rootEl.querySelector('#collection-grid');
    if (!gridEl) return;

    gridEl.innerHTML = '';

    // Get all cosmetics
    const allCosmetics = [
      ...this.cosmetics.common,
      ...this.cosmetics.rare,
      ...this.cosmetics.epic
    ];

    // Filter
    const filtered = filterType === 'all'
      ? allCosmetics
      : allCosmetics.filter(c => c.type === filterType);

    if (filtered.length === 0) {
      gridEl.innerHTML = '<p class="empty-state">No cosmetics in this category</p>';
      return;
    }

    filtered.forEach(cosmetic => {
      const owned = this.ownedCosmetics.has(cosmetic.id);
      const rarity = cosmetic.rarity || 'common';
      const isApplied = themeManager.isCosmeticApplied(cosmetic.id);

      const itemEl = document.createElement('div');
      itemEl.className = `collection-item ${owned ? 'owned' : 'locked'} rarity-${rarity} ${isApplied ? 'cosmetic-applied' : ''}`;

      itemEl.innerHTML = `
        <div class="collection-icon">${owned ? this.getTypeIcon(cosmetic.type) : '🔒'}</div>
        <div class="collection-name">${owned ? cosmetic.name : '???'}</div>
        <div class="collection-type">${cosmetic.type}</div>
        ${owned ? `
          <button class="btn-apply-cosmetic" data-cosmetic-id="${cosmetic.id}" data-cosmetic-type="${cosmetic.type}">
            ${isApplied ? '✓ Applied' : 'Apply'}
          </button>
        ` : ''}
      `;

      // Show tooltip on hover if owned
      if (owned) {
        itemEl.title = cosmetic.description;
      }

      gridEl.appendChild(itemEl);
    });

    // Add event listeners for Apply buttons
    gridEl.querySelectorAll('.btn-apply-cosmetic').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cosmeticId = btn.dataset.cosmeticId;
        const cosmeticType = btn.dataset.cosmeticType;
        this.applyCosmetic(cosmeticId, cosmeticType, rootEl);
      });
    });
  },

  getTypeIcon(type) {
    const icons = {
      wallpaper: '🖼️',
      iconPack: '📱',
      windowFrame: '🪟'
    };
    return icons[type] || '✨';
  },

  getTotalCosmetics() {
    return this.cosmetics.common.length + this.cosmetics.rare.length + this.cosmetics.epic.length;
  },

  updateStats(rootEl) {
    // Update stat boxes
    const stats = rootEl.querySelectorAll('.stat-value');
    if (stats.length >= 3) {
      stats[0].textContent = this.totalRolls;
      stats[1].textContent = `${this.ownedCosmetics.size} / ${this.getTotalCosmetics()}`;
      stats[2].textContent = `${Math.max(0, 10 - this.rollsSinceRare)} rolls`;
    }
  },

  saveState() {
    const state = {
      totalRolls: this.totalRolls,
      rollsSinceRare: this.rollsSinceRare,
      ownedCosmetics: Array.from(this.ownedCosmetics)
    };
    localStorage.setItem('cosmeticTerminalState', JSON.stringify(state));
  },

  loadState() {
    const saved = localStorage.getItem('cosmeticTerminalState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        this.totalRolls = state.totalRolls || 0;
        this.rollsSinceRare = state.rollsSinceRare || 0;
        this.ownedCosmetics = new Set(state.ownedCosmetics || []);
      } catch (e) {
        console.warn('Failed to load cosmetic state:', e);
      }
    }
  },

  /**
   * Apply a cosmetic
   * @param {string} cosmeticId - ID of cosmetic to apply
   * @param {string} cosmeticType - Type of cosmetic (wallpaper, windowFrame, iconPack)
   * @param {HTMLElement} rootEl - Root element for UI updates
   */
  applyCosmetic(cosmeticId, cosmeticType, rootEl) {
    let success = false;

    switch (cosmeticType) {
      case 'wallpaper':
        success = themeManager.applyWallpaper(cosmeticId);
        break;
      case 'windowFrame':
        success = themeManager.applyWindowFrame(cosmeticId);
        break;
      case 'iconPack':
        success = themeManager.applyIconPack(cosmeticId);
        break;
      default:
        console.warn('Unknown cosmetic type:', cosmeticType);
    }

    if (success) {
      // Refresh collection to update UI
      const activeTab = rootEl.querySelector('.collection-tab.tab-active');
      const type = activeTab ? activeTab.dataset.type : 'all';
      this.renderCollection(rootEl, type);
    }
  }
};
