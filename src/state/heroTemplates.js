// ===== Hero Templates =====
// All hero definitions with stats, abilities, and growth rates

export const HERO_TEMPLATES = {
  // === COMMON (1★) HEROES ===

  basic_warrior: {
    id: 'basic_warrior',
    name: 'Process Guardian',
    rarity: 1,
    role: 'Tank',
    baseStats: { hp: 100, atk: 6, def: 12, spd: 4, lck: 1 },
    growthRates: { hp: 10, atk: 0.5, def: 1.5, spd: 0.3, lck: 0.1 },
    abilities: [
      { id: 'basic_taunt', name: 'Basic Taunt', unlockLevel: 1, cooldown: 5 }
    ]
  },

  basic_dps: {
    id: 'basic_dps',
    name: 'Code Striker',
    rarity: 1,
    role: 'DPS',
    baseStats: { hp: 70, atk: 10, def: 5, spd: 6, lck: 2 },
    growthRates: { hp: 6, atk: 1.2, def: 0.4, spd: 0.5, lck: 0.15 },
    abilities: [
      { id: 'basic_strike', name: 'Quick Strike', unlockLevel: 1, cooldown: 3 }
    ]
  },

  basic_support: {
    id: 'basic_support',
    name: 'Heal.exe',
    rarity: 1,
    role: 'Healer',
    baseStats: { hp: 80, atk: 5, def: 6, spd: 5, lck: 2 },
    growthRates: { hp: 7, atk: 0.3, def: 0.5, spd: 0.4, lck: 0.15 },
    abilities: [
      { id: 'basic_heal', name: 'Minor Heal', unlockLevel: 1, cooldown: 6 }
    ]
  },

  // === UNCOMMON (2★) HEROES ===

  firewall_recruit: {
    id: 'firewall_recruit',
    name: 'Firewall Recruit',
    rarity: 2,
    role: 'Tank',
    baseStats: { hp: 110, atk: 7, def: 14, spd: 4, lck: 1 },
    growthRates: { hp: 12, atk: 0.6, def: 1.8, spd: 0.3, lck: 0.1 },
    abilities: [
      { id: 'shield_wall', name: 'Shield Wall', unlockLevel: 1, cooldown: 5 },
      { id: 'defense_boost', name: 'Defense Boost', unlockLevel: 20, cooldown: 8 }
    ]
  },

  data_slasher: {
    id: 'data_slasher',
    name: 'Data Slasher',
    rarity: 2,
    role: 'DPS',
    baseStats: { hp: 75, atk: 12, def: 5, spd: 7, lck: 2 },
    growthRates: { hp: 7, atk: 1.4, def: 0.4, spd: 0.6, lck: 0.2 },
    abilities: [
      { id: 'rapid_slash', name: 'Rapid Slash', unlockLevel: 1, cooldown: 3 },
      { id: 'bleed', name: 'Bleeding Edge', unlockLevel: 20, cooldown: 6 }
    ]
  },

  repair_daemon: {
    id: 'repair_daemon',
    name: 'Repair Daemon',
    rarity: 2,
    role: 'Healer',
    baseStats: { hp: 85, atk: 6, def: 7, spd: 5, lck: 2 },
    growthRates: { hp: 8, atk: 0.4, def: 0.6, spd: 0.4, lck: 0.15 },
    abilities: [
      { id: 'aoe_heal', name: 'Repair All', unlockLevel: 1, cooldown: 7 },
      { id: 'regen_buff', name: 'Regen Protocol', unlockLevel: 20, cooldown: 10 }
    ]
  },

  // === RARE (3★) HEROES ===

  firewall_knight_ignis: {
    id: 'firewall_knight_ignis',
    name: 'Firewall Knight Ignis',
    rarity: 3,
    role: 'Tank',
    baseStats: { hp: 120, atk: 8, def: 18, spd: 5, lck: 2 },
    growthRates: { hp: 15, atk: 0.8, def: 2.4, spd: 0.4, lck: 0.15 },
    abilities: [
      { id: 'taunt', name: 'Taunt', unlockLevel: 1, cooldown: 4 },
      { id: 'shield_bash', name: 'Shield Bash', unlockLevel: 20, cooldown: 5 },
      { id: 'fortify', name: 'Fortify', unlockLevel: 50, cooldown: 12 }
    ]
  },

  blade_daemon_kira: {
    id: 'blade_daemon_kira',
    name: 'Blade Daemon Kira',
    rarity: 3,
    role: 'DPS',
    baseStats: { hp: 85, atk: 15, def: 6, spd: 9, lck: 3 },
    growthRates: { hp: 8, atk: 1.8, def: 0.5, spd: 0.8, lck: 0.25 },
    abilities: [
      { id: 'double_strike', name: 'Double Strike', unlockLevel: 1, cooldown: 3 },
      { id: 'execute', name: 'Execute', unlockLevel: 20, cooldown: 8 },
      { id: 'blade_storm', name: 'Blade Storm', unlockLevel: 50, cooldown: 15 }
    ]
  },

  oracle_zephyr: {
    id: 'oracle_zephyr',
    name: 'Oracle Zephyr',
    rarity: 3,
    role: 'Support',
    baseStats: { hp: 90, atk: 7, def: 8, spd: 8, lck: 4 },
    growthRates: { hp: 9, atk: 0.6, def: 0.7, spd: 0.7, lck: 0.3 },
    abilities: [
      { id: 'buff_attack', name: 'Attack Buff', unlockLevel: 1, cooldown: 8 },
      { id: 'cleanse', name: 'Cleanse', unlockLevel: 20, cooldown: 10 },
      { id: 'haste', name: 'Haste', unlockLevel: 50, cooldown: 12 }
    ]
  },

  phoenix_healer: {
    id: 'phoenix_healer',
    name: 'Phoenix.sys',
    rarity: 3,
    role: 'Healer',
    baseStats: { hp: 95, atk: 7, def: 9, spd: 6, lck: 3 },
    growthRates: { hp: 10, atk: 0.5, def: 0.8, spd: 0.5, lck: 0.2 },
    abilities: [
      { id: 'group_heal', name: 'Mass Heal', unlockLevel: 1, cooldown: 6 },
      { id: 'revive', name: 'Revive', unlockLevel: 20, cooldown: 20 },
      { id: 'resurrection', name: 'Auto-Resurrection', unlockLevel: 75, cooldown: 60 }
    ]
  },

  // === EPIC (4★) HEROES ===

  admin_guardian_rex: {
    id: 'admin_guardian_rex',
    name: 'Admin Guardian Rex',
    rarity: 4,
    role: 'Tank',
    baseStats: { hp: 150, atk: 10, def: 25, spd: 5, lck: 3 },
    growthRates: { hp: 20, atk: 1.0, def: 3.5, spd: 0.4, lck: 0.2 },
    abilities: [
      { id: 'unbreakable', name: 'Unbreakable', unlockLevel: 1, cooldown: 5 },
      { id: 'counter_strike', name: 'Counter Strike', unlockLevel: 20, cooldown: 4 },
      { id: 'guardian_stance', name: 'Guardian Stance', unlockLevel: 50, cooldown: 15 },
      { id: 'immortal_bulwark', name: 'Ultimate: Immortal Bulwark', unlockLevel: 75, cooldown: 30 }
    ]
  },

  void_reaper_nyx: {
    id: 'void_reaper_nyx',
    name: 'Void Reaper Nyx',
    rarity: 4,
    role: 'DPS',
    baseStats: { hp: 95, atk: 22, def: 7, spd: 12, lck: 5 },
    growthRates: { hp: 9, atk: 2.5, def: 0.6, spd: 1.1, lck: 0.4 },
    abilities: [
      { id: 'void_strike', name: 'Void Strike', unlockLevel: 1, cooldown: 2 },
      { id: 'shadow_step', name: 'Shadow Step', unlockLevel: 20, cooldown: 6 },
      { id: 'assassinate', name: 'Assassinate', unlockLevel: 50, cooldown: 10 },
      { id: 'reaper_form', name: 'Ultimate: Reaper Form', unlockLevel: 75, cooldown: 40 }
    ]
  },

  chrono_mage_iris: {
    id: 'chrono_mage_iris',
    name: 'Chrono Mage Iris',
    rarity: 4,
    role: 'Support',
    baseStats: { hp: 100, atk: 12, def: 10, spd: 11, lck: 6 },
    growthRates: { hp: 10, atk: 1.2, def: 0.9, spd: 1.0, lck: 0.5 },
    abilities: [
      { id: 'time_slow', name: 'Time Slow', unlockLevel: 1, cooldown: 8 },
      { id: 'speed_buff', name: 'Temporal Acceleration', unlockLevel: 20, cooldown: 10 },
      { id: 'time_stop', name: 'Time Stop', unlockLevel: 50, cooldown: 20 },
      { id: 'chrono_shift', name: 'Ultimate: Chrono Shift', unlockLevel: 75, cooldown: 35 }
    ]
  },

  // === LEGENDARY (5★) HEROES ===

  eternal_sentinel: {
    id: 'eternal_sentinel',
    name: 'Eternal Sentinel',
    rarity: 5,
    role: 'Tank',
    baseStats: { hp: 200, atk: 12, def: 35, spd: 6, lck: 5 },
    growthRates: { hp: 30, atk: 1.2, def: 5.0, spd: 0.5, lck: 0.3 },
    abilities: [
      { id: 'aegis', name: 'Aegis Shield', unlockLevel: 1, cooldown: 4 },
      { id: 'reflect', name: 'Perfect Reflection', unlockLevel: 20, cooldown: 6 },
      { id: 'invincibility', name: 'Invincibility', unlockLevel: 50, cooldown: 20 },
      { id: 'divine_fortress', name: 'Ultimate: Divine Fortress', unlockLevel: 75, cooldown: 45 }
    ]
  },

  infinity_destroyer: {
    id: 'infinity_destroyer',
    name: 'Infinity Destroyer',
    rarity: 5,
    role: 'DPS',
    baseStats: { hp: 120, atk: 35, def: 10, spd: 15, lck: 8 },
    growthRates: { hp: 12, atk: 4.0, def: 0.8, spd: 1.5, lck: 0.6 },
    abilities: [
      { id: 'infinite_blade', name: 'Infinite Blade', unlockLevel: 1, cooldown: 2 },
      { id: 'reality_break', name: 'Reality Break', unlockLevel: 20, cooldown: 5 },
      { id: 'dimension_slash', name: 'Dimension Slash', unlockLevel: 50, cooldown: 12 },
      { id: 'omega_storm', name: 'Ultimate: Omega Storm', unlockLevel: 75, cooldown: 50 }
    ]
  },

  cosmic_oracle: {
    id: 'cosmic_oracle',
    name: 'Cosmic Oracle',
    rarity: 5,
    role: 'Support',
    baseStats: { hp: 130, atk: 15, def: 15, spd: 14, lck: 10 },
    growthRates: { hp: 15, atk: 1.5, def: 1.5, spd: 1.3, lck: 0.8 },
    abilities: [
      { id: 'cosmic_blessing', name: 'Cosmic Blessing', unlockLevel: 1, cooldown: 7 },
      { id: 'fate_weave', name: 'Fate Weave', unlockLevel: 20, cooldown: 10 },
      { id: 'probability_manipulation', name: 'Probability Manipulation', unlockLevel: 50, cooldown: 15 },
      { id: 'universe_rewrite', name: 'Ultimate: Universe Rewrite', unlockLevel: 75, cooldown: 60 }
    ]
  }
};

// Helper to get all heroes of a specific rarity
export function getHeroesByRarity(rarity) {
  return Object.values(HERO_TEMPLATES).filter(h => h.rarity === rarity);
}

// Helper to get a random hero of a specific rarity
export function getRandomHeroByRarity(rarity) {
  const heroes = getHeroesByRarity(rarity);
  return heroes[Math.floor(Math.random() * heroes.length)];
}
