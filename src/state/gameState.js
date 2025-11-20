// ===== ReincarnOS Game State Management =====
// Central state object with save/load capabilities

import { CONFIG } from './config.js';
import { showOfflineProgressModal } from '../os/modalManager.js';

// ===== Main Game State =====
export const gameState = {
  // Meta
  version: '1.0.0',
  lastSaveTime: Date.now(),
  totalPlayTime: 0,

  // Progress
  wave: 1,
  gold: 0,
  xp: 0,
  fragments: 0,                   // Secondary currency for prestige
  lifetimeGold: 0,                // Total gold earned (for prestige calculation)

  // Resources (Expansion 1.1)
  resources: {
    gold: 0,
    codeFragments: 0,
    memoryBlocks: 0,
    cpuCycles: 100,                // Start with some CPU
    entropyDust: 0
  },

  // Heroes
  heroes: [
    createHero('warrior', 'Sword Saint', 1),
    createHero('mage', 'Archmage', 1),
    createHero('ranger', 'Hunter', 1),
    createHero('cleric', 'Healer', 1)
  ],

  // Combat
  currentEnemies: [],
  combatActive: false,
  currentEvent: null,

  // Inventory
  inventory: [],
  maxInventorySlots: CONFIG.maxInventorySlots,

  // Upgrades (Soulware Store)
  upgrades: {
    goldMultiplier: 0,
    xpMultiplier: 0,
    autoProgress: 0,
    heroDamage: 0,
    heroDefense: 0,
    critChance: 0,
    heroSlots: 0,
    inventorySlots: 0
  },

  // Quests
  quests: [],
  completedQuests: [],
  mailbox: [],                     // Mail/quest messages

  // Tasks (Expansion 1.1)
  activeTasks: [],
  completedTasks: [],

  // Research (Expansion 1.1)
  research: {
    completed: [],
    active: null,
    cpuBoost: 0,
    unlocked: []
  },

  // Prestige (System Sigils)
  sigilPoints: 0,
  totalPrestiges: 0,

  // Statistics
  stats: {
    totalEnemiesKilled: 0,
    totalBossesKilled: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    totalItemsFound: 0,
    totalGoldEarned: 0,
    highestWave: 1
  },

  // Settings
  settings: {
    autoSave: true,
    notifications: true,
    soundEffects: false,
    music: false,
    combatSpeed: 1.0
  }
};

// ===== Helper Functions =====

/**
 * Create a new hero with calculated stats
 */
function createHero(classType, name, level) {
  const classConfig = CONFIG.heroClasses[classType];
  const baseStats = CONFIG.heroBaseStats;

  const hero = {
    id: `hero_${Date.now()}_${Math.random()}`,
    name: name,
    class: classType,
    level: level,
    xp: 0,
    xpToNextLevel: calculateXpForLevel(level + 1),

    // Base stats
    maxHp: Math.floor(baseStats.maxHp * classConfig.statMultipliers.maxHp),
    currentHp: 0, // Will be set to maxHp after calculation
    attack: Math.floor(baseStats.attack * classConfig.statMultipliers.attack),
    defense: Math.floor(baseStats.defense * classConfig.statMultipliers.defense),
    speed: Math.floor(baseStats.speed * classConfig.statMultipliers.speed),
    critChance: baseStats.critChance,
    critMultiplier: baseStats.critMultiplier,

    // Equipment
    equipment: {
      weapon: null,
      armor: null,
      accessory: null
    },

    // Skills
    skills: classConfig.skills.map(skillId => ({
      id: skillId,
      cooldownRemaining: 0
    })),

    // Combat state
    lastAttackTime: 0,
    statusEffects: []
  };

  // Set current HP to max
  hero.currentHp = hero.maxHp;

  return hero;
}

/**
 * Calculate XP required for a given level
 */
function calculateXpForLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

/**
 * Create an enemy for the current wave
 */
export function createEnemy(wave, isBoss = false) {
  const scaleFactor = Math.pow(CONFIG.enemyScalingPerWave, wave - 1);
  const bossMultiplier = isBoss ? CONFIG.bossStatMultiplier : 1;

  const enemy = {
    id: `enemy_${Date.now()}_${Math.random()}`,
    name: isBoss ? `Boss of Wave ${wave}` : `Enemy ${wave}`,
    wave: wave,
    isBoss: isBoss,

    maxHp: Math.floor(CONFIG.enemyBaseStats.maxHp * scaleFactor * bossMultiplier),
    currentHp: 0,
    attack: Math.floor(CONFIG.enemyBaseStats.attack * scaleFactor * bossMultiplier),
    defense: Math.floor(CONFIG.enemyBaseStats.defense * scaleFactor * bossMultiplier),
    speed: Math.floor(CONFIG.enemyBaseStats.speed * scaleFactor * bossMultiplier),

    lastAttackTime: 0,
    statusEffects: []
  };

  enemy.currentHp = enemy.maxHp;

  return enemy;
}

/**
 * Generate a random item
 */
export function generateItem(wave, forceRarity = null) {
  // Determine rarity
  let rarity = forceRarity;
  if (!rarity) {
    const rarityRoll = Math.random() * 100;
    let cumulative = 0;
    for (const [rarityName, rarityConfig] of Object.entries(CONFIG.itemRarities)) {
      cumulative += rarityConfig.weight;
      if (rarityRoll <= cumulative) {
        rarity = rarityName;
        break;
      }
    }
  }

  const rarityConfig = CONFIG.itemRarities[rarity];
  const slot = CONFIG.itemSlots[Math.floor(Math.random() * CONFIG.itemSlots.length)];
  const baseStats = CONFIG.itemBaseStats[slot];

  const item = {
    id: `item_${Date.now()}_${Math.random()}`,
    name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} ${slot}`,
    slot: slot,
    rarity: rarity,
    level: wave,
    stats: {}
  };

  // Calculate stats based on rarity and wave
  const waveMultiplier = 1 + (wave * 0.1);
  for (const [statName, statValue] of Object.entries(baseStats)) {
    item.stats[statName] = Math.floor(statValue * rarityConfig.statMultiplier * waveMultiplier);
  }

  return item;
}

// ===== Save/Load System =====

const SAVE_KEY = 'reincarnos_save';

/**
 * Save game state to localStorage
 */
export function saveGame() {
  try {
    gameState.lastSaveTime = Date.now();
    const saveData = JSON.stringify(gameState);
    localStorage.setItem(SAVE_KEY, saveData);
    console.log('Game saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
}

/**
 * Load game state from localStorage
 */
export function loadGame() {
  try {
    const saveData = localStorage.getItem(SAVE_KEY);
    if (!saveData) {
      console.log('No save data found');
      return false;
    }

    const loadedState = JSON.parse(saveData);

    // Calculate offline progress
    const offlineTime = Date.now() - loadedState.lastSaveTime;
    let offlineRewards = null;
    if (offlineTime > 0) {
      offlineRewards = calculateOfflineProgress(loadedState, offlineTime);
    }

    // Merge loaded state into gameState
    Object.assign(gameState, loadedState);

    console.log('Game loaded successfully');
    console.log(`You were offline for ${Math.floor(offlineTime / 1000)} seconds`);

    // Show offline progress modal if there are rewards (with delay to ensure UI is ready)
    if (offlineRewards && offlineRewards.waves > 0) {
      setTimeout(() => {
        showOfflineProgressModal(offlineRewards);
      }, 500);
    }

    return true;
  } catch (error) {
    console.error('Failed to load game:', error);
    return false;
  }
}

/**
 * Calculate offline progress
 * @returns {Object|null} Rewards object or null if no offline progress
 */
function calculateOfflineProgress(state, offlineTimeMs) {
  const offlineTime = Math.min(offlineTimeMs, CONFIG.maxOfflineTimeMs);
  const wavesPerSecond = 1000 / CONFIG.waveIntervalMs;
  const offlineWaves = Math.floor((offlineTime / 1000) * wavesPerSecond * CONFIG.offlineProgressRate);

  if (offlineWaves > 0) {
    const offlineGold = offlineWaves * CONFIG.baseGoldPerWave;
    const offlineXp = offlineWaves * CONFIG.baseXpPerWave;

    state.wave += offlineWaves;
    state.gold += offlineGold;
    state.xp += offlineXp;
    state.lifetimeGold += offlineGold;
    state.stats.highestWave = Math.max(state.stats.highestWave, state.wave);

    console.log(`Offline progress: +${offlineWaves} waves, +${offlineGold} gold, +${offlineXp} XP`);

    // Return rewards for UI display
    return {
      waves: offlineWaves,
      gold: offlineGold,
      xp: offlineXp,
      duration: offlineTimeMs,
      items: [] // Future: generate offline items
    };
  }

  return null;
}

/**
 * Reset game (for prestige)
 */
export function resetGame() {
  const sigilsToGain = CONFIG.sigilPowerFormula(gameState.lifetimeGold);

  // Keep prestige-related data
  const keepData = {
    sigilPoints: gameState.sigilPoints + sigilsToGain,
    totalPrestiges: gameState.totalPrestiges + 1,
    lifetimeGold: gameState.lifetimeGold,
    stats: gameState.stats,
    settings: gameState.settings
  };

  // Reset everything else
  gameState.wave = 1;
  gameState.gold = 0;
  gameState.xp = 0;
  gameState.fragments = 0;
  gameState.heroes = [
    createHero('warrior', 'Sword Saint', 1),
    createHero('mage', 'Archmage', 1),
    createHero('ranger', 'Hunter', 1),
    createHero('cleric', 'Healer', 1)
  ];
  gameState.currentEnemies = [];
  gameState.combatActive = false;
  gameState.currentEvent = null;
  gameState.inventory = [];
  gameState.upgrades = {
    goldMultiplier: 0,
    xpMultiplier: 0,
    autoProgress: 0,
    heroDamage: 0,
    heroDefense: 0,
    critChance: 0,
    heroSlots: 0,
    inventorySlots: 0
  };
  gameState.quests = [];
  gameState.completedQuests = [];

  // Restore kept data
  Object.assign(gameState, keepData);

  console.log(`Prestige! Gained ${sigilsToGain} sigil points (total: ${gameState.sigilPoints})`);
  saveGame();
}

/**
 * Export save data as string (for backup)
 */
export function exportSave() {
  return JSON.stringify(gameState);
}

/**
 * Import save data from string
 */
export function importSave(saveString) {
  try {
    const importedState = JSON.parse(saveString);
    Object.assign(gameState, importedState);
    saveGame();
    console.log('Save imported successfully');
    return true;
  } catch (error) {
    console.error('Failed to import save:', error);
    return false;
  }
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
  }, CONFIG.autoSaveInterval);
}

export function stopAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
}

// ===== Initialization =====

// Try to load save on import
loadGame();
