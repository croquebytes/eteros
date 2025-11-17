export const windowManager = {
  windows: {},
  windowLayerEl: null,
  zCounter: 100,
  activeWindowId: null,

  init(windowLayerEl) {
    this.windowLayerEl = windowLayerEl;
  },

  registerApp(appConfig) {
    this.windows[appConfig.id] = {
      app: appConfig,
      el: null,
    };
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

    // Set new active window
    const entry = this.windows[appId];
    if (entry && entry.el) {
      entry.el.classList.add('os-window--active');
      entry.el.style.zIndex = this.zCounter++;
      this.activeWindowId = appId;
    }
  },

  openWindow(appId) {
    const entry = this.windows[appId];
    if (!entry || !this.windowLayerEl) return;

    if (!entry.el) {
      // Create window element
      const winEl = document.createElement('div');
      winEl.className = 'os-window';
      winEl.dataset.appId = appId;

      // Create titlebar
      const titleBar = document.createElement('div');
      titleBar.className = 'os-window-titlebar';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'os-window-titlebar-title';
      titleSpan.textContent = entry.app.title;

      const controls = document.createElement('div');
      controls.className = 'os-window-controls';

      const closeBtn = document.createElement('button');
      closeBtn.className = 'os-window-close';
      closeBtn.textContent = '×';
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeWindow(appId);
      });

      controls.appendChild(closeBtn);
      titleBar.appendChild(titleSpan);
      titleBar.appendChild(controls);

      // Create body
      const body = document.createElement('div');
      body.className = 'os-window-body';
      entry.app.createContent(body);

      winEl.appendChild(titleBar);
      winEl.appendChild(body);

      // Focus window on mousedown
      winEl.addEventListener('mousedown', () => {
        this.setActiveWindow(appId);
      });

      this.windowLayerEl.appendChild(winEl);
      entry.el = winEl;
    } else {
      // Show existing window
      entry.el.style.display = 'flex';
    }

    // Activate this window
    this.setActiveWindow(appId);
  },

  closeWindow(appId) {
    const entry = this.windows[appId];
    if (entry && entry.el) {
      entry.el.style.display = 'none';
      entry.el.classList.remove('os-window--active');

      if (this.activeWindowId === appId) {
        this.activeWindowId = null;
      }
    }
  },
};
