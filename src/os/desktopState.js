// ===== Desktop State Management =====
// Manages window positions, icon positions, taskbar state, and OS settings
// Based on reincarnos_os_ui_shell_reference.md Section 2

const STORAGE_KEY = 'reincarnos:desktop:state';
const SAVE_DEBOUNCE_MS = 500; // Debounce saves during drag operations

// ===== Default State Factory =====

/**
 * Create default desktop state with auto-arranged icons in grid
 */
export function getDefaultDesktopState() {
  // Calculate grid layout for icons (left side of screen, vertical column)
  const gridSize = getGridSize();
  const iconPositions = autoArrangeIconsInGrid(gridSize);

  return {
    profileId: 'default',
    version: '1.0.0',

    windows: {
      // windowId: WindowState (created dynamically)
    },

    icons: iconPositions,

    taskbar: {
      pinnedAppIds: [
        'questExplorer',
        'lootDownloads',
        'soulwareStore',
        'mailClient',
        'taskScheduler',
        'researchLab',
        'recycleShrine',
        'systemSigils',
        'speculationTerminal',
        'musicPlayer',
        'skillTreeApp',
        'defragger',
        'firewallDefense',
        'cosmeticTerminal',
        'settings'
      ],
      runningWindowIds: [] // Ordered list (z-order friendly)
    },

    settings: {
      theme: 'default',
      snapEnabled: true,
      snapMode: 'quarters', // 'halves' | 'quarters'
      iconGridSize: gridSize,
      showGridOverlay: false, // Debug mode
      isMobileMode: false // Detected at runtime
    }
  };
}

/**
 * Auto-arrange icons in grid layout
 */
function autoArrangeIconsInGrid(gridSize) {
  const apps = [
    { id: 'questExplorer', label: 'Quest Explorer' },
    { id: 'mailClient', label: 'Mail Client' },
    { id: 'taskScheduler', label: 'Task Scheduler' },
    { id: 'researchLab', label: 'Research Lab' },
    { id: 'lootDownloads', label: 'Loot Downloads' },
    { id: 'soulwareStore', label: 'Soulware Store' },
    { id: 'recycleShrine', label: 'Recycle Shrine' },
    { id: 'systemSigils', label: 'System Sigils' },
    { id: 'speculationTerminal', label: 'Speculation Terminal' },
    { id: 'musicPlayer', label: 'Music Player' },
    { id: 'skillTreeApp', label: 'Skill Trees' },
    { id: 'defragger', label: 'Defragger' },
    { id: 'firewallDefense', label: 'Firewall Defense' },
    { id: 'cosmeticTerminal', label: 'Aesthetic Terminal' },
    { id: 'settings', label: 'Settings' }
  ];

  const icons = {};
  const padding = 12; // Padding from edges
  const iconsPerColumn = 8; // Max icons per column before wrapping

  apps.forEach((app, index) => {
    const column = Math.floor(index / iconsPerColumn);
    const row = index % iconsPerColumn;

    icons[`icon-${app.id}`] = {
      id: `icon-${app.id}`,
      label: app.label,
      appId: app.id,
      x: padding + (column * gridSize),
      y: padding + (row * gridSize),
      groupId: null // For future folder grouping
    };
  });

  return icons;
}

/**
 * Get responsive grid size based on viewport
 */
export function getGridSize() {
  const width = window.innerWidth;

  // Mobile: 80-100px for larger touch targets
  if (width < 768) {
    return 100;
  }
  // Tablet: 80px
  else if (width < 1024) {
    return 80;
  }
  // Desktop: 64px
  else {
    return 64;
  }
}

/**
 * Get grid cell coordinates for a pixel position
 */
export function getGridCell(x, y, gridSize) {
  return {
    col: Math.round(x / gridSize),
    row: Math.round(y / gridSize)
  };
}

/**
 * Get pixel position for a grid cell
 */
export function getCellPosition(col, row, gridSize) {
  return {
    x: col * gridSize,
    y: row * gridSize
  };
}

/**
 * Check if a grid cell is occupied by any icon
 */
export function isCellOccupied(col, row, excludeIconId = null) {
  const state = getDesktopState();
  const gridSize = state.settings.iconGridSize;

  for (const [iconId, iconData] of Object.entries(state.icons)) {
    if (iconId === excludeIconId) continue;

    const iconCell = getGridCell(iconData.x, iconData.y, gridSize);
    if (iconCell.col === col && iconCell.row === row) {
      return true;
    }
  }

  return false;
}

/**
 * Find nearest unoccupied cell to a target position
 */
export function findNearestUnoccupiedCell(targetCol, targetRow, excludeIconId = null) {
  // Start with target cell
  if (!isCellOccupied(targetCol, targetRow, excludeIconId)) {
    return { col: targetCol, row: targetRow };
  }

  // Spiral search outward
  const maxDistance = 20; // Don't search too far
  for (let distance = 1; distance <= maxDistance; distance++) {
    // Check cells in a square ring at this distance
    for (let dx = -distance; dx <= distance; dx++) {
      for (let dy = -distance; dy <= distance; dy++) {
        // Only check cells on the perimeter of the square
        if (Math.abs(dx) === distance || Math.abs(dy) === distance) {
          const col = targetCol + dx;
          const row = targetRow + dy;

          // Skip negative positions
          if (col < 0 || row < 0) continue;

          if (!isCellOccupied(col, row, excludeIconId)) {
            return { col, row };
          }
        }
      }
    }
  }

  // Fallback: return target even if occupied (shouldn't happen)
  return { col: targetCol, row: targetRow };
}

/**
 * Detect if device is mobile
 */
export function detectMobileMode() {
  const isNarrowViewport = window.matchMedia('(max-width: 767px)').matches;
  const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  return isNarrowViewport || isTouchDevice;
}

/**
 * Update mobile mode in settings
 */
export function updateMobileMode() {
  const isMobile = detectMobileMode();
  const state = getDesktopState();

  if (state.settings.isMobileMode !== isMobile) {
    state.settings.isMobileMode = isMobile;
    saveDesktopState(state, true);
    console.log(`Mobile mode: ${isMobile ? 'ON' : 'OFF'}`);
  }

  return isMobile;
}

// ===== State Management =====

let currentState = null;
let saveTimeout = null;

/**
 * Load desktop state from localStorage
 */
export function loadDesktopState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      console.log('No saved desktop state found, using defaults');
      currentState = getDefaultDesktopState();
      saveDesktopState(currentState); // Save defaults
      return currentState;
    }

    const loaded = JSON.parse(raw);

    // Validate/migrate if needed
    if (!loaded.version || loaded.version !== '1.0.0') {
      console.log('Desktop state version mismatch, resetting to defaults');
      currentState = getDefaultDesktopState();
      saveDesktopState(currentState);
      return currentState;
    }

    // Update grid size if viewport changed
    const newGridSize = getGridSize();
    if (loaded.settings.iconGridSize !== newGridSize) {
      loaded.settings.iconGridSize = newGridSize;
    }

    currentState = loaded;
    console.log('Desktop state loaded successfully');
    return currentState;

  } catch (error) {
    console.error('Failed to load desktop state:', error);
    currentState = getDefaultDesktopState();
    return currentState;
  }
}

/**
 * Save desktop state to localStorage
 */
export function saveDesktopState(state = currentState, immediate = false) {
  if (!state) {
    console.warn('No state to save');
    return;
  }

  // Update current state reference
  currentState = state;

  // Debounce saves unless immediate
  if (!immediate) {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(() => {
      performSave(state);
    }, SAVE_DEBOUNCE_MS);
  } else {
    performSave(state);
  }
}

/**
 * Actually write to localStorage
 */
function performSave(state) {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
    console.log('Desktop state saved');
  } catch (error) {
    console.error('Failed to save desktop state:', error);
  }
}

/**
 * Get current desktop state
 */
export function getDesktopState() {
  if (!currentState) {
    return loadDesktopState();
  }
  return currentState;
}

/**
 * Update window state
 */
export function updateWindowState(windowId, updates) {
  const state = getDesktopState();

  if (!state.windows[windowId]) {
    state.windows[windowId] = {
      id: windowId,
      appId: updates.appId || windowId,
      title: updates.title || windowId,
      x: 100,
      y: 100,
      width: 600,
      height: 400,
      zIndex: 100,
      isFocused: false,
      isMinimized: false,
      isMaximized: false,
      snap: null
    };
  }

  Object.assign(state.windows[windowId], updates);
  saveDesktopState(state);

  return state.windows[windowId];
}

/**
 * Update icon position
 */
export function updateIconPosition(iconId, x, y) {
  const state = getDesktopState();

  if (!state.icons[iconId]) {
    console.warn(`Icon ${iconId} not found in state`);
    return;
  }

  // Snap to grid
  const gridSize = state.settings.iconGridSize;
  state.icons[iconId].x = Math.round(x / gridSize) * gridSize;
  state.icons[iconId].y = Math.round(y / gridSize) * gridSize;

  saveDesktopState(state);
}

/**
 * Get icon position
 */
export function getIconPosition(iconId) {
  const state = getDesktopState();
  return state.icons[iconId] || null;
}

/**
 * Update settings
 */
export function updateSettings(updates) {
  const state = getDesktopState();
  Object.assign(state.settings, updates);
  saveDesktopState(state, true); // Immediate save for settings
}

/**
 * Get settings
 */
export function getSettings() {
  return getDesktopState().settings;
}

/**
 * Add window to running list
 */
export function addRunningWindow(windowId) {
  const state = getDesktopState();
  if (!state.taskbar.runningWindowIds.includes(windowId)) {
    state.taskbar.runningWindowIds.push(windowId);
    saveDesktopState(state);
  }
}

/**
 * Remove window from running list
 */
export function removeRunningWindow(windowId) {
  const state = getDesktopState();
  const index = state.taskbar.runningWindowIds.indexOf(windowId);
  if (index !== -1) {
    state.taskbar.runningWindowIds.splice(index, 1);
    saveDesktopState(state);
  }
}

/**
 * Reset desktop state to defaults (for settings reset)
 */
export function resetDesktopState() {
  currentState = getDefaultDesktopState();
  saveDesktopState(currentState, true);
  console.log('Desktop state reset to defaults');
  return currentState;
}

// ===== Initialize on import =====
loadDesktopState();
