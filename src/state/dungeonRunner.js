// ===== Dungeon Runner =====
// Lightweight dungeon loop using the enhanced game state

import { gameState, addItemToInventory } from './enhancedGameState.js';
import { updateHeroStats, addXpToHero } from './heroSystem.js';
import { getDungeonById } from './dungeonTemplates.js';

let dungeonInterval = null;
const listeners = [];
let battleNotify = null;
let currentEnemies = [];
let combatLog = [];
let currentEvent = null;
let activeModifiers = []; // Track active dungeon modifiers
let dungeonStartTime = null; // For time-limited dungeons

// Special dungeon events
const DUNGEON_EVENTS = [
  {
    id: 'treasure',
    name: '💰 Treasure Room',
    description: 'A room filled with riches!',
    chance: 0.15,
    effect: (stats) => {
      const goldBonus = Math.floor(stats.wave * 10);
      gameState.gold += goldBonus;
      gameState.lifetimeGold += goldBonus;
      if (battleNotify) {
        battleNotify(`Found ${goldBonus} extra gold in treasure room!`, 'gold');
      }
    }
  },
  {
    id: 'elite',
    name: '⚡ Elite Pack',
    description: 'Powerful enemies ahead!',
    chance: 0.12,
    enemyMultiplier: 1.5,
    enemyCountBonus: 2,
    lootBonus: 2
  },
  {
    id: 'rest',
    name: '🛏️ Rest Area',
    description: 'A safe place to recover.',
    chance: 0.10,
    effect: (stats) => {
      gameState.heroes.forEach(hero => {
        const healAmount = Math.floor(hero.currentStats.hp * 0.3);
        hero.currentHp = Math.min(hero.currentStats.hp, hero.currentHp + healAmount);
      });
      if (battleNotify) {
        battleNotify('Heroes rested and recovered 30% HP!', 'success');
      }
    }
  },
  {
    id: 'cursed',
    name: '😈 Cursed Room',
    description: 'Dark energy empowers your foes!',
    chance: 0.08,
    enemyMultiplier: 2.0
  },
  {
    id: 'lucky',
    name: '🍀 Lucky Break',
    description: 'Fortune smiles upon you!',
    chance: 0.05,
    effect: (stats) => {
      const xpBonus = Math.floor(stats.wave * 50);
      gameState.heroes.forEach(hero => {
        if (!hero.onDispatch) {
          addXpToHero(hero, xpBonus);
        }
      });
      if (battleNotify) {
        battleNotify(`Everyone gained ${xpBonus} bonus XP!`, 'level-up');
      }
    }
  }
];

// Get current active dungeon
function getCurrentDungeon() {
  const dungeonId = gameState.currentDungeonId || 'story_node_1';
  return getDungeonById(dungeonId);
}

// Set notification callback (from battle tracker)
export function setBattleNotification(notifyFn) {
  battleNotify = notifyFn;
}

export function startDungeon() {
  if (dungeonInterval) return;
  gameState.dungeonState.running = true;
  gameState.dungeonState.timeInWave = 0;

  // Get current dungeon and apply modifiers
  const dungeon = getCurrentDungeon();
  activeModifiers = dungeon?.modifiers || [];
  dungeonStartTime = Date.now();

  // Notify about active modifiers
  if (activeModifiers.length > 0 && battleNotify) {
    activeModifiers.forEach(mod => {
      battleNotify(`⚠️ ${mod.name}: ${mod.description}`, 'warning');
    });
  }

  // Top off heroes before a new push
  gameState.heroes.forEach(hero => {
    updateHeroStats(hero);
    hero.currentHp = hero.currentStats.hp;
  });

  // Create enemies for this wave
  spawnEnemies();

  dungeonInterval = setInterval(tickCombat, 500);
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

function spawnEnemies() {
  let isBossWave = gameState.wave % 10 === 0;

  // Check for "all_bosses" modifier
  const allBossesModifier = activeModifiers.find(m => m.effect?.allBosses);
  if (allBossesModifier) {
    isBossWave = true; // Every wave is a boss wave!
  }

  // Roll for special event (not on boss waves unless modifier forces it)
  currentEvent = null;
  if (!isBossWave && Math.random() < 0.3) { // 30% chance for any event
    const totalChance = DUNGEON_EVENTS.reduce((sum, e) => sum + e.chance, 0);
    let roll = Math.random() * totalChance;

    for (const event of DUNGEON_EVENTS) {
      roll -= event.chance;
      if (roll <= 0) {
        currentEvent = event;
        if (battleNotify) {
          battleNotify(`${event.name}: ${event.description}`, 'quest');
        }
        break;
      }
    }
  }

  // Apply immediate event effects (like treasure or rest)
  if (currentEvent && currentEvent.effect) {
    currentEvent.effect({ wave: gameState.wave });
  }

  // Determine enemy count (with event bonuses)
  let enemyCount = isBossWave ? 1 : Math.min(1 + Math.floor(gameState.wave / 5), 5);
  if (currentEvent && currentEvent.enemyCountBonus) {
    enemyCount += currentEvent.enemyCountBonus;
  }

  // Spawn enemies with event multipliers
  const enemyMultiplier = currentEvent?.enemyMultiplier || 1.0;
  currentEnemies = [];
  for (let i = 0; i < enemyCount; i++) {
    const enemy = createEnemy(gameState.wave, isBossWave);

    // Apply event multiplier
    if (enemyMultiplier !== 1.0) {
      enemy.maxHp = Math.floor(enemy.maxHp * enemyMultiplier);
      enemy.currentHp = enemy.maxHp;
      enemy.atk = Math.floor(enemy.atk * enemyMultiplier);
      enemy.def = Math.floor(enemy.def * enemyMultiplier);
    }

    currentEnemies.push(enemy);
  }

  combatLog = [];
}

function createEnemy(wave, isBoss) {
  // Get current dungeon configuration
  const dungeon = getCurrentDungeon();

  // Use dungeon-specific scaling
  // baseMult = 1.0 at wave 1 + (level per wave × wave)
  const effectiveLevel = (dungeon?.baseEnemyLevel || 1) + (wave * (dungeon?.enemyLevelPerWave || 0.2));
  const levelMult = 1 + (effectiveLevel * 0.1); // 10% scaling per effective level
  const bossMult = isBoss ? 3 : 1;

  const hp = Math.floor(35 * levelMult * bossMult);
  const atk = Math.floor(7 * levelMult * bossMult);

  const enemyTypes = isBoss
    ? ['Malware Boss', 'Firewall Sentinel', 'Virus Core', 'System Daemon']
    : ['Bugbot', 'Spam Script', 'Ad Popup', 'Cookie Monster', 'Memory Leak'];

  const name = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

  return {
    id: `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: isBoss ? `💀 ${name}` : name,
    maxHp: hp,
    currentHp: hp,
    atk: atk,
    def: Math.floor(2 * levelMult * bossMult),
    isBoss: isBoss,
    lastAttackTime: Date.now()
  };
}

function tickCombat() {
  if (!gameState.dungeonState.running) return;

  const now = Date.now();
  const activeHeroes = gameState.heroes.filter(h => h.currentHp > 0 && !h.onDispatch);
  const aliveEnemies = currentEnemies.filter(e => e.currentHp > 0);

  // Check time limit modifier
  const timeLimitModifier = activeModifiers.find(m => m.effect?.timeLimit);
  if (timeLimitModifier && dungeonStartTime) {
    const elapsedSeconds = (now - dungeonStartTime) / 1000;
    const timeLimit = timeLimitModifier.effect.timeLimit;
    if (elapsedSeconds >= timeLimit) {
      if (battleNotify) {
        battleNotify(`⏰ Time limit exceeded! Dungeon failed.`, 'error');
      }
      loseWave();
      return;
    }
  }

  // Check win condition
  if (aliveEnemies.length === 0) {
    completeWave();
    return;
  }

  // Check lose condition
  if (activeHeroes.length === 0) {
    loseWave();
    return;
  }

  // Apply skill tree passive effects (combat regen)
  const noHealingModifier = activeModifiers.find(m => m.effect?.disableHealing);
  if (!noHealingModifier) {
    for (const hero of activeHeroes) {
      if (hero.skillBonuses && hero.skillBonuses.combatRegen > 0) {
        const regenAmount = Math.floor(hero.currentStats.hp * hero.skillBonuses.combatRegen);
        if (regenAmount > 0) {
          hero.currentHp = Math.min(hero.currentStats.hp, hero.currentHp + regenAmount);
        }
      }
    }
  }

  // Heroes attack
  for (const hero of activeHeroes) {
    if (now - hero.lastAttackTime >= 2000) { // Attack every 2 seconds
      const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
      if (target) {
        heroAttack(hero, target);
        hero.lastAttackTime = now;
      }
    }
  }

  // Enemies attack
  for (const enemy of aliveEnemies) {
    if (now - enemy.lastAttackTime >= 2500) { // Enemies attack every 2.5 seconds
      const target = activeHeroes[Math.floor(Math.random() * activeHeroes.length)];
      if (target) {
        enemyAttack(enemy, target);
        enemy.lastAttackTime = now;
      }
    }
  }

  gameState.dungeonState.timeInWave += 500;
  notify();
}

function heroAttack(hero, enemy) {
  let damage = Math.max(1, hero.currentStats.atk - enemy.def);

  // Apply critical strike from skill tree
  let isCrit = false;
  if (hero.skillBonuses && hero.skillBonuses.critChance > 0) {
    if (Math.random() < hero.skillBonuses.critChance) {
      isCrit = true;
      const critMult = hero.skillBonuses.critMultiplier || 2.0;
      damage = Math.floor(damage * critMult);
    }
  }

  // Check for execute (instant kill below threshold)
  if (hero.skillBonuses && hero.skillBonuses.executeChance > 0 && !enemy.isBoss) {
    const executeThreshold = hero.skillBonuses.executeThreshold || 0.15;
    const hpPercent = enemy.currentHp / enemy.maxHp;
    if (hpPercent <= executeThreshold && Math.random() < hero.skillBonuses.executeChance) {
      damage = enemy.currentHp; // Instant kill!
      combatLog.push({
        type: 'execute',
        attacker: hero.name,
        target: enemy.name
      });
    }
  }

  enemy.currentHp = Math.max(0, enemy.currentHp - damage);

  // Apply lifesteal (heal based on damage dealt)
  if (hero.skillBonuses && hero.skillBonuses.lifesteal > 0) {
    const healAmount = Math.floor(damage * hero.skillBonuses.lifesteal);
    if (healAmount > 0) {
      hero.currentHp = Math.min(hero.currentStats.hp, hero.currentHp + healAmount);
    }
  }

  combatLog.push({
    type: 'hero-attack',
    attacker: hero.name,
    target: enemy.name,
    damage: damage,
    isCrit: isCrit
  });

  if (enemy.currentHp === 0) {
    combatLog.push({
      type: 'enemy-defeated',
      enemy: enemy.name
    });
  }
}

function enemyAttack(enemy, hero) {
  const damage = Math.max(1, enemy.atk - (hero.currentStats.def || 0));
  hero.currentHp = Math.max(0, hero.currentHp - damage);

  combatLog.push({
    type: 'enemy-attack',
    attacker: enemy.name,
    target: hero.name,
    damage: damage
  });

  if (hero.currentHp === 0) {
    combatLog.push({
      type: 'hero-defeated',
      hero: hero.name
    });
  }
}

function loseWave() {
  gameState.dungeonState.running = false;

  if (battleNotify) {
    battleNotify('Party defeated! Healing heroes...', 'warning');
  }

  // Heal all heroes and restart wave
  setTimeout(() => {
    gameState.heroes.forEach(hero => {
      hero.currentHp = hero.currentStats.hp;
    });

    if (battleNotify) {
      battleNotify('Heroes healed. Ready to continue!', 'success');
    }

    spawnEnemies();
    gameState.dungeonState.running = true;
    notify();
  }, 3000);
}

function completeWave() {
  gameState.dungeonState.timeInWave = 0;

  // Get current dungeon configuration
  const dungeon = getCurrentDungeon();

  // Determine if boss wave
  const isBossWave = gameState.wave % 10 === 0;

  // Use dungeon-specific rewards
  const baseGold = dungeon?.rewards?.goldPerWave || 5;
  const baseXp = dungeon?.rewards?.xpPerWave || 20;
  const goldReward = baseGold * (isBossWave ? 2 : 1);
  const xpReward = baseXp * (isBossWave ? 2 : 1);

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

  // Boss rewards: Entropy Dust
  if (isBossWave) {
    const entropyReward = Math.floor(1 + gameState.wave / 20); // 1 dust per 20 waves
    if (gameState.resources && gameState.resources.entropyDust !== undefined) {
      gameState.resources.entropyDust += entropyReward;
      if (battleNotify) {
        battleNotify(`Boss defeated! +${entropyReward} Entropy Dust`, 'gold');
      }
    }
    gameState.stats.totalBossesKilled = (gameState.stats.totalBossesKilled || 0) + 1;
  }

  // Item drops
  handleItemDrop(isBossWave);

  // Advance wave and spawn new enemies
  gameState.wave += 1;
  spawnEnemies();

  notify();
}

function handleItemDrop(isBossWave) {
  // Get current dungeon configuration
  const dungeon = getCurrentDungeon();

  // Drop chance: use dungeon's drop rate, or default to 30%
  const baseDropRate = dungeon?.rewards?.itemDropRate || 0.3;
  const dropChance = isBossWave ? 1.0 : baseDropRate;

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
  const aliveEnemies = currentEnemies.filter(e => e.currentHp > 0);
  const isBossWave = gameState.wave % 10 === 0;

  return {
    wave: gameState.wave,
    gold: gameState.gold,
    xp: gameState.xp,
    running: gameState.dungeonState.running,
    progress: 100, // No longer time-based, combat continues until enemies dead
    isBossWave,
    enemyCount: currentEnemies.length,
    enemyType: isBossWave ? 'Boss' : 'Normal',
    enemies: currentEnemies.map(e => ({
      id: e.id,
      name: e.name,
      currentHp: e.currentHp,
      maxHp: e.maxHp,
      atk: e.atk,
      def: e.def,
      isBoss: e.isBoss,
      hpPercent: Math.floor((e.currentHp / e.maxHp) * 100)
    })),
    aliveEnemies: aliveEnemies.length,
    currentEvent: currentEvent // Expose current dungeon event
  };
}

export function getCombatLog(limit = 10) {
  return combatLog.slice(-limit);
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

/**
 * Auto-resume dungeon if it was running when page was last closed
 * Call this after game state is loaded
 */
export function autoResumeDungeon() {
  // Check if dungeon was running when the game was saved
  if (gameState.dungeonState.running && !dungeonInterval) {
    console.log('Auto-resuming dungeon from previous session...');
    startDungeon();
  }
}
