// ===== System Monitor App =====
// Display CPU/Networking/Storage skill progression
// Reference: reincarnos_os_gameplay_reference.md Section 4.2

import { gameState } from '../../state/gameState.js';
import { SYSTEM_SKILLS, getSkillProgressText } from '../../state/systemSkills.js';
import { eventBus, EVENTS } from '../../state/eventBus.js';

export const systemMonitor = {
  id: 'systemMonitor',
  title: 'System Monitor – TaskMgr.exe',

  createContent(rootEl) {
    render(rootEl);

    // Listen for skill level ups to refresh UI
    eventBus.on(EVENTS.SKILL_LEVEL_UP, () => {
      render(rootEl);
    });

    // Periodic refresh (every 1 second) to update XP progress
    const intervalId = setInterval(() => {
      if (rootEl.isConnected) {
        updateSkillProgress(rootEl);
      } else {
        clearInterval(intervalId);
      }
    }, 1000);
  }
};

function render(rootEl) {
  if (!gameState.systemSkills) {
    rootEl.innerHTML = `
      <div class="window-content system-monitor">
        <div class="error-message">
          <p>❌ System skills not initialized</p>
        </div>
      </div>
    `;
    return;
  }

  const { cpu, networking, storage } = gameState.systemSkills;

  rootEl.innerHTML = `
    <div class="window-content system-monitor">
      <div class="system-monitor-header">
        <h2 class="window-subtitle">OS Performance & Skills</h2>
        <p class="system-monitor-desc">Track CPU, Networking, and Storage management skill levels</p>
      </div>

      <div class="system-skills-container">
        ${renderSkillCard('cpu', cpu)}
        ${renderSkillCard('networking', networking)}
        ${renderSkillCard('storage', storage)}
      </div>

      <div class="system-monitor-legend">
        <h3>How Skills Level Up:</h3>
        <div class="legend-grid">
          <div class="legend-item">
            <span class="legend-icon">⚙️</span>
            <span class="legend-text"><strong>CPU:</strong> Defeat enemies, complete tasks</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon">🌐</span>
            <span class="legend-text"><strong>Networking:</strong> Earn gold, complete research</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon">💾</span>
            <span class="legend-text"><strong>Storage:</strong> Collect items and loot</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSkillCard(skillId, skillData) {
  const skillDef = SYSTEM_SKILLS[skillId];
  if (!skillDef || !skillData) {
    return `<div class="skill-card">Error loading skill</div>`;
  }

  const progressPercent = Math.floor((skillData.xp / skillData.xpToNext) * 100);
  const progressText = getSkillProgressText(skillData);

  // Calculate active bonuses
  const bonuses = calculateBonuses(skillId, skillData.level);

  return `
    <div class="skill-card" data-skill-id="${skillId}" style="border-color: ${skillDef.color}">
      <div class="skill-header">
        <div class="skill-icon" style="background-color: ${skillDef.color}20; color: ${skillDef.color}">
          ${skillDef.icon}
        </div>
        <div class="skill-title-group">
          <h3 class="skill-name">${skillDef.name}</h3>
          <p class="skill-description">${skillDef.description}</p>
        </div>
      </div>

      <div class="skill-level">
        <span class="skill-level-label">Level</span>
        <span class="skill-level-value">${skillData.level}</span>
      </div>

      <div class="skill-progress-section">
        <div class="skill-progress-bar-bg">
          <div
            class="skill-progress-bar-fill"
            data-skill="${skillId}"
            style="width: ${progressPercent}%; background-color: ${skillDef.color}"
          ></div>
        </div>
        <div class="skill-progress-text">${progressText}</div>
      </div>

      <div class="skill-bonuses">
        <h4 class="skill-bonuses-title">Active Bonuses:</h4>
        <ul class="skill-bonuses-list">
          ${bonuses.map(bonus => `<li>${bonus}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

/**
 * Calculate and format active bonuses for display
 */
function calculateBonuses(skillId, level) {
  const skillDef = SYSTEM_SKILLS[skillId];
  const bonuses = [];

  // Level 1 = no bonus, Level 2 = 1x bonus, etc.
  const bonusLevels = level - 1;

  if (skillId === 'cpu') {
    const combatDamage = (skillDef.bonuses.combatDamage * bonusLevels * 100).toFixed(0);
    const taskSpeed = (skillDef.bonuses.taskSpeed * bonusLevels * 100).toFixed(0);
    bonuses.push(`+${combatDamage}% combat damage`);
    bonuses.push(`+${taskSpeed}% task completion speed`);
  } else if (skillId === 'networking') {
    const goldMult = (skillDef.bonuses.goldMultiplier * bonusLevels * 100).toFixed(0);
    bonuses.push(`+${goldMult}% gold from all sources`);
    if (level >= 5) {
      bonuses.push(`🔓 Data Center Raid unlocked`);
    }
  } else if (skillId === 'storage') {
    const inventorySlots = skillDef.bonuses.inventorySlots * bonusLevels;
    const itemQuality = (skillDef.bonuses.itemQuality * bonusLevels * 100).toFixed(0);
    bonuses.push(`+${inventorySlots} inventory slots`);
    bonuses.push(`+${itemQuality}% item quality`);
    if (level >= 5) {
      bonuses.push(`🔓 Cloud Storage (+20 slots)`);
    }
    if (level >= 10) {
      bonuses.push(`🔓 RAID Array (+50 slots)`);
    }
  }

  if (bonuses.length === 0) {
    bonuses.push('No bonuses yet (level up to gain!)');
  }

  return bonuses;
}

/**
 * Update only the progress bars without full re-render
 */
function updateSkillProgress(rootEl) {
  if (!gameState.systemSkills) return;

  ['cpu', 'networking', 'storage'].forEach(skillId => {
    const skillData = gameState.systemSkills[skillId];
    if (!skillData) return;

    const progressBar = rootEl.querySelector(`.skill-progress-bar-fill[data-skill="${skillId}"]`);
    const progressText = rootEl.querySelector(`.skill-card[data-skill-id="${skillId}"] .skill-progress-text`);
    const levelValue = rootEl.querySelector(`.skill-card[data-skill-id="${skillId}"] .skill-level-value`);

    if (progressBar) {
      const progressPercent = Math.floor((skillData.xp / skillData.xpToNext) * 100);
      progressBar.style.width = `${progressPercent}%`;
    }

    if (progressText) {
      progressText.textContent = getSkillProgressText(skillData);
    }

    if (levelValue) {
      levelValue.textContent = skillData.level;
    }
  });
}
