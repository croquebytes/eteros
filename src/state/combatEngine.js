// ===== ReincarnOS Combat Engine =====
// Handles all combat logic, damage calculations, and battle flow

import { CONFIG } from './config.js';
import { gameState, createEnemy, generateItem, saveGame } from './gameState.js';

// ===== Combat State =====
let combatInterval = null;
let uiUpdateCallbacks = [];

// ===== Public API =====

/**
 * Start a new wave
 */
export function startWave() {
  // Check if boss wave
  const isBoss = gameState.wave % CONFIG.bossWaveInterval === 0;

  // Check for random event
  let event = null;
  if (Math.random() < CONFIG.randomEventChance && !isBoss) {
    event = CONFIG.randomEvents[Math.floor(Math.random() * CONFIG.randomEvents.length)];
    gameState.currentEvent = event;
  }

  // Create enemies
  const enemyCount = isBoss ? 1 : Math.min(1 + Math.floor(gameState.wave / 5), 5);
  gameState.currentEnemies = [];

  for (let i = 0; i < enemyCount; i++) {
    const isEventBoss = event && event.isBoss;
    const enemy = createEnemy(gameState.wave, isBoss || isEventBoss);

    // Apply event modifiers
    if (event && event.enemyMultiplier) {
      enemy.maxHp = Math.floor(enemy.maxHp * event.enemyMultiplier);
      enemy.currentHp = enemy.maxHp;
      enemy.attack = Math.floor(enemy.attack * event.enemyMultiplier);
    }

    gameState.currentEnemies.push(enemy);
  }

  // Heal heroes to full
  for (const hero of gameState.heroes) {
    hero.currentHp = getHeroMaxHp(hero);
  }

  gameState.combatActive = true;
  notifyUIUpdate();

  console.log(`Wave ${gameState.wave} started! ${isBoss ? 'BOSS WAVE!' : `${enemyCount} enemies`}`);
}

/**
 * End current wave
 */
export function endWave(victory) {
  gameState.combatActive = false;

  if (victory) {
    // Calculate rewards
    let goldReward = CONFIG.baseGoldPerWave;
    let xpReward = CONFIG.baseXpPerWave;

    // Apply event bonuses
    if (gameState.currentEvent) {
      if (gameState.currentEvent.goldBonus) {
        goldReward += gameState.currentEvent.goldBonus;
      }
      if (gameState.currentEvent.xpBonus) {
        xpReward += gameState.currentEvent.xpBonus;
      }
    }

    // Apply upgrade multipliers
    goldReward = Math.floor(goldReward * (1 + gameState.upgrades.goldMultiplier * CONFIG.upgrades.goldMultiplier.effect));
    xpReward = Math.floor(xpReward * (1 + gameState.upgrades.xpMultiplier * CONFIG.upgrades.xpMultiplier.effect));

    // Grant rewards
    gameState.gold += goldReward;
    gameState.xp += xpReward;
    gameState.lifetimeGold += goldReward;
    gameState.stats.totalGoldEarned += goldReward;

    // Update stats
    gameState.stats.highestWave = Math.max(gameState.stats.highestWave, gameState.wave);

    console.log(`Wave ${gameState.wave} complete! +${goldReward} gold, +${xpReward} XP`);

    // Advance wave
    gameState.wave += 1;
    gameState.currentEvent = null;

    // Start next wave after delay
    setTimeout(() => {
      if (gameState.combatActive === false) {
        startWave();
      }
    }, 2000);
  } else {
    // Defeat - restart from wave 1 (or implement other defeat logic)
    console.log('Defeated! Returning to wave 1...');
    gameState.wave = 1;
    setTimeout(() => startWave(), 3000);
  }

  notifyUIUpdate();
}

/**
 * Main combat tick - runs every second
 */
export function combatTick() {
  if (!gameState.combatActive) return;

  const now = Date.now();

  // Get alive heroes and enemies
  const aliveHeroes = gameState.heroes.filter(h => h.currentHp > 0);
  const aliveEnemies = gameState.currentEnemies.filter(e => e.currentHp > 0);

  // Check win/loss conditions
  if (aliveEnemies.length === 0) {
    endWave(true);
    return;
  }

  if (aliveHeroes.length === 0) {
    endWave(false);
    return;
  }

  // Heroes attack
  for (const hero of aliveHeroes) {
    if (now - hero.lastAttackTime >= CONFIG.autoAttackSpeed) {
      heroAttack(hero, aliveEnemies);
      hero.lastAttackTime = now;
    }
  }

  // Enemies attack
  for (const enemy of aliveEnemies) {
    if (now - enemy.lastAttackTime >= CONFIG.autoAttackSpeed) {
      enemyAttack(enemy, aliveHeroes);
      enemy.lastAttackTime = now;
    }
  }

  // Update skill cooldowns
  for (const hero of gameState.heroes) {
    for (const skill of hero.skills) {
      if (skill.cooldownRemaining > 0) {
        skill.cooldownRemaining = Math.max(0, skill.cooldownRemaining - CONFIG.combatTickMs);
      }
    }
  }

  notifyUIUpdate();
}

/**
 * Hero attacks enemy
 */
function heroAttack(hero, enemies) {
  if (enemies.length === 0) return;

  // Pick random target
  const target = enemies[Math.floor(Math.random() * enemies.length)];

  // Calculate damage
  const heroAttack = getHeroAttack(hero);
  const rawDamage = Math.max(1, heroAttack - target.defense);

  // Check for crit
  const isCrit = Math.random() < getHeroCritChance(hero);
  const critMultiplier = isCrit ? getHeroCritMultiplier(hero) : 1;
  const finalDamage = Math.floor(rawDamage * critMultiplier);

  // Apply damage
  target.currentHp = Math.max(0, target.currentHp - finalDamage);

  console.log(`${hero.name} attacks ${target.name} for ${finalDamage} damage${isCrit ? ' (CRIT!)' : ''}`);

  // Track stats
  gameState.stats.totalDamageDealt += finalDamage;

  // Check if enemy died
  if (target.currentHp === 0) {
    onEnemyKilled(target);
  }
}

/**
 * Enemy attacks hero
 */
function enemyAttack(enemy, heroes) {
  if (heroes.length === 0) return;

  // Pick random target
  const target = heroes[Math.floor(Math.random() * heroes.length)];

  // Calculate damage
  const rawDamage = Math.max(1, enemy.attack - getHeroDefense(target));
  const finalDamage = Math.floor(rawDamage);

  // Apply damage
  target.currentHp = Math.max(0, target.currentHp - finalDamage);

  console.log(`${enemy.name} attacks ${target.name} for ${finalDamage} damage`);

  // Track stats
  gameState.stats.totalDamageTaken += finalDamage;
}

/**
 * Handle enemy death
 */
function onEnemyKilled(enemy) {
  console.log(`${enemy.name} defeated!`);

  // Grant rewards
  const goldReward = CONFIG.goldPerEnemyKill;
  const xpReward = CONFIG.xpPerEnemyKill;

  gameState.gold += goldReward;
  gameState.xp += xpReward;
  gameState.lifetimeGold += goldReward;

  // Track stats
  gameState.stats.totalEnemiesKilled += 1;
  if (enemy.isBoss) {
    gameState.stats.totalBossesKilled += 1;
  }

  // Check for loot drop
  const dropChance = enemy.isBoss ? CONFIG.bossLootDropChance : CONFIG.lootDropChance;
  if (Math.random() < dropChance) {
    const item = generateItem(gameState.wave, enemy.isBoss ? 'rare' : null);

    // Add to inventory if there's space
    const maxSlots = CONFIG.maxInventorySlots + (gameState.upgrades.inventorySlots * CONFIG.upgrades.inventorySlots.effect);
    if (gameState.inventory.length < maxSlots) {
      gameState.inventory.push(item);
      gameState.stats.totalItemsFound += 1;
      console.log(`Looted: ${item.name}!`);
    } else {
      console.log(`Inventory full! Could not loot ${item.name}`);
    }
  }
}

// ===== Stat Calculation Helpers =====

/**
 * Get hero's total max HP (base + equipment + upgrades)
 */
function getHeroMaxHp(hero) {
  let maxHp = hero.maxHp;

  // Add equipment bonuses
  for (const slot in hero.equipment) {
    const item = hero.equipment[slot];
    if (item && item.stats.maxHp) {
      maxHp += item.stats.maxHp;
    }
  }

  // Add upgrade bonuses
  const upgradeBonus = 1 + (gameState.upgrades.heroDefense * CONFIG.upgrades.heroDefense.effect);
  maxHp = Math.floor(maxHp * upgradeBonus);

  // Add sigil bonuses
  const sigilBonus = 1 + (gameState.sigilPoints * CONFIG.sigilBonusPerPoint);
  maxHp = Math.floor(maxHp * sigilBonus);

  return maxHp;
}

/**
 * Get hero's total attack
 */
function getHeroAttack(hero) {
  let attack = hero.attack;

  // Add equipment bonuses
  for (const slot in hero.equipment) {
    const item = hero.equipment[slot];
    if (item && item.stats.attack) {
      attack += item.stats.attack;
    }
  }

  // Add upgrade bonuses
  const upgradeBonus = 1 + (gameState.upgrades.heroDamage * CONFIG.upgrades.heroDamage.effect);
  attack = Math.floor(attack * upgradeBonus);

  // Add sigil bonuses
  const sigilBonus = 1 + (gameState.sigilPoints * CONFIG.sigilBonusPerPoint);
  attack = Math.floor(attack * sigilBonus);

  return attack;
}

/**
 * Get hero's total defense
 */
function getHeroDefense(hero) {
  let defense = hero.defense;

  // Add equipment bonuses
  for (const slot in hero.equipment) {
    const item = hero.equipment[slot];
    if (item && item.stats.defense) {
      defense += item.stats.defense;
    }
  }

  // Add upgrade bonuses
  const upgradeBonus = 1 + (gameState.upgrades.heroDefense * CONFIG.upgrades.heroDefense.effect);
  defense = Math.floor(defense * upgradeBonus);

  // Add sigil bonuses
  const sigilBonus = 1 + (gameState.sigilPoints * CONFIG.sigilBonusPerPoint);
  defense = Math.floor(defense * sigilBonus);

  return defense;
}

/**
 * Get hero's crit chance
 */
function getHeroCritChance(hero) {
  let critChance = hero.critChance;

  // Add equipment bonuses
  for (const slot in hero.equipment) {
    const item = hero.equipment[slot];
    if (item && item.stats.critChance) {
      critChance += item.stats.critChance;
    }
  }

  // Add upgrade bonuses
  critChance += (gameState.upgrades.critChance * CONFIG.upgrades.critChance.effect);

  return Math.min(critChance, 1.0); // Cap at 100%
}

/**
 * Get hero's crit multiplier
 */
function getHeroCritMultiplier(hero) {
  let critMultiplier = hero.critMultiplier;

  // Add equipment bonuses
  for (const slot in hero.equipment) {
    const item = hero.equipment[slot];
    if (item && item.stats.critMultiplier) {
      critMultiplier += item.stats.critMultiplier;
    }
  }

  return critMultiplier;
}

// ===== Equipment System =====

/**
 * Equip an item to a hero
 */
export function equipItem(heroId, itemId) {
  const hero = gameState.heroes.find(h => h.id === heroId);
  const item = gameState.inventory.find(i => i.id === itemId);

  if (!hero || !item) {
    console.error('Hero or item not found');
    return false;
  }

  // Unequip current item in that slot if exists
  if (hero.equipment[item.slot]) {
    gameState.inventory.push(hero.equipment[item.slot]);
  }

  // Equip new item
  hero.equipment[item.slot] = item;

  // Remove from inventory
  gameState.inventory = gameState.inventory.filter(i => i.id !== itemId);

  // Update hero HP if max changed
  const newMaxHp = getHeroMaxHp(hero);
  const hpRatio = hero.currentHp / hero.maxHp;
  hero.currentHp = Math.floor(newMaxHp * hpRatio);

  console.log(`${hero.name} equipped ${item.name}`);
  notifyUIUpdate();
  return true;
}

/**
 * Unequip an item from a hero
 */
export function unequipItem(heroId, slot) {
  const hero = gameState.heroes.find(h => h.id === heroId);

  if (!hero || !hero.equipment[slot]) {
    console.error('Hero or equipped item not found');
    return false;
  }

  const item = hero.equipment[slot];
  const maxSlots = CONFIG.maxInventorySlots + (gameState.upgrades.inventorySlots * CONFIG.upgrades.inventorySlots.effect);

  if (gameState.inventory.length >= maxSlots) {
    console.error('Inventory full');
    return false;
  }

  // Add to inventory
  gameState.inventory.push(item);

  // Remove from hero
  hero.equipment[slot] = null;

  console.log(`${hero.name} unequipped ${item.name}`);
  notifyUIUpdate();
  return true;
}

// ===== Combat Loop Management =====

/**
 * Start the combat system
 */
export function startCombatLoop() {
  if (combatInterval) {
    stopCombatLoop();
  }

  // Start first wave
  startWave();

  // Start combat tick
  combatInterval = setInterval(combatTick, CONFIG.combatTickMs);

  console.log('Combat system started');
}

/**
 * Stop the combat system
 */
export function stopCombatLoop() {
  if (combatInterval) {
    clearInterval(combatInterval);
    combatInterval = null;
  }
  gameState.combatActive = false;
  console.log('Combat system stopped');
}

// ===== UI Update System =====

/**
 * Register a callback for UI updates
 */
export function onUIUpdate(callback) {
  uiUpdateCallbacks.push(callback);
}

/**
 * Notify all UI update callbacks
 */
function notifyUIUpdate() {
  for (const callback of uiUpdateCallbacks) {
    try {
      callback();
    } catch (error) {
      console.error('UI update callback error:', error);
    }
  }
}

// ===== Export Combat Stats (for display) =====

export function getCombatStats() {
  return {
    wave: gameState.wave,
    gold: gameState.gold,
    xp: gameState.xp,
    heroes: gameState.heroes.map(h => ({
      name: h.name,
      class: h.class,
      level: h.level,
      currentHp: h.currentHp,
      maxHp: getHeroMaxHp(h),
      hpPercent: Math.floor((h.currentHp / getHeroMaxHp(h)) * 100)
    })),
    enemies: gameState.currentEnemies.map(e => ({
      name: e.name,
      isBoss: e.isBoss,
      currentHp: e.currentHp,
      maxHp: e.maxHp,
      hpPercent: Math.floor((e.currentHp / e.maxHp) * 100)
    })),
    combatActive: gameState.combatActive,
    currentEvent: gameState.currentEvent
  };
}
