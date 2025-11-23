// ===== Desktop with Icon Drag/Drop and State Persistence =====

import { windowManager } from './windowManager.js';
import { createStartButton, createStartMenu } from './startMenu.js';
import {
  getDesktopState,
  updateIconPosition,
  getSettings,
  getGridSize,
  getGridCell,
  getCellPosition,
  isCellOccupied,
  findNearestUnoccupiedCell,
  updateMobileMode
} from './desktopState.js';
import { getDungeonStats } from '../state/dungeonRunner.js';

const APPS = [
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
  { id: 'systemMonitor', label: 'System Monitor' },
  { id: 'resourceTracker', label: 'Resource Tracker' },
  { id: 'settings', label: 'Settings' },
];

export function createDesktop() {
  const desktopEl = document.createElement('div');
  desktopEl.id = 'desktop';

  const wallpaper = document.createElement('div');
  wallpaper.id = 'desktop-wallpaper';
  desktopEl.appendChild(wallpaper);

  const windowLayerEl = document.createElement('div');
  windowLayerEl.id = 'window-layer';
  desktopEl.appendChild(windowLayerEl);

  const iconsContainer = document.createElement('div');
  iconsContainer.id = 'desktop-icons';

  // Load icon positions from state
  const state = getDesktopState();

  APPS.forEach((app) => {
    const iconId = `icon-${app.id}`;
    const iconState = state.icons[iconId];

    const icon = document.createElement('div');
    icon.className = 'desktop-icon';
    icon.dataset.appId = app.id;
    icon.dataset.iconId = iconId;

    // Always position icon - use state or calculate default grid position
    if (iconState && iconState.x !== undefined && iconState.y !== undefined) {
      // Use saved position
      icon.style.left = iconState.x + 'px';
      icon.style.top = iconState.y + 'px';
    } else {
      // Calculate default grid position for first load
      const gridSize = getGridSize();
      const padding = 12;
      const iconsPerColumn = 8;
      const index = APPS.findIndex(a => a.id === app.id);
      const column = Math.floor(index / iconsPerColumn);
      const row = index % iconsPerColumn;
      const defaultX = padding + (column * gridSize);
      const defaultY = padding + (row * gridSize);

      icon.style.left = defaultX + 'px';
      icon.style.top = defaultY + 'px';

      // Save this default position to state
      updateIconPosition(iconId, defaultX, defaultY);
    }

    const glyph = document.createElement('div');
    glyph.className = 'desktop-icon-glyph';
    glyph.textContent = app.label[0] || '?';

    const label = document.createElement('div');
    label.className = 'desktop-icon-label';
    label.textContent = app.label;

    icon.appendChild(glyph);
    icon.appendChild(label);

    // Mobile mode: single-tap, Desktop mode: double-click
    const settings = getSettings();
    const isMobile = settings.isMobileMode;

    if (isMobile) {
      // Single tap to open on mobile
      let tapTimeout = null;
      let lastTap = 0;

      icon.addEventListener('click', (e) => {
        // Prevent opening during drag
        if (icon.classList.contains('desktop-icon--dragging')) {
          return;
        }

        const now = Date.now();
        const timeSinceLastTap = now - lastTap;

        // If tapped within 300ms, it's a double-tap (ignore on mobile)
        if (timeSinceLastTap < 300) {
          clearTimeout(tapTimeout);
          return;
        }

        // Single tap - open after small delay to distinguish from drag start
        tapTimeout = setTimeout(() => {
          windowManager.openWindow(app.id);
        }, 150);

        lastTap = now;
      });
    } else {
      // Desktop: double-click to open
      icon.addEventListener('dblclick', () => {
        windowManager.openWindow(app.id);
      });
    }

    // Make icon draggable
    makeIconDraggable(icon, iconId);

    iconsContainer.appendChild(icon);
  });

  desktopEl.appendChild(iconsContainer);

  // Create taskbar
  const taskbar = createTaskbar();
  desktopEl.appendChild(taskbar);

  // Add start menu
  const startMenu = createStartMenu();
  desktopEl.appendChild(startMenu);

  // Add desktop context menu handlers
  setupDesktopContextMenu(wallpaper, iconsContainer);

  // Optional: Add grid overlay for debug
  const settings = getSettings();
  if (settings.showGridOverlay) {
    const gridOverlay = createGridOverlay(settings.iconGridSize);
    desktopEl.appendChild(gridOverlay);
  }

  // Add mobile home button
  if (settings.isMobileMode) {
    const homeButton = createMobileHomeButton();
    desktopEl.appendChild(homeButton);
  }

  // Update mobile mode on resize
  window.addEventListener('resize', () => {
    const wasMobile = settings.isMobileMode;
    updateMobileMode();
    const isMobile = getSettings().isMobileMode;

    if (wasMobile !== isMobile) {
      // Mode changed - reload page for simplicity
      console.log('Mobile mode changed, reloading...');
      location.reload();
    }
  });

  return { desktopEl, windowLayerEl };
}

/**
 * Make a desktop icon draggable with grid snap
 */
function makeIconDraggable(iconEl, iconId) {
  let isDragging = false;
  let dragOffsetX = 0; // Offset from cursor to icon top-left
  let dragOffsetY = 0;

  function handleMouseDown(e) {
    // Only drag on single click, not double-click
    if (e.detail === 2) {
      return;
    }

    // Prevent default to stop text selection
    e.preventDefault();

    // Normalize touch/mouse events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Calculate offset from cursor to icon's current position
    const rect = iconEl.getBoundingClientRect();

    // Offset from cursor (viewport coords) to icon top-left (viewport coords)
    dragOffsetX = clientX - rect.left;
    dragOffsetY = clientY - rect.top;

    isDragging = true;
    iconEl.classList.add('desktop-icon--dragging');
    iconEl.style.userSelect = 'none';

    // Add document listeners only when actively dragging
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    e.preventDefault();

    updatePosition(e.clientX, e.clientY);
  }

  function handleTouchMove(e) {
    if (!isDragging) return;
    e.preventDefault();

    updatePosition(e.touches[0].clientX, e.touches[0].clientY);
  }

  function updatePosition(clientX, clientY) {
    // Get desktop bounds
    const desktop = document.getElementById('desktop');
    const desktopRect = desktop.getBoundingClientRect();
    const iconRect = iconEl.getBoundingClientRect();

    // Calculate new position (cursor - offset = top-left of icon, relative to desktop)
    let newX = clientX - dragOffsetX - desktopRect.left;
    let newY = clientY - dragOffsetY - desktopRect.top;

    // Constrain to desktop bounds
    const maxX = desktopRect.width - iconRect.width;
    const maxY = desktopRect.height - 60; // Leave space for taskbar

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    iconEl.style.left = newX + 'px';
    iconEl.style.top = newY + 'px';
  }

  function handleMouseUp(e) {
    if (!isDragging) return;
    finishDrag();
  }

  function handleTouchEnd(e) {
    if (!isDragging) return;
    finishDrag();
  }

  function finishDrag() {
    isDragging = false;
    iconEl.classList.remove('desktop-icon--dragging');
    iconEl.style.userSelect = '';

    // Snap to grid with collision detection
    const settings = getSettings();
    const gridSize = settings.iconGridSize;

    const currentLeft = parseFloat(iconEl.style.left) || 0;
    const currentTop = parseFloat(iconEl.style.top) || 0;

    // Get target grid cell
    const targetCell = getGridCell(currentLeft, currentTop, gridSize);

    // Find nearest unoccupied cell
    const finalCell = findNearestUnoccupiedCell(
      targetCell.col,
      targetCell.row,
      iconId
    );

    // Convert cell back to pixels
    const finalPos = getCellPosition(finalCell.col, finalCell.row, gridSize);

    iconEl.style.left = finalPos.x + 'px';
    iconEl.style.top = finalPos.y + 'px';

    // Save icon position to state
    updateIconPosition(iconId, finalPos.x, finalPos.y);

    console.log(`Icon ${iconId} moved to cell (${finalCell.col}, ${finalCell.row}) = (${finalPos.x}px, ${finalPos.y}px)`);

    // Remove document listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  }

  // Only attach mousedown to the icon itself
  iconEl.addEventListener('mousedown', handleMouseDown);
  iconEl.addEventListener('touchstart', handleMouseDown, { passive: false });
}

/**
 * Create taskbar with running windows only (Windows OS style)
 */
function createTaskbar() {
  const taskbar = document.createElement('div');
  taskbar.id = 'taskbar';

  // Add start button
  const startButton = createStartButton();
  taskbar.appendChild(startButton);

  const running = document.createElement('div');
  running.className = 'taskbar-running';
  running.id = 'taskbar-running';

  const tray = document.createElement('div');
  tray.className = 'taskbar-tray';

  const clock = document.createElement('span');
  clock.id = 'taskbar-clock';
  tray.appendChild(clock);

  taskbar.appendChild(running);
  taskbar.appendChild(tray);

  function updateClock() {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  updateClock();
  setInterval(updateClock, 60_000);

  // Update taskbar buttons periodically to sync with window state
  setInterval(() => {
    updateTaskbarButtons();
  }, 500);

  return taskbar;
}

/**
 * Update taskbar to show only running/open windows
 */
function updateTaskbarButtons() {
  const state = getDesktopState();
  const runningContainer = document.getElementById('taskbar-running');
  if (!runningContainer) return;

  // Get currently running windows
  const runningAppIds = state.taskbar.runningWindowIds || [];

  // Remove buttons for closed windows
  const existingButtons = runningContainer.querySelectorAll('.taskbar-button');
  existingButtons.forEach(btn => {
    const appId = btn.dataset.appId;
    if (!runningAppIds.includes(appId)) {
      btn.remove();
    }
  });

  // Add buttons for newly opened windows
  runningAppIds.forEach(appId => {
    // Check if button already exists
    let btn = runningContainer.querySelector(`[data-app-id="${appId}"]`);

    if (!btn) {
      // Create new button
      const app = APPS.find(a => a.id === appId);
      if (!app) return;

      btn = document.createElement('button');
      btn.className = 'taskbar-button';
      btn.dataset.appId = appId;
      btn.textContent = app.label;

      btn.addEventListener('click', () => {
        handleTaskbarClick(appId);
      });

      runningContainer.appendChild(btn);
    }

    // Update button visual state
    const windowState = state.windows[appId];
    const isMinimized = windowState?.isMinimized || false;
    const isActive = windowState?.isFocused || false;

    btn.classList.toggle('taskbar-button--running', true);
    btn.classList.toggle('taskbar-button--minimized', isMinimized);
    btn.classList.toggle('taskbar-button--active', isActive && !isMinimized);

    // Add dungeon running badge to Quest Explorer
    if (appId === 'questExplorer') {
      const dungeonStats = getDungeonStats();
      let badge = btn.querySelector('.taskbar-badge');

      if (dungeonStats.running) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'taskbar-badge';
          btn.appendChild(badge);
        }
        badge.textContent = `⚔${dungeonStats.wave}`;
        badge.title = `Dungeon running - Wave ${dungeonStats.wave}`;
      } else if (badge) {
        badge.remove();
      }
    }
  });
}

/**
 * Handle taskbar button clicks with minimize/restore logic
 */
function handleTaskbarClick(appId) {
  const isOpen = windowManager.isWindowOpen(appId);
  const isMinimized = windowManager.isWindowMinimized(appId);
  const isActive = windowManager.activeWindowId === appId;

  if (!isOpen || (!isMinimized && !isActive)) {
    // Window is closed or not focused -> open/focus it
    windowManager.openWindow(appId);
  } else if (isActive && !isMinimized) {
    // Window is active and visible -> minimize it
    windowManager.minimizeWindow(appId);
  } else if (isMinimized) {
    // Window is minimized -> restore it
    windowManager.restoreWindow(appId);
  }
}

/**
 * Create grid overlay for debugging icon positions (optional)
 */
function createGridOverlay(gridSize) {
  const overlay = document.createElement('div');
  overlay.id = 'desktop-grid-overlay';
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '1';

  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = 'rgba(100, 149, 237, 0.2)'; // Cornflower blue, semi-transparent
  ctx.lineWidth = 1;

  // Draw vertical lines
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Draw horizontal lines
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  overlay.appendChild(canvas);
  return overlay;
}

/**
 * Create mobile home button
 */
function createMobileHomeButton() {
  const button = document.createElement('button');
  button.id = 'mobile-home-button';
  button.className = 'mobile-home-button';
  button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  `;
  button.title = 'Home';

  // Badge for open window count
  const badge = document.createElement('span');
  badge.className = 'home-button-badge';
  button.appendChild(badge);

  button.addEventListener('click', () => {
    handleHomeButtonClick();
  });

  // Update badge count periodically
  setInterval(() => {
    const state = getDesktopState();
    const openCount = state.taskbar.runningWindowIds.length;
    badge.textContent = openCount > 0 ? openCount : '';
    badge.style.display = openCount > 0 ? 'flex' : 'none';
  }, 500);

  return button;
}

/**
 * Handle mobile home button click
 */
function handleHomeButtonClick() {
  // Minimize all open windows
  const state = getDesktopState();
  const openWindows = state.taskbar.runningWindowIds || [];

  openWindows.forEach(appId => {
    if (!windowManager.isWindowMinimized(appId)) {
      windowManager.minimizeWindow(appId);
    }
  });

  console.log('All windows minimized');
}

// ===== Desktop Context Menu System =====

const WALLPAPERS = [
  'radial-gradient(circle at top left, #223355 0, #050815 55%, #02040a 100%)',
  'radial-gradient(circle at center, #2e1065 0%, #050815 60%, #02040a 100%)',
  'radial-gradient(circle at bottom right, #064e3b 0%, #050815 55%, #02040a 100%)',
  'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)'
];

let currentWallpaperIndex = 0;
let contextMenuEl = null;

/**
 * Setup desktop context menu (right-click on wallpaper/desktop)
 */
function setupDesktopContextMenu(wallpaperEl, iconsContainer) {
  // Prevent default context menu on wallpaper
  wallpaperEl.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showDesktopContextMenu(e.clientX, e.clientY);
  });

  // Also handle desktop area (not on icons)
  iconsContainer.addEventListener('contextmenu', (e) => {
    // Only show if clicking on empty space, not an icon
    if (!e.target.closest('.desktop-icon')) {
      e.preventDefault();
      showDesktopContextMenu(e.clientX, e.clientY);
    }
  });

  // Close context menu on any click
  document.addEventListener('click', () => {
    hideDesktopContextMenu();
  });

  // Close context menu on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideDesktopContextMenu();
    }
  });
}

/**
 * Show desktop context menu at position
 */
function showDesktopContextMenu(x, y) {
  // Hide any existing menu
  hideDesktopContextMenu();

  // Create context menu
  contextMenuEl = document.createElement('div');
  contextMenuEl.className = 'desktop-context-menu';
  contextMenuEl.style.left = x + 'px';
  contextMenuEl.style.top = y + 'px';

  const menuItems = [
    {
      icon: '🎨',
      label: 'Change Wallpaper',
      action: changeWallpaper
    },
    {
      icon: '🔄',
      label: 'Arrange Icons',
      action: arrangeIcons
    },
    { divider: true },
    {
      icon: '↻',
      label: 'Refresh Desktop',
      action: refreshDesktop
    }
  ];

  menuItems.forEach(item => {
    if (item.divider) {
      const divider = document.createElement('div');
      divider.className = 'desktop-context-menu-divider';
      contextMenuEl.appendChild(divider);
    } else {
      const menuItem = document.createElement('div');
      menuItem.className = 'desktop-context-menu-item';
      menuItem.innerHTML = `
        <span class="desktop-context-menu-item-icon">${item.icon}</span>
        <span>${item.label}</span>
      `;
      menuItem.addEventListener('click', (e) => {
        e.stopPropagation();
        item.action();
        hideDesktopContextMenu();
      });
      contextMenuEl.appendChild(menuItem);
    }
  });

  document.body.appendChild(contextMenuEl);

  // Adjust position if menu goes off screen
  const rect = contextMenuEl.getBoundingClientRect();
  if (rect.right > window.innerWidth) {
    contextMenuEl.style.left = (x - rect.width) + 'px';
  }
  if (rect.bottom > window.innerHeight) {
    contextMenuEl.style.top = (y - rect.height) + 'px';
  }
}

/**
 * Hide desktop context menu
 */
function hideDesktopContextMenu() {
  if (contextMenuEl) {
    contextMenuEl.remove();
    contextMenuEl = null;
  }
}

/**
 * Change desktop wallpaper (cycle through wallpapers)
 */
function changeWallpaper() {
  currentWallpaperIndex = (currentWallpaperIndex + 1) % WALLPAPERS.length;
  const wallpaperEl = document.getElementById('desktop-wallpaper');
  if (wallpaperEl) {
    wallpaperEl.style.background = WALLPAPERS[currentWallpaperIndex];
    console.log(`Changed wallpaper to ${currentWallpaperIndex + 1}/${WALLPAPERS.length}`);
  }
}

/**
 * Arrange icons in default grid layout
 */
function arrangeIcons() {
  const gridSize = getGridSize();
  const padding = 12;
  const iconsPerColumn = 8;

  const state = getDesktopState();
  const icons = Object.values(state.icons);

  icons.forEach((iconData, index) => {
    const column = Math.floor(index / iconsPerColumn);
    const row = index % iconsPerColumn;

    const x = padding + (column * gridSize);
    const y = padding + (row * gridSize);

    updateIconPosition(iconData.id, x, y);

    // Update DOM element position
    const iconEl = document.querySelector(`[data-icon-id="${iconData.id}"]`);
    if (iconEl) {
      iconEl.style.left = x + 'px';
      iconEl.style.top = y + 'px';
    }
  });

  console.log('Icons arranged in grid layout');
}

/**
 * Refresh desktop (reload icon positions from state)
 */
function refreshDesktop() {
  location.reload();
}
