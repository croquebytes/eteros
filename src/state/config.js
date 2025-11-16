// ===== ReincarnOS Game Configuration =====
// All tunable constants and game balance parameters

export const CONFIG = {
  // === Combat Timing ===
  waveIntervalMs: 5000,           // Time between waves (5 seconds)
  combatTickMs: 1000,             // Combat update frequency (1 second)
  autoAttackSpeed: 2000,          // Base attack interval (2 seconds)

  // === Currency & Economy ===
  baseGoldPerWave: 5,             // Gold earned per wave completion
  baseXpPerWave: 10,              // XP earned per wave
  goldPerEnemyKill: 2,            // Gold per enemy defeated
  xpPerEnemyKill: 5,              // XP per enemy defeated

  // === Hero Stats (Base) ===
  heroBaseStats: {
    maxHp: 100,
    attack: 10,
    defense: 5,
    speed: 10,
    critChance: 0.05,             // 5% crit chance
    critMultiplier: 2.0,          // 200% damage on crit
  },

  // === Hero Classes ===
  heroClasses: {
    warrior: {
      name: 'Warrior',
      glyph: '⚔️',
      statMultipliers: { maxHp: 1.3, attack: 1.1, defense: 1.2, speed: 0.9 },
      skills: ['shield_bash', 'taunt']
    },
    mage: {
      name: 'Mage',
      glyph: '🔮',
      statMultipliers: { maxHp: 0.8, attack: 1.4, defense: 0.7, speed: 1.1 },
      skills: ['fireball', 'frost_nova']
    },
    ranger: {
      name: 'Ranger',
      glyph: '🏹',
      statMultipliers: { maxHp: 0.9, attack: 1.2, defense: 0.9, speed: 1.3 },
      skills: ['multi_shot', 'poison_arrow']
    },
    cleric: {
      name: 'Cleric',
      glyph: '✨',
      statMultipliers: { maxHp: 1.0, attack: 0.8, defense: 1.0, speed: 1.0 },
      skills: ['heal', 'divine_shield']
    }
  },

  // === Enemy Scaling ===
  enemyBaseStats: {
    maxHp: 50,
    attack: 8,
    defense: 3,
    speed: 8,
  },
  enemyScalingPerWave: 1.08,      // 8% stat increase per wave
  bossWaveInterval: 10,            // Boss appears every 10 waves
  bossStatMultiplier: 3.0,         // Bosses have 3x stats

  // === Loot System ===
  lootDropChance: 0.3,             // 30% chance per enemy
  bossLootDropChance: 1.0,         // Bosses always drop loot
  itemRarities: {
    common: { weight: 50, color: '#9ca3af', statMultiplier: 1.0 },
    uncommon: { weight: 30, color: '#10b981', statMultiplier: 1.3 },
    rare: { weight: 15, color: '#3b82f6', statMultiplier: 1.6 },
    epic: { weight: 4, color: '#a855f7', statMultiplier: 2.0 },
    legendary: { weight: 1, color: '#f59e0b', statMultiplier: 2.5 }
  },
  itemSlots: ['weapon', 'armor', 'accessory'],
  itemBaseStats: {
    weapon: { attack: 5, critChance: 0.02 },
    armor: { maxHp: 20, defense: 3 },
    accessory: { speed: 2, critMultiplier: 0.1 }
  },

  // === Upgrades (Soulware Store) ===
  upgrades: {
    goldMultiplier: {
      name: 'Gold Mining Software',
      baseCost: 100,
      costMultiplier: 1.5,
      effect: 0.1,                // +10% gold per level
      maxLevel: 50
    },
    xpMultiplier: {
      name: 'Experience Optimizer',
      baseCost: 150,
      costMultiplier: 1.5,
      effect: 0.1,                // +10% XP per level
      maxLevel: 50
    },
    autoProgress: {
      name: 'Idle Accelerator',
      baseCost: 500,
      costMultiplier: 2.0,
      effect: 0.05,               // +5% offline progress per level
      maxLevel: 20
    },
    heroDamage: {
      name: 'Attack Enhancement',
      baseCost: 200,
      costMultiplier: 1.6,
      effect: 0.08,               // +8% damage per level
      maxLevel: 100
    },
    heroDefense: {
      name: 'Defense Protocol',
      baseCost: 200,
      costMultiplier: 1.6,
      effect: 0.08,               // +8% defense per level
      maxLevel: 100
    },
    critChance: {
      name: 'Critical Strike Module',
      baseCost: 300,
      costMultiplier: 1.7,
      effect: 0.01,               // +1% crit chance per level
      maxLevel: 30
    },
    heroSlots: {
      name: 'Party Expansion License',
      baseCost: 1000,
      costMultiplier: 3.0,
      effect: 1,                  // +1 hero slot per level
      maxLevel: 4                 // Max 8 heroes (4 base + 4 upgrades)
    },
    inventorySlots: {
      name: 'Storage Expansion',
      baseCost: 500,
      costMultiplier: 2.5,
      effect: 10,                 // +10 slots per level
      maxLevel: 10
    }
  },

  // === Prestige (System Sigils) ===
  prestigeCostFormula: (wave) => Math.floor(50 + wave * 5), // Cost increases with progress
  sigilPowerFormula: (totalGold) => Math.floor(Math.sqrt(totalGold / 1000)), // Square root scaling
  sigilBonusPerPoint: 0.02,       // +2% all stats per sigil point

  // === Quests ===
  questTemplates: [
    { id: 'clear_waves', name: 'Wave Warrior', target: 10, reward: { gold: 50, xp: 100 } },
    { id: 'earn_gold', name: 'Gold Rush', target: 500, reward: { gold: 100, xp: 200 } },
    { id: 'defeat_boss', name: 'Boss Hunter', target: 1, reward: { gold: 200, xp: 500 } },
    { id: 'equip_items', name: 'Gear Up', target: 4, reward: { gold: 150, xp: 300 } },
    { id: 'level_hero', name: 'Training Montage', target: 5, reward: { gold: 300, xp: 600 } },
  ],

  // === Offline Progress ===
  maxOfflineTimeMs: 24 * 60 * 60 * 1000, // Max 24 hours of offline progress
  offlineProgressRate: 0.5,       // Offline earns 50% of online rate

  // === UI Settings ===
  maxInventorySlots: 50,          // Base inventory size
  maxHeroSlots: 4,                // Base party size
  notificationDuration: 5000,     // Notifications shown for 5 seconds
  autoSaveInterval: 30000,        // Auto-save every 30 seconds

  // === Random Events ===
  randomEventChance: 0.05,        // 5% chance per wave
  randomEvents: [
    { id: 'treasure', name: 'Treasure Cache!', goldBonus: 50 },
    { id: 'ambush', name: 'Ambush!', enemyMultiplier: 1.5 },
    { id: 'blessing', name: 'Divine Blessing', xpBonus: 100 },
    { id: 'virus', name: 'System Virus!', isBoss: true }
  ],

  // === Skills ===
  skills: {
    shield_bash: {
      name: 'Shield Bash',
      cooldown: 5000,
      damage: 1.5,
      effect: 'stun',
      duration: 2000
    },
    taunt: {
      name: 'Taunt',
      cooldown: 8000,
      effect: 'taunt',
      duration: 3000
    },
    fireball: {
      name: 'Fireball',
      cooldown: 4000,
      damage: 2.0,
      effect: 'burn',
      duration: 3000
    },
    frost_nova: {
      name: 'Frost Nova',
      cooldown: 6000,
      damage: 1.3,
      effect: 'slow',
      duration: 4000
    },
    multi_shot: {
      name: 'Multi-Shot',
      cooldown: 5000,
      damage: 0.8,
      targets: 3
    },
    poison_arrow: {
      name: 'Poison Arrow',
      cooldown: 4000,
      damage: 1.0,
      effect: 'poison',
      duration: 5000
    },
    heal: {
      name: 'Heal',
      cooldown: 6000,
      healing: 50,
      targets: 1
    },
    divine_shield: {
      name: 'Divine Shield',
      cooldown: 10000,
      effect: 'shield',
      duration: 3000,
      absorb: 100
    }
  }
};
