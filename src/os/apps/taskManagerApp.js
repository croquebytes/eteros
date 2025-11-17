// ===== Task Manager App =====
// AFK Dispatch Mission Management

import { gameState } from '../../state/enhancedGameState.js';
import { DISPATCH_TEMPLATES } from '../../state/dispatchTemplates.js';
import { startDispatch, getAvailableSlots, getDispatchTimeRemaining, formatTimeRemaining } from '../../state/dispatchSystem.js';
import { canSendOnDispatch } from '../../state/heroSystem.js';

export const taskManagerAppNew = {
  id: 'taskManager',
  title: 'Task Manager.exe',

  createContent(rootEl) {
    rootEl.innerHTML = `
      <div class="task-manager-container">
        <div class="task-header">
          <h2>Task Manager</h2>
          <p>Assign heroes to AFK dispatch missions</p>
          <div class="slots-display">
            Available Slots: <strong id="available-slots">${getAvailableSlots(gameState)}</strong> / ${gameState.dispatchState.maxSlots}
          </div>
        </div>

        <div class="task-tabs">
          <button class="task-tab active" data-tab="active">Active Dispatches</button>
          <button class="task-tab" data-tab="available">Available Missions</button>
          <button class="task-tab" data-tab="completed">Completed</button>
        </div>

        <div class="task-content">
          <div class="task-panel active" id="panel-active">
            <!-- Active dispatches will be loaded here -->
          </div>

          <div class="task-panel" id="panel-available">
            <!-- Available missions will be loaded here -->
          </div>

          <div class="task-panel" id="panel-completed">
            <!-- Completed dispatches will be loaded here -->
          </div>
        </div>
      </div>
    `;

    // Tab switching
    const tabs = rootEl.querySelectorAll('.task-tab');
    const panels = rootEl.querySelectorAll('.task-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;

        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        rootEl.querySelector(`#panel-${targetTab}`).classList.add('active');

        // Load content for the selected tab
        if (targetTab === 'active') {
          loadActiveDispatches(rootEl);
        } else if (targetTab === 'available') {
          loadAvailableMissions(rootEl);
        } else if (targetTab === 'completed') {
          loadCompletedDispatches(rootEl);
        }
      });
    });

    // Load initial content
    loadActiveDispatches(rootEl);

    // Set up auto-refresh for active dispatches
    const refreshInterval = setInterval(() => {
      if (rootEl.querySelector('#panel-active').classList.contains('active')) {
        loadActiveDispatches(rootEl);
      }
    }, 1000);

    // Clean up interval when window closes (store in rootEl)
    rootEl._refreshInterval = refreshInterval;
  }
};

function loadActiveDispatches(rootEl) {
  const panel = rootEl.querySelector('#panel-active');

  if (gameState.dispatchState.activeDispatches.length === 0) {
    panel.innerHTML = '<p class="empty-message">No active dispatches. Start a new mission!</p>';
    return;
  }

  panel.innerHTML = gameState.dispatchState.activeDispatches.map(dispatch => {
    const timeRemaining = getDispatchTimeRemaining(dispatch);
    const progress = ((dispatch.template.duration - timeRemaining) / dispatch.template.duration) * 100;
    const heroes = gameState.heroes.filter(h => dispatch.heroes.includes(h.id));

    return `
      <div class="dispatch-card active-dispatch">
        <div class="dispatch-header">
          <h3>${dispatch.template.name}</h3>
          <span class="dispatch-tier">Tier ${dispatch.template.tier}</span>
        </div>
        <p class="dispatch-description">${dispatch.template.description}</p>

        <div class="dispatch-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <span class="time-remaining">${formatTimeRemaining(timeRemaining)}</span>
        </div>

        <div class="dispatch-heroes">
          <strong>Heroes:</strong>
          ${heroes.map(h => `<span class="hero-tag">${h.name} (Lv.${h.level})</span>`).join(' ')}
        </div>

        <div class="dispatch-success">
          <strong>Success Rate:</strong> ${(dispatch.successRate * 100).toFixed(1)}%
        </div>
      </div>
    `;
  }).join('');

  // Update slots display
  updateSlotsDisplay(rootEl);
}

function loadAvailableMissions(rootEl) {
  const panel = rootEl.querySelector('#panel-available');

  // Get available missions based on player progress
  const availableMissions = Object.values(DISPATCH_TEMPLATES).filter(template => {
    // Check if player has any hero at required level
    const maxHeroLevel = Math.max(...gameState.heroes.map(h => h.level));
    return maxHeroLevel >= template.requiredLevel;
  });

  if (availableMissions.length === 0) {
    panel.innerHTML = '<p class="empty-message">No available missions. Level up your heroes!</p>';
    return;
  }

  panel.innerHTML = availableMissions.map(template => `
    <div class="dispatch-card available-dispatch">
      <div class="dispatch-header">
        <h3>${template.name}</h3>
        <span class="dispatch-tier">Tier ${template.tier}</span>
      </div>
      <p class="dispatch-description">${template.description}</p>

      <div class="dispatch-requirements">
        <strong>Requirements:</strong>
        <ul>
          <li>Heroes: ${template.requiredHeroes}</li>
          <li>Level: ${template.requiredLevel}+</li>
          ${template.roleRequirements.length > 0 ? `<li>Roles: ${template.roleRequirements.map(r => `${r.count}× ${r.role}`).join(', ')}</li>` : ''}
          <li>Duration: ${formatTimeRemaining(template.duration)}</li>
        </ul>
      </div>

      <div class="dispatch-rewards">
        <strong>Success Rewards:</strong>
        <ul>
          ${template.rewards.onSuccess.gold ? `<li>Gold: ${template.rewards.onSuccess.gold}</li>` : ''}
          ${template.rewards.onSuccess.xp ? `<li>XP: ${template.rewards.onSuccess.xp}</li>` : ''}
          ${template.rewards.onSuccess.items && template.rewards.onSuccess.items.length > 0 ?
            `<li>Items: ${template.rewards.onSuccess.items.map(i => i.itemId).join(', ')}</li>` : ''}
        </ul>
      </div>

      <button class="start-dispatch-btn" data-dispatch-id="${template.id}">Start Dispatch</button>
    </div>
  `).join('');

  // Add event listeners for start dispatch buttons
  const startButtons = panel.querySelectorAll('.start-dispatch-btn');
  startButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const dispatchId = btn.dataset.dispatchId;
      openHeroSelection(rootEl, dispatchId);
    });
  });
}

function loadCompletedDispatches(rootEl) {
  const panel = rootEl.querySelector('#panel-completed');

  if (gameState.dispatchState.completedDispatches.length === 0) {
    panel.innerHTML = '<p class="empty-message">No completed dispatches yet.</p>';
    return;
  }

  // Show last 10 completed dispatches
  const recent = gameState.dispatchState.completedDispatches.slice(-10).reverse();

  panel.innerHTML = recent.map(dispatch => {
    const outcome = dispatch.result.outcome;
    const outcomeClass = outcome === 'success' ? 'success' : outcome === 'partial' ? 'partial' : 'failure';
    const outcomeText = outcome === 'success' ? 'SUCCESS' : outcome === 'partial' ? 'PARTIAL SUCCESS' : 'FAILURE';

    return `
      <div class="dispatch-card completed-dispatch ${outcomeClass}">
        <div class="dispatch-header">
          <h3>${dispatch.template.name}</h3>
          <span class="outcome-badge ${outcomeClass}">${outcomeText}</span>
        </div>

        <div class="dispatch-rewards-received">
          <strong>Rewards:</strong>
          <ul>
            ${dispatch.result.rewards.gold ? `<li>+${dispatch.result.rewards.gold} Gold</li>` : ''}
            ${dispatch.result.rewards.xp ? `<li>+${dispatch.result.rewards.xp} XP</li>` : ''}
            ${dispatch.result.rewards.items && dispatch.result.rewards.items.length > 0 ?
              `<li>${dispatch.result.rewards.items.length} items</li>` : ''}
          </ul>
        </div>
      </div>
    `;
  }).join('');
}

function openHeroSelection(rootEl, dispatchId) {
  const template = DISPATCH_TEMPLATES[dispatchId];

  // Create hero selection modal
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';

  const availableHeroes = gameState.heroes.filter(h => {
    const canSend = canSendOnDispatch(h);
    return canSend.canSend && h.level >= template.requiredLevel;
  });

  modal.innerHTML = `
    <div class="modal-content hero-selection-modal">
      <h2>Select Heroes for ${template.name}</h2>
      <p>Required: ${template.requiredHeroes} heroes (Level ${template.requiredLevel}+)</p>
      ${template.roleRequirements.length > 0 ?
        `<p>Role Requirements: ${template.roleRequirements.map(r => `${r.count}× ${r.role}`).join(', ')}</p>` : ''}

      <div class="hero-selection-grid">
        ${availableHeroes.map(hero => `
          <div class="hero-selection-card" data-hero-id="${hero.id}">
            <input type="checkbox" id="hero-${hero.id}" class="hero-checkbox">
            <label for="hero-${hero.id}">
              <div class="hero-info">
                <span class="hero-name">${hero.name}</span>
                <span class="hero-level">Lv.${hero.level}</span>
                <span class="hero-role">${hero.role}</span>
              </div>
              <div class="hero-stats">
                HP: ${hero.currentStats.hp} | ATK: ${hero.currentStats.atk} | DEF: ${hero.currentStats.def}
              </div>
            </label>
          </div>
        `).join('')}
      </div>

      <div class="modal-actions">
        <button id="confirm-dispatch">Start Dispatch</button>
        <button id="cancel-selection">Cancel</button>
      </div>
    </div>
  `;

  rootEl.appendChild(modal);

  // Event listeners
  const confirmBtn = modal.querySelector('#confirm-dispatch');
  const cancelBtn = modal.querySelector('#cancel-selection');

  confirmBtn.addEventListener('click', () => {
    const selectedCheckboxes = modal.querySelectorAll('.hero-checkbox:checked');
    const selectedHeroIds = Array.from(selectedCheckboxes).map(cb => cb.id.replace('hero-', ''));
    const selectedHeroes = gameState.heroes.filter(h => selectedHeroIds.includes(h.id));

    if (selectedHeroes.length < template.requiredHeroes) {
      alert(`You need to select at least ${template.requiredHeroes} heroes.`);
      return;
    }

    // Start the dispatch
    const result = startDispatch(template, selectedHeroes, gameState);

    if (result.success) {
      alert(`Dispatch started! Success rate: ${(result.successRate * 100).toFixed(1)}%`);
      modal.remove();
      loadActiveDispatches(rootEl);
      updateSlotsDisplay(rootEl);
    } else {
      alert(`Failed to start dispatch: ${result.error}`);
    }
  });

  cancelBtn.addEventListener('click', () => {
    modal.remove();
  });
}

function updateSlotsDisplay(rootEl) {
  const slotsDisplay = rootEl.querySelector('#available-slots');
  if (slotsDisplay) {
    slotsDisplay.textContent = getAvailableSlots(gameState);
  }
}
