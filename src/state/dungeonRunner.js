// ===== Dungeon Runner =====
// Lightweight dungeon loop using the enhanced game state

import { gameState } from './enhancedGameState.js';
import { updateHeroStats } from './heroSystem.js';

let dungeonInterval = null;
const listeners = [];

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

  // Simple rewards scale with party power
  const partyPower = Math.max(1, Math.floor(gameState.heroes.reduce((sum, hero) => sum + hero.currentStats.atk, 0) / 10));
  const goldReward = 5 + partyPower;
  const xpReward = 3 + Math.floor(partyPower / 2);

  gameState.gold += goldReward;
  gameState.lifetimeGold += goldReward;
  gameState.xp += xpReward;
  gameState.stats.totalGoldEarned += goldReward;
  gameState.stats.highestWave = Math.max(gameState.stats.highestWave, gameState.wave);

  gameState.wave += 1;
}

export function onDungeonUpdate(callback) {
  listeners.push(callback);
}

export function getDungeonStats() {
  const progress = Math.min(100, Math.floor((gameState.dungeonState.timeInWave / gameState.dungeonState.waveDuration) * 100));
  return {
    wave: gameState.wave,
    gold: gameState.gold,
    xp: gameState.xp,
    running: gameState.dungeonState.running,
    progress
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
