// ===== Research Lab App =====
// Tech tree and research system

import { gameState } from '../../state/gameState.js';
import { eventBus, EVENTS } from '../../state/eventBus.js';
import { RESOURCE_INFO } from '../../state/resourceManager.js';

// Research tree structure
export const RESEARCH_TREE = {
  // Tier 1 - Starting research
  cpu_optimization_1: {
    id: 'cpu_optimization_1',
    name: 'CPU Optimization I',
    description: 'Increase passive CPU cycle generation by 50%',
    tier: 1,
    cost: { codeFragments: 50, cpuCycles: 100 },
    duration: 30000, // 30 seconds
    prerequisites: [],
    unlocks: ['cpu_optimization_2'],
    effect: { cpuGenerationMultiplier: 1.5 }
  },
  memory_management_1: {
    id: 'memory_management_1',
    name: 'Memory Management I',
    description: 'Unlock Memory Block generation',
    tier: 1,
    cost: { codeFragments: 75, cpuCycles: 150 },
    duration: 45000,
    prerequisites: [],
    unlocks: ['memory_management_2', 'cache_coherency'],
    effect: { unlockMemoryGeneration: true }
  },
  combat_algorithms_1: {
    id: 'combat_algorithms_1',
    name: 'Combat Algorithms I',
    description: 'Increase hero damage by 20%',
    tier: 1,
    cost: { codeFragments: 100, cpuCycles: 200 },
    duration: 60000,
    prerequisites: [],
    unlocks: ['combat_algorithms_2'],
    effect: { heroDamageMultiplier: 1.2 }
  },

  // Tier 2 - Intermediate research
  cpu_optimization_2: {
    id: 'cpu_optimization_2',
    name: 'CPU Optimization II',
    description: 'Further increase CPU cycle generation by 100%',
    tier: 2,
    cost: { codeFragments: 150, memoryBlocks: 10, cpuCycles: 500 },
    duration: 90000,
    prerequisites: ['cpu_optimization_1'],
    unlocks: ['cpu_optimization_3', 'parallel_processing'],
    effect: { cpuGenerationMultiplier: 2.0 }
  },
  memory_management_2: {
    id: 'memory_management_2',
    name: 'Memory Management II',
    description: 'Increase Memory Block generation by 50%',
    tier: 2,
    cost: { codeFragments: 200, memoryBlocks: 15, cpuCycles: 600 },
    duration: 120000,
    prerequisites: ['memory_management_1'],
    unlocks: ['memory_management_3'],
    effect: { memoryGenerationMultiplier: 1.5 }
  },
  combat_algorithms_2: {
    id: 'combat_algorithms_2',
    name: 'Combat Algorithms II',
    description: 'Increase hero damage by 40%',
    tier: 2,
    cost: { codeFragments: 250, memoryBlocks: 20, cpuCycles: 750 },
    duration: 120000,
    prerequisites: ['combat_algorithms_1'],
    unlocks: ['combat_algorithms_3', 'critical_strike_theory'],
    effect: { heroDamageMultiplier: 1.4 }
  },
  cache_coherency: {
    id: 'cache_coherency',
    name: 'Cache Coherency',
    description: 'Heroes gain 15% faster attack speed',
    tier: 2,
    cost: { codeFragments: 175, memoryBlocks: 12, cpuCycles: 500 },
    duration: 90000,
    prerequisites: ['memory_management_1'],
    unlocks: ['advanced_caching'],
    effect: { heroAttackSpeedMultiplier: 1.15 }
  },

  // Tier 3 - Advanced research
  cpu_optimization_3: {
    id: 'cpu_optimization_3',
    name: 'CPU Optimization III',
    description: 'Triple CPU cycle generation',
    tier: 3,
    cost: { codeFragments: 500, memoryBlocks: 50, cpuCycles: 2000, entropyDust: 10 },
    duration: 300000,
    prerequisites: ['cpu_optimization_2'],
    unlocks: ['quantum_processing'],
    effect: { cpuGenerationMultiplier: 3.0 }
  },
  combat_algorithms_3: {
    id: 'combat_algorithms_3',
    name: 'Combat Algorithms III',
    description: 'Double hero damage',
    tier: 3,
    cost: { codeFragments: 750, memoryBlocks: 75, cpuCycles: 3000, entropyDust: 15 },
    duration: 360000,
    prerequisites: ['combat_algorithms_2'],
    unlocks: ['adaptive_combat'],
    effect: { heroDamageMultiplier: 2.0 }
  },
  parallel_processing: {
    id: 'parallel_processing',
    name: 'Parallel Processing',
    description: 'Can run 2 tasks simultaneously',
    tier: 3,
    cost: { codeFragments: 600, memoryBlocks: 60, cpuCycles: 2500, entropyDust: 12 },
    duration: 240000,
    prerequisites: ['cpu_optimization_2'],
    unlocks: ['distributed_computing'],
    effect: { maxConcurrentTasks: 2 }
  },
  critical_strike_theory: {
    id: 'critical_strike_theory',
    name: 'Critical Strike Theory',
    description: 'Heroes gain +10% critical strike chance',
    tier: 3,
    cost: { codeFragments: 700, memoryBlocks: 65, cpuCycles: 2750, entropyDust: 13 },
    duration: 300000,
    prerequisites: ['combat_algorithms_2'],
    unlocks: ['precision_algorithms'],
    effect: { heroCritChance: 0.1 }
  },

  // Tier 4 - Elite research
  quantum_processing: {
    id: 'quantum_processing',
    name: 'Quantum Processing',
    description: 'Unlock Quantum Bits currency and 5x CPU generation',
    tier: 4,
    cost: { codeFragments: 2000, memoryBlocks: 200, cpuCycles: 10000, entropyDust: 50 },
    duration: 600000,
    prerequisites: ['cpu_optimization_3', 'parallel_processing'],
    unlocks: [],
    effect: { cpuGenerationMultiplier: 5.0, unlockQuantumBits: true }
  },
  adaptive_combat: {
    id: 'adaptive_combat',
    name: 'Adaptive Combat AI',
    description: 'Heroes adapt to enemy types, +50% damage vs bosses',
    tier: 4,
    cost: { codeFragments: 2500, memoryBlocks: 250, cpuCycles: 12000, entropyDust: 60 },
    duration: 720000,
    prerequisites: ['combat_algorithms_3', 'critical_strike_theory'],
    unlocks: [],
    effect: { heroBossDamageMultiplier: 1.5 }
  }
};

export const researchLabApp = {
  id: 'researchLab',
  title: 'Research Lab – R&D.exe',

  createContent(rootEl) {
    render(rootEl);

    // Listen for research completion
    eventBus.on(EVENTS.RESEARCH_COMPLETED, () => render(rootEl));
    eventBus.on(EVENTS.RESOURCE_CHANGED, () => {
      // Only update cost displays, not full re-render
      updateCostDisplays(rootEl);
    });
  }
};

function render(rootEl) {
  const { completed, unlocked } = gameState.research;

  rootEl.innerHTML = `
    <div class="window-content research-lab">
      <div class="research-sidebar">
        <h2 class="window-subtitle">Research Progress</h2>
        <div class="research-stats">
          <div class="stat-row">
            <span class="stat-label">Completed:</span>
            <span class="stat-value">${completed.length}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Available:</span>
            <span class="stat-value">${getAvailableResearch().length}</span>
          </div>
        </div>

        <div class="research-filters">
          <h3 class="filter-title">Filter by Tier</h3>
          <div class="filter-buttons">
            <button class="filter-btn active" data-tier="all">All</button>
            <button class="filter-btn" data-tier="1">Tier 1</button>
            <button class="filter-btn" data-tier="2">Tier 2</button>
            <button class="filter-btn" data-tier="3">Tier 3</button>
            <button class="filter-btn" data-tier="4">Tier 4</button>
          </div>
        </div>

        <div class="research-legend">
          <h3 class="legend-title">Legend</h3>
          <div class="legend-item">
            <span class="legend-icon completed">✓</span>
            <span class="legend-text">Completed</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon available">○</span>
            <span class="legend-text">Available</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon locked">⊘</span>
            <span class="legend-text">Locked</span>
          </div>
        </div>
      </div>

      <div class="research-main">
        <h2 class="window-subtitle">Technology Tree</h2>
        <div id="research-tree" class="research-tree"></div>
      </div>
    </div>
  `;

  renderResearchTree(rootEl, 'all');

  // Add filter button handlers
  rootEl.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      rootEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tier = btn.dataset.tier;
      renderResearchTree(rootEl, tier);
    });
  });
}

function renderResearchTree(rootEl, tierFilter) {
  const treeContainer = rootEl.querySelector('#research-tree');
  if (!treeContainer) return;

  const { completed } = gameState.research;
  const available = getAvailableResearch();

  // Filter research by tier
  let researchList = Object.values(RESEARCH_TREE);
  if (tierFilter !== 'all') {
    researchList = researchList.filter(r => r.tier === parseInt(tierFilter));
  }

  // Group by tier
  const tierGroups = {};
  researchList.forEach(research => {
    if (!tierGroups[research.tier]) {
      tierGroups[research.tier] = [];
    }
    tierGroups[research.tier].push(research);
  });

  treeContainer.innerHTML = Object.entries(tierGroups)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([tier, items]) => `
      <div class="research-tier">
        <h3 class="tier-header">Tier ${tier}</h3>
        <div class="research-cards">
          ${items.map(research => renderResearchCard(research, completed, available)).join('')}
        </div>
      </div>
    `).join('');

  // Add click handlers for starting research
  treeContainer.querySelectorAll('.btn-start-research').forEach(btn => {
    btn.addEventListener('click', () => {
      const researchId = btn.dataset.researchId;
      startResearch(researchId);
      render(rootEl);
    });
  });
}

function renderResearchCard(research, completed, available) {
  const isCompleted = completed.includes(research.id);
  const isAvailable = available.some(r => r.id === research.id);
  const isLocked = !isCompleted && !isAvailable;

  const status = isCompleted ? 'completed' : isAvailable ? 'available' : 'locked';
  const statusIcon = isCompleted ? '✓' : isAvailable ? '○' : '⊘';

  const canAfford = isAvailable && checkCanAfford(research.cost);

  return `
    <div class="research-card ${status}" data-research-id="${research.id}">
      <div class="research-card-header">
        <span class="research-status-icon">${statusIcon}</span>
        <h4 class="research-name">${research.name}</h4>
      </div>
      <div class="research-description">${research.description}</div>

      ${!isCompleted ? `
        <div class="research-cost">
          <div class="cost-label">Cost:</div>
          ${renderCosts(research.cost, canAfford)}
        </div>
        <div class="research-duration">
          <span class="duration-icon">⏱</span>
          <span class="duration-text">${formatDuration(research.duration)}</span>
        </div>
      ` : ''}

      ${isCompleted ? `
        <div class="research-completed-badge">
          <span class="completed-icon">✓</span>
          <span class="completed-text">Researched</span>
        </div>
      ` : ''}

      ${isAvailable && !isCompleted ? `
        <button class="btn-start-research ${!canAfford ? 'disabled' : ''}"
                data-research-id="${research.id}"
                ${!canAfford ? 'disabled' : ''}>
          Start Research
        </button>
      ` : ''}

      ${isLocked ? `
        <div class="research-prerequisites">
          <div class="prereq-label">Requires:</div>
          ${research.prerequisites.map(prereqId => {
            const prereq = RESEARCH_TREE[prereqId];
            return `<div class="prereq-item">${prereq.name}</div>`;
          }).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function renderCosts(costs, canAfford) {
  return Object.entries(costs).map(([resource, amount]) => {
    const info = RESOURCE_INFO[resource];
    const current = gameState.resources[resource] || 0;
    const hasEnough = current >= amount;

    return `
      <div class="cost-item ${hasEnough ? 'affordable' : 'unaffordable'}">
        <span class="cost-icon">${info.icon}</span>
        <span class="cost-amount">${amount}</span>
        <span class="cost-name">${info.name}</span>
      </div>
    `;
  }).join('');
}

function checkCanAfford(costs) {
  return Object.entries(costs).every(([resource, amount]) => {
    return (gameState.resources[resource] || 0) >= amount;
  });
}

function getAvailableResearch() {
  const { completed } = gameState.research;

  return Object.values(RESEARCH_TREE).filter(research => {
    // Skip if already completed
    if (completed.includes(research.id)) return false;

    // Check if all prerequisites are met
    const prereqsMet = research.prerequisites.every(prereqId =>
      completed.includes(prereqId)
    );

    return prereqsMet;
  });
}

function startResearch(researchId) {
  const research = RESEARCH_TREE[researchId];
  if (!research) return;

  // Check if can afford
  if (!checkCanAfford(research.cost)) {
    console.warn('Cannot afford research:', research.name);
    return;
  }

  // Deduct costs
  Object.entries(research.cost).forEach(([resource, amount]) => {
    gameState.resources[resource] -= amount;
  });

  // Emit event (TaskScheduler should handle this via custom task)
  eventBus.emit(EVENTS.RESEARCH_STARTED, research);

  console.log(`Started research: ${research.name}`);

  // Schedule completion
  setTimeout(() => {
    completeResearch(researchId);
  }, research.duration);
}

function completeResearch(researchId) {
  const research = RESEARCH_TREE[researchId];
  if (!research) return;

  // Add to completed
  if (!gameState.research.completed.includes(researchId)) {
    gameState.research.completed.push(researchId);
  }

  // Apply effects
  applyResearchEffects(research);

  // Emit event
  eventBus.emit(EVENTS.RESEARCH_COMPLETED, research);

  console.log(`Completed research: ${research.name}`);
}

function applyResearchEffects(research) {
  const effects = research.effect;

  // Apply multipliers and bonuses
  if (effects.cpuGenerationMultiplier) {
    gameState.research.cpuBoost = (gameState.research.cpuBoost || 1) * effects.cpuGenerationMultiplier;
  }

  if (effects.heroDamageMultiplier) {
    gameState.research.heroDamageBoost = (gameState.research.heroDamageBoost || 1) * effects.heroDamageMultiplier;
  }

  if (effects.heroAttackSpeedMultiplier) {
    gameState.research.heroAttackSpeedBoost = (gameState.research.heroAttackSpeedBoost || 1) * effects.heroAttackSpeedMultiplier;
  }

  if (effects.heroCritChance) {
    gameState.research.heroCritBonus = (gameState.research.heroCritBonus || 0) + effects.heroCritChance;
  }

  if (effects.maxConcurrentTasks) {
    gameState.research.maxConcurrentTasks = effects.maxConcurrentTasks;
  }

  // Unlock features
  if (effects.unlockMemoryGeneration) {
    gameState.research.unlocked.push('memory_generation');
  }

  if (effects.unlockQuantumBits) {
    gameState.research.unlocked.push('quantum_bits');
  }

  console.log('Applied research effects:', effects);
}

function updateCostDisplays(rootEl) {
  // Update cost affordability without full re-render
  const cards = rootEl.querySelectorAll('.research-card');
  cards.forEach(card => {
    const researchId = card.dataset.researchId;
    const research = RESEARCH_TREE[researchId];
    if (!research) return;

    const canAfford = checkCanAfford(research.cost);
    const btn = card.querySelector('.btn-start-research');
    if (btn) {
      if (canAfford) {
        btn.classList.remove('disabled');
        btn.disabled = false;
      } else {
        btn.classList.add('disabled');
        btn.disabled = true;
      }
    }
  });
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}
