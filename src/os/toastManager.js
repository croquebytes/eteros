// ===== Toast Notification Manager =====
// In-game notification system (replaces browser alerts/prompts)

const toastContainer = createToastContainer();
const activeToasts = [];

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container';
  return container;
}

export function initToastManager() {
  document.body.appendChild(toastContainer);
}

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - 'info', 'success', 'warning', 'error', 'level-up', 'item'
 * @param {number} duration - Duration in ms (0 = permanent until dismissed)
 */
export function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = getToastIcon(type);
  const content = document.createElement('div');
  content.className = 'toast-content';
  content.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => dismissToast(toast));

  if (icon) {
    const iconEl = document.createElement('div');
    iconEl.className = 'toast-icon';
    iconEl.textContent = icon;
    toast.appendChild(iconEl);
  }

  toast.appendChild(content);
  toast.appendChild(closeBtn);

  toastContainer.appendChild(toast);
  activeToasts.push(toast);

  // Animate in
  setTimeout(() => toast.classList.add('toast-visible'), 10);

  // Auto-dismiss after duration
  if (duration > 0) {
    setTimeout(() => dismissToast(toast), duration);
  }

  return toast;
}

/**
 * Show a confirmation dialog (replacement for confirm())
 */
export function showConfirmToast(message, onConfirm, onCancel) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-confirm';

  const content = document.createElement('div');
  content.className = 'toast-content';
  content.textContent = message;

  const actions = document.createElement('div');
  actions.className = 'toast-actions';

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'toast-btn toast-btn-confirm';
  confirmBtn.textContent = 'Confirm';
  confirmBtn.addEventListener('click', () => {
    if (onConfirm) onConfirm();
    dismissToast(toast);
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'toast-btn toast-btn-cancel';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => {
    if (onCancel) onCancel();
    dismissToast(toast);
  });

  actions.appendChild(confirmBtn);
  actions.appendChild(cancelBtn);

  toast.appendChild(content);
  toast.appendChild(actions);

  toastContainer.appendChild(toast);
  activeToasts.push(toast);

  setTimeout(() => toast.classList.add('toast-visible'), 10);

  return toast;
}

/**
 * Show a selection dialog (replacement for prompt with choices)
 */
export function showSelectionToast(message, options, onSelect, onCancel) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-selection';

  const header = document.createElement('div');
  header.className = 'toast-header';
  header.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => {
    if (onCancel) onCancel();
    dismissToast(toast);
  });

  header.appendChild(closeBtn);

  const optionsList = document.createElement('div');
  optionsList.className = 'toast-options';

  options.forEach((option, index) => {
    const optionBtn = document.createElement('button');
    optionBtn.className = 'toast-option';
    optionBtn.textContent = option.label || option;
    optionBtn.addEventListener('click', () => {
      if (onSelect) onSelect(option.value !== undefined ? option.value : option, index);
      dismissToast(toast);
    });
    optionsList.appendChild(optionBtn);
  });

  toast.appendChild(header);
  toast.appendChild(optionsList);

  toastContainer.appendChild(toast);
  activeToasts.push(toast);

  setTimeout(() => toast.classList.add('toast-visible'), 10);

  return toast;
}

function dismissToast(toast) {
  toast.classList.remove('toast-visible');
  toast.classList.add('toast-dismissing');

  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
    const index = activeToasts.indexOf(toast);
    if (index > -1) {
      activeToasts.splice(index, 1);
    }
  }, 300);
}

function getToastIcon(type) {
  const icons = {
    info: 'ℹ️',
    success: '✓',
    warning: '⚠️',
    error: '✗',
    'level-up': '⬆️',
    item: '📦',
    quest: '📜',
    gold: '💰'
  };
  return icons[type] || null;
}

/**
 * Clear all toasts
 */
export function clearAllToasts() {
  activeToasts.forEach(toast => dismissToast(toast));
}
