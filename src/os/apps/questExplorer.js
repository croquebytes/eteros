// ===== Quest Explorer App =====
// Dungeon controller and hero status interface

import { gameState } from '../../state/enhancedGameState.js';
import { onDungeonUpdate, getDungeonStats, toggleDungeon, stopDungeon, getCombatLog } from '../../state/dungeonRunner.js';
import { updateHeroStats, calculateXpForLevel } from '../../state/heroSystem.js';

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
                <div>💰 <span id="qe-gold">0</span></div>
              </div>
            </div>
            <div id="qe-enemy-list" class="enemy-list"></div>
            <div id="qe-event-notice" class="event-notice"></div>
          </div>
        </div>
        <div class="qe-column qe-quests">
          <h2 class="window-subtitle">Combat Log</h2>
          <div id="qe-combat-log" class="combat-log"></div>
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

      if (waveEl) waveEl.textContent = stats.wave;
      if (goldEl) goldEl.textContent = Math.floor(stats.gold);

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
          const status = hero.onDispatch ? 'On Dispatch' : hero.fatigued ? 'Fatigued' : stats.running ? 'Fighting' : 'Idle';

          // Calculate XP progress
          const xpPercent = Math.floor((hero.xp / hero.xpToNextLevel) * 100);
          const xpRemaining = hero.xpToNextLevel - hero.xp;

          return `
            <div class="party-member ${hero.currentHp === 0 ? 'dead' : ''}">
              <div class="party-member-header">
                <span class="party-glyph">${hero.role?.[0]?.toUpperCase() || '⚔️'}</span>
                <span class="party-name">${hero.name}</span>
                <span class="party-level">Lv${hero.level}</span>
              </div>
              <div class="party-stats-mini">
                ⚔️${hero.currentStats.atk} 🛡️${hero.currentStats.def} ⚡${hero.currentStats.spd || 0}
              </div>
              <div class="party-hp-bar">
                <div class="hp-bar-fill" style="width: ${hpPercent}%; background: ${hpColor};"></div>
              </div>
              <div class="party-hp-text">${hero.currentHp} / ${hero.currentStats.hp} HP</div>
              <div class="party-xp-bar">
                <div class="xp-bar-fill" style="width: ${xpPercent}%;"></div>
              </div>
              <div class="party-xp-text">XP: ${hero.xp} / ${hero.xpToNextLevel} (${xpRemaining} to next)</div>
              <div class="party-status">${status}</div>
            </div>
          `;
        }).join('');
      }

      // Update enemy list
      const enemyList = rootEl.querySelector('#qe-enemy-list');
      if (enemyList) {
        if (!stats.running) {
          enemyList.innerHTML = '<div class="no-enemies">Dungeon paused. Click "Start Dungeon" to begin!</div>';
        } else if (!stats.enemies || stats.enemies.length === 0) {
          enemyList.innerHTML = '<div class="no-enemies">No enemies... Victory incoming!</div>';
        } else {
          enemyList.innerHTML = stats.enemies.map(enemy => {
            const hpPercent = enemy.hpPercent;
            const hpColor = hpPercent > 50 ? '#ef4444' : hpPercent > 25 ? '#f59e0b' : '#dc2626';
            const isDead = enemy.currentHp === 0;

            return `
              <div class="enemy-card ${isDead ? 'dead' : ''} ${enemy.isBoss ? 'boss' : ''}">
                <div class="enemy-header">
                  <span class="enemy-name">${enemy.name}</span>
                  ${enemy.isBoss ? '<span class="boss-badge">BOSS</span>' : ''}
                </div>
                <div class="enemy-stats">
                  ⚔️${enemy.atk} 🛡️${enemy.def}
                </div>
                <div class="enemy-hp-bar">
                  <div class="enemy-hp-fill" style="width: ${hpPercent}%; background: ${hpColor};"></div>
                </div>
                <div class="enemy-hp-text">${enemy.currentHp} / ${enemy.maxHp} HP</div>
              </div>
            `;
          }).join('');
        }
      }

      // Update combat log
      const combatLogEl = rootEl.querySelector('#qe-combat-log');
      if (combatLogEl) {
        const log = getCombatLog(8);
        if (log.length === 0) {
          combatLogEl.innerHTML = '<div class="log-empty">No combat activity yet...</div>';
        } else {
          combatLogEl.innerHTML = log.map(entry => {
            let icon = '⚔️';
            let className = 'log-entry';
            let text = '';

            if (entry.type === 'hero-attack') {
              icon = '⚔️';
              className = 'log-entry log-hero-attack';
              text = `${entry.attacker} attacks ${entry.target} for ${entry.damage} damage`;
            } else if (entry.type === 'enemy-attack') {
              icon = '💥';
              className = 'log-entry log-enemy-attack';
              text = `${entry.attacker} hits ${entry.target} for ${entry.damage} damage`;
            } else if (entry.type === 'enemy-defeated') {
              icon = '💀';
              className = 'log-entry log-enemy-defeated';
              text = `${entry.enemy} defeated!`;
            } else if (entry.type === 'hero-defeated') {
              icon = '☠️';
              className = 'log-entry log-hero-defeated';
              text = `${entry.hero} has fallen!`;
            }

            return `<div class="${className}">${icon} ${text}</div>`;
          }).join('');

          // Auto-scroll to bottom
          setTimeout(() => {
            combatLogEl.scrollTop = combatLogEl.scrollHeight;
          }, 10);
        }
      }
    }
  }
};
