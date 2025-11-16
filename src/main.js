import './style.css';
import { createDesktop } from './os/desktop.js';
import { windowManager } from './os/windowManager.js';
import { startAutoSave } from './state/gameState.js';
import { startCombatLoop } from './state/combatEngine.js';

import { questExplorerApp } from './os/apps/questExplorer.js';
import { soulwareStoreApp } from './os/apps/soulwareStore.js';
import { lootDownloadsApp } from './os/apps/lootDownloads.js';
import { recycleShrineApp } from './os/apps/recycleShrine.js';
import { systemSigilsApp } from './os/apps/systemSigils.js';

const root = document.getElementById('app');

const { desktopEl, windowLayerEl } = createDesktop();
root.appendChild(desktopEl);

windowManager.init(windowLayerEl);

// Register apps with window manager
windowManager.registerApp(questExplorerApp);
windowManager.registerApp(soulwareStoreApp);
windowManager.registerApp(lootDownloadsApp);
windowManager.registerApp(recycleShrineApp);
windowManager.registerApp(systemSigilsApp);

// Start game systems
startCombatLoop();
startAutoSave();

console.log('ReincarnOS booted - Combat and auto-save active');
