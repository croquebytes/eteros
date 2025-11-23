// ===== Hero System =====
// Hero creation, leveling, stat calculation, and equipment

import { HERO_TEMPLATES } from './heroTemplates.js';
import { getNodeById } from '../data/skillTrees.js';
import { applyHeroSynergyBonuses } from './heroSynergies.js';

// Helper to get research bonuses (defined later to avoid circular dependency issues)
let researchBonusesGetter = null;
export function setResearchBonusesGetter(getter) {
  researchBonusesGetter = getter;
}

// XP Curve Configuration
export const XP_CURVE = {
  early: (level) => 100 * level,                              // Levels 1-20
  mid: (level) => 150 * level,                                // Levels 21-50
  late: (level) => Math.floor(200 * level * (1 + level / 100)) // Levels 51-100
};

// Rarity multipliers for stat growth
export const RARITY_MULTIPLIERS = {
  1: 0.8,   // Common
  2: 0.9,   // Uncommon
  3: 1.0,   // Rare
  4: 1.2,   // Epic
  5: 1.5    // Legendary
};

// Level breakpoint unlocks
export const LEVEL_UNLOCKS = {
  10: 'passiveSlot1',
  20: 'abilitySlot2',
  25: 'dispatchTier2',
  30: 'passiveSlot2',
  50: 'dispatchTier3',
  75: 'ultimateAbility',
  100: 'finalPassive'
};

// Create a new hero instance from a template
export function createHero(templateId, level = 1) {
  const template = HERO_TEMPLATES[templateId];
  if (!template) {
    console.error(`Hero template not found: ${templateId}`);
    return null;
  }

  const hero = {
    id: `hero_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    templateId: template.id,
    name: template.name,
    rarity: template.rarity,
    role: template.role,

    // Level and XP
    level: level,
    xp: 0,
    xpToNextLevel: calculateXpForLevel(level + 1),

    // Base stats (at level 1)
    baseStats: { ...template.baseStats },
    growthRates: { ...template.growthRates },

    // Current calculated stats (will be recalculated)
    currentStats: {},

    // Equipment
    equipment: {
      weapon: null,
      armor: null,
      accessory: null
    },

    // Abilities
    abilities: template.abilities.map(ability => ({
      ...ability,
      cooldownRemaining: 0
    })),

    // Awakening
    awakenings: 0,  // 0-5

    // Combat state
    currentHp: 0,  // Will be set after stat calculation
    lastAttackTime: 0,
    statusEffects: [],

    // Dispatch state
    onDispatch: false,
    dispatchId: null,
    dispatchEndTime: null,

    // Fatigue (from failed dispatches)
    fatigued: false,
    fatigueEndTime: null,

    // Skill Tree
    skillPoints: Math.max(0, level - 1), // 1 point per level beyond 1
    unlockedSkillNodes: [] // Array of skill node IDs
  };

  // Calculate current stats
  updateHeroStats(hero);

  // Log initial skill points
  if (hero.skillPoints > 0) {
    console.log(`${hero.name} created at level ${level} with ${hero.skillPoints} skill points`);
  }

  return hero;
}

// Calculate XP required for a specific level
export function calculateXpForLevel(level) {
  if (level <= 20) {
    return XP_CURVE.early(level);
  } else if (level <= 50) {
    return XP_CURVE.mid(level);
  } else {
    return XP_CURVE.late(level);
  }
}

// Calculate hero's current stats based on level, equipment, and buffs
export function updateHeroStats(hero, systemWideSoulware = []) {
  const template = HERO_TEMPLATES[hero.templateId];
  const rarityMult = RARITY_MULTIPLIERS[hero.rarity];

  // Base stats + level growth
  const stats = {};
  for (const statName of ['hp', 'atk', 'def', 'spd', 'lck']) {
    const baseStat = hero.baseStats[statName] || 0;
    const growth = hero.growthRates[statName] || 0;
    const levelBonus = growth * (hero.level - 1) * rarityMult;

    stats[statName] = Math.floor(baseStat + levelBonus);
  }

  // Awakening bonuses (+10% per awakening)
  if (hero.awakenings > 0) {
    const awakeningMultiplier = 1 + (hero.awakenings * 0.10);
    for (const statName in stats) {
      stats[statName] = Math.floor(stats[statName] * awakeningMultiplier);
    }
  }

  // Research bonuses (applied early to base stats)
  if (researchBonusesGetter) {
    const research = researchBonusesGetter();
    if (research) {
      // Hero damage boost
      if (research.heroDamageBoost && research.heroDamageBoost > 1) {
        stats.atk = Math.floor(stats.atk * research.heroDamageBoost);
      }

      // Attack speed boost
      if (research.heroAttackSpeedBoost && research.heroAttackSpeedBoost > 1) {
        stats.spd = Math.floor(stats.spd * research.heroAttackSpeedBoost);
      }
    }
  }

  // Equipment bonuses
  for (const slot in hero.equipment) {
    const item = hero.equipment[slot];
    if (item && item.statBonuses) {
      for (const statName in item.statBonuses) {
        // Handle flat bonuses
        if (!statName.includes('Percent') && stats[statName] !== undefined) {
          stats[statName] += item.statBonuses[statName];
        }
        // Handle percentage bonuses
        else if (statName.endsWith('Percent')) {
          const baseStat = statName.replace('Percent', '');
          if (stats[baseStat] !== undefined) {
            stats[baseStat] = Math.floor(stats[baseStat] * (1 + item.statBonuses[statName]));
          }
        }
      }
    }
  }

  // System-wide Soulware bonuses
  for (const soulware of systemWideSoulware) {
    // Check conditional effects
    if (soulware.conditionalEffects) {
      for (const conditional of soulware.conditionalEffects) {
        if (evaluateConditional(conditional.condition, hero)) {
          applyStatBonus(stats, conditional.effect);
        }
      }
    }

    // Apply stat bonuses
    if (soulware.statBonuses) {
      applyStatBonus(stats, soulware.statBonuses);
    }
  }

  // Skill Tree bonuses
  if (hero.unlockedSkillNodes && hero.unlockedSkillNodes.length > 0) {
    applySkillTreeBonuses(stats, hero);
  }

  // Hero Synergy bonuses (apply synergies from party composition)
  // Apply synergies to each stat type
  stats.hp = applyHeroSynergyBonuses(hero, stats.hp, 'maxHp');
  stats.atk = applyHeroSynergyBonuses(hero, stats.atk, 'attack');
  stats.def = applyHeroSynergyBonuses(hero, stats.def, 'defense');
  stats.spd = applyHeroSynergyBonuses(hero, stats.spd, 'speed');

  // Fatigue debuff
  if (hero.fatigued && hero.fatigueEndTime > Date.now()) {
    for (const statName in stats) {
      stats[statName] = Math.floor(stats[statName] * 0.8);  // -20% all stats
    }
  } else if (hero.fatigued && hero.fatigueEndTime <= Date.now()) {
    // Remove fatigue
    hero.fatigued = false;
    hero.fatigueEndTime = null;
  }

  hero.currentStats = stats;

  // Initialize HP if not set
  if (hero.currentHp === 0 || hero.currentHp > stats.hp) {
    hero.currentHp = stats.hp;
  }
}

// Apply stat bonuses from Soulware
function applyStatBonus(stats, bonuses) {
  for (const statName in bonuses) {
    // Handle flat bonuses
    if (!statName.includes('Percent') && statName !== 'allStatsPercent' && stats[statName] !== undefined) {
      stats[statName] += bonuses[statName];
    }
    // Handle percentage bonuses
    else if (statName.endsWith('Percent') && statName !== 'allStatsPercent') {
      const baseStat = statName.replace('Percent', '');
      if (stats[baseStat] !== undefined) {
        stats[baseStat] = Math.floor(stats[baseStat] * (1 + bonuses[statName]));
      }
    }
    // Handle all stats percentage
    else if (statName === 'allStatsPercent') {
      for (const stat in stats) {
        stats[stat] = Math.floor(stats[stat] * (1 + bonuses[statName]));
      }
    }
  }
}

// Apply skill tree bonuses
function applySkillTreeBonuses(stats, hero) {
  if (!hero.unlockedSkillNodes || hero.unlockedSkillNodes.length === 0) {
    return;
  }

  // Calculate aggregated bonuses from all unlocked skill nodes
  const bonuses = calculateSkillBonusesInternal(hero);

  // Apply stat multipliers to base stats
  if (bonuses.attackMultiplier) {
    stats.atk = Math.floor(stats.atk * (1 + bonuses.attackMultiplier));
  }
  if (bonuses.defenseMultiplier) {
    stats.def = Math.floor(stats.def * (1 + bonuses.defenseMultiplier));
  }
  if (bonuses.maxHpMultiplier) {
    stats.hp = Math.floor(stats.hp * (1 + bonuses.maxHpMultiplier));
  }
  if (bonuses.speedBonus) {
    stats.spd = Math.floor(stats.spd * (1 + bonuses.speedBonus));
  }

  // Apply derived stats (these aren't in base stats but need to be tracked)
  // Note: critChance, dodgeChance etc. will be stored in skillBonuses for combat to use

  // Store aggregated bonuses on hero for combat and other systems to use
  hero.skillBonuses = bonuses;
}

// Helper: Calculate aggregated skill bonuses from unlocked nodes
function calculateSkillBonusesInternal(hero) {
  const bonuses = {
    attackMultiplier: 0,
    defenseMultiplier: 0,
    maxHpMultiplier: 0,
    critChance: 0,
    critMultiplier: 0,
    goldBonus: 0,
    xpBonus: 0,
    speedBonus: 0,
    dodgeChance: 0,
    cooldownReduction: 0,
    partyStatBonus: 0,
    partyAttackBonus: 0,
    partyHpBonus: 0,
    partyXpBonus: 0,
    partyLuckBonus: 0,
    stunImmune: false,
    poisonImmune: false,
    aoeDamage: false,
    combatRegen: 0,
    reflectChance: 0,
    armorPenetration: 0,
    attackSpeed: 0,
    lifesteal: 0,
    blockChance: 0,
    thorns: 0
  };

  if (!hero.unlockedSkillNodes || hero.unlockedSkillNodes.length === 0) {
    return bonuses;
  }

  // Aggregate effects from all unlocked nodes
  hero.unlockedSkillNodes.forEach(nodeId => {
    const node = getNodeById(nodeId);
    if (!node || !node.effects) return;

    // Aggregate all numeric and boolean effects
    for (const [key, value] of Object.entries(node.effects)) {
      if (typeof bonuses[key] === 'number' && typeof value === 'number') {
        bonuses[key] += value;
      } else if (typeof bonuses[key] === 'boolean' && value === true) {
        bonuses[key] = true;
      }
    }
  });

  return bonuses;
}

// Evaluate conditional effects
function evaluateConditional(condition, hero) {
  // Simple condition evaluation
  if (condition.includes('heroRarity')) {
    const match = condition.match(/heroRarity\s*([<>=]+)\s*(\d+)/);
    if (match) {
      const operator = match[1];
      const value = parseInt(match[2]);

      if (operator === '<=') return hero.rarity <= value;
      if (operator === '<') return hero.rarity < value;
      if (operator === '>=') return hero.rarity >= value;
      if (operator === '>') return hero.rarity > value;
      if (operator === '===') return hero.rarity === value;
    }
  }

  // Add more condition types as needed
  return false;
}

// Add XP to a hero
export function addXpToHero(hero, xpAmount) {
  hero.xp += xpAmount;

  // Check for level ups
  while (hero.xp >= hero.xpToNextLevel && hero.level < getMaxLevel(hero)) {
    hero.xp -= hero.xpToNextLevel;
    hero.level++;
    hero.xpToNextLevel = calculateXpForLevel(hero.level + 1);

    // Grant skill point on level up
    grantSkillPoints(hero, 1);

    // Update stats on level up
    updateHeroStats(hero);

    // Log level up
    console.log(`${hero.name} leveled up to ${hero.level}! (+1 skill point, total: ${hero.skillPoints})`);

    // Check for unlocks
    const unlock = LEVEL_UNLOCKS[hero.level];
    if (unlock) {
      console.log(`${hero.name} unlocked: ${unlock}`);
    }
  }
}

// Get maximum level for a hero (100 + 10 per awakening)
export function getMaxLevel(hero) {
  return 100 + (hero.awakenings * 10);
}

// Awaken a hero (requires Awakening Shards)
export function awakenHero(hero) {
  if (hero.awakenings >= 5) {
    return { success: false, error: 'Max awakenings reached' };
  }

  // TODO: Check if player has enough Awakening Shards
  // For now, just awaken
  hero.awakenings++;

  // Recalculate stats
  updateHeroStats(hero);

  return { success: true, newLevel: hero.awakenings };
}

// Equip an item to a hero
export function equipItem(hero, item) {
  if (!item || !item.type) {
    return { success: false, error: 'Invalid item' };
  }

  // System-wide items can't be equipped to individual heroes
  if (item.type === 'systemWide') {
    return { success: false, error: 'System-wide items cannot be equipped to individual heroes' };
  }

  // Check if slot exists
  if (!hero.equipment[item.type]) {
    return { success: false, error: 'Invalid equipment slot' };
  }

  // Unequip current item in that slot
  const oldItem = hero.equipment[item.type];

  // Equip new item
  hero.equipment[item.type] = item;

  // Recalculate stats
  updateHeroStats(hero);

  return { success: true, oldItem };
}

// Unequip an item from a hero
export function unequipItem(hero, slot) {
  if (!hero.equipment[slot]) {
    return { success: false, error: 'Invalid equipment slot' };
  }

  const item = hero.equipment[slot];
  hero.equipment[slot] = null;

  // Recalculate stats
  updateHeroStats(hero);

  return { success: true, item };
}

// Check if hero can be sent on a dispatch
export function canSendOnDispatch(hero) {
  if (hero.onDispatch) {
    return { canSend: false, reason: 'Hero is already on a dispatch' };
  }

  if (hero.fatigued && hero.fatigueEndTime > Date.now()) {
    const timeRemaining = Math.ceil((hero.fatigueEndTime - Date.now()) / 60000);
    return { canSend: false, reason: `Hero is fatigued (${timeRemaining} minutes remaining)` };
  }

  return { canSend: true };
}

// Send hero on dispatch
export function sendHeroOnDispatch(hero, dispatchId, endTime) {
  hero.onDispatch = true;
  hero.dispatchId = dispatchId;
  hero.dispatchEndTime = endTime;
}

// Return hero from dispatch
export function returnHeroFromDispatch(hero, success = true) {
  hero.onDispatch = false;
  hero.dispatchId = null;
  hero.dispatchEndTime = null;

  // Apply fatigue if failed
  if (!success) {
    hero.fatigued = true;
    hero.fatigueEndTime = Date.now() + 3600000;  // 1 hour fatigue
  }
}

// Get hero power level (for matchmaking/difficulty)
export function getHeroPower(hero) {
  const stats = hero.currentStats;
  return Math.floor(
    stats.hp * 0.3 +
    stats.atk * 2.0 +
    stats.def * 1.5 +
    stats.spd * 1.0 +
    stats.lck * 0.5
  );
}

// Get party power level
export function getPartyPower(heroes) {
  return heroes.reduce((total, hero) => total + getHeroPower(hero), 0);
}

// ===== SKILL TREE FUNCTIONS =====

/**
 * Grant skill points to hero (called on level up)
 * @param {Object} hero - Hero instance
 * @param {number} amount - Skill points to grant (default: 1)
 */
export function grantSkillPoints(hero, amount = 1) {
  hero.skillPoints = (hero.skillPoints || 0) + amount;
}

/**
 * Unlock a skill node for a hero
 * @param {Object} hero - Hero instance
 * @param {Object} node - Skill node from skillTrees.js
 * @param {Object} resourceManager - ResourceManager instance (optional, for resource costs)
 * @returns {Object} { success: boolean, message: string }
 */
export function unlockSkillNode(hero, node, resourceManager = null) {
  // Ensure arrays exist
  if (!hero.unlockedSkillNodes) {
    hero.unlockedSkillNodes = [];
  }
  if (hero.skillPoints === undefined) {
    hero.skillPoints = 0;
  }

  // Already unlocked
  if (hero.unlockedSkillNodes.includes(node.id)) {
    return { success: false, message: 'Skill already unlocked' };
  }

  // Check prerequisites
  for (const reqId of node.requires) {
    if (!hero.unlockedSkillNodes.includes(reqId)) {
      return { success: false, message: 'Missing prerequisite skill' };
    }
  }

  // Check skill points
  const requiredPoints = node.cost.skillPoints || 0;
  if (hero.skillPoints < requiredPoints) {
    return { success: false, message: `Need ${requiredPoints} skill points (have ${hero.skillPoints})` };
  }

  // Check other resource costs
  if (node.cost.gold && resourceManager) {
    if (!resourceManager.canAfford({ gold: node.cost.gold })) {
      return { success: false, message: `Need ${node.cost.gold} gold` };
    }
  }
  if (node.cost.codeFragments && resourceManager) {
    if (!resourceManager.canAfford({ codeFragments: node.cost.codeFragments })) {
      return { success: false, message: `Need ${node.cost.codeFragments} code fragments` };
    }
  }

  // Spend resources
  hero.skillPoints -= requiredPoints;

  if (resourceManager) {
    if (node.cost.gold) {
      resourceManager.spend('gold', node.cost.gold);
    }
    if (node.cost.codeFragments) {
      resourceManager.spend('codeFragments', node.cost.codeFragments);
    }
  }

  // Unlock node
  hero.unlockedSkillNodes.push(node.id);

  // Recalculate stats with new skill bonuses
  updateHeroStats(hero);

  return { success: true, message: `Unlocked: ${node.name}` };
}

/**
 * Reset hero skill tree (respec)
 * @param {Object} hero - Hero instance
 * @param {Object} resourceManager - ResourceManager instance
 * @param {number} cost - Gold cost to respec (default: 500)
 * @returns {Object} { success: boolean, message: string }
 */
export function resetSkillTree(hero, resourceManager, cost = 500) {
  if (!hero.unlockedSkillNodes || hero.unlockedSkillNodes.length === 0) {
    return { success: false, message: 'No skills to reset' };
  }

  // Check if can afford respec
  if (!resourceManager.canAfford({ gold: cost })) {
    return { success: false, message: `Need ${cost} gold to reset skills` };
  }

  // Calculate skill points to refund
  const skillPointsToRefund = hero.unlockedSkillNodes.length; // Simplified: 1 point per node
  // (In reality, would need to look up each node's cost)

  // Spend gold
  resourceManager.spend('gold', cost);

  // Reset
  hero.skillPoints = (hero.skillPoints || 0) + skillPointsToRefund;
  hero.unlockedSkillNodes = [];

  // Recalculate stats
  updateHeroStats(hero);

  return { success: true, message: `Skills reset! Refunded ${skillPointsToRefund} skill points.` };
}
