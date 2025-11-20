// ===== System Skills =====
// OS-themed skill progression system (CPU/Networking/Storage)
// Inspired by reference doc: reincarnos_os_gameplay_reference.md Section 4.2

import { eventBus, EVENTS } from './eventBus.js';
import { showToast } from '../os/toastManager.js';

// System Skill Definitions
export const SYSTEM_SKILLS = {
  cpu: {
    id: 'cpu',
    name: 'CPU Management',
    icon: '⚙️',
    description: 'Increases combat damage and task completion speed',
    color: '#60a5fa',
    bonuses: {
      combatDamage: 0.05, // +5% damage per level
      taskSpeed: 0.03 // +3% task speed per level
    }
  },
  networking: {
    id: 'networking',
    name: 'Networking',
    icon: '🌐',
    description: 'Increases gold gain and unlocks new dungeons',
    color: '#10b981',
    bonuses: {
      goldMultiplier: 0.04, // +4% gold per level
      dungeonUnlocks: true
    }
  },
  storage: {
    id: 'storage',
    name: 'Storage Management',
    icon: '💾',
    description: 'Increases inventory size and item quality',
    color: '#a855f7',
    bonuses: {
      inventorySlots: 2, // +2 slots per level
      itemQuality: 0.02 // +2% better item rolls per level
    }
  }
};

// XP requirements per level (exponential scaling)
function getXpForLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

/**
 * Initialize system skills in game state
 */
export function initSystemSkills(gameState) {
  if (!gameState.systemSkills) {
    gameState.systemSkills = {
      cpu: { level: 1, xp: 0, xpToNext: getXpForLevel(2), unlocked: true },
      networking: { level: 1, xp: 0, xpToNext: getXpForLevel(2), unlocked: true },
      storage: { level: 1, xp: 0, xpToNext: getXpForLevel(2), unlocked: true }
    };
  }
}

/**
 * Grant XP to a system skill
 */
export function grantSkillXp(gameState, skillId, amount, source = 'unknown') {
  if (!gameState.systemSkills) {
    initSystemSkills(gameState);
  }

  const skill = gameState.systemSkills[skillId];
  if (!skill || !skill.unlocked) {
    console.warn(`Skill ${skillId} not found or not unlocked`);
    return;
  }

  skill.xp += amount;

  // Check for level up
  while (skill.xp >= skill.xpToNext) {
    skill.xp -= skill.xpToNext;
    skill.level += 1;
    skill.xpToNext = getXpForLevel(skill.level + 1);

    // Emit level up event
    const skillDef = SYSTEM_SKILLS[skillId];
    eventBus.emit(EVENTS.SKILL_LEVEL_UP, { skillId, level: skill.level, skillDef });

    // Show toast notification
    showToast(
      `${skillDef.icon} ${skillDef.name} leveled up to ${skill.level}!`,
      'level-up',
      4000
    );

    console.log(`System Skill Level Up: ${skillDef.name} -> Level ${skill.level}`);

    // Check for unlocks at specific levels
    checkSkillUnlocks(gameState, skillId, skill.level);
  }
}

/**
 * Check for unlocks at specific skill levels
 */
function checkSkillUnlocks(gameState, skillId, level) {
  // Example: Unlock new features at milestones
  if (skillId === 'networking' && level === 5) {
    showToast('🌐 New dungeon unlocked: Data Center Raid!', 'info', 5000);
  }

  if (skillId === 'cpu' && level === 10) {
    showToast('⚙️ Multi-threading unlocked! Tasks run faster.', 'success', 5000);
  }

  if (skillId === 'storage' && level === 5) {
    showToast('💾 Cloud Storage unlocked! +20 inventory slots', 'success', 5000);
    gameState.maxInventorySlots += 20;
  }
}

/**
 * Get total bonus for a specific type
 */
export function getSkillBonus(gameState, bonusType) {
  if (!gameState.systemSkills) {
    initSystemSkills(gameState);
  }

  let totalBonus = 0;

  for (const [skillId, skillData] of Object.entries(gameState.systemSkills)) {
    const skillDef = SYSTEM_SKILLS[skillId];
    if (!skillDef || !skillData.unlocked) continue;

    const bonus = skillDef.bonuses[bonusType];
    if (bonus) {
      if (typeof bonus === 'number') {
        totalBonus += bonus * (skillData.level - 1); // Level 1 = no bonus, Level 2 = 1x bonus, etc.
      }
    }
  }

  return totalBonus;
}

/**
 * Get multiplier from skill bonuses (1.0 = no bonus)
 */
export function getSkillMultiplier(gameState, bonusType) {
  return 1.0 + getSkillBonus(gameState, bonusType);
}

/**
 * Hook into game events to grant skill XP
 */
export function hookSkillXpGains(gameState) {
  // CPU XP from combat
  eventBus.on(EVENTS.ENEMY_DEFEATED, (data) => {
    grantSkillXp(gameState, 'cpu', data.isBoss ? 15 : 5, 'combat');
  });

  // CPU XP from task completion
  eventBus.on(EVENTS.TASK_COMPLETED, (task) => {
    if (task.type === 'compilation' || task.type === 'defrag') {
      grantSkillXp(gameState, 'cpu', 10, 'task');
    }
    if (task.type === 'research') {
      grantSkillXp(gameState, 'networking', 8, 'research');
    }
  });

  // Networking XP from gold gains
  eventBus.on(EVENTS.GOLD_GAINED, (data) => {
    if (data.amount >= 100) {
      grantSkillXp(gameState, 'networking', Math.floor(data.amount / 100), 'gold');
    }
  });

  // Storage XP from item collection
  eventBus.on(EVENTS.ITEM_COLLECTED, (item) => {
    const xpMap = { common: 2, uncommon: 4, rare: 8, epic: 15, legendary: 30 };
    grantSkillXp(gameState, 'storage', xpMap[item.rarity] || 2, 'loot');
  });

  console.log('System Skills XP hooks initialized');
}

/**
 * Get formatted skill progress string
 */
export function getSkillProgressText(skillData) {
  const percent = Math.floor((skillData.xp / skillData.xpToNext) * 100);
  return `${skillData.xp.toLocaleString()} / ${skillData.xpToNext.toLocaleString()} (${percent}%)`;
}
