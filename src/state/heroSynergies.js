// ===== Hero Synergy System =====
// Provides bonuses when certain hero class combinations are in the party

import { gameState } from './gameState.js';
import { eventBus, EVENTS } from './eventBus.js';

// Synergy definitions
export const SYNERGIES = {
  // 2-hero synergies
  holy_warrior: {
    id: 'holy_warrior',
    name: 'Holy Warrior',
    description: 'Warrior + Cleric: +20% HP and +15% healing effectiveness',
    classes: ['warrior', 'cleric'],
    minCount: 2,
    effects: {
      maxHpMultiplier: 1.2,
      healingEffectiveness: 1.15
    },
    icon: '⚔️✨'
  },

  arcane_guard: {
    id: 'arcane_guard',
    name: 'Arcane Guard',
    description: 'Warrior + Mage: +25% damage and Mage gains shield',
    classes: ['warrior', 'mage'],
    minCount: 2,
    effects: {
      damageMultiplier: 1.25,
      mageShieldBonus: true
    },
    icon: '⚔️🔮'
  },

  rangers_pact: {
    id: 'rangers_pact',
    name: 'Rangers Pact',
    description: '2 Rangers: +30% critical strike chance and +20% attack speed',
    classes: ['ranger', 'ranger'],
    minCount: 2,
    effects: {
      critChanceBonus: 0.3,
      attackSpeedMultiplier: 1.2
    },
    icon: '🏹🏹'
  },

  elemental_fury: {
    id: 'elemental_fury',
    name: 'Elemental Fury',
    description: 'Mage + Ranger: AoE attacks hit +1 target',
    classes: ['mage', 'ranger'],
    minCount: 2,
    effects: {
      aoeTargetBonus: 1,
      damageMultiplier: 1.1
    },
    icon: '🔮🏹'
  },

  divine_marksman: {
    id: 'divine_marksman',
    name: 'Divine Marksman',
    description: 'Ranger + Cleric: Critical strikes heal for 20% of damage',
    classes: ['ranger', 'cleric'],
    minCount: 2,
    effects: {
      critHealing: 0.2,
      critChanceBonus: 0.15
    },
    icon: '🏹✨'
  },

  mystic_healers: {
    id: 'mystic_healers',
    name: 'Mystic Healers',
    description: 'Mage + Cleric: +50% healing and mana regeneration',
    classes: ['mage', 'cleric'],
    minCount: 2,
    effects: {
      healingEffectiveness: 1.5,
      manaRegenBonus: 1.0
    },
    icon: '🔮✨'
  },

  // 3-hero synergies
  trinity_force: {
    id: 'trinity_force',
    name: 'Trinity Force',
    description: 'Warrior + Mage + Ranger: Balanced team, +35% all stats',
    classes: ['warrior', 'mage', 'ranger'],
    minCount: 3,
    effects: {
      allStatsMultiplier: 1.35
    },
    icon: '⚔️🔮🏹'
  },

  divine_trinity: {
    id: 'divine_trinity',
    name: 'Divine Trinity',
    description: 'Warrior + Ranger + Cleric: +40% survivability',
    classes: ['warrior', 'ranger', 'cleric'],
    minCount: 3,
    effects: {
      maxHpMultiplier: 1.4,
      defenseMultiplier: 1.3
    },
    icon: '⚔️🏹✨'
  },

  arcane_assault: {
    id: 'arcane_assault',
    name: 'Arcane Assault',
    description: 'Warrior + Mage + Cleric: +50% spell damage and cleave attacks',
    classes: ['warrior', 'mage', 'cleric'],
    minCount: 3,
    effects: {
      spellDamageMultiplier: 1.5,
      cleaveBonus: true
    },
    icon: '⚔️🔮✨'
  },

  hunters_blessing: {
    id: 'hunters_blessing',
    name: 'Hunters Blessing',
    description: 'Ranger + Mage + Cleric: Every 3rd attack deals double damage',
    classes: ['ranger', 'mage', 'cleric'],
    minCount: 3,
    effects: {
      tripleStrikeBonus: true,
      damageMultiplier: 1.25
    },
    icon: '🏹🔮✨'
  },

  // 4-hero synergy (full party)
  perfect_harmony: {
    id: 'perfect_harmony',
    name: 'Perfect Harmony',
    description: 'All 4 classes: +100% all stats and heroes revive once per wave',
    classes: ['warrior', 'mage', 'ranger', 'cleric'],
    minCount: 4,
    effects: {
      allStatsMultiplier: 2.0,
      reviveOnce: true
    },
    icon: '⚔️🔮🏹✨'
  },

  // Same class synergies
  warriors_wall: {
    id: 'warriors_wall',
    name: 'Warriors Wall',
    description: '2+ Warriors: Each Warrior gains +50% defense and taunt radius',
    classes: ['warrior', 'warrior'],
    minCount: 2,
    effects: {
      warriorDefenseBonus: 0.5,
      tauntRadius: 1.5
    },
    icon: '⚔️⚔️'
  },

  mage_council: {
    id: 'mage_council',
    name: 'Mage Council',
    description: '2+ Mages: Spell cooldowns reduced by 30%',
    classes: ['mage', 'mage'],
    minCount: 2,
    effects: {
      cooldownReduction: 0.3,
      spellDamageMultiplier: 1.2
    },
    icon: '🔮🔮'
  },

  clerics_sanctuary: {
    id: 'clerics_sanctuary',
    name: 'Clerics Sanctuary',
    description: '2+ Clerics: All healing creates shields for 30% of heal amount',
    classes: ['cleric', 'cleric'],
    minCount: 2,
    effects: {
      healingShields: 0.3,
      healingEffectiveness: 1.3
    },
    icon: '✨✨'
  }
};

/**
 * Calculate active synergies based on current party composition
 */
export function getActiveSynergies() {
  const party = gameState.heroes;
  if (!party || party.length === 0) return [];

  const classCounts = {};
  party.forEach(hero => {
    classCounts[hero.class] = (classCounts[hero.class] || 0) + 1;
  });

  const activeSynergies = [];

  for (const synergy of Object.values(SYNERGIES)) {
    if (checkSynergyActive(synergy, classCounts, party)) {
      activeSynergies.push(synergy);
    }
  }

  return activeSynergies;
}

/**
 * Check if a specific synergy is active
 */
function checkSynergyActive(synergy, classCounts, party) {
  const requiredClasses = synergy.classes;

  // For synergies requiring specific classes
  const classRequirements = {};
  requiredClasses.forEach(className => {
    classRequirements[className] = (classRequirements[className] || 0) + 1;
  });

  // Check if all requirements are met
  for (const [className, requiredCount] of Object.entries(classRequirements)) {
    if ((classCounts[className] || 0) < requiredCount) {
      return false;
    }
  }

  return true;
}

/**
 * Calculate total synergy bonuses
 */
export function calculateSynergyBonuses() {
  const activeSynergies = getActiveSynergies();

  const bonuses = {
    maxHpMultiplier: 1,
    damageMultiplier: 1,
    defenseMultiplier: 1,
    attackSpeedMultiplier: 1,
    allStatsMultiplier: 1,
    spellDamageMultiplier: 1,
    healingEffectiveness: 1,
    critChanceBonus: 0,
    cooldownReduction: 0,

    // Special effects (boolean flags)
    mageShieldBonus: false,
    cleaveBonus: false,
    tripleStrikeBonus: false,
    reviveOnce: false,
    critHealing: 0,
    aoeTargetBonus: 0,
    manaRegenBonus: 0,

    // Class-specific bonuses
    warriorDefenseBonus: 0,
    tauntRadius: 1,
    healingShields: 0
  };

  // Aggregate all synergy effects
  activeSynergies.forEach(synergy => {
    const effects = synergy.effects;

    // Multiplicative bonuses
    if (effects.maxHpMultiplier) bonuses.maxHpMultiplier *= effects.maxHpMultiplier;
    if (effects.damageMultiplier) bonuses.damageMultiplier *= effects.damageMultiplier;
    if (effects.defenseMultiplier) bonuses.defenseMultiplier *= effects.defenseMultiplier;
    if (effects.attackSpeedMultiplier) bonuses.attackSpeedMultiplier *= effects.attackSpeedMultiplier;
    if (effects.allStatsMultiplier) bonuses.allStatsMultiplier *= effects.allStatsMultiplier;
    if (effects.spellDamageMultiplier) bonuses.spellDamageMultiplier *= effects.spellDamageMultiplier;
    if (effects.healingEffectiveness) bonuses.healingEffectiveness *= effects.healingEffectiveness;

    // Additive bonuses
    if (effects.critChanceBonus) bonuses.critChanceBonus += effects.critChanceBonus;
    if (effects.cooldownReduction) bonuses.cooldownReduction += effects.cooldownReduction;
    if (effects.critHealing) bonuses.critHealing += effects.critHealing;
    if (effects.aoeTargetBonus) bonuses.aoeTargetBonus += effects.aoeTargetBonus;
    if (effects.manaRegenBonus) bonuses.manaRegenBonus += effects.manaRegenBonus;
    if (effects.warriorDefenseBonus) bonuses.warriorDefenseBonus += effects.warriorDefenseBonus;
    if (effects.tauntRadius) bonuses.tauntRadius *= effects.tauntRadius;
    if (effects.healingShields) bonuses.healingShields += effects.healingShields;

    // Boolean effects
    if (effects.mageShieldBonus) bonuses.mageShieldBonus = true;
    if (effects.cleaveBonus) bonuses.cleaveBonus = true;
    if (effects.tripleStrikeBonus) bonuses.tripleStrikeBonus = true;
    if (effects.reviveOnce) bonuses.reviveOnce = true;
  });

  return bonuses;
}

/**
 * Apply synergy bonuses to hero stats
 * This should be called in combat calculations
 */
export function applyHeroSynergyBonuses(hero, baseStat, statType) {
  const bonuses = calculateSynergyBonuses();
  let finalValue = baseStat;

  // Apply all stats multiplier (affects everything)
  finalValue *= bonuses.allStatsMultiplier;

  // Apply specific stat multipliers
  switch (statType) {
    case 'maxHp':
      finalValue *= bonuses.maxHpMultiplier;
      break;
    case 'attack':
    case 'damage':
      finalValue *= bonuses.damageMultiplier;
      if (hero.class === 'mage') {
        finalValue *= bonuses.spellDamageMultiplier;
      }
      break;
    case 'defense':
      finalValue *= bonuses.defenseMultiplier;
      if (hero.class === 'warrior') {
        finalValue *= (1 + bonuses.warriorDefenseBonus);
      }
      break;
    case 'speed':
    case 'attackSpeed':
      finalValue *= bonuses.attackSpeedMultiplier;
      break;
  }

  return Math.floor(finalValue);
}

/**
 * Get synergy bonus for critical strike chance
 */
export function getSynergyCritBonus() {
  const bonuses = calculateSynergyBonuses();
  return bonuses.critChanceBonus;
}

/**
 * Get synergy bonus for cooldown reduction
 */
export function getSynergyCooldownReduction() {
  const bonuses = calculateSynergyBonuses();
  return bonuses.cooldownReduction;
}

/**
 * Check if a special synergy effect is active
 */
export function hasSynergyEffect(effectName) {
  const bonuses = calculateSynergyBonuses();
  return bonuses[effectName] || false;
}

/**
 * Initialize synergy system
 */
export function initSynergySystem() {
  // Listen for party changes
  eventBus.on(EVENTS.HERO_ADDED, () => {
    const synergies = getActiveSynergies();
    eventBus.emit(EVENTS.SYNERGIES_UPDATED, synergies);
    console.log(`Active synergies: ${synergies.map(s => s.name).join(', ')}`);
  });

  eventBus.on(EVENTS.HERO_REMOVED, () => {
    const synergies = getActiveSynergies();
    eventBus.emit(EVENTS.SYNERGIES_UPDATED, synergies);
  });

  // Calculate initial synergies
  const initialSynergies = getActiveSynergies();
  if (initialSynergies.length > 0) {
    console.log('Initial synergies active:', initialSynergies.map(s => s.name).join(', '));
  }
}

/**
 * Get synergy info for UI display
 */
export function getSynergyDisplayInfo() {
  const activeSynergies = getActiveSynergies();
  const bonuses = calculateSynergyBonuses();

  return {
    active: activeSynergies,
    bonuses: bonuses,
    count: activeSynergies.length
  };
}
