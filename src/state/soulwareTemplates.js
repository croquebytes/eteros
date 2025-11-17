// ===== Soulware Item Templates =====
// Equipment and party-wide boosters

export const SOULWARE_TEMPLATES = {
  // === COMMON (1★) WEAPONS ===

  basic_blade: {
    id: 'basic_blade',
    name: 'Basic Blade.exe',
    rarity: 1,
    type: 'weapon',
    statBonuses: { atk: 5, atkPercent: 0.05 },
    passiveEffect: null,
    source: 'dungeon_drop'
  },

  starter_staff: {
    id: 'starter_staff',
    name: 'Starter Staff v1.0',
    rarity: 1,
    type: 'weapon',
    statBonuses: { atk: 4, spdPercent: 0.03 },
    passiveEffect: null,
    source: 'dungeon_drop'
  },

  // === COMMON (1★) ARMOR ===

  basic_shield: {
    id: 'basic_shield',
    name: 'Basic Shield.sys',
    rarity: 1,
    type: 'armor',
    statBonuses: { def: 8, hpPercent: 0.05 },
    passiveEffect: null,
    source: 'dungeon_drop'
  },

  leather_patch: {
    id: 'leather_patch',
    name: 'Leather Patch v1.0',
    rarity: 1,
    type: 'armor',
    statBonuses: { def: 6, defPercent: 0.03 },
    passiveEffect: null,
    source: 'dungeon_drop'
  },

  // === UNCOMMON (2★) WEAPONS ===

  flame_sword: {
    id: 'flame_sword',
    name: 'Flame Sword.exe',
    rarity: 2,
    type: 'weapon',
    statBonuses: { atk: 12, atkPercent: 0.08 },
    passiveEffect: { id: 'burn', description: '10% chance to burn on hit', value: 0.10 },
    source: 'dungeon_drop'
  },

  crit_driver_v1: {
    id: 'crit_driver_v1',
    name: 'Crit Driver v1.0',
    rarity: 2,
    type: 'weapon',
    statBonuses: { atk: 10, lckPercent: 0.10 },
    passiveEffect: { id: 'crit_boost', description: '+5% crit rate', value: { critRate: 0.05 } },
    source: 'dungeon_drop'
  },

  // === RARE (3★) WEAPONS ===

  crit_driver_v2: {
    id: 'crit_driver_v2',
    name: 'Crit Driver v2.0',
    rarity: 3,
    type: 'weapon',
    statBonuses: { atkPercent: 0.15 },
    passiveEffect: { id: 'crit_boost', description: '+10% crit rate', value: { critRate: 0.10 } },
    source: 'dungeon_drop'
  },

  void_blade: {
    id: 'void_blade',
    name: 'Void Blade.exe',
    rarity: 3,
    type: 'weapon',
    statBonuses: { atk: 25, atkPercent: 0.12, spdPercent: 0.08 },
    passiveEffect: { id: 'armor_pierce', description: 'Ignore 15% of enemy defense', value: 0.15 },
    source: 'dungeon_drop'
  },

  // === RARE (3★) ARMOR ===

  firewall_firmware: {
    id: 'firewall_firmware',
    name: 'Firewall Firmware',
    rarity: 3,
    type: 'armor',
    statBonuses: { defPercent: 0.20, hpPercent: 0.10 },
    passiveEffect: { id: 'damage_reduction', description: '+5% damage reduction', value: 0.05 },
    source: 'dungeon_drop'
  },

  regenerative_plating: {
    id: 'regenerative_plating',
    name: 'Regenerative Plating v2.0',
    rarity: 3,
    type: 'armor',
    statBonuses: { def: 18, hpPercent: 0.15 },
    passiveEffect: { id: 'regen', description: 'Regenerate 2% HP every 5 seconds', value: 0.02 },
    source: 'dungeon_drop'
  },

  // === RARE (3★) ACCESSORIES ===

  overclocking_daemon: {
    id: 'overclocking_daemon',
    name: 'Overclocking Daemon',
    rarity: 3,
    type: 'accessory',
    statBonuses: { spdPercent: 0.10, atkPercent: 0.08 },
    passiveEffect: { id: 'cooldown_reduction', description: 'Abilities cooldown 5% faster', value: 0.05 },
    source: 'dungeon_drop'
  },

  lucky_charm: {
    id: 'lucky_charm',
    name: 'Lucky Charm.dll',
    rarity: 3,
    type: 'accessory',
    statBonuses: { lck: 5, lckPercent: 0.15 },
    passiveEffect: { id: 'drop_boost', description: '+10% item drop rate', value: 0.10 },
    source: 'dungeon_drop'
  },

  // === EPIC (4★) WEAPONS ===

  admin_blade: {
    id: 'admin_blade',
    name: 'Admin Blade v3.0',
    rarity: 4,
    type: 'weapon',
    statBonuses: { atk: 40, atkPercent: 0.25, lckPercent: 0.10 },
    passiveEffect: { id: 'admin_strike', description: '+15% damage, +10% crit rate', value: { damageBoost: 0.15, critRate: 0.10 } },
    source: 'boss_raid'
  },

  infinity_edge: {
    id: 'infinity_edge',
    name: 'Infinity Edge.exe',
    rarity: 4,
    type: 'weapon',
    statBonuses: { atk: 50, atkPercent: 0.30 },
    passiveEffect: { id: 'execute', description: 'Deal 50% more damage to enemies below 30% HP', value: { lowHpBonus: 0.50, threshold: 0.30 } },
    source: 'challenge_dungeon'
  },

  // === EPIC (4★) SYSTEM-WIDE ===

  low_rarity_amplifier: {
    id: 'low_rarity_amplifier',
    name: 'Low-Rarity Amplifier',
    rarity: 4,
    type: 'systemWide',
    statBonuses: {},
    passiveEffect: { id: 'low_rarity_boost', description: 'All heroes 3★ or lower gain +30% stats', value: 0.30 },
    conditionalEffects: [
      { condition: 'heroRarity <= 3', effect: { allStatsPercent: 0.30 } }
    ],
    source: 'store'
  },

  tank_synergy_relay: {
    id: 'tank_synergy_relay',
    name: 'Tank Synergy Relay',
    rarity: 3,
    type: 'systemWide',
    statBonuses: {},
    passiveEffect: { id: 'tank_boost', description: 'If party has 2+ Tank heroes, all Tanks gain +20% DEF', value: 0.20 },
    conditionalEffects: [
      { condition: 'partyTankCount >= 2', effect: { defPercent: 0.20 }, targetRole: 'Tank' }
    ],
    source: 'dungeon_drop'
  },

  dps_overclock_module: {
    id: 'dps_overclock_module',
    name: 'DPS Overclock Module',
    rarity: 3,
    type: 'systemWide',
    statBonuses: {},
    passiveEffect: { id: 'dps_boost', description: 'If party has 3+ DPS heroes, all DPS gain +15% ATK and SPD', value: { atkPercent: 0.15, spdPercent: 0.15 } },
    conditionalEffects: [
      { condition: 'partyDpsCount >= 3', effect: { atkPercent: 0.15, spdPercent: 0.15 }, targetRole: 'DPS' }
    ],
    source: 'dungeon_drop'
  },

  healing_protocol_v3: {
    id: 'healing_protocol_v3',
    name: 'Healing Protocol v3.1',
    rarity: 2,
    type: 'systemWide',
    statBonuses: {},
    passiveEffect: { id: 'party_regen', description: 'Party heals 2% HP every 5 seconds', value: 0.02 },
    source: 'dungeon_drop'
  },

  gold_multiplier_patch: {
    id: 'gold_multiplier_patch',
    name: 'Gold Multiplier Patch',
    rarity: 3,
    type: 'systemWide',
    statBonuses: {},
    passiveEffect: { id: 'gold_boost', description: '+25% gold from dungeons', value: 0.25 },
    source: 'store'
  },

  xp_boost_script: {
    id: 'xp_boost_script',
    name: 'XP Boost Script',
    rarity: 3,
    type: 'systemWide',
    statBonuses: {},
    passiveEffect: { id: 'xp_boost', description: '+15% XP gain', value: 0.15 },
    source: 'store'
  },

  boss_slayer_codec: {
    id: 'boss_slayer_codec',
    name: 'Boss Slayer Codec',
    rarity: 3,
    type: 'systemWide',
    statBonuses: {},
    passiveEffect: { id: 'boss_damage', description: '+50% damage vs bosses', value: 0.50 },
    dungeonModifiers: { bossRaid: { damageBonus: 0.50 } },
    source: 'boss_raid'
  },

  // === LEGENDARY (5★) SYSTEM-WIDE ===

  admin_legacy_kernel: {
    id: 'admin_legacy_kernel',
    name: "Admin's Legacy Kernel",
    rarity: 5,
    type: 'systemWide',
    statBonuses: { hpPercent: 0.30, atkPercent: 0.20 },
    passiveEffect: {
      id: 'root_access',
      description: 'Once per dungeon, if party would be defeated, restore 50% HP to all heroes and gain +50% damage for 30s',
      value: { reviveOnce: true, hpRestore: 0.50, damageBoost: 0.50, boostDuration: 30 }
    },
    source: 'prestige'
  },

  infinity_core: {
    id: 'infinity_core',
    name: 'Infinity Core.sys',
    rarity: 5,
    type: 'systemWide',
    statBonuses: { allStatsPercent: 0.25 },
    passiveEffect: {
      id: 'infinite_power',
      description: 'All stats +25%, abilities cooldown 20% faster, +50% crit damage',
      value: { cooldownReduction: 0.20, critDamageBonus: 0.50 }
    },
    source: 'prestige'
  }
};

// Helper functions
export function getSoulwareByRarity(rarity) {
  return Object.values(SOULWARE_TEMPLATES).filter(s => s.rarity === rarity);
}

export function getRandomSoulware(rarity, type = null) {
  let items = getSoulwareByRarity(rarity);
  if (type) {
    items = items.filter(s => s.type === type);
  }
  return items[Math.floor(Math.random() * items.length)];
}
