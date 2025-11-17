// ===== Gacha / Summon System =====
// Banner configuration and pull logic

import { HERO_TEMPLATES, getRandomHeroByRarity } from './heroTemplates.js';

// Gacha Banner Configurations
export const GACHA_BANNERS = {
  standard_banner: {
    id: 'standard_banner',
    name: 'Standard Soul Summon',
    type: 'standard',
    singlePullCost: 10,
    tenPullCost: 100,
    rarityRates: {
      1: 0.50,  // 50%
      2: 0.30,  // 30%
      3: 0.15,  // 15%
      4: 0.045, // 4.5%
      5: 0.005  // 0.5%
    },
    pity: {
      hardPity: 90,           // Guaranteed 4★+ at pull 90
      softPityStart: 70,      // Soft pity starts at pull 71
      softPityIncrement: 0.01, // +1% per pull after 70
      legendaryPity: 180      // Guaranteed 5★ at pull 180
    },
    heroPool: {
      1: ['basic_warrior', 'basic_dps', 'basic_support'],
      2: ['firewall_recruit', 'data_slasher', 'repair_daemon'],
      3: ['firewall_knight_ignis', 'blade_daemon_kira', 'oracle_zephyr', 'phoenix_healer'],
      4: ['admin_guardian_rex', 'void_reaper_nyx', 'chrono_mage_iris'],
      5: ['eternal_sentinel', 'infinity_destroyer', 'cosmic_oracle']
    }
  },

  beginner_banner: {
    id: 'beginner_banner',
    name: 'Beginner Soul Summon',
    type: 'beginner',
    singlePullCost: 5,   // 50% discount
    tenPullCost: 50,
    maxPulls: 20,        // Limited to 20 pulls total
    guaranteedFirstTenPull: true,  // First 10-pull guarantees 4★
    rarityRates: {
      1: 0.45,
      2: 0.30,
      3: 0.18,
      4: 0.06,  // Higher 4★ rate
      5: 0.01   // Higher 5★ rate
    },
    pity: {
      hardPity: 20,  // Guaranteed 4★+ at pull 20
      softPityStart: 10,
      softPityIncrement: 0.02,
      legendaryPity: null  // No legendary pity on beginner banner
    },
    heroPool: {
      1: ['basic_warrior', 'basic_dps', 'basic_support'],
      2: ['firewall_recruit', 'data_slasher', 'repair_daemon'],
      3: ['firewall_knight_ignis', 'blade_daemon_kira', 'oracle_zephyr', 'phoenix_healer'],
      4: ['admin_guardian_rex', 'void_reaper_nyx', 'chrono_mage_iris'],
      5: []  // No 5★ in beginner banner
    }
  }

  // Rate-up and event banners can be added dynamically
};

// Gacha System State (to be stored in gameState)
export function createGachaState() {
  return {
    standardBannerPity: 0,
    standardBannerLegendaryPity: 0,
    beginnerBannerPulls: 0,
    beginnerBannerAvailable: true,
    rateUpBannerPity: 0,
    eventBannerPity: 0
  };
}

// Perform a gacha pull
export function performGachaPull(banner, pityState, isTenPull = false) {
  const pulls = isTenPull ? 10 : 1;
  const results = [];

  // Check beginner banner pull limit
  if (banner.type === 'beginner' && banner.maxPulls) {
    if (pityState.beginnerBannerPulls + pulls > banner.maxPulls) {
      return { error: 'Beginner banner pull limit reached' };
    }
  }

  // Guarantee 4★ on first ten-pull of beginner banner
  let guaranteedFourStar = false;
  if (banner.type === 'beginner' && isTenPull && pityState.beginnerBannerPulls === 0 && banner.guaranteedFirstTenPull) {
    guaranteedFourStar = true;
  }

  for (let i = 0; i < pulls; i++) {
    let rarity;

    // Guaranteed 4★ on last pull of first beginner ten-pull
    if (guaranteedFourStar && i === pulls - 1) {
      rarity = 4;
    } else {
      // Increment pity counters
      if (banner.type === 'standard') {
        pityState.standardBannerPity++;
        pityState.standardBannerLegendaryPity++;
      } else if (banner.type === 'beginner') {
        pityState.beginnerBannerPulls++;
      }

      // Calculate effective rates with pity
      let effectiveRates = { ...banner.rarityRates };

      // Soft pity logic
      const currentPity = banner.type === 'standard' ? pityState.standardBannerPity :
                          banner.type === 'beginner' ? pityState.beginnerBannerPulls : 0;

      if (banner.pity.softPityStart && currentPity > banner.pity.softPityStart) {
        const softPityIncrease = (currentPity - banner.pity.softPityStart) * banner.pity.softPityIncrement;
        effectiveRates[4] = Math.min(1.0, effectiveRates[4] + softPityIncrease);
        if (effectiveRates[5] !== undefined) {
          effectiveRates[5] = Math.min(1.0, effectiveRates[5] + softPityIncrease * 0.5);
        }
      }

      // Hard pity - guaranteed 4★+
      if (currentPity >= banner.pity.hardPity) {
        rarity = Math.random() < 0.1 ? 5 : 4;  // 10% chance for 5★, otherwise 4★
      }
      // Legendary pity - guaranteed 5★
      else if (banner.pity.legendaryPity && pityState.standardBannerLegendaryPity >= banner.pity.legendaryPity) {
        rarity = 5;
      }
      // Normal roll
      else {
        rarity = rollRarity(effectiveRates);
      }
    }

    // Select hero from pool
    const heroPool = banner.heroPool[rarity];
    if (!heroPool || heroPool.length === 0) {
      // Fallback to lower rarity if pool is empty
      rarity = Math.max(1, rarity - 1);
    }

    const heroTemplateId = heroPool[Math.floor(Math.random() * heroPool.length)];
    const heroTemplate = HERO_TEMPLATES[heroTemplateId];

    results.push({
      heroTemplateId,
      heroTemplate,
      rarity,
      isNew: true  // Will be determined by caller
    });

    // Reset pity if pulled 4★+
    if (rarity >= 4) {
      if (banner.type === 'standard') {
        pityState.standardBannerPity = 0;
      }
    }

    // Reset legendary pity if pulled 5★
    if (rarity === 5) {
      if (banner.type === 'standard') {
        pityState.standardBannerLegendaryPity = 0;
      }
    }
  }

  return {
    results,
    pityState
  };
}

// Roll a rarity based on rates
function rollRarity(rates) {
  const roll = Math.random();
  let cumulative = 0;

  for (let rarity = 5; rarity >= 1; rarity--) {
    if (rates[rarity] !== undefined) {
      cumulative += rates[rarity];
      if (roll <= cumulative) {
        return rarity;
      }
    }
  }

  return 1;  // Fallback to common
}

// Handle duplicate heroes (convert to currency)
export function handleDuplicate(heroTemplateId, rarity) {
  const rewards = {};

  if (rarity === 1) {
    // Common: 10 Memory Fragments
    rewards.memoryFragments = 10;
  } else if (rarity === 2) {
    // Uncommon: 25 Memory Fragments
    rewards.memoryFragments = 25;
  } else if (rarity === 3) {
    // Rare: 25 Awakening Shards
    rewards.awakeningShards = 25;
  } else if (rarity === 4) {
    // Epic: 50 Legendary Shards
    rewards.legendaryShards = 50;
  } else if (rarity === 5) {
    // Legendary: 100 Legendary Shards
    rewards.legendaryShards = 100;
  }

  return rewards;
}

// Calculate Soul Core income (for reference)
export const SOUL_CORE_INCOME = {
  dailyLogin: 5,
  weeklyTotal: 90,  // ~90 per week F2P
  sources: {
    dailyLogin: 5,
    dungeonMilestones: 20,
    dispatchMissions: 15,
    mailboxContracts: 10,
    events: 10,
    firstClears: 'varies'
  }
};
