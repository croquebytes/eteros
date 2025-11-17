// ===== Dispatch System =====
// AFK mission management

import { DISPATCH_TEMPLATES, calculateDispatchSuccessRate } from './dispatchTemplates.js';
import { returnHeroFromDispatch, addXpToHero } from './heroSystem.js';
import { SOULWARE_TEMPLATES } from './soulwareTemplates.js';

// Dispatch State (to be stored in gameState)
export function createDispatchState() {
  return {
    activeDispatches: [],
    completedDispatches: [],
    maxSlots: 4,  // Increases with prestige
    dailyAttempts: {}
  };
}

// Create a new dispatch mission
export function startDispatch(dispatch, heroes, gameState) {
  const template = DISPATCH_TEMPLATES[dispatch.id] || dispatch;

  // Validation
  if (heroes.length < template.requiredHeroes) {
    return { success: false, error: `Requires at least ${template.requiredHeroes} heroes` };
  }

  if (gameState.dispatchState.activeDispatches.length >= gameState.dispatchState.maxSlots) {
    return { success: false, error: 'All dispatch slots are full' };
  }

  // Check hero requirements
  for (const hero of heroes) {
    if (hero.level < template.requiredLevel) {
      return { success: false, error: `${hero.name} is below the required level (${template.requiredLevel})` };
    }

    if (hero.onDispatch) {
      return { success: false, error: `${hero.name} is already on a dispatch` };
    }

    if (hero.fatigued && hero.fatigueEndTime > Date.now()) {
      return { success: false, error: `${hero.name} is fatigued` };
    }
  }

  // Check role requirements
  if (template.roleRequirements && template.roleRequirements.length > 0) {
    for (const roleReq of template.roleRequirements) {
      const roleCount = heroes.filter(h => h.role === roleReq.role).length;
      if (roleCount < roleReq.count) {
        return { success: false, error: `Requires ${roleReq.count} ${roleReq.role} heroes` };
      }
    }
  }

  // Calculate success rate
  const successRate = calculateDispatchSuccessRate(heroes, template);

  // Create dispatch instance
  const dispatchInstance = {
    id: `dispatch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    templateId: template.id,
    template,
    heroes: heroes.map(h => h.id),
    startTime: Date.now(),
    endTime: Date.now() + template.duration,
    successRate,
    completed: false
  };

  // Mark heroes as on dispatch
  for (const hero of heroes) {
    hero.onDispatch = true;
    hero.dispatchId = dispatchInstance.id;
    hero.dispatchEndTime = dispatchInstance.endTime;
  }

  // Add to active dispatches
  gameState.dispatchState.activeDispatches.push(dispatchInstance);

  return { success: true, dispatch: dispatchInstance, successRate };
}

// Check and complete finished dispatches
export function updateDispatches(gameState) {
  const now = Date.now();
  const completedDispatches = [];

  for (const dispatch of gameState.dispatchState.activeDispatches) {
    if (now >= dispatch.endTime && !dispatch.completed) {
      // Complete the dispatch
      const result = completeDispatch(dispatch, gameState);
      completedDispatches.push({ dispatch, result });
      dispatch.completed = true;
    }
  }

  // Remove completed dispatches from active list
  gameState.dispatchState.activeDispatches = gameState.dispatchState.activeDispatches.filter(d => !d.completed);

  // Add to completed list
  gameState.dispatchState.completedDispatches.push(...completedDispatches.map(c => ({
    ...c.dispatch,
    result: c.result
  })));

  return completedDispatches;
}

// Complete a dispatch and roll rewards
function completeDispatch(dispatch, gameState) {
  const template = dispatch.template;
  const heroes = gameState.heroes.filter(h => dispatch.heroes.includes(h.id));

  // Roll for success
  const roll = Math.random();
  let outcome;
  let rewards;

  if (roll <= dispatch.successRate) {
    outcome = 'success';
    rewards = { ...template.rewards.onSuccess };
  } else if (roll <= dispatch.successRate + 0.20) {
    outcome = 'partial';
    rewards = { ...template.rewards.onPartialSuccess };
  } else {
    outcome = 'failure';
    rewards = { ...template.rewards.onFailure };
  }

  // Apply rewards
  if (rewards.gold) {
    gameState.gold += rewards.gold;
  }

  if (rewards.xp) {
    // Distribute XP to heroes
    const xpPerHero = Math.floor(rewards.xp / heroes.length);
    for (const hero of heroes) {
      addXpToHero(hero, xpPerHero);
    }
  }

  if (rewards.items && rewards.items.length > 0) {
    for (const itemReward of rewards.items) {
      const dropRoll = Math.random();
      if (dropRoll <= itemReward.dropRate) {
        // Add item to inventory
        const itemTemplate = SOULWARE_TEMPLATES[itemReward.itemId];
        if (itemTemplate) {
          const item = createItemInstance(itemTemplate);
          gameState.inventory.push(item);
        }
      }
    }
  }

  if (rewards.currencies) {
    for (const currency in rewards.currencies) {
      if (!gameState.currencies) {
        gameState.currencies = {};
      }
      gameState.currencies[currency] = (gameState.currencies[currency] || 0) + rewards.currencies[currency];
    }
  }

  // Return heroes from dispatch
  for (const hero of heroes) {
    returnHeroFromDispatch(hero, outcome !== 'failure');
  }

  // Apply fatigue on failure
  if (outcome === 'failure' && template.failurePenalty.fatigue) {
    for (const hero of heroes) {
      hero.fatigued = true;
      hero.fatigueEndTime = Date.now() + template.failurePenalty.debuff.duration;
    }
  }

  return {
    outcome,
    rewards,
    successRate: dispatch.successRate
  };
}

// Create item instance from template
function createItemInstance(template) {
  return {
    id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    templateId: template.id,
    ...template,
    equipped: false,
    equippedHeroId: null
  };
}

// Cancel an active dispatch (loses rewards, heroes return fatigued)
export function cancelDispatch(dispatchId, gameState) {
  const dispatch = gameState.dispatchState.activeDispatches.find(d => d.id === dispatchId);
  if (!dispatch) {
    return { success: false, error: 'Dispatch not found' };
  }

  // Return heroes fatigued
  const heroes = gameState.heroes.filter(h => dispatch.heroes.includes(h.id));
  for (const hero of heroes) {
    returnHeroFromDispatch(hero, false);
  }

  // Remove from active dispatches
  gameState.dispatchState.activeDispatches = gameState.dispatchState.activeDispatches.filter(d => d.id !== dispatchId);

  return { success: true };
}

// Get available dispatch slots
export function getAvailableSlots(gameState) {
  return gameState.dispatchState.maxSlots - gameState.dispatchState.activeDispatches.length;
}

// Get time remaining for a dispatch (in milliseconds)
export function getDispatchTimeRemaining(dispatch) {
  const remaining = dispatch.endTime - Date.now();
  return Math.max(0, remaining);
}

// Format time remaining as string
export function formatTimeRemaining(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}
