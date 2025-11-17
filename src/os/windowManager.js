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

      // Make window draggable by titlebar
      this.makeDraggable(winEl, titleBar);

      this.windowLayerEl.appendChild(winEl);
      entry.el = winEl;
    } else {
      // Show existing window
      entry.el.style.display = 'flex';
    }

    // Activate this window
    this.setActiveWindow(appId);
  },

  /**
   * Make a window draggable by its titlebar
   */
  makeDraggable(winEl, titleBar) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    titleBar.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    // Get initial offset from existing position
    const rect = winEl.getBoundingClientRect();
    xOffset = rect.left;
    yOffset = rect.top;

    function dragStart(e) {
      // Don't drag if clicking on controls
      if (e.target.closest('.os-window-controls')) {
        return;
      }

      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      isDragging = true;

      titleBar.style.cursor = 'grabbing';
      winEl.style.userSelect = 'none';
    }

    function drag(e) {
      if (!isDragging) return;

      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;

      // Constrain to viewport
      const maxX = window.innerWidth - 200; // Leave at least 200px visible
      const maxY = window.innerHeight - 100; // Leave at least 100px visible

      currentX = Math.max(0, Math.min(currentX, maxX));
      currentY = Math.max(0, Math.min(currentY, maxY));

      xOffset = currentX;
      yOffset = currentY;

      winEl.style.left = currentX + 'px';
      winEl.style.top = currentY + 'px';
    }

    function dragEnd() {
      if (isDragging) {
        isDragging = false;
        titleBar.style.cursor = 'default';
        winEl.style.userSelect = '';
      }
    }
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
