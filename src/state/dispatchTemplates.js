// ===== Dispatch Mission Templates =====
// AFK missions for heroes

export const DISPATCH_TEMPLATES = {
  // === TIER 1 DISPATCHES ===

  memory_leak_patrol: {
    id: 'memory_leak_patrol',
    name: 'Memory Leak Patrol',
    tier: 1,
    duration: 3600000,  // 1 hour
    requiredHeroes: 1,
    requiredLevel: 5,
    roleRequirements: [],
    description: 'Patrol system memory and patch minor leaks.',
    rewards: {
      onSuccess: {
        gold: 100,
        xp: 200,
        items: [{ itemId: 'basic_blade', dropRate: 0.10 }],
        currencies: {}
      },
      onPartialSuccess: {
        gold: 50,
        xp: 100,
        items: [],
        currencies: {}
      },
      onFailure: {
        gold: 10,
        xp: 20,
        items: [],
        currencies: {}
      }
    },
    failurePenalty: {
      fatigue: true,
      debuff: { statsMultiplier: 0.8, duration: 3600000 }
    }
  },

  virus_scan: {
    id: 'virus_scan',
    name: 'Routine Virus Scan',
    tier: 1,
    duration: 7200000,  // 2 hours
    requiredHeroes: 1,
    requiredLevel: 8,
    roleRequirements: [],
    description: 'Scan system directories for malicious code.',
    rewards: {
      onSuccess: {
        gold: 200,
        xp: 400,
        items: [{ itemId: 'basic_shield', dropRate: 0.15 }],
        currencies: { memoryFragments: 10 }
      },
      onPartialSuccess: {
        gold: 100,
        xp: 200,
        items: [],
        currencies: { memoryFragments: 5 }
      },
      onFailure: {
        gold: 20,
        xp: 40,
        items: [],
        currencies: {}
      }
    },
    failurePenalty: {
      fatigue: true,
      debuff: { statsMultiplier: 0.8, duration: 3600000 }
    }
  },

  // === TIER 2 DISPATCHES ===

  firewall_inspection: {
    id: 'firewall_inspection',
    name: 'Firewall Inspection',
    tier: 2,
    duration: 14400000,  // 4 hours
    requiredHeroes: 2,
    requiredLevel: 30,
    roleRequirements: [],
    description: 'Inspect and reinforce system firewalls.',
    rewards: {
      onSuccess: {
        gold: 500,
        xp: 1000,
        items: [{ itemId: 'flame_sword', dropRate: 1.0 }],
        currencies: { memoryFragments: 30 }
      },
      onPartialSuccess: {
        gold: 250,
        xp: 500,
        items: [],
        currencies: { memoryFragments: 15 }
      },
      onFailure: {
        gold: 50,
        xp: 100,
        items: [],
        currencies: {}
      }
    },
    failurePenalty: {
      fatigue: true,
      debuff: { statsMultiplier: 0.75, duration: 7200000 }
    }
  },

  data_mining_operation: {
    id: 'data_mining_operation',
    name: 'Data Mining Operation',
    tier: 2,
    duration: 21600000,  // 6 hours
    requiredHeroes: 2,
    requiredLevel: 35,
    roleRequirements: [],
    description: 'Mine encrypted data nodes for valuable resources.',
    rewards: {
      onSuccess: {
        gold: 800,
        xp: 1500,
        items: [{ itemId: 'crit_driver_v1', dropRate: 1.0 }],
        currencies: { memoryFragments: 50, awakeningShards: 10 }
      },
      onPartialSuccess: {
        gold: 400,
        xp: 750,
        items: [],
        currencies: { memoryFragments: 25, awakeningShards: 5 }
      },
      onFailure: {
        gold: 80,
        xp: 150,
        items: [],
        currencies: {}
      }
    },
    failurePenalty: {
      fatigue: true,
      debuff: { statsMultiplier: 0.75, duration: 7200000 }
    }
  },

  // === TIER 3 DISPATCHES ===

  deep_registry_dive: {
    id: 'deep_registry_dive',
    name: 'Deep Registry Dive',
    tier: 3,
    duration: 28800000,  // 8 hours
    requiredHeroes: 3,
    requiredLevel: 60,
    roleRequirements: [{ role: 'Tank', count: 1 }],
    description: 'Explore corrupted registry sectors. Dangerous.',
    rewards: {
      onSuccess: {
        gold: 1500,
        xp: 3000,
        items: [{ itemId: 'void_blade', dropRate: 1.0 }],
        currencies: { awakeningShards: 25, legendaryShards: 5 }
      },
      onPartialSuccess: {
        gold: 750,
        xp: 1500,
        items: [],
        currencies: { awakeningShards: 12 }
      },
      onFailure: {
        gold: 150,
        xp: 300,
        items: [],
        currencies: {}
      }
    },
    failurePenalty: {
      fatigue: true,
      debuff: { statsMultiplier: 0.70, duration: 10800000 }
    }
  },

  kernel_stabilization: {
    id: 'kernel_stabilization',
    name: 'Kernel Stabilization',
    tier: 3,
    duration: 28800000,  // 8 hours
    requiredHeroes: 3,
    requiredLevel: 65,
    roleRequirements: [{ role: 'Healer', count: 1 }],
    description: 'Stabilize unstable kernel processes. Requires healer.',
    rewards: {
      onSuccess: {
        gold: 1800,
        xp: 3500,
        items: [{ itemId: 'firewall_firmware', dropRate: 1.0 }],
        currencies: { awakeningShards: 30, legendaryShards: 8 }
      },
      onPartialSuccess: {
        gold: 900,
        xp: 1750,
        items: [],
        currencies: { awakeningShards: 15, legendaryShards: 4 }
      },
      onFailure: {
        gold: 180,
        xp: 350,
        items: [],
        currencies: {}
      }
    },
    failurePenalty: {
      fatigue: true,
      debuff: { statsMultiplier: 0.70, duration: 10800000 }
    }
  },

  // === TIER 4 DISPATCHES ===

  admin_vault_retrieval: {
    id: 'admin_vault_retrieval',
    name: 'Admin Vault Retrieval',
    tier: 4,
    duration: 43200000,  // 12 hours
    requiredHeroes: 4,
    requiredLevel: 80,
    roleRequirements: [{ role: 'Tank', count: 1 }, { role: 'Healer', count: 1 }],
    description: 'Retrieve artifacts from the Admin Vault. Extremely dangerous.',
    rewards: {
      onSuccess: {
        gold: 0,
        xp: 5000,
        items: [{ itemId: 'admin_blade', dropRate: 1.0 }],
        currencies: { soulCores: 50, legendaryShards: 100 }
      },
      onPartialSuccess: {
        gold: 0,
        xp: 2500,
        items: [],
        currencies: { soulCores: 25, legendaryShards: 50 }
      },
      onFailure: {
        gold: 0,
        xp: 500,
        items: [],
        currencies: {}
      }
    },
    failurePenalty: {
      fatigue: true,
      debuff: { statsMultiplier: 0.60, duration: 14400000 }
    }
  },

  core_corruption_raid: {
    id: 'core_corruption_raid',
    name: 'Core Corruption Raid',
    tier: 4,
    duration: 43200000,  // 12 hours
    requiredHeroes: 4,
    requiredLevel: 85,
    roleRequirements: [{ role: 'Tank', count: 1 }, { role: 'DPS', count: 2 }],
    description: 'Raid the core corruption source. Epic rewards.',
    rewards: {
      onSuccess: {
        gold: 3000,
        xp: 6000,
        items: [{ itemId: 'infinity_edge', dropRate: 0.5 }, { itemId: 'admin_blade', dropRate: 1.0 }],
        currencies: { soulCores: 100, legendaryShards: 150, awakeningShards: 50 }
      },
      onPartialSuccess: {
        gold: 1500,
        xp: 3000,
        items: [{ itemId: 'void_blade', dropRate: 1.0 }],
        currencies: { soulCores: 50, legendaryShards: 75, awakeningShards: 25 }
      },
      onFailure: {
        gold: 300,
        xp: 600,
        items: [],
        currencies: { awakeningShards: 10 }
      }
    },
    failurePenalty: {
      fatigue: true,
      debuff: { statsMultiplier: 0.60, duration: 14400000 }
    }
  }
};

// Success rate formula
export function calculateDispatchSuccessRate(heroes, dispatch) {
  if (heroes.length < dispatch.requiredHeroes) {
    return 0;
  }

  // Check role requirements
  if (dispatch.roleRequirements.length > 0) {
    for (const roleReq of dispatch.roleRequirements) {
      const roleCount = heroes.filter(h => h.role === roleReq.role).length;
      if (roleCount < roleReq.count) {
        return 0.10;  // Min 10% if role requirements not met
      }
    }
  }

  // Calculate success based on average hero level
  const avgLevel = heroes.reduce((sum, h) => sum + h.level, 0) / heroes.length;
  const levelRatio = avgLevel / dispatch.requiredLevel;

  // Base success rate
  let successRate = Math.min(0.95, Math.max(0.10, levelRatio * 0.90));

  // Luck bonus
  const avgLuck = heroes.reduce((sum, h) => sum + (h.stats?.lck || 0), 0) / heroes.length;
  const luckBonus = (avgLuck / 10) * 0.005;  // +0.5% per 10 LCK
  successRate = Math.min(0.95, successRate + luckBonus);

  return successRate;
}

// Helper functions
export function getDispatchesByTier(tier) {
  return Object.values(DISPATCH_TEMPLATES).filter(d => d.tier === tier);
}

export function getAvailableDispatches(playerState) {
  return Object.values(DISPATCH_TEMPLATES).filter(dispatch => {
    // Check if player has any hero at required level
    const maxHeroLevel = Math.max(...playerState.heroes.map(h => h.level));
    return maxHeroLevel >= dispatch.requiredLevel;
  });
}
