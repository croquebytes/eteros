import './style.css';
import { createDesktop } from './os/desktop.js';
import { windowManager } from './os/windowManager.js';
import { startAutoSave } from './state/gameState.js';
import { startCombatLoop } from './state/combatEngine.js';

// Import apps
import { questExplorerApp } from './os/apps/questExplorer.js';
import { mailClientApp } from './os/apps/mailClient.js';
import { taskSchedulerUIApp } from './os/apps/taskSchedulerApp.js';
import { researchLabApp } from './os/apps/researchLab.js';
import { soulwareStoreApp } from './os/apps/soulwareStore.js';
import { lootDownloadsApp } from './os/apps/lootDownloads.js';
import { recycleShrineApp } from './os/apps/recycleShrine.js';
import { systemSigilsApp } from './os/apps/systemSigils.js';

// Import new game systems
import { ResourceManager } from './state/resourceManager.js';
import { TaskScheduler } from './state/taskScheduler.js';
import { initSynergySystem } from './state/heroSynergies.js';

const root = document.getElementById('app');

const { desktopEl, windowLayerEl } = createDesktop();
root.appendChild(desktopEl);

windowManager.init(windowLayerEl);

// Initialize new game systems
const resourceManager = new ResourceManager();
const taskScheduler = new TaskScheduler(resourceManager);

// Register apps with window manager
windowManager.registerApp(questExplorerApp);
windowManager.registerApp(mailClientApp);
windowManager.registerApp(taskSchedulerUIApp);
windowManager.registerApp(researchLabApp);
windowManager.registerApp(soulwareStoreApp);
windowManager.registerApp(lootDownloadsApp);
windowManager.registerApp(recycleShrineApp);
windowManager.registerApp(systemSigilsApp);

// Start game systems
startCombatLoop();
startAutoSave();

// Initialize synergy system
initSynergySystem();

// Start task scheduler tick loop (updates every 100ms)
setInterval(() => {
  taskScheduler.tick();
  resourceManager.tick(0.1); // 0.1 seconds
}, 100);

console.log('ReincarnOS booted - All systems active');
