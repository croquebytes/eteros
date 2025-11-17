// ===== Quest Explorer App =====
// Dungeon controller and hero status interface

import { gameState } from '../../state/enhancedGameState.js';
import { onDungeonUpdate, getDungeonStats, toggleDungeon, stopDungeon } from '../../state/dungeonRunner.js';
import { updateHeroStats } from '../../state/heroSystem.js';

export const questExplorerApp = {
  id: 'questExplorer',
  title: 'Quest Explorer – Dungeon.exe',

  createContent(rootEl) {
    // Create initial UI
    rootEl.innerHTML = `
      <div class="window-content quest-explorer">
        <div class="qe-header">
          <div class="qe-controls">
            <button id="qe-toggle-run" class="btn">Start Dungeon</button>
            <button id="qe-stop-run" class="btn btn-secondary">Stop</button>
          </div>
          <div class="qe-progress">
            <div class="progress-bar"><div id="qe-progress-fill" class="progress-fill"></div></div>
            <span id="qe-progress-text">Idle</span>
          </div>
        </div>
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
          <h2 class="window-subtitle">Heroes</h2>
          <div id="qe-stats" class="stats-panel"></div>
        </div>
      </div>
    `;

    // Initial render
    updateUI();

    // Register for dungeon updates
    onDungeonUpdate(() => {
      updateUI();
    });

    // Wire buttons
    rootEl.querySelector('#qe-toggle-run')?.addEventListener('click', () => {
      toggleDungeon();
      updateUI();
    });

    rootEl.querySelector('#qe-stop-run')?.addEventListener('click', () => {
      stopDungeon();
      updateUI();
    });

    // Update UI function
    function updateUI() {
      const stats = getDungeonStats();

      // Update wave and resources
      const waveEl = rootEl.querySelector('#qe-wave');
      const goldEl = rootEl.querySelector('#qe-gold');
      const xpEl = rootEl.querySelector('#qe-xp');

      if (waveEl) waveEl.textContent = stats.wave;
      if (goldEl) goldEl.textContent = Math.floor(stats.gold);
      if (xpEl) xpEl.textContent = Math.floor(stats.xp);

      const progressFill = rootEl.querySelector('#qe-progress-fill');
      const progressText = rootEl.querySelector('#qe-progress-text');
      const toggleBtn = rootEl.querySelector('#qe-toggle-run');

      if (progressFill) {
        progressFill.style.width = `${stats.progress}%`;
      }
      if (progressText) {
        progressText.textContent = stats.running ? `Advancing... ${stats.progress}%` : 'Idle';
      }
      if (toggleBtn) {
        toggleBtn.textContent = stats.running ? 'Pause Dungeon' : 'Start Dungeon';
      }

      // Update party list
      const partyList = rootEl.querySelector('#qe-party-list');
      if (partyList) {
        // Ensure stats are current
        gameState.heroes.forEach(hero => updateHeroStats(hero));

        partyList.innerHTML = gameState.heroes.map(hero => {
          const hpPercent = Math.floor((hero.currentHp / hero.currentStats.hp) * 100);
          const hpColor = hpPercent > 50 ? '#10b981' : hpPercent > 25 ? '#f59e0b' : '#ef4444';
          const status = hero.onDispatch ? 'On Dispatch' : hero.fatigued ? 'Fatigued' : stats.running ? 'Exploring' : 'Idle';

          return `
            <div class="party-member ${hero.currentHp === 0 ? 'dead' : ''}">
              <div class="party-member-header">
                <span class="party-glyph">${hero.role?.[0]?.toUpperCase() || '⚔️'}</span>
                <span class="party-name">${hero.name}</span>
                <span class="party-level">Lv${hero.level}</span>
              </div>
              <div class="party-hp-bar">
                <div class="hp-bar-fill" style="width: ${hpPercent}%; background: ${hpColor};"></div>
              </div>
              <div class="party-hp-text">${hero.currentHp} / ${hero.currentStats.hp} HP — ${status}</div>
            </div>
          `;
        }).join('');
      }

      // Update enemy list
      const enemyList = rootEl.querySelector('#qe-enemy-list');
      if (enemyList) {
        enemyList.innerHTML = stats.running
          ? '<div class="no-enemies">Simulating dungeon wave...</div>'
          : '<div class="no-enemies">Dungeon paused</div>';
      }

      // Update stats panel
      const statsPanel = rootEl.querySelector('#qe-stats');
      if (statsPanel) {
        statsPanel.innerHTML = gameState.heroes.map(hero => {
          return `
            <div class="stat-row">
              <div class="stat-label">${hero.name} (Lv${hero.level})</div>
              <div class="stat-value">HP ${hero.currentStats.hp} | ATK ${hero.currentStats.atk} | DEF ${hero.currentStats.def}</div>
            </div>
          `;
        }).join('');
      }
    }
  }
};
