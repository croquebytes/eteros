/**
 * Skill Tree Data
 * Defines skill trees for all hero classes with branching paths
 */

export const SKILL_TREES = {
  /**
   * WARRIOR CLASS - Tank/melee specialist
   * Branches: Offense (damage), Defense (survivability), Utility (support)
   */
  warrior: {
    name: 'Warrior',
    className: 'warrior',
    branches: {
      offense: {
        name: 'Offense',
        color: '#ff4444',
        nodes: [
          {
            id: 'war_off_1',
            name: 'Power Strike',
            description: '+10% attack damage',
            branch: 'offense',
            row: 0,
            column: 0,
            cost: { skillPoints: 1 },
            requires: [],
            effects: {
              attackMultiplier: 0.10
            }
          },
          {
            id: 'war_off_2',
            name: 'Weapon Mastery',
            description: '+15% attack damage',
            branch: 'offense',
            row: 1,
            column: 0,
            cost: { skillPoints: 1 },
            requires: ['war_off_1'],
            effects: {
              attackMultiplier: 0.15
            }
          },
          {
            id: 'war_off_3',
            name: 'Critical Edge',
            description: '+5% critical hit chance',
            branch: 'offense',
            row: 2,
            column: 0,
            cost: { skillPoints: 2 },
            requires: ['war_off_2'],
            effects: {
              critChance: 0.05
            }
          },
          {
            id: 'war_off_4',
            name: 'Devastating Blow',
            description: '+0.5x critical damage multiplier',
            branch: 'offense',
            row: 3,
            column: 0,
            cost: { skillPoints: 2 },
            requires: ['war_off_3'],
            effects: {
              critMultiplier: 0.5
            }
          },
          {
            id: 'war_off_5',
            name: 'Berserker Rage',
            description: '+25% damage, special ability cooldowns reduced by 20%',
            branch: 'offense',
            row: 4,
            column: 0,
            cost: { skillPoints: 3, gold: 1000 },
            requires: ['war_off_4'],
            effects: {
              attackMultiplier: 0.25,
              cooldownReduction: 0.20
            }
          }
        ]
      },
      defense: {
        name: 'Defense',
        color: '#4444ff',
        nodes: [
          {
            id: 'war_def_1',
            name: 'Toughness',
            description: '+15% max HP',
            branch: 'defense',
            row: 0,
            column: 1,
            cost: { skillPoints: 1 },
            requires: [],
            effects: {
              maxHpMultiplier: 0.15
            }
          },
          {
            id: 'war_def_2',
            name: 'Iron Skin',
            description: '+10% defense',
            branch: 'defense',
            row: 1,
            column: 1,
            cost: { skillPoints: 1 },
            requires: ['war_def_1'],
            effects: {
              defenseMultiplier: 0.10
            }
          },
          {
            id: 'war_def_3',
            name: 'Fortified Armor',
            description: '+20% max HP, +10% defense',
            branch: 'defense',
            row: 2,
            column: 1,
            cost: { skillPoints: 2 },
            requires: ['war_def_2'],
            effects: {
              maxHpMultiplier: 0.20,
              defenseMultiplier: 0.10
            }
          },
          {
            id: 'war_def_4',
            name: 'Regeneration',
            description: 'Heal 2% max HP every 5 seconds in combat',
            branch: 'defense',
            row: 3,
            column: 1,
            cost: { skillPoints: 2 },
            requires: ['war_def_3'],
            effects: {
              combatRegen: 0.02
            }
          },
          {
            id: 'war_def_5',
            name: 'Unbreakable',
            description: '+30% max HP, +20% defense, immune to stun',
            branch: 'defense',
            row: 4,
            column: 1,
            cost: { skillPoints: 3, gold: 1000 },
            requires: ['war_def_4'],
            effects: {
              maxHpMultiplier: 0.30,
              defenseMultiplier: 0.20,
              stunImmune: true
            }
          }
        ]
      },
      utility: {
        name: 'Utility',
        color: '#44ff44',
        nodes: [
          {
            id: 'war_util_1',
            name: 'Inspiring Presence',
            description: '+5% gold from waves',
            branch: 'utility',
            row: 0,
            column: 2,
            cost: { skillPoints: 1 },
            requires: [],
            effects: {
              goldBonus: 0.05
            }
          },
          {
            id: 'war_util_2',
            name: 'Battle Veteran',
            description: '+10% XP gain when this hero participates',
            branch: 'utility',
            row: 1,
            column: 2,
            cost: { skillPoints: 1 },
            requires: ['war_util_1'],
            effects: {
              xpBonus: 0.10
            }
          },
          {
            id: 'war_util_3',
            name: 'Tactical Mind',
            description: '+5% all stats for party',
            branch: 'utility',
            row: 2,
            column: 2,
            cost: { skillPoints: 2 },
            requires: ['war_util_2'],
            effects: {
              partyStatBonus: 0.05
            }
          },
          {
            id: 'war_util_4',
            name: 'Warlord\'s Command',
            description: '+10% damage for all party members',
            branch: 'utility',
            row: 3,
            column: 2,
            cost: { skillPoints: 2 },
            requires: ['war_util_3'],
            effects: {
              partyAttackBonus: 0.10
            }
          }
        ]
      }
    }
  },

  /**
   * MAGE CLASS - High damage caster
   */
  mage: {
    name: 'Mage',
    className: 'mage',
    branches: {
      offense: {
        name: 'Arcane Power',
        color: '#ff44ff',
        nodes: [
          {
            id: 'mag_off_1',
            name: 'Spell Focus',
            description: '+12% attack damage',
            branch: 'offense',
            row: 0,
            column: 0,
            cost: { skillPoints: 1 },
            requires: [],
            effects: {
              attackMultiplier: 0.12
            }
          },
          {
            id: 'mag_off_2',
            name: 'Arcane Mastery',
            description: '+18% attack damage',
            branch: 'offense',
            row: 1,
            column: 0,
            cost: { skillPoints: 1 },
            requires: ['mag_off_1'],
            effects: {
              attackMultiplier: 0.18
            }
          },
          {
            id: 'mag_off_3',
            name: 'Critical Casting',
            description: '+8% critical chance',
            branch: 'offense',
            row: 2,
            column: 0,
            cost: { skillPoints: 2 },
            requires: ['mag_off_2'],
            effects: {
              critChance: 0.08
            }
          },
          {
            id: 'mag_off_4',
            name: 'Spell Amplification',
            description: '+1.0x critical multiplier',
            branch: 'offense',
            row: 3,
            column: 0,
            cost: { skillPoints: 2 },
            requires: ['mag_off_3'],
            effects: {
              critMultiplier: 1.0
            }
          },
          {
            id: 'mag_off_5',
            name: 'Arcane Overload',
            description: '+30% damage, abilities deal AoE damage',
            branch: 'offense',
            row: 4,
            column: 0,
            cost: { skillPoints: 3, codeFragments: 50 },
            requires: ['mag_off_4'],
            effects: {
              attackMultiplier: 0.30,
              aoeDamage: true
            }
          }
        ]
      },
      defense: {
        name: 'Arcane Shield',
        color: '#4488ff',
        nodes: [
          {
            id: 'mag_def_1',
            name: 'Mana Shield',
            description: '+10% max HP',
            branch: 'defense',
            row: 0,
            column: 1,
            cost: { skillPoints: 1 },
            requires: [],
            effects: {
              maxHpMultiplier: 0.10
            }
          },
          {
            id: 'mag_def_2',
            name: 'Arcane Barrier',
            description: '+15% defense',
            branch: 'defense',
            row: 1,
            column: 1,
            cost: { skillPoints: 1 },
            requires: ['mag_def_1'],
            effects: {
              defenseMultiplier: 0.15
            }
          },
          {
            id: 'mag_def_3',
            name: 'Spell Reflection',
            description: '10% chance to reflect damage back to attacker',
            branch: 'defense',
            row: 2,
            column: 1,
            cost: { skillPoints: 2 },
            requires: ['mag_def_2'],
            effects: {
              reflectChance: 0.10
            }
          },
          {
            id: 'mag_def_4',
            name: 'Temporal Barrier',
            description: '+15% HP, 15% chance to dodge attacks',
            branch: 'defense',
            row: 3,
            column: 1,
            cost: { skillPoints: 2 },
            requires: ['mag_def_3'],
            effects: {
              maxHpMultiplier: 0.15,
              dodgeChance: 0.15
            }
          }
        ]
      },
      utility: {
        name: 'Wisdom',
        color: '#ffff44',
        nodes: [
          {
            id: 'mag_util_1',
            name: 'Mana Efficiency',
            description: '+10% XP gain',
            branch: 'utility',
            row: 0,
            column: 2,
            cost: { skillPoints: 1 },
            requires: [],
            effects: {
              xpBonus: 0.10
            }
          },
          {
            id: 'mag_util_2',
            name: 'Arcane Knowledge',
            description: '+5% codeFragments from recycling',
            branch: 'utility',
            row: 1,
            column: 2,
            cost: { skillPoints: 1 },
            requires: ['mag_util_1'],
            effects: {
              codeFragmentsBonus: 0.05
            }
          },
          {
            id: 'mag_util_3',
            name: 'Elemental Mastery',
            description: '+20% damage vs bosses',
            branch: 'utility',
            row: 2,
            column: 2,
            cost: { skillPoints: 2 },
            requires: ['mag_util_2'],
            effects: {
              bossDamageBonus: 0.20
            }
          },
          {
            id: 'mag_util_4',
            name: 'Archmage\'s Wisdom',
            description: '+15% XP, +10% resources from all sources',
            branch: 'utility',
            row: 3,
            column: 2,
            cost: { skillPoints: 2 },
            requires: ['mag_util_3'],
            effects: {
              xpBonus: 0.15,
              resourceBonus: 0.10
            }
          }
        ]
      }
    }
  },

  /**
   * RANGER CLASS - Balanced DPS with utility
   */
  ranger: {
    name: 'Ranger',
    className: 'ranger',
    branches: {
      offense: {
        name: 'Precision',
        color: '#ff8844',
        nodes: [
          {
            id: 'ran_off_1',
            name: 'Sharpshooter',
            description: '+8% attack, +3% crit chance',
            branch: 'offense',
            row: 0,
            column: 0,
            cost: { skillPoints: 1 },
            requires: [],
            effects: {
              attackMultiplier: 0.08,
              critChance: 0.03
            }
          },
          {
            id: 'ran_off_2',
            name: 'Deadly Aim',
            description: '+12% attack, +5% crit chance',
            branch: 'offense',
            row: 1,
            column: 0,
            cost: { skillPoints: 1 },
            requires: ['ran_off_1'],
            effects: {
              attackMultiplier: 0.12,
              critChance: 0.05
            }
          },
          {
            id: 'ran_off_3',
            name: 'Piercing Shot',
            description: 'Attacks ignore 25% of enemy defense',
            branch: 'offense',
            row: 2,
            column: 0,
            cost: { skillPoints: 2 },
            requires: ['ran_off_2'],
            effects: {
              armorPenetration: 0.25
            }
          },
          {
            id: 'ran_off_4',
            name: 'Rapid Fire',
            description: 'Attack speed +30%',
            branch: 'offense',
            row: 3,
            column: 0,
            cost: { skillPoints: 2 },
            requires: ['ran_off_3'],
            effects: {
              attackSpeed: 0.30
            }
          },
          {
            id: 'ran_off_5',
            name: 'Sniper Elite',
            description: '+10% crit chance, +1.5x crit multiplier, attacks have 20% chance to instantly kill non-boss enemies below 15% HP',
            branch: 'offense',
            row: 4,
            column: 0,
            cost: { skillPoints: 3, gold: 1500 },
            requires: ['ran_off_4'],
            effects: {
              critChance: 0.10,
              critMultiplier: 1.5,
              executeChance: 0.20,
              executeThreshold: 0.15
            }
          }
        ]
      },
      defense: {
        name: 'Evasion',
        color: '#44ff88',
        nodes: [
          {
            id: 'ran_def_1',
            name: 'Agility',
            description: '+12% max HP, +8% speed',
            branch: 'defense',
            row: 0,
            column: 1,
            cost: { skillPoints: 1 },
            requires: [],
            effects: {
              maxHpMultiplier: 0.12,
              speedBonus: 0.08
            }
          },
          {
            id: 'ran_def_2',
            name: 'Evasive Maneuvers',
            description: '+10% dodge chance',
            branch: 'defense',
            row: 1,
            column: 1,
            cost: { skillPoints: 1 },
            requires: ['ran_def_1'],
            effects: {
              dodgeChance: 0.10
            }
          },
          {
            id: 'ran_def_3',
            name: 'Fleet-Footed',
            description: '+15% dodge, +15% speed',
            branch: 'defense',
            row: 2,
            column: 1,
            cost: { skillPoints: 2 },
            requires: ['ran_def_2'],
            effects: {
              dodgeChance: 0.15,
              speedBonus: 0.15
            }
          },
          {
            id: 'ran_def_4',
            name: 'Shadow Step',
            description: '+20% dodge, immune to poison',
            branch: 'defense',
            row: 3,
            column: 1,
            cost: { skillPoints: 2 },
            requires: ['ran_def_3'],
            effects: {
              dodgeChance: 0.20,
              poisonImmune: true
            }
          }
        ]
      },
      utility: {
        name: 'Survivalist',
        color: '#88ff44',
        nodes: [
          {
            id: 'ran_util_1',
            name: 'Hunter\'s Mark',
            description: '+8% gold from kills',
            branch: 'utility',
            row: 0,
            column: 2,
            cost: { skillPoints: 1 },
            requires: [],
            effects: {
              goldBonus: 0.08
            }
          },
          {
            id: 'ran_util_2',
            name: 'Scavenger',
            description: '+10% item drop rate',
            branch: 'utility',
            row: 1,
            column: 2,
            cost: { skillPoints: 1 },
            requires: ['ran_util_1'],
            effects: {
              dropRateBonus: 0.10
            }
          },
          {
            id: 'ran_util_3',
            name: 'Treasure Hunter',
            description: '+15% gold, +15% item drop rate',
            branch: 'utility',
            row: 2,
            column: 2,
            cost: { skillPoints: 2 },
            requires: ['ran_util_2'],
            effects: {
              goldBonus: 0.15,
              dropRateBonus: 0.15
            }
          },
          {
            id: 'ran_util_4',
            name: 'Master Tracker',
            description: '+20% gold, +20% drop rate, +5% rare drop chance',
            branch: 'utility',
            row: 3,
            column: 2,
            cost: { skillPoints: 2 },
            requires: ['ran_util_3'],
            effects: {
              goldBonus: 0.20,
              dropRateBonus: 0.20,
              rareDropBonus: 0.05
            }
          }
        ]
      }
    }
  },

  /**
   * CLERIC CLASS - Support/healer
   */
  cleric: {
    name: 'Cleric',
    className: 'cleric',
    branches: {
      offense: {
        name: 'Holy Wrath',
        color: '#ffdd44',
        nodes: [
          {
            id: 'cle_off_1',
            name: 'Holy Smite',
            description: '+10% attack vs undead/demons',
            branch: 'offense',
            row: 0,
            column: 0,
            cost: { skillPoints: 1 },
            requires: [],
            effects: {
              undeadDamageBonus: 0.10
            }
          },
          {
            id: 'cle_off_2',
            name: 'Divine Power',
            description: '+12% attack damage',
            branch: 'offense',
            row: 1,
            column: 0,
            cost: { skillPoints: 1 },
            requires: ['cle_off_1'],
            effects: {
              attackMultiplier: 0.12
            }
          },
          {
            id: 'cle_off_3',
            name: 'Righteous Fury',
            description: '+20% attack, healing spells also deal damage to enemies',
            branch: 'offense',
            row: 2,
            column: 0,
            cost: { skillPoints: 2 },
            requires: ['cle_off_2'],
            effects: {
              attackMultiplier: 0.20,
              healDamageConversion: 0.50
            }
          },
          {
            id: 'cle_off_4',
            name: 'Divine Judgment',
            description: '+25% attack, +10% crit chance vs bosses',
            branch: 'offense',
            row: 3,
            column: 0,
            cost: { skillPoints: 2 },
            requires: ['cle_off_3'],
            effects: {
              attackMultiplier: 0.25,
              bossCritBonus: 0.10
            }
          }
        ]
      },
      defense: {
        name: 'Divine Protection',
        color: '#ffcc88',
        nodes: [
          {
            id: 'cle_def_1',
            name: 'Blessed Armor',
            description: '+18% max HP',
            branch: 'defense',
            row: 0,
            column: 1,
            cost: { skillPoints: 1 },
            requires: [],
            effects: {
              maxHpMultiplier: 0.18
            }
          },
          {
            id: 'cle_def_2',
            name: 'Divine Shield',
            description: '+12% defense, +10% HP',
            branch: 'defense',
            row: 1,
            column: 1,
            cost: { skillPoints: 1 },
            requires: ['cle_def_1'],
            effects: {
              defenseMultiplier: 0.12,
              maxHpMultiplier: 0.10
            }
          },
          {
            id: 'cle_def_3',
            name: 'Sanctuary',
            description: '+20% HP for entire party',
            branch: 'defense',
            row: 2,
            column: 1,
            cost: { skillPoints: 2 },
            requires: ['cle_def_2'],
            effects: {
              partyHpBonus: 0.20
            }
          },
          {
            id: 'cle_def_4',
            name: 'Guardian Angel',
            description: '10% chance to survive lethal damage at 1 HP (once per battle)',
            branch: 'defense',
            row: 3,
            column: 1,
            cost: { skillPoints: 2 },
            requires: ['cle_def_3'],
            effects: {
              angelicGuardian: 0.10
            }
          },
          {
            id: 'cle_def_5',
            name: 'Divine Intervention',
            description: '+30% HP for party, passive healing for party (1% HP every 5s)',
            branch: 'defense',
            row: 4,
            column: 1,
            cost: { skillPoints: 3, gold: 1200 },
            requires: ['cle_def_4'],
            effects: {
              partyHpBonus: 0.30,
              partyRegen: 0.01
            }
          }
        ]
      },
      utility: {
        name: 'Holy Wisdom',
        color: '#aaddff',
        nodes: [
          {
            id: 'cle_util_1',
            name: 'Blessing',
            description: '+8% XP gain for party',
            branch: 'utility',
            row: 0,
            column: 2,
            cost: { skillPoints: 1 },
            requires: [],
            effects: {
              partyXpBonus: 0.08
            }
          },
          {
            id: 'cle_util_2',
            name: 'Divine Favor',
            description: '+5% luck for party (affects drops, crits)',
            branch: 'utility',
            row: 1,
            column: 2,
            cost: { skillPoints: 1 },
            requires: ['cle_util_1'],
            effects: {
              partyLuckBonus: 0.05
            }
          },
          {
            id: 'cle_util_3',
            name: 'Holy Radiance',
            description: '+15% XP for party, abilities cooldown 15% faster',
            branch: 'utility',
            row: 2,
            column: 2,
            cost: { skillPoints: 2 },
            requires: ['cle_util_2'],
            effects: {
              partyXpBonus: 0.15,
              cooldownReduction: 0.15
            }
          },
          {
            id: 'cle_util_4',
            name: 'Miracle Worker',
            description: '+20% XP, +10% luck, 5% chance to double rewards',
            branch: 'utility',
            row: 3,
            column: 2,
            cost: { skillPoints: 2 },
            requires: ['cle_util_3'],
            effects: {
              partyXpBonus: 0.20,
              partyLuckBonus: 0.10,
              doubleRewardChance: 0.05
            }
          }
        ]
      }
    }
  }
};

/**
 * Get all nodes for a class as flat array
 * @param {string} className - warrior, mage, ranger, cleric
 * @returns {Array} All skill nodes
 */
export function getAllNodesForClass(className) {
  const tree = SKILL_TREES[className];
  if (!tree) return [];

  const nodes = [];
  Object.values(tree.branches).forEach(branch => {
    nodes.push(...branch.nodes);
  });

  return nodes;
}

/**
 * Get node by ID
 * @param {string} nodeId
 * @returns {Object|null} Skill node
 */
export function getNodeById(nodeId) {
  for (const tree of Object.values(SKILL_TREES)) {
    for (const branch of Object.values(tree.branches)) {
      const node = branch.nodes.find(n => n.id === nodeId);
      if (node) return node;
    }
  }
  return null;
}

/**
 * Check if hero meets requirements for a node
 * @param {Object} hero - Hero object
 * @param {Object} node - Skill node
 * @returns {Object} { canUnlock: boolean, reason: string }
 */
export function canUnlockNode(hero, node) {
  // Check prerequisites
  for (const reqId of node.requires) {
    if (!hero.unlockedSkillNodes || !hero.unlockedSkillNodes.includes(reqId)) {
      return { canUnlock: false, reason: 'Missing prerequisite skill' };
    }
  }

  // Check skill points
  const skillPoints = hero.skillPoints || 0;
  const requiredPoints = node.cost.skillPoints || 0;
  if (skillPoints < requiredPoints) {
    return { canUnlock: false, reason: `Need ${requiredPoints} skill points` };
  }

  // Check other resources (gold, codeFragments, etc.)
  // This would integrate with ResourceManager in actual implementation

  return { canUnlock: true, reason: '' };
}

/**
 * Calculate total stats from unlocked skill nodes
 * @param {Object} hero - Hero with unlockedSkillNodes array
 * @returns {Object} Aggregated stat bonuses
 */
export function calculateSkillBonuses(hero) {
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
    // ... other stats
  };

  if (!hero.unlockedSkillNodes || hero.unlockedSkillNodes.length === 0) {
    return bonuses;
  }

  hero.unlockedSkillNodes.forEach(nodeId => {
    const node = getNodeById(nodeId);
    if (node && node.effects) {
      // Aggregate effects
      for (const [stat, value] of Object.entries(node.effects)) {
        if (typeof value === 'number') {
          bonuses[stat] = (bonuses[stat] || 0) + value;
        } else {
          // Boolean flags (like stunImmune, aoeDamage, etc.)
          bonuses[stat] = value;
        }
      }
    }
  });

  return bonuses;
}
