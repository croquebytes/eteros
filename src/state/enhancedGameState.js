// ===== Enhanced ReincarnOS Game State =====
// Comprehensive game state with all new systems

import { createHero, addXpToHero, updateHeroStats } from './heroSystem.js';
import { createGachaState } from './gachaSystem.js';
import { createDispatchState, updateDispatches } from './dispatchSystem.js';

// ===== Main Game State =====
export const gameState = {
  // Meta
  version: '2.0.0',
  lastSaveTime: Date.now(),
  totalPlayTime: 0,
  lastUpdateTime: Date.now(),

  // Core Progress
  wave: 1,
  currentDungeon: 'story_node_1',
  highestStoryNodeCleared: 0,

  // Currencies
  gold: 0,
  soulCores: 50,  // Start with some for beginner banner
  lifetimeGold: 0,

  currencies: {
    memoryFragments: 0,
    awakeningShards: 0,
    legendaryShards: 0,
    codeFragments: 0,
    eventTokens: 0
  },

  // Heroes
  heroes: [
    // Start with 3 basic heroes
    createHero('basic_warrior', 1),
    createHero('basic_dps', 1),
    createHero('basic_support', 1)
  ],
  activeParty: [],  // IDs of heroes in active party (max 4)

  // Inventory
  inventory: [],
  systemWideSoulware: [],  // System-wide Soulware items (max 3 equipped)
  maxInventorySlots: 50,
  maxSystemWideSoulware: 3,

  // Gacha System
  gachaState: createGachaState(),

  // Dispatch System
  dispatchState: createDispatchState(),

  // Mailbox / Contracts
  mailboxState: {
    availableContracts: [],
    activeContracts: [],
    completedContracts: [],
    dailyRefreshTime: Date.now() + 86400000,  // 24 hours
    weeklyRefreshTime: Date.now() + 604800000  // 7 days
  },

  // Reputation
  reputation: {
    firewall_guild: 0,
    data_merchants: 0,
    admin_council: 0,
    recycle_monks: 0
  },

  // Dungeon Progress
  dungeonProgress: {
    completedStoryNodes: [],
    clearedDungeons: {},
    currentRun: null,
    challengeAttemptsToday: {}
  },

  // Gambling / Speculation Station
  gamblingState: {
    slotsPlaysToday: 0,
    highLowPlaysToday: 0,
    lotteryTicketsToday: 0,
    jackpotPool: 100000,
    lastDailyReset: Date.now()
  },

  // Task Scheduler (Automation)
  automationState: {
    rules: [],
    maxRules: 3,  // Increases with prestige
    autoRecycleEnabled: false,
    autoRetryDungeonsEnabled: false,
    autoDispatchEnabled: false
  },

  // Prestige (System Sigils)
  prestigeState: {
    sigilPoints: 0,
    totalPrestiges: 0,
    unlockedBonuses: [],
    prestigeReady: false
  },

  // Statistics
  stats: {
    totalEnemiesKilled: 0,
    totalBossesKilled: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    totalItemsFound: 0,
    totalGoldEarned: 0,
    totalGachaPulls: 0,
    totalDispatchesCompleted: 0,
    totalContractsCompleted: 0,
    highestWave: 1,
    highestHeroLevel: 1
  },

  // Unlocks
  unlockedApps: ['quest_explorer', 'loot_downloads'],
  unlockedFeatures: [],

  // Settings
  settings: {
    autoSave: true,
    autoSaveInterval: 60000,  // 1 minute
    notifications: true,
    soundEffects: false,
    music: false,
    combatSpeed: 1.0
  }
};

// ===== Game Loop Update =====
export function updateGameState() {
  const now = Date.now();
  const deltaTime = now - gameState.lastUpdateTime;
  gameState.lastUpdateTime = now;
  gameState.totalPlayTime += deltaTime;

  // Update dispatches
  const completedDispatches = updateDispatches(gameState);
  if (completedDispatches.length > 0) {
    console.log(`Completed ${completedDispatches.length} dispatches`);
  }

  // Update fatigue timers
  for (const hero of gameState.heroes) {
    if (hero.fatigued && hero.fatigueEndTime <= now) {
      hero.fatigued = false;
      hero.fatigueEndTime = null;
      console.log(`${hero.name} is no longer fatigued`);
    }
  }

  // Update daily resets
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  if (now >= gameState.gamblingState.lastDailyReset + 86400000) {
    resetDailyLimits();
  }

  // Update mailbox contracts refresh
  if (now >= gameState.mailboxState.dailyRefreshTime) {
    refreshDailyContracts();
  }
  if (now >= gameState.mailboxState.weeklyRefreshTime) {
    refreshWeeklyContracts();
  }
}

// Reset daily limits (gambling, challenge dungeons, etc.)
function resetDailyLimits() {
  gameState.gamblingState.slotsPlaysToday = 0;
  gameState.gamblingState.highLowPlaysToday = 0;
  gameState.gamblingState.lotteryTicketsToday = 0;
  gameState.gamblingState.lastDailyReset = Date.now();
  gameState.dungeonProgress.challengeAttemptsToday = {};
  console.log('Daily limits reset');
}

// Refresh daily mailbox contracts
function refreshDailyContracts() {
  // TODO: Generate new daily contracts based on player progress
  gameState.mailboxState.dailyRefreshTime = Date.now() + 86400000;
  console.log('Daily contracts refreshed');
}

// Refresh weekly mailbox contracts
function refreshWeeklyContracts() {
  // TODO: Generate new weekly contracts
  gameState.mailboxState.weeklyRefreshTime = Date.now() + 604800000;
  console.log('Weekly contracts refreshed');
}

// ===== Currency Management =====
export function addGold(amount) {
  gameState.gold += amount;
  gameState.lifetimeGold += amount;
  gameState.stats.totalGoldEarned += amount;
}

export function spendGold(amount) {
  if (gameState.gold < amount) {
    return { success: false, error: 'Not enough gold' };
  }
  gameState.gold -= amount;
  return { success: true };
}

export function addSoulCores(amount) {
  gameState.soulCores += amount;
}

export function spendSoulCores(amount) {
  if (gameState.soulCores < amount) {
    return { success: false, error: 'Not enough Soul Cores' };
  }
  gameState.soulCores -= amount;
  return { success: true };
}

export function addCurrency(currencyType, amount) {
  if (gameState.currencies[currencyType] !== undefined) {
    gameState.currencies[currencyType] += amount;
  } else {
    console.warn(`Unknown currency type: ${currencyType}`);
  }
}

export function spendCurrency(currencyType, amount) {
  if (gameState.currencies[currencyType] === undefined) {
    return { success: false, error: `Unknown currency: ${currencyType}` };
  }
  if (gameState.currencies[currencyType] < amount) {
    return { success: false, error: `Not enough ${currencyType}` };
  }
  gameState.currencies[currencyType] -= amount;
  return { success: true };
}

// ===== Hero Management =====
export function addHeroToRoster(templateId) {
  const hero = createHero(templateId, 1);
  if (hero) {
    gameState.heroes.push(hero);
    console.log(`Added hero: ${hero.name}`);
    return hero;
  }
  return null;
}

export function setActiveParty(heroIds) {
  if (heroIds.length > 4) {
    return { success: false, error: 'Party size cannot exceed 4' };
  }

  // Verify all heroes exist and are not on dispatch
  for (const heroId of heroIds) {
    const hero = gameState.heroes.find(h => h.id === heroId);
    if (!hero) {
      return { success: false, error: 'Hero not found' };
    }
    if (hero.onDispatch) {
      return { success: false, error: `${hero.name} is on a dispatch` };
    }
  }

  gameState.activeParty = heroIds;
  return { success: true };
}

export function getActivePartyHeroes() {
  return gameState.activeParty.map(id => gameState.heroes.find(h => h.id === id)).filter(h => h);
}

// ===== Inventory Management =====
export function addItemToInventory(item) {
  if (gameState.inventory.length >= gameState.maxInventorySlots) {
    return { success: false, error: 'Inventory full' };
  }

  gameState.inventory.push(item);
  gameState.stats.totalItemsFound++;
  return { success: true };
}

export function removeItemFromInventory(itemId) {
  const index = gameState.inventory.findIndex(i => i.id === itemId);
  if (index === -1) {
    return { success: false, error: 'Item not found' };
  }

  const item = gameState.inventory.splice(index, 1)[0];
  return { success: true, item };
}

export function equipSystemWideSoulware(item) {
  if (item.type !== 'systemWide') {
    return { success: false, error: 'Only system-wide Soulware can be equipped here' };
  }

  if (gameState.systemWideSoulware.length >= gameState.maxSystemWideSoulware) {
    return { success: false, error: 'All system-wide slots are full' };
  }

  // Remove from inventory
  const result = removeItemFromInventory(item.id);
  if (!result.success) {
    return result;
  }

  // Add to system-wide Soulware
  gameState.systemWideSoulware.push(item);

  // Update all hero stats
  for (const hero of gameState.heroes) {
    updateHeroStats(hero, gameState.systemWideSoulware);
  }

  return { success: true };
}

export function unequipSystemWideSoulware(itemId) {
  const index = gameState.systemWideSoulware.findIndex(i => i.id === itemId);
  if (index === -1) {
    return { success: false, error: 'Item not found in system-wide slots' };
  }

  const item = gameState.systemWideSoulware.splice(index, 1)[0];

  // Add back to inventory
  const result = addItemToInventory(item);
  if (!result.success) {
    // If inventory is full, put it back
    gameState.systemWideSoulware.push(item);
    return result;
  }

  // Update all hero stats
  for (const hero of gameState.heroes) {
    updateHeroStats(hero, gameState.systemWideSoulware);
  }

  return { success: true, item };
}

// ===== Dungeon Management =====
export function setCurrentDungeon(dungeonId) {
  gameState.currentDungeon = dungeonId;
  console.log(`Now running dungeon: ${dungeonId}`);
}

export function completeStoryNode(nodeId) {
  const nodeNumber = parseInt(nodeId.replace('story_node_', ''));
  if (nodeNumber > gameState.highestStoryNodeCleared) {
    gameState.highestStoryNodeCleared = nodeNumber;
    console.log(`Story node ${nodeNumber} completed!`);
  }

  if (!gameState.dungeonProgress.completedStoryNodes.includes(nodeId)) {
    gameState.dungeonProgress.completedStoryNodes.push(nodeId);
  }
}

// ===== Save/Load System =====
const SAVE_KEY = 'reincarnos_enhanced_save';

export function saveGame() {
  try {
    gameState.lastSaveTime = Date.now();
    const saveData = JSON.stringify(gameState);
    localStorage.setItem(SAVE_KEY, saveData);
    console.log('Game saved successfully');
    return { success: true };
  } catch (error) {
    console.error('Failed to save game:', error);
    return { success: false, error: error.message };
  }
}

export function loadGame() {
  try {
    const saveData = localStorage.getItem(SAVE_KEY);
    if (!saveData) {
      console.log('No save data found');
      return { success: false, error: 'No save found' };
    }

    const loadedState = JSON.parse(saveData);

    // Calculate offline progress
    const offlineTime = Date.now() - loadedState.lastSaveTime;
    if (offlineTime > 0) {
      calculateOfflineProgress(loadedState, offlineTime);
    }

    // Merge loaded state
    Object.assign(gameState, loadedState);

    // Update hero stats (in case formulas changed)
    for (const hero of gameState.heroes) {
      updateHeroStats(hero, gameState.systemWideSoulware);
    }

    console.log(`Game loaded. Offline for ${Math.floor(offlineTime / 60000)} minutes`);
    return { success: true, offlineTime };
  } catch (error) {
    console.error('Failed to load game:', error);
    return { success: false, error: error.message };
  }
}

function calculateOfflineProgress(state, offlineTimeMs) {
  // TODO: Calculate offline dungeon progress, dispatch completions, etc.
  const offlineHours = offlineTimeMs / 3600000;
  const maxOfflineHours = 24;  // Cap at 24 hours

  const effectiveHours = Math.min(offlineHours, maxOfflineHours);

  // Simplified offline gold gain
  const offlineGold = Math.floor(effectiveHours * 100);  // 100 gold per hour
  state.gold += offlineGold;
  state.lifetimeGold += offlineGold;

  console.log(`Offline progress: +${offlineGold} gold`);
}

// ===== Auto-save System =====
let autoSaveInterval = null;

export function startAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }

  autoSaveInterval = setInterval(() => {
    if (gameState.settings.autoSave) {
      saveGame();
    }
  }, gameState.settings.autoSaveInterval);

  console.log('Auto-save enabled');
}

export function stopAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
  console.log('Auto-save disabled');
}

// ===== Prestige System =====
export function canPrestige() {
  return gameState.highestStoryNodeCleared >= 10;  // Unlock at Story Node 10
}

export function calculatePrestigeRewards() {
  const sigilsToGain = Math.floor(Math.sqrt(gameState.lifetimeGold / 1000));
  return { sigilPoints: sigilsToGain };
}

export function performPrestige() {
  if (!canPrestige()) {
    return { success: false, error: 'Prestige not unlocked yet' };
  }

  const rewards = calculatePrestigeRewards();

  // Store prestige data
  const keepData = {
    sigilPoints: gameState.prestigeState.sigilPoints + rewards.sigilPoints,
    totalPrestiges: gameState.prestigeState.totalPrestiges + 1,
    unlockedBonuses: [...gameState.prestigeState.unlockedBonuses],
    lifetimeGold: gameState.lifetimeGold,
    stats: { ...gameState.stats },
    settings: { ...gameState.settings },
    reputation: { ...gameState.reputation },
    unlockedApps: [...gameState.unlockedApps]
  };

  // Reset most of the game state
  Object.assign(gameState, {
    wave: 1,
    currentDungeon: 'story_node_1',
    highestStoryNodeCleared: 0,
    gold: 0,
    soulCores: 50,
    currencies: {
      memoryFragments: 0,
      awakeningShards: 0,
      legendaryShards: 0,
      codeFragments: 0,
      eventTokens: 0
    },
    heroes: [
      createHero('basic_warrior', 1),
      createHero('basic_dps', 1),
      createHero('basic_support', 1)
    ],
    activeParty: [],
    inventory: [],
    systemWideSoulware: [],
    gachaState: createGachaState(),
    dispatchState: createDispatchState(),
    dungeonProgress: {
      completedStoryNodes: [],
      clearedDungeons: {},
      currentRun: null,
      challengeAttemptsToday: {}
    }
  });

  // Restore kept data
  gameState.prestigeState = {
    ...keepData,
    prestigeReady: false
  };

  console.log(`Prestige complete! Gained ${rewards.sigilPoints} Sigil Points`);
  saveGame();

  return { success: true, rewards };
}

// ===== Initialization =====
// Try to load save on import
loadGame();

// Start game loop
setInterval(updateGameState, 1000);  // Update every second
