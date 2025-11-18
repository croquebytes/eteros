// ===== Party Power Calculator =====
// Calculates party damage, power level, and provides dungeon recommendations

import { gameState } from './enhancedGameState.js';

/**
 * Calculate total party damage output
 * Based on hero stats, equipment, and active effects
 */
export function calculatePartyDamage() {
  let totalDamage = 0;

  for (const hero of gameState.heroes) {
    if (hero.onDispatch || hero.fatigued) continue;

    // Base attack from hero
    let heroAtk = hero.currentStats?.atk || hero.baseStats?.atk || 10;

    // Add equipment bonuses
    if (hero.equipment) {
      if (hero.equipment.weapon?.statBonuses?.atk) {
        heroAtk += hero.equipment.weapon.statBonuses.atk;
      }
      if (hero.equipment.accessory?.statBonuses?.atk) {
        heroAtk += hero.equipment.accessory.statBonuses.atk;
      }
    }

    totalDamage += heroAtk;
  }

  return Math.floor(totalDamage);
}

/**
 * Calculate party power level (includes HP, DEF, and ATK)
 * This is a more comprehensive metric than just damage
 */
export function calculatePartyPower() {
  let totalPower = 0;

  for (const hero of gameState.heroes) {
    if (hero.onDispatch || hero.fatigued) continue;

    const stats = hero.currentStats || hero.baseStats || {};

    // Weight different stats:
    // ATK x1.0, HP x0.1, DEF x0.5, SPD x0.2
    const atk = stats.atk || 10;
    const hp = stats.hp || 100;
    const def = stats.def || 5;
    const spd = stats.spd || 10;

    const heroPower = atk + (hp * 0.1) + (def * 0.5) + (spd * 0.2);
    totalPower += heroPower;
  }

  return Math.floor(totalPower);
}

/**
 * Get dungeon difficulty rating based on party power
 * @param {number} recommendedPower - Recommended party power for dungeon
 * @returns {string} - 'trivial', 'easy', 'moderate', 'challenging', 'deadly', 'impossible'
 */
export function getDungeonDifficulty(recommendedPower) {
  const partyPower = calculatePartyPower();
  const powerRatio = partyPower / Math.max(1, recommendedPower);

  if (powerRatio >= 2.0) return 'trivial';
  if (powerRatio >= 1.5) return 'easy';
  if (powerRatio >= 1.1) return 'moderate';
  if (powerRatio >= 0.9) return 'challenging';
  if (powerRatio >= 0.6) return 'deadly';
  return 'impossible';
}

/**
 * Get color and emoji for difficulty
 */
export function getDifficultyDisplay(difficulty) {
  const displays = {
    trivial: { color: '#64748b', emoji: '😴', label: 'Trivial' },
    easy: { color: '#10b981', emoji: '✅', label: 'Easy' },
    moderate: { color: '#3b82f6', emoji: '⚔️', label: 'Moderate' },
    challenging: { color: '#f59e0b', emoji: '⚠️', label: 'Challenging' },
    deadly: { color: '#ef4444', emoji: '💀', label: 'Deadly' },
    impossible: { color: '#7c3aed', emoji: '☠️', label: 'Impossible' }
  };

  return displays[difficulty] || displays.moderate;
}

/**
 * Calculate recommended dungeon based on party power
 * @param {Array} availableDungeons - List of dungeon templates
 * @returns {Object} - Best recommended dungeon
 */
export function getRecommendedDungeon(availableDungeons) {
  const partyPower = calculatePartyPower();

  // Find dungeons where party power is 90-120% of recommended
  const goodMatches = availableDungeons.filter(dungeon => {
    const recPower = dungeon.recommendedPartyPower || 100;
    const ratio = partyPower / recPower;
    return ratio >= 0.9 && ratio <= 1.2;
  });

  if (goodMatches.length > 0) {
    return goodMatches[0];
  }

  // If no good matches, find closest
  let closest = availableDungeons[0];
  let closestDiff = Infinity;

  for (const dungeon of availableDungeons) {
    const recPower = dungeon.recommendedPartyPower || 100;
    const diff = Math.abs(partyPower - recPower);
    if (diff < closestDiff) {
      closestDiff = diff;
      closest = dungeon;
    }
  }

  return closest;
}

/**
 * Calculate sigil score for prestige (based on highest wave and dungeon tier)
 * @param {number} highestWave - Highest wave reached
 * @param {number} highestDungeonTier - Highest dungeon difficulty tier cleared
 * @returns {number} - Sigil score
 */
export function calculateSigilScore(highestWave, highestDungeonTier) {
  const baseScore = highestWave * 10;
  const tierMultiplier = 1 + (highestDungeonTier * 0.5);
  return Math.floor(baseScore * tierMultiplier);
}
