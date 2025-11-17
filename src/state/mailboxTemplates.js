// ===== Mailbox Contract Templates =====
// Story-driven quest contracts from NPC factions

export const MAILBOX_TEMPLATES = {
  // === FIREWALL GUILD CONTRACTS ===

  spam_filter_emergency: {
    id: 'spam_filter_emergency',
    sender: 'Firewall Guild',
    subject: 'URGENT: Spam Cleanup Needed',
    flavorText: 'Our spam filters are overwhelmed. Send a cleanup crew to purge the inbox before the malware spreads.',
    requirements: {
      type: 'dispatch',
      details: { dispatchId: 'virus_scan', count: 1 }
    },
    rewards: {
      gold: 200,
      xp: 0,
      soulCores: 0,
      reputation: { faction: 'firewall_guild', amount: 50 }
    },
    refreshType: 'daily',
    unlockRequirement: { minStoryNodeCleared: 5 }
  },

  firewall_reinforcement: {
    id: 'firewall_reinforcement',
    sender: 'Firewall Guild',
    subject: 'Firewall Maintenance Request',
    flavorText: 'Monthly firewall inspection is due. We need experienced admins for this critical task.',
    requirements: {
      type: 'dispatch',
      details: { dispatchId: 'firewall_inspection', count: 1 }
    },
    rewards: {
      gold: 500,
      xp: 0,
      soulCores: 20,
      reputation: { faction: 'firewall_guild', amount: 100 },
      items: ['firewall_firmware']
    },
    refreshType: 'weekly',
    unlockRequirement: { minStoryNodeCleared: 7 }
  },

  // === DATA MERCHANT COLLECTIVE CONTRACTS ===

  courier_rush_delivery: {
    id: 'courier_rush_delivery',
    sender: 'Data Merchant Collective',
    subject: 'Courier Contract: Rush Delivery',
    flavorText: 'Time-sensitive data packet needs transport to Sector 7. High-speed courier only.',
    requirements: {
      type: 'heroRequirement',
      details: { minSpeed: 50, count: 1, duration: 14400000 }  // 4 hours with 50+ SPD hero
    },
    rewards: {
      gold: 300,
      xp: 0,
      soulCores: 30,
      reputation: { faction: 'data_merchants', amount: 100 }
    },
    refreshType: 'daily',
    unlockRequirement: { minStoryNodeCleared: 5 }
  },

  data_mining_contract: {
    id: 'data_mining_contract',
    sender: 'Data Merchant Collective',
    subject: 'Mining Contract: Rare Data Nodes',
    flavorText: 'We need skilled miners to extract valuable data from deep nodes. Generous compensation.',
    requirements: {
      type: 'dispatch',
      details: { dispatchId: 'data_mining_operation', count: 1 }
    },
    rewards: {
      gold: 800,
      xp: 0,
      soulCores: 40,
      reputation: { faction: 'data_merchants', amount: 150 },
      currencies: { memoryFragments: 100 }
    },
    refreshType: 'weekly',
    unlockRequirement: { minStoryNodeCleared: 8 }
  },

  // === ADMIN COUNCIL CONTRACTS ===

  boss_bounty_infinite_loop: {
    id: 'boss_bounty_infinite_loop',
    sender: 'Admin Council',
    subject: 'BOUNTY: Eliminate Infinite Loop Wyrm',
    flavorText: 'The Infinite Loop Wyrm threatens system stability. Authorized admins: terminate with extreme prejudice.',
    requirements: {
      type: 'dungeonClear',
      details: { dungeonId: 'boss_raid_infinite_loop', count: 1 }
    },
    rewards: {
      gold: 0,
      xp: 0,
      soulCores: 0,
      reputation: { faction: 'admin_council', amount: 200 },
      currencies: { legendaryShards: 100 },
      items: ['admin_legacy_kernel']
    },
    refreshType: 'weekly',
    unlockRequirement: { minStoryNodeCleared: 11 }
  },

  boss_bounty_kernel_panic: {
    id: 'boss_bounty_kernel_panic',
    sender: 'Admin Council',
    subject: 'BOUNTY: Eliminate Kernel Panic Entity',
    flavorText: 'The Kernel Panic Lord corrupts critical system processes. Immediate termination required.',
    requirements: {
      type: 'dungeonClear',
      details: { dungeonId: 'boss_raid_kernel_panic', count: 1 }
    },
    rewards: {
      gold: 0,
      xp: 0,
      soulCores: 0,
      reputation: { faction: 'admin_council', amount: 200 },
      currencies: { legendaryShards: 100 },
      items: ['infinity_core']
    },
    refreshType: 'weekly',
    unlockRequirement: { minStoryNodeCleared: 12 }
  },

  emergency_kernel_stabilization: {
    id: 'emergency_kernel_stabilization',
    sender: 'Admin Council',
    subject: 'EMERGENCY: Kernel Stabilization',
    flavorText: 'Critical kernel instability detected. Send your best team immediately.',
    requirements: {
      type: 'dispatch',
      details: { dispatchId: 'kernel_stabilization', count: 1 }
    },
    rewards: {
      gold: 1500,
      xp: 0,
      soulCores: 75,
      reputation: { faction: 'admin_council', amount: 250 },
      currencies: { legendaryShards: 50 }
    },
    refreshType: 'weekly',
    unlockRequirement: { minStoryNodeCleared: 10 }
  },

  // === RECYCLE SHRINE MONKS CONTRACTS ===

  recycle_donation_drive: {
    id: 'recycle_donation_drive',
    sender: 'Recycle Shrine Monks',
    subject: 'Donation Drive: Recycle 10 Items',
    flavorText: 'The Shrine seeks offerings. Recycle unwanted Soulware to fuel the next cycle.',
    requirements: {
      type: 'recycle',
      details: { itemCount: 10 }
    },
    rewards: {
      gold: 0,
      xp: 0,
      soulCores: 0,
      reputation: { faction: 'recycle_monks', amount: 150 },
      currencies: { awakeningShards: 50, codeFragments: 100 }
    },
    refreshType: 'weekly',
    unlockRequirement: { minStoryNodeCleared: 7 }
  },

  mass_disassembly_request: {
    id: 'mass_disassembly_request',
    sender: 'Recycle Shrine Monks',
    subject: 'Mass Disassembly Request',
    flavorText: 'We require large quantities of Code Fragments for a ritual. Recycle rare items for bonus rewards.',
    requirements: {
      type: 'recycle',
      details: { itemCount: 5, minRarity: 3 }  // 5 Rare+ items
    },
    rewards: {
      gold: 0,
      xp: 0,
      soulCores: 50,
      reputation: { faction: 'recycle_monks', amount: 200 },
      currencies: { legendaryShards: 25, codeFragments: 200 }
    },
    refreshType: 'weekly',
    unlockRequirement: { minStoryNodeCleared: 10 }
  },

  // === MYSTERY CONTRACTS ===

  mystery_spam_email: {
    id: 'mystery_spam_email',
    sender: '[REDACTED]',
    subject: 'Re: Re: Fwd: CHECK THIS OUT',
    flavorText: 'Curious? Don\'t ask questions. Just pull.',
    requirements: {
      type: 'gacha',
      details: { pullCount: 5 }
    },
    rewards: {
      gold: 500,
      xp: 0,
      soulCores: 0,
      reputation: null,
      items: ['lucky_charm']
    },
    refreshType: 'weekly',
    unlockRequirement: { minStoryNodeCleared: 5 }
  },

  mysterious_offer: {
    id: 'mysterious_offer',
    sender: '???',
    subject: 'An Offer You Can\'t Refuse',
    flavorText: 'Gamble at the Speculation Station 10 times. Rewards await the bold.',
    requirements: {
      type: 'gambling',
      details: { gameId: 'soul_slots', playCount: 10 }
    },
    rewards: {
      gold: 0,
      xp: 0,
      soulCores: 100,
      reputation: null,
      currencies: { memoryFragments: 200 }
    },
    refreshType: 'weekly',
    unlockRequirement: { minStoryNodeCleared: 8 }
  }
};

// Reputation System Configuration
export const REPUTATION_FACTIONS = {
  firewall_guild: {
    id: 'firewall_guild',
    name: 'Firewall Guild',
    description: 'Defensive specialists and system protectors',
    rewards: {
      500: { type: 'discount', value: 0.05, description: '5% discount at Firewall Guild vendors' },
      1000: { type: 'item_unlock', value: 'firewall_firmware', description: 'Unlock Firewall Firmware for purchase' },
      2500: { type: 'hero_unlock', value: 'admin_guardian_rex', description: 'Recruit Admin Guardian Rex' },
      5000: { type: 'item_unlock', value: 'admin_legacy_kernel', description: 'Unlock Admin\'s Legacy Kernel' },
      10000: { type: 'cosmetic', value: 'firewall_title', description: 'Title: Guardian of the Firewall' }
    }
  },

  data_merchants: {
    id: 'data_merchants',
    name: 'Data Merchant Collective',
    description: 'Traders of information and rare resources',
    rewards: {
      500: { type: 'currency_bonus', value: 0.10, description: '+10% Soul Cores from contracts' },
      1000: { type: 'item_unlock', value: 'overclocking_daemon', description: 'Unlock Overclocking Daemon' },
      2500: { type: 'hero_unlock', value: 'chrono_mage_iris', description: 'Recruit Chrono Mage Iris' },
      5000: { type: 'item_unlock', value: 'infinity_edge', description: 'Unlock Infinity Edge' },
      10000: { type: 'cosmetic', value: 'merchant_title', description: 'Title: Data Tycoon' }
    }
  },

  admin_council: {
    id: 'admin_council',
    name: 'Admin Council',
    description: 'The highest authority in ReincarnOS',
    rewards: {
      500: { type: 'prestige_bonus', value: 0.05, description: '+5% prestige point gain' },
      1000: { type: 'item_unlock', value: 'admin_blade', description: 'Unlock Admin Blade v3.0' },
      2500: { type: 'hero_unlock', value: 'eternal_sentinel', description: 'Recruit Eternal Sentinel' },
      5000: { type: 'sigil_unlock', value: 'admin_sigil', description: 'Unlock Admin Sigil (prestige bonus)' },
      10000: { type: 'cosmetic', value: 'admin_title', description: 'Title: System Administrator' }
    }
  },

  recycle_monks: {
    id: 'recycle_monks',
    name: 'Recycle Shrine Monks',
    description: 'Masters of transmutation and rebirth',
    rewards: {
      500: { type: 'recycle_bonus', value: 0.10, description: '+10% Code Fragments from recycling' },
      1000: { type: 'currency_unlock', value: 'awakening_shards', description: 'Unlock Awakening Shard bonuses' },
      2500: { type: 'hero_unlock', value: 'phoenix_healer', description: 'Recruit Phoenix.sys' },
      5000: { type: 'item_unlock', value: 'infinity_core', description: 'Unlock Infinity Core.sys' },
      10000: { type: 'cosmetic', value: 'monk_title', description: 'Title: Eternal Recycler' }
    }
  }
};

// Helper functions
export function getContractsByFaction(faction) {
  return Object.values(MAILBOX_TEMPLATES).filter(c => c.sender === faction);
}

export function getAvailableContracts(playerState) {
  return Object.values(MAILBOX_TEMPLATES).filter(contract => {
    const req = contract.unlockRequirement;
    if (req.minStoryNodeCleared && playerState.highestStoryNodeCleared < req.minStoryNodeCleared) {
      return false;
    }
    return true;
  });
}

export function getDailyContracts(playerState) {
  const available = getAvailableContracts(playerState);
  return available.filter(c => c.refreshType === 'daily').slice(0, 3);  // Return 3 random daily
}

export function getWeeklyContracts(playerState) {
  const available = getAvailableContracts(playerState);
  return available.filter(c => c.refreshType === 'weekly');
}
