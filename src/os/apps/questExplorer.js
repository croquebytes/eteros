// ===== Quest Explorer App =====
// Main combat and quest interface

import { gameState } from '../../state/gameState.js';
import { CONFIG } from '../../state/config.js';
import { onUIUpdate, getCombatStats } from '../../state/combatEngine.js';

export const questExplorerApp = {
  id: 'questExplorer',
  title: 'Quest Explorer – Dungeon.exe',

  createContent(rootEl) {
    // Create initial UI
    rootEl.innerHTML = `
      <div class="window-content quest-explorer">
        <div class="qe-column qe-party">
          <h2 class="window-subtitle">Party</h2>
          <div id="qe-party-list" class="party-list"></div>
        </div>
        <div class="qe-column qe-battle">
          <h2 class="window-subtitle">Battle</h2>
          <div class="battle-viewport">
            <div class="battle-header">
              <div class="battle-wave">Wave: <span id="qe-wave">1</span></div>
              <div class="battle-resources">
                <div>Gold: <span id="qe-gold">0</span></div>
                <div>XP: <span id="qe-xp">0</span></div>
              </div>
            </div>
            <div id="qe-enemy-list" class="enemy-list"></div>
            <div id="qe-event-notice" class="event-notice"></div>
          </div>
        </div>
        <div class="qe-column qe-quests">
          <h2 class="window-subtitle">Stats</h2>
          <div id="qe-stats" class="stats-panel"></div>
        </div>
      </div>
    `;

    // Initial render
    updateUI();

    // Register for combat updates
    onUIUpdate(() => {
      updateUI();
    });

    // Update UI function
    function updateUI() {
      const stats = getCombatStats();

      // Update wave and resources
      const waveEl = rootEl.querySelector('#qe-wave');
      const goldEl = rootEl.querySelector('#qe-gold');
      const xpEl = rootEl.querySelector('#qe-xp');

      if (waveEl) waveEl.textContent = stats.wave;
      if (goldEl) goldEl.textContent = Math.floor(stats.gold);
      if (xpEl) xpEl.textContent = Math.floor(stats.xp);

      // Update party list
      const partyList = rootEl.querySelector('#qe-party-list');
      if (partyList) {
        partyList.innerHTML = stats.heroes.map(hero => {
          const hpColor = hero.hpPercent > 50 ? '#10b981' : hero.hpPercent > 25 ? '#f59e0b' : '#ef4444';
          const classGlyph = CONFIG.heroClasses[hero.class]?.glyph || '⚔️';

          return `
            <div class="party-member ${hero.currentHp === 0 ? 'dead' : ''}">
              <div class="party-member-header">
                <span class="party-glyph">${classGlyph}</span>
                <span class="party-name">${hero.name}</span>
                <span class="party-level">Lv${hero.level}</span>
              </div>
              <div class="party-hp-bar">
                <div class="hp-bar-fill" style="width: ${hero.hpPercent}%; background: ${hpColor};"></div>
              </div>
              <div class="party-hp-text">${hero.currentHp} / ${hero.maxHp} HP</div>
            </div>
          `;
        }).join('');
      }

      // Update enemy list
      const enemyList = rootEl.querySelector('#qe-enemy-list');
      if (enemyList) {
        if (stats.enemies.length === 0) {
          enemyList.innerHTML = '<div class="no-enemies">Preparing next wave...</div>';
        } else {
          enemyList.innerHTML = stats.enemies.map(enemy => {
            const hpColor = enemy.hpPercent > 50 ? '#ef4444' : enemy.hpPercent > 25 ? '#f59e0b' : '#9ca3af';

            return `
              <div class="enemy ${enemy.isBoss ? 'boss' : ''}">
                <div class="enemy-header">
                  <span class="enemy-glyph">${enemy.isBoss ? '👑' : '💀'}</span>
                  <span class="enemy-name">${enemy.name}</span>
                </div>
                <div class="enemy-hp-bar">
                  <div class="hp-bar-fill" style="width: ${enemy.hpPercent}%; background: ${hpColor};"></div>
                </div>
                <div class="enemy-hp-text">${enemy.currentHp} / ${enemy.maxHp} HP</div>
              </div>
            `;
          }).join('');
        }
      }

      // Update event notice
      const eventNotice = rootEl.querySelector('#qe-event-notice');
      if (eventNotice) {
        if (stats.currentEvent) {
          eventNotice.innerHTML = `<div class="event-active">⚡ ${stats.currentEvent.name}</div>`;
          eventNotice.style.display = 'block';
        } else {
          eventNotice.style.display = 'none';
        }
      }

      // Update stats panel
      const statsPanel = rootEl.querySelector('#qe-stats');
      if (statsPanel) {
        statsPanel.innerHTML = `
          <div class="stat-row">
            <span class="stat-label">Enemies Killed:</span>
            <span class="stat-value">${gameState.stats.totalEnemiesKilled}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Bosses Killed:</span>
            <span class="stat-value">${gameState.stats.totalBossesKilled}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Highest Wave:</span>
            <span class="stat-value">${gameState.stats.highestWave}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Total Damage:</span>
            <span class="stat-value">${Math.floor(gameState.stats.totalDamageDealt)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Items Found:</span>
            <span class="stat-value">${gameState.stats.totalItemsFound}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Sigil Points:</span>
            <span class="stat-value">${gameState.sigilPoints}</span>
          </div>
        `;
      }
    }
  }
};
