// ===== Modal Manager =====
// Full-screen modal dialogs for important notifications (offline progress, level-ups, etc.)

let currentModal = null;

/**
 * Show offline progress modal with rewards summary
 * @param {Object} rewards - { waves, gold, xp, duration }
 */
export function showOfflineProgressModal(rewards) {
  if (!rewards || rewards.waves === 0) return;

  const modal = createModal('offline-progress');

  const content = `
    <div class="modal-content offline-progress-modal">
      <div class="modal-header">
        <h2>⏰ Welcome Back!</h2>
        <button class="modal-close" aria-label="Close">×</button>
      </div>
      <div class="modal-body">
        <div class="offline-summary">
          <p class="offline-duration">You were offline for <strong>${formatDuration(rewards.duration)}</strong></p>
          <div class="offline-rewards">
            <div class="reward-item">
              <div class="reward-icon">🌊</div>
              <div class="reward-value">+${rewards.waves.toLocaleString()}</div>
              <div class="reward-label">Waves Cleared</div>
            </div>
            <div class="reward-item">
              <div class="reward-icon">💰</div>
              <div class="reward-value">+${rewards.gold.toLocaleString()}</div>
              <div class="reward-label">Gold Earned</div>
            </div>
            <div class="reward-item">
              <div class="reward-icon">⭐</div>
              <div class="reward-value">+${rewards.xp.toLocaleString()}</div>
              <div class="reward-label">XP Gained</div>
            </div>
          </div>
          ${rewards.items && rewards.items.length > 0 ? `
            <div class="offline-items">
              <h3>Items Found:</h3>
              <div class="item-list">
                ${rewards.items.map(item => `
                  <div class="item-chip rarity-${item.rarity}">
                    ${item.name}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
      <div class="modal-footer">
        <button class="modal-btn modal-btn-primary">Continue Adventure</button>
      </div>
    </div>
  `;

  modal.innerHTML = content;
  document.body.appendChild(modal);

  // Animate in
  setTimeout(() => modal.classList.add('modal-visible'), 10);

  // Close handlers
  const closeBtn = modal.querySelector('.modal-close');
  const continueBtn = modal.querySelector('.modal-btn-primary');

  const closeModal = () => dismissModal(modal);

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (continueBtn) continueBtn.addEventListener('click', closeModal);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on Escape key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  currentModal = modal;
  return modal;
}

/**
 * Show a generic modal dialog
 * @param {string} title - Modal title
 * @param {string} bodyHTML - HTML content for modal body
 * @param {Array} buttons - Array of {label, onClick, primary} button configs
 */
export function showModal(title, bodyHTML, buttons = []) {
  const modal = createModal('generic');

  const buttonsHTML = buttons.length > 0
    ? buttons.map(btn => `
        <button class="modal-btn ${btn.primary ? 'modal-btn-primary' : 'modal-btn-secondary'}">
          ${btn.label}
        </button>
      `).join('')
    : '<button class="modal-btn modal-btn-primary">OK</button>';

  const content = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${title}</h2>
        <button class="modal-close" aria-label="Close">×</button>
      </div>
      <div class="modal-body">
        ${bodyHTML}
      </div>
      <div class="modal-footer">
        ${buttonsHTML}
      </div>
    </div>
  `;

  modal.innerHTML = content;
  document.body.appendChild(modal);

  setTimeout(() => modal.classList.add('modal-visible'), 10);

  // Wire up buttons
  const modalBtns = modal.querySelectorAll('.modal-btn');
  modalBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      if (buttons[index] && buttons[index].onClick) {
        buttons[index].onClick();
      }
      dismissModal(modal);
    });
  });

  // Close button
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => dismissModal(modal));
  }

  // Backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      dismissModal(modal);
    }
  });

  // Escape key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      dismissModal(modal);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  currentModal = modal;
  return modal;
}

/**
 * Create modal backdrop element
 */
function createModal(type) {
  const modal = document.createElement('div');
  modal.className = `modal modal-${type}`;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  return modal;
}

/**
 * Dismiss the current modal
 */
function dismissModal(modal) {
  if (!modal) return;

  modal.classList.remove('modal-visible');
  modal.classList.add('modal-dismissing');

  setTimeout(() => {
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
    if (currentModal === modal) {
      currentModal = null;
    }
  }, 300);
}

/**
 * Get current modal (if any)
 */
export function getCurrentModal() {
  return currentModal;
}

/**
 * Close current modal
 */
export function closeCurrentModal() {
  if (currentModal) {
    dismissModal(currentModal);
  }
}

/**
 * Format duration in human-readable format
 */
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return days === 1
      ? `1 day${remainingHours > 0 ? ` and ${remainingHours}h` : ''}`
      : `${days} days${remainingHours > 0 ? ` and ${remainingHours}h` : ''}`;
  } else if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return hours === 1
      ? `1 hour${remainingMinutes > 0 ? ` and ${remainingMinutes}m` : ''}`
      : `${hours} hours${remainingMinutes > 0 ? ` and ${remainingMinutes}m` : ''}`;
  } else if (minutes > 0) {
    return minutes === 1 ? '1 minute' : `${minutes} minutes`;
  } else {
    return seconds === 1 ? '1 second' : `${seconds} seconds`;
  }
}
