// ===== Resource Manager =====
// Centralized management for all game currencies and resources

import { eventBus, EVENTS } from './eventBus.js';

export class ResourceManager {
  constructor(gameState) {
    this.state = gameState;
    this.generationRates = {
      cpuCycles: 1, // Base: 1 per second
    };
  }

  /**
   * Add resources to the game state
   * @param {string} resourceType - Type of resource
   * @param {number} amount - Amount to add
   * @param {string} source - Source of the resource (for tracking)
   */
  add(resourceType, amount, source = 'unknown') {
    if (this.state.resources[resourceType] === undefined) {
      console.error(`Unknown resource type: ${resourceType}`);
      return false;
    }

    const oldValue = this.state.resources[resourceType];
    this.state.resources[resourceType] += amount;

    // Emit event
    eventBus.emit(EVENTS.RESOURCE_CHANGED, {
      resourceType,
      amount,
      oldValue,
      newValue: this.state.resources[resourceType],
      source
    });

    return true;
  }

  /**
   * Remove resources from the game state
   * @param {string} resourceType - Type of resource
   * @param {number} amount - Amount to remove
   * @param {boolean} force - Force removal even if insufficient
   * @returns {boolean} Success
   */
  spend(resourceType, amount, force = false) {
    if (this.state.resources[resourceType] === undefined) {
      console.error(`Unknown resource type: ${resourceType}`);
      return false;
    }

    if (!force && this.state.resources[resourceType] < amount) {
      eventBus.emit(EVENTS.RESOURCE_INSUFFICIENT, {
        resourceType,
        required: amount,
        available: this.state.resources[resourceType]
      });
      return false;
    }

    const oldValue = this.state.resources[resourceType];
    this.state.resources[resourceType] = Math.max(0, this.state.resources[resourceType] - amount);

    eventBus.emit(EVENTS.RESOURCE_CHANGED, {
      resourceType,
      amount: -amount,
      oldValue,
      newValue: this.state.resources[resourceType],
      source: 'spend'
    });

    return true;
  }

  /**
   * Check if player has enough resources
   * @param {Object} costs - Resource costs {gold: 100, cpuCycles: 50}
   * @returns {boolean} Can afford
   */
  canAfford(costs) {
    for (const [resource, amount] of Object.entries(costs)) {
      if (this.state.resources[resource] === undefined || this.state.resources[resource] < amount) {
        return false;
      }
    }
    return true;
  }

  /**
   * Spend multiple resources at once
   * @param {Object} costs - Resource costs
   * @returns {boolean} Success
   */
  spendMultiple(costs) {
    // Check if can afford first
    if (!this.canAfford(costs)) {
      return false;
    }

    // Spend all resources
    for (const [resource, amount] of Object.entries(costs)) {
      this.spend(resource, amount);
    }

    return true;
  }

  /**
   * Get current amount of a resource
   * @param {string} resourceType - Resource type
   * @returns {number} Current amount
   */
  get(resourceType) {
    return this.state.resources[resourceType] || 0;
  }

  /**
   * Get all resources
   * @returns {Object} All resources
   */
  getAll() {
    return { ...this.state.resources };
  }

  /**
   * Calculate resource generation per second
   * @param {string} resourceType - Resource type
   * @returns {number} Per second rate
   */
  getGenerationRate(resourceType) {
    let baseRate = this.generationRates[resourceType] || 0;

    // Apply multipliers from upgrades
    if (resourceType === 'gold') {
      const goldMult = 1 + (this.state.upgrades.goldMultiplier * 0.1);
      baseRate *= goldMult;
    }

    if (resourceType === 'cpuCycles') {
      // CPU can be boosted by research
      const cpuBoost = this.state.research.cpuBoost || 0;
      baseRate += cpuBoost;
    }

    return baseRate;
  }

  /**
   * Generate passive resources
   * Called every game tick
   */
  tick(deltaTime = 1) {
    // CPU Cycles regenerate automatically
    const cpuRate = this.getGenerationRate('cpuCycles');
    if (cpuRate > 0) {
      this.add('cpuCycles', cpuRate * deltaTime, 'passive_generation');
    }

    // Gold from combat is handled by combat engine
  }

  /**
   * Format resource amount for display
   * @param {number} amount - Amount
   * @param {boolean} abbreviate - Use K/M/B abbreviations
   * @returns {string} Formatted string
   */
  static format(amount, abbreviate = true) {
    if (!abbreviate) {
      return Math.floor(amount).toLocaleString();
    }

    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(2) + 'B';
    }
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(2) + 'M';
    }
    if (amount >= 1000) {
      return (amount / 1000).toFixed(2) + 'K';
    }
    return Math.floor(amount).toString();
  }
}

// ===== Resource Definitions =====
export const RESOURCE_INFO = {
  gold: {
    name: 'Gold',
    icon: '💰',
    description: 'Standard currency for purchases',
    color: '#f59e0b'
  },
  codeFragments: {
    name: 'Code Fragments',
    icon: '📜',
    description: 'Obtained from recycling and bug fixes',
    color: '#10b981'
  },
  memoryBlocks: {
    name: 'Memory Blocks',
    icon: '🧱',
    description: 'Scarce storage resources from defragmentation',
    color: '#3b82f6'
  },
  cpuCycles: {
    name: 'CPU Cycles',
    icon: '⚡',
    description: 'Regenerating computational power',
    color: '#a855f7'
  },
  entropyDust: {
    name: 'Entropy Dust',
    icon: '✨',
    description: 'Late-game upgrade material from malware',
    color: '#ef4444'
  }
};
