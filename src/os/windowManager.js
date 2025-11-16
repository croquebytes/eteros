export const windowManager = {
  windows: {},
  windowLayerEl: null,
  zCounter: 1,

  init(windowLayerEl) {
    this.windowLayerEl = windowLayerEl;
  },

  registerApp(appConfig) {
    this.windows[appConfig.id] = {
      app: appConfig,
      el: null,
    };
  },

  openWindow(appId) {
    const entry = this.windows[appId];
    if (!entry || !this.windowLayerEl) return;

    if (!entry.el) {
      const winEl = document.createElement('div');
      winEl.className = 'os-window';
      winEl.dataset.appId = appId;
      winEl.style.zIndex = this.zCounter++;

      const titleBar = document.createElement('div');
      titleBar.className = 'os-window-titlebar';

      const titleSpan = document.createElement('span');
      titleSpan.textContent = entry.app.title;

      const closeBtn = document.createElement('button');
      closeBtn.className = 'os-window-close';
      closeBtn.textContent = '×';
      closeBtn.addEventListener('click', () => this.closeWindow(appId));

      titleBar.appendChild(titleSpan);
      titleBar.appendChild(closeBtn);

      const body = document.createElement('div');
      body.className = 'os-window-body';
      entry.app.createContent(body);

      winEl.appendChild(titleBar);
      winEl.appendChild(body);

      winEl.addEventListener('mousedown', () => {
        winEl.style.zIndex = this.zCounter++;
      });

      this.windowLayerEl.appendChild(winEl);
      entry.el = winEl;
    } else {
      entry.el.style.display = 'flex';
      entry.el.style.zIndex = this.zCounter++;
    }
  },

  closeWindow(appId) {
    const entry = this.windows[appId];
    if (entry && entry.el) {
      entry.el.style.display = 'none';
    }
  },
};
