// ===== Status Effects System =====
// Handles buffs and debuffs for combat

import { eventBus, EVENTS } from './eventBus.js';

// Status effect definitions
export const STATUS_EFFECTS = {
  // Debuffs (negative effects)
  stun: {
    id: 'stun',
    name: 'Stunned',
    type: 'debuff',
    icon: '💫',
    description: 'Cannot act',
    color: '#fbbf24',
    effects: {
      cannotAct: true,
      cannotMove: true
    }
  },

  burn: {
    id: 'burn',
    name: 'Burning',
    type: 'debuff',
    icon: '🔥',
    description: 'Takes damage over time',
    color: '#ef4444',
    effects: {
      damagePerTick: 10, // Base damage, scales with duration
      tickInterval: 1000 // Damage every 1 second
    }
  },

  poison: {
    id: 'poison',
    name: 'Poisoned',
    type: 'debuff',
    icon: '☠️',
    description: 'Takes damage over time and reduces healing',
    color: '#10b981',
    effects: {
      damagePerTick: 5,
      tickInterval: 1000,
      healingReduction: 0.5 // 50% less healing received
    }
  },

  slow: {
    id: 'slow',
    name: 'Slowed',
    type: 'debuff',
    icon: '🐌',
    description: 'Reduced attack speed',
    color: '#3b82f6',
    effects: {
      attackSpeedMultiplier: 0.5 // 50% slower attacks
    }
  },

  freeze: {
    id: 'freeze',
    name: 'Frozen',
    type: 'debuff',
    icon: '❄️',
    description: 'Cannot act and takes increased damage',
    color: '#06b6d4',
    effects: {
      cannotAct: true,
      cannotMove: true,
      damageMultiplier: 1.5 // Takes 50% more damage
    }
  },

  weaken: {
    id: 'weaken',
    name: 'Weakened',
    type: 'debuff',
    icon: '⚠️',
    description: 'Reduced attack power',
    color: '#f59e0b',
    effects: {
      attackMultiplier: 0.7 // 30% less damage dealt
    }
  },

  curse: {
    id: 'curse',
    name: 'Cursed',
    type: 'debuff',
    icon: '👁️',
    description: 'Reduced all stats',
    color: '#8b5cf6',
    effects: {
      allStatsMultiplier: 0.8, // 20% all stats reduction
      cannotHeal: true
    }
  },

  bleed: {
    id: 'bleed',
    name: 'Bleeding',
    type: 'debuff',
    icon: '🩸',
    description: 'Takes increasing damage over time',
    color: '#dc2626',
    effects: {
      damagePerTick: 8,
      tickInterval: 1000,
      stackable: true, // Can stack for more damage
      increasingDamage: true // Damage increases each tick
    }
  },

  // Buffs (positive effects)
  shield: {
    id: 'shield',
    name: 'Shielded',
    type: 'buff',
    icon: '🛡️',
    description: 'Absorbs incoming damage',
    color: '#3b82f6',
    effects: {
      absorbDamage: 100, // Amount of damage to absorb
      expiresOnDamage: true // Expires when shield is broken
    }
  },

  regen: {
    id: 'regen',
    name: 'Regenerating',
    type: 'buff',
    icon: '💚',
    description: 'Restores HP over time',
    color: '#10b981',
    effects: {
      healPerTick: 15,
      tickInterval: 1000
    }
  },

  haste: {
    id: 'haste',
    name: 'Hasted',
    type: 'buff',
    icon: '⚡',
    description: 'Increased attack speed',
    color: '#fbbf24',
    effects: {
      attackSpeedMultiplier: 1.5 // 50% faster attacks
    }
  },

  berserk: {
    id: 'berserk',
    name: 'Berserk',
    type: 'buff',
    icon: '😤',
    description: 'Increased damage but reduced defense',
    color: '#dc2626',
    effects: {
      attackMultiplier: 1.8, // 80% more damage
      defenseMultiplier: 0.6 // 40% less defense
    }
  },

  fortify: {
    id: 'fortify',
    name: 'Fortified',
    type: 'buff',
    icon: '🏰',
    description: 'Increased defense',
    color: '#6b7280',
    effects: {
      defenseMultiplier: 1.5 // 50% more defense
    }
  },

  enrage: {
    id: 'enrage',
    name: 'Enraged',
    type: 'buff',
    icon: '💢',
    description: 'Massive damage boost at low HP',
    color: '#b91c1c',
    effects: {
      attackMultiplier: 2.5, // 150% more damage
      critChanceBonus: 0.25, // +25% crit chance
      triggersAtLowHp: true // Only activates below 30% HP
    }
  },

  invisible: {
    id: 'invisible',
    name: 'Invisible',
    type: 'buff',
    icon: '👻',
    description: 'Cannot be targeted',
    color: '#94a3b8',
    effects: {
      cannotBeTargeted: true,
      evasionBonus: 1.0 // 100% evasion
    }
  },

  blessed: {
    id: 'blessed',
    name: 'Blessed',
    type: 'buff',
    icon: '✨',
    description: 'Increased all stats and healing',
    color: '#fde047',
    effects: {
      allStatsMultiplier: 1.3, // 30% all stats increase
      healingReceived: 1.5, // 50% more healing
      critChanceBonus: 0.15 // +15% crit chance
    }
  }
};

/**
 * Apply a status effect to a target
 * @param {Object} target - Hero or enemy
 * @param {string} effectId - Status effect ID
 * @param {number} duration - Duration in milliseconds
 * @param {number} strength - Strength multiplier (default 1.0)
 * @param {Object} source - Source of the effect
 */
export function applyStatusEffect(target, effectId, duration, strength = 1.0, source = null) {
  const effectDef = STATUS_EFFECTS[effectId];
  if (!effectDef) {
    console.warn(`Unknown status effect: ${effectId}`);
    return;
  }

  // Check if effect can stack
  const existingEffect = target.statusEffects?.find(e => e.id === effectId);
  if (existingEffect && !effectDef.effects.stackable) {
    // Refresh duration if not stackable
    existingEffect.duration = Math.max(existingEffect.duration, duration);
    existingEffect.appliedAt = Date.now();
    return;
  }

  // Initialize statusEffects array if needed
  if (!target.statusEffects) {
    target.statusEffects = [];
  }

  // Create effect instance
  const effectInstance = {
    id: effectId,
    name: effectDef.name,
    type: effectDef.type,
    icon: effectDef.icon,
    description: effectDef.description,
    color: effectDef.color,
    duration: duration,
    appliedAt: Date.now(),
    strength: strength,
    source: source,
    tickCount: 0,
    lastTick: Date.now(),
    effects: { ...effectDef.effects },
    absorbRemaining: effectDef.effects.absorbDamage ? effectDef.effects.absorbDamage * strength : 0
  };

  target.statusEffects.push(effectInstance);

  // Emit event
  eventBus.emit(EVENTS.STATUS_EFFECT_APPLIED, {
    target,
    effect: effectInstance
  });

  console.log(`Applied ${effectDef.name} to ${target.name} for ${duration}ms`);
}

/**
 * Remove a status effect from a target
 */
export function removeStatusEffect(target, effectId) {
  if (!target.statusEffects) return;

  const index = target.statusEffects.findIndex(e => e.id === effectId);
  if (index !== -1) {
    const removed = target.statusEffects.splice(index, 1)[0];
    eventBus.emit(EVENTS.STATUS_EFFECT_REMOVED, {
      target,
      effect: removed
    });
    console.log(`Removed ${removed.name} from ${target.name}`);
  }
}

/**
 * Clear all status effects from a target
 */
export function clearAllStatusEffects(target, type = null) {
  if (!target.statusEffects) return;

  if (type) {
    target.statusEffects = target.statusEffects.filter(e => e.type !== type);
  } else {
    target.statusEffects = [];
  }
}

/**
 * Update status effects (call every game tick)
 */
export function updateStatusEffects(target, deltaTime) {
  if (!target.statusEffects || target.statusEffects.length === 0) return;

  const now = Date.now();
  const effectsToRemove = [];

  for (const effect of target.statusEffects) {
    // Check duration
    const elapsed = now - effect.appliedAt;
    if (elapsed >= effect.duration) {
      effectsToRemove.push(effect.id);
      continue;
    }

    // Process tick-based effects
    if (effect.effects.tickInterval) {
      const tickElapsed = now - effect.lastTick;
      if (tickElapsed >= effect.effects.tickInterval) {
        processEffectTick(target, effect);
        effect.lastTick = now;
        effect.tickCount++;
      }
    }
  }

  // Remove expired effects
  effectsToRemove.forEach(id => removeStatusEffect(target, id));
}

/**
 * Process tick-based effect (DoT, HoT, etc.)
 */
function processEffectTick(target, effect) {
  // Damage over time
  if (effect.effects.damagePerTick) {
    let damage = effect.effects.damagePerTick * effect.strength;

    // Increasing damage (like bleed)
    if (effect.effects.increasingDamage) {
      damage *= (1 + effect.tickCount * 0.1); // 10% more damage per tick
    }

    target.currentHp = Math.max(0, target.currentHp - damage);

    eventBus.emit(EVENTS.STATUS_EFFECT_TICK, {
      target,
      effect,
      damage: damage,
      type: 'damage'
    });
  }

  // Healing over time
  if (effect.effects.healPerTick) {
    let healing = effect.effects.healPerTick * effect.strength;

    // Apply healing reduction from other effects
    const poisonEffect = target.statusEffects?.find(e => e.id === 'poison');
    if (poisonEffect) {
      healing *= (1 - poisonEffect.effects.healingReduction);
    }

    target.currentHp = Math.min(target.maxHp, target.currentHp + healing);

    eventBus.emit(EVENTS.STATUS_EFFECT_TICK, {
      target,
      effect,
      healing: healing,
      type: 'healing'
    });
  }
}

/**
 * Check if target has a specific status effect
 */
export function hasStatusEffect(target, effectId) {
  return target.statusEffects?.some(e => e.id === effectId) || false;
}

/**
 * Get all active status effects of a type
 */
export function getStatusEffectsByType(target, type) {
  if (!target.statusEffects) return [];
  return target.statusEffects.filter(e => e.type === type);
}

/**
 * Calculate stat modifier from status effects
 */
export function getStatusEffectStatModifier(target, statType) {
  if (!target.statusEffects || target.statusEffects.length === 0) {
    return 1.0; // No modification
  }

  let multiplier = 1.0;
  let bonuses = 0;

  for (const effect of target.statusEffects) {
    const effects = effect.effects;

    // All stats multiplier
    if (effects.allStatsMultiplier) {
      multiplier *= effects.allStatsMultiplier;
    }

    // Specific stat multipliers
    switch (statType) {
      case 'attack':
        if (effects.attackMultiplier) multiplier *= effects.attackMultiplier;
        break;
      case 'defense':
        if (effects.defenseMultiplier) multiplier *= effects.defenseMultiplier;
        break;
      case 'attackSpeed':
        if (effects.attackSpeedMultiplier) multiplier *= effects.attackSpeedMultiplier;
        break;
      case 'critChance':
        if (effects.critChanceBonus) bonuses += effects.critChanceBonus;
        break;
    }

    // Check conditional effects
    if (effects.triggersAtLowHp && target.currentHp / target.maxHp > 0.3) {
      // Don't apply enrage effect if not at low HP
      continue;
    }
  }

  return multiplier + bonuses;
}

/**
 * Check if target can act (not stunned/frozen)
 */
export function canAct(target) {
  if (!target.statusEffects) return true;

  return !target.statusEffects.some(e =>
    e.effects.cannotAct || e.effects.cannotMove
  );
}

/**
 * Check if target can be targeted
 */
export function canBeTargeted(target) {
  if (!target.statusEffects) return true;

  return !target.statusEffects.some(e => e.effects.cannotBeTargeted);
}

/**
 * Process incoming damage with status effect modifications
 */
export function processDamageWithEffects(target, baseDamage, source = null) {
  let finalDamage = baseDamage;

  if (!target.statusEffects) {
    return finalDamage;
  }

  // Check for damage multipliers
  for (const effect of target.statusEffects) {
    if (effect.effects.damageMultiplier) {
      finalDamage *= effect.effects.damageMultiplier;
    }
  }

  // Check for shield absorption
  const shieldEffect = target.statusEffects?.find(e => e.id === 'shield' && e.absorbRemaining > 0);
  if (shieldEffect) {
    const absorbed = Math.min(shieldEffect.absorbRemaining, finalDamage);
    finalDamage -= absorbed;
    shieldEffect.absorbRemaining -= absorbed;

    if (shieldEffect.absorbRemaining <= 0 && shieldEffect.effects.expiresOnDamage) {
      removeStatusEffect(target, 'shield');
    }

    eventBus.emit(EVENTS.DAMAGE_ABSORBED, {
      target,
      amount: absorbed,
      remaining: shieldEffect.absorbRemaining
    });
  }

  return finalDamage;
}

/**
 * Get status effects display info for UI
 */
export function getStatusEffectsDisplay(target) {
  if (!target.statusEffects || target.statusEffects.length === 0) {
    return [];
  }

  return target.statusEffects.map(effect => ({
    id: effect.id,
    name: effect.name,
    icon: effect.icon,
    type: effect.type,
    color: effect.color,
    remaining: effect.duration - (Date.now() - effect.appliedAt),
    stacks: effect.effects.stackable ? target.statusEffects.filter(e => e.id === effect.id).length : 1
  }));
}

/**
 * Add status effect events to EventBus
 */
export function registerStatusEffectEvents() {
  // Events are already in eventBus.js, just need to add them
  // STATUS_EFFECT_APPLIED
  // STATUS_EFFECT_REMOVED
  // STATUS_EFFECT_TICK
  // DAMAGE_ABSORBED
}
