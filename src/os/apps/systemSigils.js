// ===== System Sigils App =====
// Prestige system for meta progression

import { gameState, resetGame, saveGame } from '../../state/gameState.js';
import { CONFIG } from '../../state/config.js';

export const systemSigilsApp = {
  id: 'systemSigils',
  title: 'System Sigils – Prestige.exe',

  createContent(rootEl) {
    render(rootEl);
  }
};

function render(rootEl) {
  const sigilsToGain = CONFIG.sigilPowerFormula(gameState.lifetimeGold);
  const currentBonus = gameState.sigilPoints * CONFIG.sigilBonusPerPoint;
  const futureBonus = (gameState.sigilPoints + sigilsToGain) * CONFIG.sigilBonusPerPoint;

  // Calculate progress to next sigil
  const currentSigils = CONFIG.sigilPowerFormula(gameState.lifetimeGold);
  const nextSigilGold = Math.pow(currentSigils + 1, 2) * 1000;
  const progressToNext = gameState.lifetimeGold / nextSigilGold;
  const goldNeeded = Math.max(0, nextSigilGold - gameState.lifetimeGold);

  // Get sample hero stats for preview
  const sampleHero = gameState.heroes[0] || { maxHp: 100, attack: 10, defense: 5 };
  const currentStatMultiplier = 1 + currentBonus;
  const futureStatMultiplier = 1 + futureBonus;
  const currentPreviewHp = Math.floor(100 * currentStatMultiplier);
  const futurePreviewHp = Math.floor(100 * futureStatMultiplier);
  const currentPreviewAtk = Math.floor(10 * currentStatMultiplier);
  const futurePreviewAtk = Math.floor(10 * futureStatMultiplier);

  rootEl.innerHTML = `
    <div class="window-content system-sigils">
      <div class="sigils-panel">
        <h2 class="window-subtitle">Prestige System</h2>
        <div class="sigils-info">
          <div class="info-section">
            <div class="info-label">Current Sigil Points:</div>
            <div class="info-value sigil-current">${gameState.sigilPoints}</div>
          </div>
          <div class="info-section">
            <div class="info-label">Current Bonus:</div>
            <div class="info-value">+${(currentBonus * 100).toFixed(1)}% to all stats</div>
          </div>
          <div class="info-section">
            <div class="info-label">Lifetime Gold Earned:</div>
            <div class="info-value">${Math.floor(gameState.lifetimeGold).toLocaleString()}</div>
          </div>
          <div class="info-section">
            <div class="info-label">Total Prestiges:</div>
            <div class="info-value">${gameState.totalPrestiges}</div>
          </div>
        </div>

        <div class="prestige-divider"></div>

        <div class="progress-section">
          <h3 class="progress-title">Progress to Next Sigil Point</h3>
          <div class="sigil-progress-bar-bg">
            <div class="sigil-progress-bar-fill" style="width: ${Math.min(100, progressToNext * 100).toFixed(1)}%"></div>
          </div>
          <div class="progress-text">
            ${Math.floor(gameState.lifetimeGold).toLocaleString()} / ${Math.floor(nextSigilGold).toLocaleString()} gold
            ${goldNeeded > 0 ? `(${Math.floor(goldNeeded).toLocaleString()} needed)` : ''}
          </div>
        </div>

        <div class="prestige-divider"></div>

        <div class="prestige-section">
          <h3 class="prestige-title">Reset & Gain Power</h3>
          <p class="prestige-description">
            Resetting will return you to Wave 1, but you'll gain permanent Sigil Points
            that boost all your stats forever. All progress except Sigils and stats will be lost.
          </p>

          <div class="prestige-preview">
            <div class="preview-item">
              <span class="preview-label">Sigils to gain:</span>
              <span class="preview-value gain">${sigilsToGain}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">Total after reset:</span>
              <span class="preview-value">${gameState.sigilPoints + sigilsToGain}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">New bonus:</span>
              <span class="preview-value">+${(futureBonus * 100).toFixed(1)}%</span>
            </div>
          </div>

          ${sigilsToGain > 0 ? `
            <div class="stat-preview-box">
              <h4 class="stat-preview-title">Example Stat Changes (Base Level 1 Hero):</h4>
              <div class="stat-preview-grid">
                <div class="stat-preview-item">
                  <span class="stat-preview-name">HP:</span>
                  <span class="stat-preview-before">${currentPreviewHp}</span>
                  <span class="stat-preview-arrow">→</span>
                  <span class="stat-preview-after">${futurePreviewHp}</span>
                  <span class="stat-preview-diff">(+${futurePreviewHp - currentPreviewHp})</span>
                </div>
                <div class="stat-preview-item">
                  <span class="stat-preview-name">Attack:</span>
                  <span class="stat-preview-before">${currentPreviewAtk}</span>
                  <span class="stat-preview-arrow">→</span>
                  <span class="stat-preview-after">${futurePreviewAtk}</span>
                  <span class="stat-preview-diff">(+${futurePreviewAtk - currentPreviewAtk})</span>
                </div>
              </div>
            </div>
          ` : ''}

          ${sigilsToGain > 0 ?
            `<button class="btn-prestige" id="btn-prestige">
              Prestige Now (Gain ${sigilsToGain} Sigil${sigilsToGain !== 1 ? 's' : ''})
            </button>` :
            `<div class="prestige-warning">
              You need ${Math.floor(goldNeeded).toLocaleString()} more lifetime gold to gain your next Sigil Point. Keep playing!
            </div>`
          }
        </div>
      </div>

      <div class="stats-panel">
        <h2 class="window-subtitle">Statistics</h2>
        <div class="stat-list">
          <div class="stat-item">
            <span class="stat-name">Highest Wave:</span>
            <span class="stat-number">${gameState.stats.highestWave}</span>
          </div>
          <div class="stat-item">
            <span class="stat-name">Enemies Killed:</span>
            <span class="stat-number">${gameState.stats.totalEnemiesKilled}</span>
          </div>
          <div class="stat-item">
            <span class="stat-name">Bosses Killed:</span>
            <span class="stat-number">${gameState.stats.totalBossesKilled}</span>
          </div>
          <div class="stat-item">
            <span class="stat-name">Total Damage Dealt:</span>
            <span class="stat-number">${Math.floor(gameState.stats.totalDamageDealt).toLocaleString()}</span>
          </div>
          <div class="stat-item">
            <span class="stat-name">Total Damage Taken:</span>
            <span class="stat-number">${Math.floor(gameState.stats.totalDamageTaken).toLocaleString()}</span>
          </div>
          <div class="stat-item">
            <span class="stat-name">Items Found:</span>
            <span class="stat-number">${gameState.stats.totalItemsFound}</span>
          </div>
          <div class="stat-item">
            <span class="stat-name">Total Gold Earned:</span>
            <span class="stat-number">${Math.floor(gameState.stats.totalGoldEarned).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add event listener
  const btnPrestige = document.getElementById('btn-prestige');
  if (btnPrestige) {
    btnPrestige.addEventListener('click', () => handlePrestige(rootEl));
  }
}

function handlePrestige(rootEl) {
  const sigilsToGain = CONFIG.sigilPowerFormula(gameState.lifetimeGold);

  if (sigilsToGain === 0) {
    alert('You need more lifetime gold to prestige!');
    return;
  }

  const confirmed = confirm(
    `Are you sure you want to prestige?\n\n` +
    `You will gain ${sigilsToGain} Sigil Point${sigilsToGain !== 1 ? 's' : ''}.\n` +
    `This will reset your progress to Wave 1 and clear most stats.\n` +
    `Sigil Points provide permanent +${CONFIG.sigilBonusPerPoint * 100}% per point to all stats.\n\n` +
    `This action cannot be undone!`
  );

  if (confirmed) {
    resetGame();
    alert(`Prestige complete! You gained ${sigilsToGain} Sigil Point${sigilsToGain !== 1 ? 's' : ''}!`);
    render(rootEl);
  }
}
