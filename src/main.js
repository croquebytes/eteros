import './style.css';
import { createDesktop } from './os/desktop.js';
import { windowManager } from './os/windowManager.js';
import { startAutoSave } from './state/gameState.js';
import { startCombatLoop } from './state/combatEngine.js';
import { initToastManager } from './os/toastManager.js';

// Import apps
import { questExplorerApp } from './os/apps/questExplorer.js';
import { mailClientApp } from './os/apps/mailClient.js';
import { taskSchedulerUIApp } from './os/apps/taskSchedulerApp.js';
import { researchLabApp } from './os/apps/researchLab.js';
import { soulwareStoreApp } from './os/apps/soulwareStore.js';
import { lootDownloadsApp } from './os/apps/lootDownloads.js';
import { recycleShrineApp } from './os/apps/recycleShrine.js';
import { systemSigilsApp } from './os/apps/systemSigils.js';
import { speculationTerminalApp } from './os/apps/speculationTerminal.js';
import { settingsApp, initSettings } from './os/apps/settingsApp.js';
// NEW APPS (Phase 1)
import { musicPlayer } from './os/apps/musicPlayer.js';
import { skillTreeApp } from './os/apps/skillTreeApp.js';
import { defragger } from './os/apps/defragger.js';
// NEW APPS (Phase 2)
import { firewallDefense } from './os/apps/firewallDefense.js';
import { cosmeticTerminal } from './os/apps/cosmeticTerminal.js';

// Import new game systems
import { ResourceManager } from './state/resourceManager.js';
import { TaskScheduler } from './state/taskScheduler.js';
import { initSynergySystem } from './state/heroSynergies.js';
import { audioManager } from './state/audioManager.js';
import { eventBus } from './state/eventBus.js';
import { themeManager } from './state/themeManager.js';
import { tasksSystem } from './state/tasksSystem.js';

const root = document.getElementById('app');

// Initialize toast notification system
initToastManager();

// Initialize settings system
initSettings();

const { desktopEl, windowLayerEl} = createDesktop();
root.appendChild(desktopEl);

windowManager.init(windowLayerEl);

// Initialize new game systems
const resourceManager = new ResourceManager();
const taskScheduler = new TaskScheduler(resourceManager);

// Set resource manager for apps that need it
skillTreeApp.setResourceManager(resourceManager);
defragger.setResourceManager(resourceManager);
firewallDefense.setResourceManager(resourceManager);
cosmeticTerminal.setResourceManager(resourceManager);

// Initialize adaptive music (Phase 2)
audioManager.initEventListeners(eventBus);
audioManager.loadState();

// Initialize theme manager (Phase 3)
themeManager.loadTheme();

// Initialize tasks system (Phase 3)
tasksSystem.init();

// Register apps with window manager
windowManager.registerApp(questExplorerApp);
windowManager.registerApp(mailClientApp);
windowManager.registerApp(taskSchedulerUIApp);
windowManager.registerApp(researchLabApp);
windowManager.registerApp(soulwareStoreApp);
windowManager.registerApp(lootDownloadsApp);
windowManager.registerApp(recycleShrineApp);
windowManager.registerApp(systemSigilsApp);
windowManager.registerApp(speculationTerminalApp);
windowManager.registerApp(settingsApp);
// NEW APPS (Phase 1)
windowManager.registerApp(musicPlayer);
windowManager.registerApp(skillTreeApp);
windowManager.registerApp(defragger);
// NEW APPS (Phase 2)
windowManager.registerApp(firewallDefense);
windowManager.registerApp(cosmeticTerminal);

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
