// ===== Recycle Shrine App =====
// Item disassembly and resource management

import { gameState } from '../../state/gameState.js';

export const recycleShrineApp = {
  id: 'recycleShrine',
  title: 'Recycle Shrine – Disassembly.exe',

  createContent(rootEl) {
    rootEl.innerHTML = `
      <div class="window-content recycle-shrine">
        <div class="shrine-info">
          <h2 class="window-subtitle">♻️ Item Disassembly</h2>
          <p class="shrine-description">
            Unwanted items can be recycled from your inventory for resources.
            Open the <strong class="text-emphasis">Loot Downloads</strong> app and click the "Recycle" button on any item.
          </p>

          <div class="resource-display">
            <div class="resource-item">
              <span class="resource-icon icon-with-text">💰</span>
              <div class="resource-info">
                <div class="resource-label label-text">Gold</div>
                <div class="resource-value">${Math.floor(gameState.gold).toLocaleString()}</div>
              </div>
            </div>
            <div class="resource-item">
              <span class="resource-icon icon-with-text">🔮</span>
              <div class="resource-info">
                <div class="resource-label label-text">Fragments</div>
                <div class="resource-value">${gameState.fragments.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div class="shrine-tips mt-lg">
            <h3 class="section-title">💡 Recycling Tips</h3>
            <ul class="tips-list">
              <li><span class="tip-icon">✓</span> Higher rarity items give more resources</li>
              <li><span class="tip-icon">✓</span> Higher level items give more gold</li>
              <li><span class="tip-icon">✓</span> Fragments are used for future features</li>
              <li><span class="tip-icon">✓</span> Don't recycle equipped items - unequip them first!</li>
            </ul>
          </div>
        </div>

        <div class="shrine-visual">
          <div class="shrine-animation">
            <div class="shrine-icon icon-large">♻️</div>
            <div class="shrine-glow"></div>
          </div>
          <div class="shrine-flavor small-text text-muted">
            "All things return to the void,<br>
            only to be reborn anew."
          </div>
        </div>
      </div>
    `;
  }
};
