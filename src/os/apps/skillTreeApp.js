/**
 * Skill Tree App
 * UI for viewing and unlocking hero skill nodes
 */

import { SKILL_TREES, getNodeById, canUnlockNode } from '../../data/skillTrees.js';
import { gameState, getHeroById as getHeroByIdFromState, unlockHeroSkill } from '../../state/gameState.js';

export const skillTreeApp = {
  id: 'skillTreeApp',
  title: 'Skill Trees',
  selectedHeroId: null,
  resourceManager: null, // Will be set during initialization

  createContent(rootEl) {
    rootEl.innerHTML = `
      <div class="skill-tree-container">
        <!-- Header -->
        <div class="skill-tree-header">
          <h3>⚡ Hero Skill Trees</h3>
          <p class="skill-tree-subtitle">Unlock powerful abilities and passive bonuses</p>
        </div>

        <!-- Hero Selector -->
        <div class="skill-tree-section">
          <h4>Select Hero</h4>
          <div class="skill-tree-hero-selector" id="st-hero-selector">
            <!-- Heroes will be rendered here -->
          </div>
        </div>

        <!-- Selected Hero Info -->
        <div class="skill-tree-section" id="st-hero-info" style="display: none;">
          <div class="skill-tree-hero-panel">
            <div class="hero-panel-left">
              <h4 id="st-hero-name">Hero Name</h4>
              <div class="hero-panel-stats">
                <div class="stat-item">
                  <span class="stat-label">Level:</span>
                  <span id="st-hero-level">1</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Class:</span>
                  <span id="st-hero-class">Warrior</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Skill Points:</span>
                  <span id="st-hero-skillpoints" class="highlight">0</span>
                </div>
              </div>
            </div>
            <div class="hero-panel-right">
              <button id="st-btn-respec" class="btn-respec">
                Reset Skills (500 Gold)
              </button>
            </div>
          </div>
        </div>

        <!-- Skill Tree Display -->
        <div class="skill-tree-section" id="st-tree-display" style="display: none;">
          <div class="skill-tree-tabs" id="st-tabs">
            <!-- Branch tabs will be rendered here -->
          </div>
          <div class="skill-tree-grid" id="st-grid">
            <!-- Skill nodes will be rendered here -->
          </div>
        </div>

        <!-- Selected Node Detail -->
        <div class="skill-tree-section" id="st-node-detail" style="display: none;">
          <div class="node-detail-panel">
            <h4 id="st-node-name">Skill Name</h4>
            <p id="st-node-description">Skill description goes here</p>
            <div class="node-detail-cost" id="st-node-cost">
              <!-- Cost will be rendered here -->
            </div>
            <div class="node-detail-effects" id="st-node-effects">
              <!-- Effects will be rendered here -->
            </div>
            <div class="node-detail-actions">
              <button id="st-btn-unlock" class="btn-unlock">
                Unlock Skill
              </button>
              <div id="st-unlock-message" class="unlock-message"></div>
            </div>
          </div>
        </div>

        <!-- Help Text -->
        <div class="skill-tree-help">
          <small>
            💡 Click a hero to view their skill tree. Unlock skills to gain permanent stat bonuses and special effects.
            Each hero earns 1 skill point per level.
          </small>
        </div>
      </div>
    `;

    this.renderHeroSelector(rootEl);
    this.attachEventListeners(rootEl);
  },

  /**
   * Set resource manager reference
   */
  setResourceManager(rm) {
    this.resourceManager = rm;
  },

  /**
   * Render hero selector
   */
  renderHeroSelector(rootEl) {
    const selectorEl = rootEl.querySelector('#st-hero-selector');
    if (!selectorEl) return;

    // Get game state (assuming it's accessible globally or passed in)
    // For now, use placeholder - will be connected in integration phase
    const heroes = this.getHeroes();

    if (!heroes || heroes.length === 0) {
      selectorEl.innerHTML = '<p class="empty-state">No heroes available. Recruit heroes first!</p>';
      return;
    }

    selectorEl.innerHTML = '';

    heroes.forEach(hero => {
      const heroCard = document.createElement('div');
      heroCard.className = 'hero-card' + (this.selectedHeroId === hero.id ? ' hero-card-selected' : '');
      heroCard.dataset.heroId = hero.id;

      const className = this.getHeroClassName(hero);
      const skillPoints = hero.skillPoints || 0;
      const unlockedCount = hero.unlockedSkillNodes ? hero.unlockedSkillNodes.length : 0;

      heroCard.innerHTML = `
        <div class="hero-card-header">
          <span class="hero-card-name">${hero.name}</span>
          <span class="hero-card-level">Lv.${hero.level}</span>
        </div>
        <div class="hero-card-class">${className}</div>
        <div class="hero-card-skills">
          <span class="skill-points">${skillPoints} SP</span>
          <span class="skill-unlocked">${unlockedCount} unlocked</span>
        </div>
      `;

      heroCard.addEventListener('click', () => {
        this.selectHero(hero.id, rootEl);
      });

      selectorEl.appendChild(heroCard);
    });
  },

  /**
   * Select a hero and display their skill tree
   */
  selectHero(heroId, rootEl) {
    this.selectedHeroId = heroId;
    const hero = this.getHeroById(heroId);
    if (!hero) return;

    // Update hero selector styling
    rootEl.querySelectorAll('.hero-card').forEach(card => {
      card.classList.toggle('hero-card-selected', card.dataset.heroId === heroId);
    });

    // Show hero info panel
    const heroInfoEl = rootEl.querySelector('#st-hero-info');
    heroInfoEl.style.display = 'block';

    // Update hero info
    const className = this.getHeroClassName(hero);
    rootEl.querySelector('#st-hero-name').textContent = hero.name;
    rootEl.querySelector('#st-hero-level').textContent = hero.level;
    rootEl.querySelector('#st-hero-class').textContent = className;
    rootEl.querySelector('#st-hero-skillpoints').textContent = hero.skillPoints || 0;

    // Show skill tree display
    const treeDisplayEl = rootEl.querySelector('#st-tree-display');
    treeDisplayEl.style.display = 'block';

    // Render skill tree
    this.renderSkillTree(hero, rootEl);
  },

  /**
   * Render skill tree for selected hero
   */
  renderSkillTree(hero, rootEl) {
    const className = this.getHeroClassName(hero);
    const tree = SKILL_TREES[className];
    if (!tree) {
      console.warn(`No skill tree found for class: ${className}`);
      return;
    }

    // Render branch tabs
    this.renderBranchTabs(tree, rootEl);

    // Render skill grid (default to first branch)
    const firstBranchKey = Object.keys(tree.branches)[0];
    this.renderBranchNodes(tree, firstBranchKey, hero, rootEl);
  },

  /**
   * Render branch tabs
   */
  renderBranchTabs(tree, rootEl) {
    const tabsEl = rootEl.querySelector('#st-tabs');
    if (!tabsEl) return;

    tabsEl.innerHTML = '';

    Object.entries(tree.branches).forEach(([branchKey, branch], index) => {
      const tabBtn = document.createElement('button');
      tabBtn.className = 'skill-tree-tab' + (index === 0 ? ' tab-active' : '');
      tabBtn.dataset.branch = branchKey;
      tabBtn.textContent = branch.name;
      tabBtn.style.borderBottomColor = branch.color;

      tabBtn.addEventListener('click', () => {
        // Update tab styling
        rootEl.querySelectorAll('.skill-tree-tab').forEach(tab => {
          tab.classList.remove('tab-active');
        });
        tabBtn.classList.add('tab-active');

        // Render nodes for this branch
        const hero = this.getHeroById(this.selectedHeroId);
        this.renderBranchNodes(tree, branchKey, hero, rootEl);
      });

      tabsEl.appendChild(tabBtn);
    });
  },

  /**
   * Render skill nodes for a specific branch
   */
  renderBranchNodes(tree, branchKey, hero, rootEl) {
    const gridEl = rootEl.querySelector('#st-grid');
    if (!gridEl) return;

    const branch = tree.branches[branchKey];
    const nodes = branch.nodes;

    gridEl.innerHTML = '';

    // Calculate grid dimensions
    const maxRow = Math.max(...nodes.map(n => n.row));
    const maxCol = Math.max(...nodes.map(n => n.column));

    // Create grid
    gridEl.style.gridTemplateColumns = `repeat(${maxCol + 1}, 1fr)`;
    gridEl.style.gridTemplateRows = `repeat(${maxRow + 1}, auto)`;

    nodes.forEach(node => {
      const nodeEl = document.createElement('div');
      nodeEl.className = 'skill-node';
      nodeEl.style.gridColumn = node.column + 1;
      nodeEl.style.gridRow = node.row + 1;
      nodeEl.dataset.nodeId = node.id;

      // Determine node state
      const isUnlocked = hero.unlockedSkillNodes && hero.unlockedSkillNodes.includes(node.id);
      const canUnlock = canUnlockNode(hero, node);

      if (isUnlocked) {
        nodeEl.classList.add('node-unlocked');
      } else if (canUnlock.canUnlock) {
        nodeEl.classList.add('node-available');
      } else {
        nodeEl.classList.add('node-locked');
      }

      nodeEl.innerHTML = `
        <div class="node-icon">${isUnlocked ? '✓' : '◆'}</div>
        <div class="node-name">${node.name}</div>
        <div class="node-cost">${node.cost.skillPoints || 0} SP</div>
      `;

      // Click to show detail
      nodeEl.addEventListener('click', () => {
        this.showNodeDetail(node, hero, rootEl);
      });

      gridEl.appendChild(nodeEl);
    });
  },

  /**
   * Show node detail panel
   */
  showNodeDetail(node, hero, rootEl) {
    const detailEl = rootEl.querySelector('#st-node-detail');
    detailEl.style.display = 'block';

    // Update detail content
    rootEl.querySelector('#st-node-name').textContent = node.name;
    rootEl.querySelector('#st-node-description').textContent = node.description;

    // Cost
    const costEl = rootEl.querySelector('#st-node-cost');
    const costParts = [];
    if (node.cost.skillPoints) costParts.push(`${node.cost.skillPoints} Skill Points`);
    if (node.cost.gold) costParts.push(`${node.cost.gold} Gold`);
    if (node.cost.codeFragments) costParts.push(`${node.cost.codeFragments} Code Fragments`);
    costEl.innerHTML = `<strong>Cost:</strong> ${costParts.join(', ')}`;

    // Effects
    const effectsEl = rootEl.querySelector('#st-node-effects');
    effectsEl.innerHTML = '<strong>Effects:</strong><ul class="effects-list"></ul>';
    const effectsList = effectsEl.querySelector('.effects-list');

    Object.entries(node.effects).forEach(([key, value]) => {
      const li = document.createElement('li');
      li.textContent = this.formatEffect(key, value);
      effectsList.appendChild(li);
    });

    // Unlock button
    const unlockBtn = rootEl.querySelector('#st-btn-unlock');
    const unlockMsg = rootEl.querySelector('#st-unlock-message');
    unlockMsg.textContent = '';

    const isUnlocked = hero.unlockedSkillNodes && hero.unlockedSkillNodes.includes(node.id);
    const canUnlock = canUnlockNode(hero, node);

    if (isUnlocked) {
      unlockBtn.disabled = true;
      unlockBtn.textContent = 'Already Unlocked';
    } else if (canUnlock.canUnlock) {
      unlockBtn.disabled = false;
      unlockBtn.textContent = 'Unlock Skill';
      unlockBtn.onclick = () => {
        this.unlockNode(node, hero, rootEl);
      };
    } else {
      unlockBtn.disabled = true;
      unlockBtn.textContent = 'Cannot Unlock';
      unlockMsg.textContent = canUnlock.reason;
      unlockMsg.className = 'unlock-message error';
    }
  },

  /**
   * Unlock a skill node
   */
  unlockNode(node, hero, rootEl) {
    const result = unlockHeroSkill(hero.id, node);

    const unlockMsg = rootEl.querySelector('#st-unlock-message');

    if (result.success) {
      unlockMsg.textContent = result.message;
      unlockMsg.className = 'unlock-message success';

      // Refresh display
      setTimeout(() => {
        this.selectHero(hero.id, rootEl);
        this.renderHeroSelector(rootEl);
      }, 500);
    } else {
      unlockMsg.textContent = result.message;
      unlockMsg.className = 'unlock-message error';
    }
  },

  /**
   * Attach event listeners
   */
  attachEventListeners(rootEl) {
    // Respec button
    rootEl.querySelector('#st-btn-respec')?.addEventListener('click', () => {
      if (!this.selectedHeroId) return;

      const hero = getHeroById(this.selectedHeroId);
      if (!hero) return;

      if (confirm(`Reset all skills for ${hero.name}? This costs 500 gold and refunds all skill points.`)) {
        const canAfford = gameState.gold >= 500;
        if (!canAfford) {
          alert('Not enough gold to respec.');
          return;
        }

        gameState.gold -= 500;
        if (!hero.unlockedSkillNodes) hero.unlockedSkillNodes = [];
        hero.skillPoints = (hero.skillPoints || 0) + hero.unlockedSkillNodes.length;
        hero.unlockedSkillNodes = [];

        alert(`Skills reset! Refunded skill points to ${hero.skillPoints}.`);
        this.selectHero(hero.id, rootEl);
        this.renderHeroSelector(rootEl);
      }
    });
  },

  /**
   * Helper: Get heroes from game state
   * TODO: Connect to actual gameState in integration phase
   */
  getHeroes() {
    return gameState.heroes || [];
  },

  /**
   * Helper: Get hero by ID
   */
  getHeroById(heroId) {
    return getHeroByIdFromState(heroId);
  },

  /**
   * Helper: Get hero class name
   */
  getHeroClassName(hero) {
    if (hero.class) return hero.class;
    // Map template to class name
    // This is a simplification - in reality, we'd look up the template
    if (hero.templateId) {
      // Extract class from template ID (e.g., 'warrior_1' -> 'warrior')
      const parts = hero.templateId.split('_');
      return parts[0];
    }
    return 'warrior'; // fallback
  },

  /**
   * Helper: Format effect for display
   */
  formatEffect(key, value) {
    const formatMap = {
      attackMultiplier: (v) => `+${(v * 100).toFixed(0)}% Attack`,
      defenseMultiplier: (v) => `+${(v * 100).toFixed(0)}% Defense`,
      maxHpMultiplier: (v) => `+${(v * 100).toFixed(0)}% Max HP`,
      critChance: (v) => `+${(v * 100).toFixed(0)}% Crit Chance`,
      critMultiplier: (v) => `+${v.toFixed(1)}x Crit Damage`,
      goldBonus: (v) => `+${(v * 100).toFixed(0)}% Gold`,
      xpBonus: (v) => `+${(v * 100).toFixed(0)}% XP`,
      speedBonus: (v) => `+${(v * 100).toFixed(0)}% Speed`,
      dodgeChance: (v) => `+${(v * 100).toFixed(0)}% Dodge`,
      cooldownReduction: (v) => `${(v * 100).toFixed(0)}% Faster Cooldowns`,
      partyStatBonus: (v) => `+${(v * 100).toFixed(0)}% All Stats (Party)`,
      partyAttackBonus: (v) => `+${(v * 100).toFixed(0)}% Attack (Party)`,
      partyHpBonus: (v) => `+${(v * 100).toFixed(0)}% HP (Party)`,
      partyXpBonus: (v) => `+${(v * 100).toFixed(0)}% XP (Party)`,
      stunImmune: (v) => 'Immune to Stun',
      poisonImmune: (v) => 'Immune to Poison',
      aoeDamage: (v) => 'Abilities deal AoE damage',
      combatRegen: (v) => `Heal ${(v * 100).toFixed(0)}% HP every 5s`
    };

    const formatter = formatMap[key];
    if (formatter) {
      return formatter(value);
    }

    // Generic fallback
    if (typeof value === 'number') {
      return `${key}: +${value}`;
    } else {
      return `${key}: ${value}`;
    }
  }
};
