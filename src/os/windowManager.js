// ===== Enhanced Window Manager with Snap, Minimize, Maximize, Persistence =====

import {
  updateWindowState,
  getDesktopState,
  addRunningWindow,
  removeRunningWindow,
  getSettings
} from './desktopState.js';
import {
  getSnapZone,
  showSnapPreview,
  hideSnapPreview,
  applySnapToWindow
} from './snapPreview.js';

export const windowManager = {
  windows: {},
  windowLayerEl: null,
  zCounter: 100,
  activeWindowId: null,
  beforeSnapState: {}, // Store window state before snapping for restore

  init(windowLayerEl) {
    this.windowLayerEl = windowLayerEl;

    // Restore any previously open windows from state
    this.restoreOpenWindows();
  },

  registerApp(appConfig) {
    this.windows[appConfig.id] = {
      app: appConfig,
      el: null,
    };
  },

  /**
   * Restore windows that were open in previous session
   */
  restoreOpenWindows() {
    const state = getDesktopState();
    const openWindows = state.taskbar.runningWindowIds || [];

    openWindows.forEach(appId => {
      // Open window but don't auto-focus all of them
      if (this.windows[appId]) {
        this.openWindow(appId, false);
      }
    });
  },

  /**
   * Mark a window as active (focused) and deactivate all others
   */
  setActiveWindow(appId) {
    // Remove active class from all windows
    Object.values(this.windows).forEach(({ el }) => {
      if (el) {
        el.classList.remove('os-window--active');
      }
    });

    // Update all window states to unfocused
    const state = getDesktopState();
    Object.keys(state.windows).forEach(winId => {
      if (state.windows[winId]) {
        state.windows[winId].isFocused = false;
      }
    });

    // Set new active window
    const entry = this.windows[appId];
    if (entry && entry.el) {
      entry.el.classList.add('os-window--active');
      entry.el.style.zIndex = this.zCounter++;
      this.activeWindowId = appId;

      // Update state
      updateWindowState(appId, {
        isFocused: true,
        zIndex: this.zCounter - 1
      });
    }
  },

  /**
   * Open or restore a window
   * @param {string} appId - Application ID
   * @param {boolean} focus - Whether to focus the window (default true)
   */
  openWindow(appId, focus = true) {
    const entry = this.windows[appId];
    if (!entry || !this.windowLayerEl) return;

    // If window is minimized, just restore it
    const state = getDesktopState();
    if (entry.el && state.windows[appId]?.isMinimized) {
      this.restoreWindow(appId);
      return;
    }

    if (!entry.el) {
      // Create window element
      const winEl = document.createElement('div');
      winEl.className = 'os-window';
      winEl.dataset.appId = appId;

      // Load saved position or use default centered position
      const savedWindow = state.windows[appId];
      const defaultWidth = 600;
      const defaultHeight = 400;
      const defaultX = Math.max(50, (window.innerWidth - defaultWidth) / 2);
      const defaultY = Math.max(50, (window.innerHeight - defaultHeight) / 2);

      if (savedWindow) {
        winEl.style.left = savedWindow.x + 'px';
        winEl.style.top = savedWindow.y + 'px';
        winEl.style.width = savedWindow.width + 'px';
        winEl.style.height = savedWindow.height + 'px';
      } else {
        winEl.style.left = defaultX + 'px';
        winEl.style.top = defaultY + 'px';
        winEl.style.width = defaultWidth + 'px';
        winEl.style.height = defaultHeight + 'px';

        // Save initial window state
        updateWindowState(appId, {
          appId: appId,
          title: entry.app.title,
          x: defaultX,
          y: defaultY,
          width: defaultWidth,
          height: defaultHeight,
          zIndex: this.zCounter,
          isFocused: false,
          isMinimized: false,
          isMaximized: false,
          snap: null
        });
      }

      // Create titlebar
      const titleBar = document.createElement('div');
      titleBar.className = 'os-window-titlebar';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'os-window-titlebar-title';
      titleSpan.textContent = entry.app.title;

      const controls = document.createElement('div');
      controls.className = 'os-window-controls';

      // Minimize button
      const minimizeBtn = document.createElement('button');
      minimizeBtn.className = 'os-window-minimize';
      minimizeBtn.textContent = '−';
      minimizeBtn.title = 'Minimize';
      minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.minimizeWindow(appId);
      });

      // Maximize button
      const maximizeBtn = document.createElement('button');
      maximizeBtn.className = 'os-window-maximize';
      maximizeBtn.textContent = '□';
      maximizeBtn.title = 'Maximize';
      maximizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMaximize(appId);
      });

      // Close button
      const closeBtn = document.createElement('button');
      closeBtn.className = 'os-window-close';
      closeBtn.textContent = '×';
      closeBtn.title = 'Close';
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeWindow(appId);
      });

      controls.appendChild(minimizeBtn);
      controls.appendChild(maximizeBtn);
      controls.appendChild(closeBtn);
      titleBar.appendChild(titleSpan);
      titleBar.appendChild(controls);

      // Double-click titlebar to maximize/restore
      titleBar.addEventListener('dblclick', (e) => {
        if (!e.target.closest('.os-window-controls')) {
          this.toggleMaximize(appId);
        }
      });

      // Create body
      const body = document.createElement('div');
      body.className = 'os-window-body';
      entry.app.createContent(body);

      winEl.appendChild(titleBar);
      winEl.appendChild(body);

      // Focus window on mousedown
      winEl.addEventListener('mousedown', () => {
        if (!state.windows[appId]?.isMinimized) {
          this.setActiveWindow(appId);
        }
      });

      // Make window draggable by titlebar
      this.makeDraggable(winEl, titleBar, appId);

      this.windowLayerEl.appendChild(winEl);
      entry.el = winEl;

      // Add to running windows
      addRunningWindow(appId);
    } else {
      // Show existing window
      entry.el.style.display = 'flex';
      entry.el.classList.remove('os-window--minimized');

      updateWindowState(appId, {
        isMinimized: false
      });
    }

    // Activate this window if focus requested
    if (focus) {
      this.setActiveWindow(appId);
    }
  },

  /**
   * Make a window draggable by its titlebar with snap support
   */
  makeDraggable(winEl, titleBar, appId) {
    let isDragging = false;
    let dragOffsetX = 0; // Offset from cursor to window top-left
    let dragOffsetY = 0;
    let wasMaximized = false;

    const self = this;

    function handleMouseDown(e) {
      // Don't drag if clicking on controls
      if (e.target.closest('.os-window-controls')) {
        return;
      }

      // Normalize touch/mouse events
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      // If window is maximized, restore it but keep dragging from cursor position
      const state = getDesktopState();
      if (state.windows[appId]?.isMaximized) {
        wasMaximized = true;

        // Calculate relative position in titlebar
        const titleBarRect = titleBar.getBoundingClientRect();
        const relativeX = (clientX - titleBarRect.left) / titleBarRect.width;

        // Restore window
        self.restoreWindow(appId);

        // Position window so cursor is at same relative position in titlebar
        const newRect = winEl.getBoundingClientRect();
        const newLeft = clientX - (newRect.width * relativeX);
        const newTop = clientY - 10; // Small offset from top

        winEl.style.left = newLeft + 'px';
        winEl.style.top = newTop + 'px';

        // Set drag offset for this new position
        dragOffsetX = clientX - newLeft;
        dragOffsetY = clientY - newTop;
      } else {
        wasMaximized = false;

        // Calculate offset from cursor to window's current position
        const rect = winEl.getBoundingClientRect();
        dragOffsetX = clientX - rect.left;
        dragOffsetY = clientY - rect.top;
      }

      isDragging = true;

      titleBar.style.cursor = 'grabbing';
      winEl.style.userSelect = 'none';
      winEl.classList.add('os-window--dragging');

      // Add document listeners only when actively dragging
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    function handleMouseMove(e) {
      if (!isDragging) return;
      e.preventDefault();

      const clientX = e.clientX;
      const clientY = e.clientY;

      updatePosition(clientX, clientY);
    }

    function handleTouchMove(e) {
      if (!isDragging) return;
      e.preventDefault();

      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;

      updatePosition(clientX, clientY);
    }

    function updatePosition(clientX, clientY) {
      // Calculate new position (cursor - offset = top-left of window)
      let newX = clientX - dragOffsetX;
      let newY = clientY - dragOffsetY;

      // Constrain to viewport
      const maxX = window.innerWidth - 200; // Leave at least 200px visible
      const maxY = window.innerHeight - 100; // Leave at least 100px visible

      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      winEl.style.left = newX + 'px';
      winEl.style.top = newY + 'px';

      // Show snap preview if near edges
      const settings = getSettings();
      if (settings.snapEnabled) {
        const rect = winEl.getBoundingClientRect();
        const centerX = rect.left + (rect.width / 2);
        const topY = rect.top;

        const snapZone = getSnapZone(centerX, topY, settings.snapMode);
        showSnapPreview(snapZone);
      }
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
      titleBar.style.cursor = 'default';
      winEl.style.userSelect = '';
      winEl.classList.remove('os-window--dragging');

      // Get current window position
      const currentLeft = parseFloat(winEl.style.left) || 0;
      const currentTop = parseFloat(winEl.style.top) || 0;

      // Apply snap if in snap zone
      const settings = getSettings();
      if (settings.snapEnabled) {
        const rect = winEl.getBoundingClientRect();
        const centerX = rect.left + (rect.width / 2);
        const topY = rect.top;

        const snapZone = getSnapZone(centerX, topY, settings.snapMode);

        if (snapZone) {
          // Store pre-snap state for restore
          const currentState = getDesktopState().windows[appId];
          if (currentState && !currentState.snap) {
            self.beforeSnapState[appId] = {
              x: currentLeft,
              y: currentTop,
              width: parseInt(winEl.style.width) || 600,
              height: parseInt(winEl.style.height) || 400
            };
          }

          // Add snapping animation class
          winEl.classList.add('os-window--snapping');

          // Apply snap
          const updates = applySnapToWindow(winEl, snapZone);
          updateWindowState(appId, updates);

          // Remove animation class after transition
          setTimeout(() => {
            winEl.classList.remove('os-window--snapping');
          }, 300);
        } else {
          // No snap, just save position
          updateWindowState(appId, {
            x: currentLeft,
            y: currentTop,
            snap: null,
            isMaximized: false
          });
        }
      } else {
        // Snap disabled, just save position
        updateWindowState(appId, {
          x: currentLeft,
          y: currentTop
        });
      }

      hideSnapPreview();
      wasMaximized = false;

      // Remove document listeners after drag is complete
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    }

    // Only attach mousedown to the titlebar itself
    titleBar.addEventListener('mousedown', handleMouseDown);
    titleBar.addEventListener('touchstart', handleMouseDown, { passive: false });
  },

  /**
   * Minimize a window (hide but keep in taskbar)
   */
  minimizeWindow(appId) {
    const entry = this.windows[appId];
    if (!entry || !entry.el) return;

    entry.el.classList.add('os-window--minimized');
    entry.el.style.display = 'none';

    updateWindowState(appId, {
      isMinimized: true,
      isFocused: false
    });

    // If this was the active window, clear active state
    if (this.activeWindowId === appId) {
      this.activeWindowId = null;
    }

    console.log(`Window ${appId} minimized`);
  },

  /**
   * Restore a minimized window
   */
  restoreWindow(appId) {
    const entry = this.windows[appId];
    if (!entry || !entry.el) return;

    const state = getDesktopState();
    const windowState = state.windows[appId];

    // If window was snapped/maximized, restore to pre-snap state
    if (windowState?.isMaximized && this.beforeSnapState[appId]) {
      const prevState = this.beforeSnapState[appId];
      entry.el.style.left = prevState.x + 'px';
      entry.el.style.top = prevState.y + 'px';
      entry.el.style.width = prevState.width + 'px';
      entry.el.style.height = prevState.height + 'px';

      updateWindowState(appId, {
        x: prevState.x,
        y: prevState.y,
        width: prevState.width,
        height: prevState.height,
        isMaximized: false,
        isMinimized: false,
        snap: null
      });

      delete this.beforeSnapState[appId];
    } else {
      updateWindowState(appId, {
        isMinimized: false,
        isMaximized: false
      });
    }

    entry.el.classList.remove('os-window--minimized', 'os-window--maximized');
    entry.el.style.display = 'flex';

    this.setActiveWindow(appId);

    console.log(`Window ${appId} restored`);
  },

  /**
   * Toggle maximize state
   */
  toggleMaximize(appId) {
    const entry = this.windows[appId];
    if (!entry || !entry.el) return;

    const state = getDesktopState();
    const windowState = state.windows[appId];

    if (windowState?.isMaximized || windowState?.snap === 'maximize') {
      // Restore from maximize
      this.restoreWindow(appId);
    } else {
      // Maximize
      this.maximizeWindow(appId);
    }
  },

  /**
   * Maximize a window (fill screen minus taskbar)
   */
  maximizeWindow(appId) {
    const entry = this.windows[appId];
    if (!entry || !entry.el) return;

    const state = getDesktopState();
    const windowState = state.windows[appId];

    // Store current state before maximizing
    if (!windowState?.isMaximized) {
      this.beforeSnapState[appId] = {
        x: parseInt(entry.el.style.left) || 100,
        y: parseInt(entry.el.style.top) || 100,
        width: parseInt(entry.el.style.width) || 600,
        height: parseInt(entry.el.style.height) || 400
      };
    }

    // Apply maximize
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const taskbarHeight = 40;

    entry.el.style.left = '0px';
    entry.el.style.top = '0px';
    entry.el.style.width = viewportWidth + 'px';
    entry.el.style.height = (viewportHeight - taskbarHeight) + 'px';
    entry.el.classList.add('os-window--maximized');

    updateWindowState(appId, {
      x: 0,
      y: 0,
      width: viewportWidth,
      height: viewportHeight - taskbarHeight,
      isMaximized: true,
      snap: 'maximize'
    });

    console.log(`Window ${appId} maximized`);
  },

  /**
   * Close a window (hide and remove from running list)
   */
  closeWindow(appId) {
    const entry = this.windows[appId];
    if (entry && entry.el) {
      entry.el.style.display = 'none';
      entry.el.classList.remove('os-window--active', 'os-window--minimized', 'os-window--maximized');

      if (this.activeWindowId === appId) {
        this.activeWindowId = null;
      }

      // Remove from running windows
      removeRunningWindow(appId);

      // Update state
      updateWindowState(appId, {
        isMinimized: false,
        isMaximized: false,
        isFocused: false
      });

      console.log(`Window ${appId} closed`);
    }
  },

  /**
   * Check if window is open (visible)
   */
  isWindowOpen(appId) {
    const entry = this.windows[appId];
    return entry && entry.el && entry.el.style.display !== 'none';
  },

  /**
   * Check if window is minimized
   */
  isWindowMinimized(appId) {
    const state = getDesktopState();
    return state.windows[appId]?.isMinimized || false;
  }
};
