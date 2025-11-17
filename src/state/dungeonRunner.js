// ===== Dungeon Runner =====
// Lightweight dungeon loop using the enhanced game state

import { gameState, addItemToInventory } from './enhancedGameState.js';
import { updateHeroStats, addXpToHero } from './heroSystem.js';

let dungeonInterval = null;
const listeners = [];
let battleNotify = null;

// Set notification callback (from battle tracker)
export function setBattleNotification(notifyFn) {
  battleNotify = notifyFn;
}

export function startDungeon() {
  if (dungeonInterval) return;
  gameState.dungeonState.running = true;
  gameState.dungeonState.timeInWave = 0;

  // Top off heroes before a new push
  gameState.heroes.forEach(hero => updateHeroStats(hero));

  dungeonInterval = setInterval(tickWave, 500);
  notify();
}

export function stopDungeon() {
  if (dungeonInterval) {
    clearInterval(dungeonInterval);
    dungeonInterval = null;
  }
  gameState.dungeonState.running = false;
  notify();
}

export function toggleDungeon() {
  if (gameState.dungeonState.running) {
    stopDungeon();
  } else {
    startDungeon();
  }
}

function tickWave() {
  if (!gameState.dungeonState.running) return;

  gameState.dungeonState.timeInWave += 500;

  if (gameState.dungeonState.timeInWave >= gameState.dungeonState.waveDuration) {
    completeWave();
  }

  notify();
}

function completeWave() {
  gameState.dungeonState.timeInWave = 0;

  // Determine if boss wave
  const isBossWave = gameState.wave % 10 === 0;

  // Simple rewards scale with party power
  const partyPower = Math.max(1, Math.floor(gameState.heroes.reduce((sum, hero) => sum + hero.currentStats.atk, 0) / 10));
  const goldReward = (isBossWave ? 10 : 5) + partyPower;
  const xpReward = (isBossWave ? 6 : 3) + Math.floor(partyPower / 2);

  // Grant gold
  gameState.gold += goldReward;
  gameState.lifetimeGold += goldReward;
  gameState.stats.totalGoldEarned += goldReward;

  // Grant XP to all heroes (split evenly)
  const xpPerHero = Math.floor(xpReward / gameState.heroes.length);
  for (const hero of gameState.heroes) {
    if (!hero.onDispatch) {  // Only heroes not on dispatch gain XP
      const oldLevel = hero.level;
      addXpToHero(hero, xpPerHero);

      // Check for level up notification
      if (hero.level > oldLevel && battleNotify) {
        battleNotify(`${hero.name} → Lv ${hero.level}!`, 'level-up');
      }
    }
  }

  // Update highest wave stat
  gameState.stats.highestWave = Math.max(gameState.stats.highestWave, gameState.wave);

  // Item drops
  handleItemDrop(isBossWave);

  // Advance wave
  gameState.wave += 1;
}

function handleItemDrop(isBossWave) {
  // Drop chance: 30% for normal waves, 100% for boss waves
  const dropChance = isBossWave ? 1.0 : 0.3;

  if (Math.random() < dropChance) {
    const item = generateItem(gameState.wave, isBossWave);
    const result = addItemToInventory(item);

    if (result.success) {
      if (battleNotify) {
        battleNotify(`Found: ${item.name}!`, 'item');
      }
      console.log(`Looted: ${item.name}`);
    } else {
      console.log(`Inventory full! Could not loot ${item.name}`);
      if (battleNotify) {
        battleNotify('Inventory full!', 'warning');
      }
    }
  }
}

function generateItem(wave, isBoss) {
  // Simple item generation
  const rarities = [
    { rarity: 1, weight: 50, name: 'Common' },
    { rarity: 2, weight: 30, name: 'Uncommon' },
    { rarity: 3, weight: 15, name: 'Rare' },
    { rarity: 4, weight: 4, name: 'Epic' },
    { rarity: 5, weight: 1, name: 'Legendary' }
  ];

  // Boss waves have better drop rates
  let rarityRoll = Math.random() * 100;
  if (isBoss) {
    rarityRoll *= 0.5; // Better chance for high rarity
  }

  let cumulative = 0;
  let selectedRarity = 1;
  let selectedRarityName = 'Common';

  for (const r of rarities) {
    cumulative += r.weight;
    if (rarityRoll <= cumulative) {
      selectedRarity = r.rarity;
      selectedRarityName = r.name;
      break;
    }
  }

  // Item types
  const types = ['weapon', 'armor', 'accessory'];
  const type = types[Math.floor(Math.random() * types.length)];

  // Stat bonuses based on wave and rarity
  const rarityMult = selectedRarity * 0.5;
  const waveMult = 1 + (wave * 0.1);
  const baseStat = Math.floor(5 * rarityMult * waveMult);

  const statBonuses = {};
  if (type === 'weapon') {
    statBonuses.atk = baseStat;
  } else if (type === 'armor') {
    statBonuses.hp = baseStat * 3;
    statBonuses.def = baseStat;
  } else if (type === 'accessory') {
    statBonuses.spd = Math.floor(baseStat * 0.5);
    statBonuses.lck = Math.floor(baseStat * 0.3);
  }

  return {
    id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: `${selectedRarityName} ${type}`,
    type: type,
    rarity: selectedRarity,
    level: wave,
    statBonuses: statBonuses
  };
}

export function onDungeonUpdate(callback) {
  listeners.push(callback);
}

export function getDungeonStats() {
  const progress = Math.min(100, Math.floor((gameState.dungeonState.timeInWave / gameState.dungeonState.waveDuration) * 100));
  const isBossWave = gameState.wave % 10 === 0;
  const enemyCount = Math.min(1 + Math.floor(gameState.wave / 5), 5);

  return {
    wave: gameState.wave,
    gold: gameState.gold,
    xp: gameState.xp,
    running: gameState.dungeonState.running,
    progress,
    isBossWave,
    enemyCount: isBossWave ? 1 : enemyCount,
    enemyType: isBossWave ? 'Boss' : 'Normal'
  };
}

function notify() {
  listeners.forEach(cb => {
    try {
      cb();
    } catch (error) {
      console.error('Dungeon update callback failed', error);
    }
  });
}
