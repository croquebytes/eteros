import { windowManager } from './windowManager.js';
import { createBattleTracker } from './battleTrackerWidget.js';

const APPS = [
  { id: 'questExplorer', label: 'Quest Explorer' },
  { id: 'soulSummoner', label: 'Soul Summoner' },
  { id: 'taskManager', label: 'Task Manager' },
  { id: 'lootDownloads', label: 'Loot Downloads' },
  { id: 'soulwareStore', label: 'Soulware Store' },
  { id: 'recycleShrine', label: 'Recycle Shrine' },
  { id: 'systemSigils', label: 'System Sigils' },
  { id: 'speculationTerminal', label: 'Speculation Terminal' },
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

  APPS.forEach((app) => {
    const icon = document.createElement('div');
    icon.className = 'desktop-icon';
    icon.dataset.appId = app.id;

    const glyph = document.createElement('div');
    glyph.className = 'desktop-icon-glyph';
    glyph.textContent = app.label[0] || '?';

    const label = document.createElement('div');
    label.className = 'desktop-icon-label';
    label.textContent = app.label;

    icon.appendChild(glyph);
    icon.appendChild(label);

    icon.addEventListener('dblclick', () => {
      windowManager.openWindow(app.id);
    });

    iconsContainer.appendChild(icon);
  });

  desktopEl.appendChild(iconsContainer);

  const taskbar = document.createElement('div');
  taskbar.id = 'taskbar';

  const pinned = document.createElement('div');
  pinned.className = 'taskbar-pinned';

  APPS.forEach((app) => {
    const btn = document.createElement('button');
    btn.className = 'taskbar-button';
    btn.dataset.appId = app.id;
    btn.textContent = app.label;
    btn.addEventListener('click', () => {
      windowManager.openWindow(app.id);
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

  desktopEl.appendChild(taskbar);

  function updateClock() {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  updateClock();
  setInterval(updateClock, 60_000);

  // Add battle tracker widget
  const battleTracker = createBattleTracker();
  desktopEl.appendChild(battleTracker);

  return { desktopEl, windowLayerEl };
}
