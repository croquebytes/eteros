// ===== Desktop with Icon Drag/Drop and State Persistence =====

import { windowManager } from './windowManager.js';
import { createBattleTracker } from './battleTrackerWidget.js';
import {
  getDesktopState,
  updateIconPosition,
  getSettings
} from './desktopState.js';

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

    // Position icon from state or use default grid position
    if (iconState) {
      icon.style.left = iconState.x + 'px';
      icon.style.top = iconState.y + 'px';
    }

    const glyph = document.createElement('div');
    glyph.className = 'desktop-icon-glyph';
    glyph.textContent = app.label[0] || '?';

    const label = document.createElement('div');
    label.className = 'desktop-icon-label';
    label.textContent = app.label;

    icon.appendChild(glyph);
    icon.appendChild(label);

    // Double-click to open window
    icon.addEventListener('dblclick', () => {
      windowManager.openWindow(app.id);
    });

    // Make icon draggable
    makeIconDraggable(icon, iconId);

    iconsContainer.appendChild(icon);
  });

  desktopEl.appendChild(iconsContainer);

  // Create taskbar
  const taskbar = createTaskbar();
  desktopEl.appendChild(taskbar);

  // Add battle tracker widget
  const battleTracker = createBattleTracker();
  desktopEl.appendChild(battleTracker);

  // Optional: Add grid overlay for debug
  const settings = getSettings();
  if (settings.showGridOverlay) {
    const gridOverlay = createGridOverlay(settings.iconGridSize);
    desktopEl.appendChild(gridOverlay);
  }

  return { desktopEl, windowLayerEl };
}

/**
 * Make a desktop icon draggable with grid snap
 */
function makeIconDraggable(iconEl, iconId) {
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  iconEl.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);

  // Support touch events for mobile
  iconEl.addEventListener('touchstart', dragStart, { passive: false });
  document.addEventListener('touchmove', drag, { passive: false });
  document.addEventListener('touchend', dragEnd);

  // Get initial offset from existing position
  const rect = iconEl.getBoundingClientRect();
  xOffset = rect.left;
  yOffset = rect.top;

  function dragStart(e) {
    // Only drag on single click, not double-click
    if (e.detail === 2) {
      return;
    }

    // Prevent default to stop text selection
    e.preventDefault();

    // Normalize touch/mouse events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    initialX = clientX - xOffset;
    initialY = clientY - yOffset;
    isDragging = false; // Will become true on first move

    iconEl.style.userSelect = 'none';
  }

  function drag(e) {
    // Only start dragging after small movement to distinguish from click
    if (!isDragging && initialX !== undefined) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const deltaX = Math.abs(clientX - (initialX + xOffset));
      const deltaY = Math.abs(clientY - (initialY + yOffset));

      if (deltaX > 5 || deltaY > 5) {
        isDragging = true;
        iconEl.classList.add('desktop-icon--dragging');
      }
    }

    if (!isDragging) return;

    e.preventDefault();

    // Normalize touch/mouse events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    currentX = clientX - initialX;
    currentY = clientY - initialY;

    // Constrain to desktop bounds
    const desktop = document.getElementById('desktop');
    const desktopRect = desktop.getBoundingClientRect();
    const iconRect = iconEl.getBoundingClientRect();

    const maxX = desktopRect.width - iconRect.width;
    const maxY = desktopRect.height - 60; // Leave space for taskbar

    currentX = Math.max(0, Math.min(currentX, maxX));
    currentY = Math.max(0, Math.min(currentY, maxY));

    xOffset = currentX;
    yOffset = currentY;

    iconEl.style.left = currentX + 'px';
    iconEl.style.top = currentY + 'px';
  }

  function dragEnd() {
    if (isDragging) {
      isDragging = false;
      iconEl.classList.remove('desktop-icon--dragging');
      iconEl.style.userSelect = '';

      // Snap to grid
      const settings = getSettings();
      const gridSize = settings.iconGridSize;

      const snappedX = Math.round(currentX / gridSize) * gridSize;
      const snappedY = Math.round(currentY / gridSize) * gridSize;

      iconEl.style.left = snappedX + 'px';
      iconEl.style.top = snappedY + 'px';

      // Save icon position to state
      updateIconPosition(iconId, snappedX, snappedY);

      console.log(`Icon ${iconId} moved to (${snappedX}, ${snappedY})`);
    }

    // Reset drag state
    initialX = undefined;
    initialY = undefined;
  }
}

/**
 * Create taskbar with pinned apps and running windows
 */
function createTaskbar() {
  const taskbar = document.createElement('div');
  taskbar.id = 'taskbar';

  const pinned = document.createElement('div');
  pinned.className = 'taskbar-pinned';

  const state = getDesktopState();

  APPS.forEach((app) => {
    const btn = document.createElement('button');
    btn.className = 'taskbar-button';
    btn.dataset.appId = app.id;
    btn.textContent = app.label;

    // Update button state based on window state
    btn.addEventListener('click', () => {
      handleTaskbarClick(app.id);
    });

    pinned.appendChild(btn);
  });

  const tray = document.createElement('div');
  tray.className = 'taskbar-tray';

  const clock = document.createElement('span');
  clock.id = 'taskbar-clock';
  tray.appendChild(clock);

  taskbar.appendChild(pinned);
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

  // Update taskbar button states periodically
  setInterval(() => {
    updateTaskbarButtonStates();
  }, 500);

  return taskbar;
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
 * Update taskbar button visual states based on window states
 */
function updateTaskbarButtonStates() {
  const state = getDesktopState();
  const taskbarButtons = document.querySelectorAll('.taskbar-button');

  taskbarButtons.forEach(btn => {
    const appId = btn.dataset.appId;
    const windowState = state.windows[appId];
    const isRunning = state.taskbar.runningWindowIds.includes(appId);
    const isMinimized = windowState?.isMinimized || false;
    const isActive = windowState?.isFocused || false;

    // Update button classes
    btn.classList.toggle('taskbar-button--running', isRunning);
    btn.classList.toggle('taskbar-button--minimized', isMinimized);
    btn.classList.toggle('taskbar-button--active', isActive && !isMinimized);
  });
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
