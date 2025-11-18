// ===== Dungeon Templates =====
// All dungeon types with waves, enemies, rewards, and modifiers

export const DUNGEON_TEMPLATES = {
  // === STORY NODES ===

  story_node_1: {
    id: 'story_node_1',
    name: 'Startup Errors',
    type: 'story',
    tier: 1,
    waves: 10,
    baseEnemyLevel: 1,
    enemyLevelPerWave: 0.2,
    recommendedPartyPower: 50,  // ~Level 1 party
    rewards: {
      goldPerWave: 5,
      xpPerWave: 20,
      itemDropRate: 0.05,
      firstClearRewards: {
        soulCores: 50,
        guaranteedItem: 'basic_blade',
        unlocks: ['loot_downloads_app']
      }
    },
    unlockRequirements: {}
  },

  story_node_2: {
    id: 'story_node_2',
    name: 'Registry Corruption',
    type: 'story',
    tier: 1,
    waves: 10,
    baseEnemyLevel: 5,
    enemyLevelPerWave: 0.3,
    recommendedPartyPower: 80,  // ~Level 3-5 party
    rewards: {
      goldPerWave: 8,
      xpPerWave: 30,
      itemDropRate: 0.08,
      firstClearRewards: {
        soulCores: 75,
        guaranteedItem: 'flame_sword',
        unlocks: []
      }
    },
    unlockRequirements: { minStoryNodeCleared: 1 }
  },

  story_node_5: {
    id: 'story_node_5',
    name: 'Spam Filter Breakdown',
    type: 'story',
    tier: 2,
    waves: 15,
    baseEnemyLevel: 15,
    enemyLevelPerWave: 0.4,
    recommendedPartyPower: 200,  // ~Level 10-15 party
    rewards: {
      goldPerWave: 15,
      xpPerWave: 60,
      itemDropRate: 0.10,
      firstClearRewards: {
        soulCores: 150,
        guaranteedItem: 'crit_driver_v1',
        unlocks: ['mailbox_app']
      }
    },
    unlockRequirements: { minStoryNodeCleared: 4 }
  },

  story_node_10: {
    id: 'story_node_10',
    name: 'Kernel Panic Zone',
    type: 'story',
    tier: 3,
    waves: 20,
    baseEnemyLevel: 40,
    enemyLevelPerWave: 0.6,
    rewards: {
      goldPerWave: 30,
      xpPerWave: 120,
      itemDropRate: 0.15,
      firstClearRewards: {
        soulCores: 300,
        guaranteedItem: 'void_blade',
        unlocks: ['system_sigils_app']
      }
    },
    unlockRequirements: { minStoryNodeCleared: 9 }
  },

  story_node_15: {
    id: 'story_node_15',
    name: "Administrator's Tomb",
    type: 'story',
    tier: 4,
    waves: 25,
    baseEnemyLevel: 70,
    enemyLevelPerWave: 0.8,
    rewards: {
      goldPerWave: 50,
      xpPerWave: 200,
      itemDropRate: 0.20,
      firstClearRewards: {
        soulCores: 500,
        guaranteedItem: 'admin_blade',
        unlocks: ['task_scheduler_app']
      }
    },
    unlockRequirements: { minStoryNodeCleared: 14 }
  },

  story_node_20: {
    id: 'story_node_20',
    name: 'Core Corruption Source',
    type: 'story',
    tier: 5,
    waves: 30,
    baseEnemyLevel: 90,
    enemyLevelPerWave: 1.0,
    rewards: {
      goldPerWave: 80,
      xpPerWave: 350,
      itemDropRate: 0.25,
      firstClearRewards: {
        soulCores: 1000,
        guaranteedItem: 'infinity_edge',
        unlocks: ['registry_editor_app']
      }
    },
    unlockRequirements: { minStoryNodeCleared: 19, minPrestigeLevel: 1 }
  },

  // === FARMING NODES ===

  farming_node_gold: {
    id: 'farming_node_gold',
    name: 'Crypto Mining Cluster',
    type: 'farming',
    subtype: 'gold',
    tier: 2,
    waves: Infinity,
    baseEnemyLevel: 10,
    enemyLevelPerWave: 0.5,
    recommendedPartyPower: 150,  // ~Level 8-12 party
    rewards: {
      goldPerWave: 20,      // 2× normal
      xpPerWave: 10,        // 0.5× normal
      itemDropRate: 0.02,   // 0.5× normal
      firstClearRewards: null
    },
    unlockRequirements: { minStoryNodeCleared: 3 }
  },

  farming_node_xp: {
    id: 'farming_node_xp',
    name: 'Training Simulation Server',
    type: 'farming',
    subtype: 'xp',
    tier: 2,
    waves: Infinity,
    baseEnemyLevel: 10,
    enemyLevelPerWave: 0.5,
    recommendedPartyPower: 150,  // ~Level 8-12 party
    rewards: {
      goldPerWave: 5,       // 0.5× normal
      xpPerWave: 100,       // 2× normal
      itemDropRate: 0.02,   // 0.5× normal
      firstClearRewards: null
    },
    unlockRequirements: { minStoryNodeCleared: 3 }
  },

  farming_node_items: {
    id: 'farming_node_items',
    name: 'Loot Repository Network',
    type: 'farming',
    subtype: 'items',
    tier: 2,
    waves: Infinity,
    baseEnemyLevel: 10,
    enemyLevelPerWave: 0.5,
    recommendedPartyPower: 150,  // ~Level 8-12 party
    rewards: {
      goldPerWave: 5,       // 0.5× normal
      xpPerWave: 10,        // 0.5× normal
      itemDropRate: 0.40,   // 2× normal
      firstClearRewards: null
    },
    unlockRequirements: { minStoryNodeCleared: 3 }
  },

  // === CHALLENGE DUNGEONS ===

  challenge_no_healing: {
    id: 'challenge_no_healing',
    name: 'No-Heal Firewall',
    type: 'challenge',
    tier: 3,
    waves: 20,
    baseEnemyLevel: 40,
    enemyLevelPerWave: 1.0,
    attemptsPerDay: 3,
    modifiers: [
      { id: 'no_healing', name: 'No Healing Allowed', description: 'Party cannot heal HP during combat', effect: { disableHealing: true } }
    ],
    rewards: {
      goldPerWave: 30,
      xpPerWave: 100,
      itemDropRate: 0.30,
      firstClearRewards: {
        soulCores: 100,
        guaranteedItem: 'infinity_edge',
        legendaryShards: 25
      }
    },
    unlockRequirements: { minStoryNodeCleared: 10, minHeroLevel: 40 }
  },

  challenge_speed_run: {
    id: 'challenge_speed_run',
    name: 'Speed Run Protocol',
    type: 'challenge',
    tier: 3,
    waves: 20,
    baseEnemyLevel: 35,
    enemyLevelPerWave: 0.8,
    attemptsPerDay: 3,
    modifiers: [
      { id: 'time_limit', name: 'Speed Run', description: 'Must clear in under 5 minutes', effect: { timeLimit: 300 } }
    ],
    rewards: {
      goldPerWave: 25,
      xpPerWave: 90,
      itemDropRate: 0.25,
      firstClearRewards: {
        soulCores: 100,
        guaranteedItem: 'overclocking_daemon',
        legendaryShards: 25
      }
    },
    unlockRequirements: { minStoryNodeCleared: 10, minHeroLevel: 35 }
  },

  challenge_boss_rush: {
    id: 'challenge_boss_rush',
    name: 'Boss Rush Archive',
    type: 'challenge',
    tier: 4,
    waves: 20,
    baseEnemyLevel: 50,
    enemyLevelPerWave: 1.2,
    attemptsPerDay: 3,
    modifiers: [
      { id: 'all_bosses', name: 'Boss Rush', description: 'All 20 waves are boss enemies', effect: { allBosses: true } }
    ],
    rewards: {
      goldPerWave: 50,
      xpPerWave: 150,
      itemDropRate: 0.40,
      firstClearRewards: {
        soulCores: 150,
        guaranteedItem: 'admin_blade',
        legendaryShards: 50
      }
    },
    unlockRequirements: { minStoryNodeCleared: 12, minHeroLevel: 50 }
  },

  // === BOSS RAIDS ===

  boss_raid_infinite_loop: {
    id: 'boss_raid_infinite_loop',
    name: 'Infinite Loop Wyrm',
    type: 'bossRaid',
    tier: 4,
    waves: 5,  // 5 phases
    baseEnemyLevel: 60,
    enemyLevelPerWave: 5,
    phases: [
      { id: 1, name: 'Summon Phase', mechanic: 'Spawns endless adds', test: 'AoE damage' },
      { id: 2, name: 'Fortress Phase', mechanic: 'Gains +200% DEF', test: 'Sustained damage' },
      { id: 3, name: 'Single Target Phase', mechanic: 'Massive single-target damage', test: 'Tank survivability' },
      { id: 4, name: 'No Heal Phase', mechanic: 'Disables healing', test: 'Burst DPS' },
      { id: 5, name: 'Enrage Phase', mechanic: '60 second timer or wipe', test: 'DPS check' }
    ],
    rewards: {
      goldPerWave: 100,
      xpPerWave: 300,
      itemDropRate: 1.0,  // Guaranteed drop
      firstClearRewards: {
        soulCores: 500,
        guaranteedItem: 'infinity_core',
        legendaryShards: 50,
        cosmetic: 'wyrm_mount'
      },
      repeatClearRewards: {
        goldPerWave: 50,
        xpPerWave: 150,
        itemDropRate: 0.50,
        legendaryShards: 25
      }
    },
    unlockRequirements: { minStoryNodeCleared: 11 },
    refreshType: 'weekly'
  },

  boss_raid_kernel_panic: {
    id: 'boss_raid_kernel_panic',
    name: 'Kernel Panic Lord',
    type: 'bossRaid',
    tier: 4,
    waves: 5,
    baseEnemyLevel: 65,
    enemyLevelPerWave: 5,
    phases: [
      { id: 1, name: 'Crash Phase', mechanic: 'Random hero stuns', test: 'Cleanse/immunity' },
      { id: 2, name: 'Memory Leak', mechanic: 'HP drains over time', test: 'Healing throughput' },
      { id: 3, name: 'Stack Overflow', mechanic: 'Damage increases each turn', test: 'Speed kill' },
      { id: 4, name: 'Null Pointer', mechanic: 'One-shot mechanic', test: 'Dodge/block' },
      { id: 5, name: 'Blue Screen', mechanic: 'Enrage + party wipe', test: 'All-out DPS' }
    ],
    rewards: {
      goldPerWave: 120,
      xpPerWave: 350,
      itemDropRate: 1.0,
      firstClearRewards: {
        soulCores: 500,
        guaranteedItem: 'admin_legacy_kernel',
        legendaryShards: 50,
        cosmetic: 'kernel_pet'
      },
      repeatClearRewards: {
        goldPerWave: 60,
        xpPerWave: 175,
        itemDropRate: 0.50,
        legendaryShards: 25
      }
    },
    unlockRequirements: { minStoryNodeCleared: 12 },
    refreshType: 'weekly'
  }
};

// Helper functions
export function getDungeonsByType(type) {
  return Object.values(DUNGEON_TEMPLATES).filter(d => d.type === type);
}

export function getDungeonById(id) {
  return DUNGEON_TEMPLATES[id];
}

export function getAvailableDungeons(playerState) {
  return Object.values(DUNGEON_TEMPLATES).filter(dungeon => {
    const reqs = dungeon.unlockRequirements;

    if (reqs.minStoryNodeCleared && playerState.highestStoryNodeCleared < reqs.minStoryNodeCleared) {
      return false;
    }

    if (reqs.minPrestigeLevel && playerState.totalPrestiges < reqs.minPrestigeLevel) {
      return false;
    }

    if (reqs.minHeroLevel) {
      const maxHeroLevel = Math.max(...playerState.heroes.map(h => h.level));
      if (maxHeroLevel < reqs.minHeroLevel) {
        return false;
      }
    }

    return true;
  });
}
