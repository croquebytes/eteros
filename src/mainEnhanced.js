// ===== ReincarnOS Main Entry Point (Enhanced) =====
// Bootstrap application with all new game systems

import './style.css';
import { createDesktop } from './os/desktop.js';
import { windowManager } from './os/windowManager.js';
import { gameState, startAutoSave, updateGameState } from './state/enhancedGameState.js';
import { initToastManager } from './os/toastManager.js';
import { startCombatLoop } from './state/combatEngine.js';
import { updateMobileMode } from './os/desktopState.js';

// Import existing apps
import { questExplorerApp } from './os/apps/questExplorer.js';
import { lootDownloadsApp } from './os/apps/lootDownloads.js';
import { recycleShrineApp } from './os/apps/recycleShrine.js';
import { systemSigilsApp } from './os/apps/systemSigils.js';
import { soulwareStoreApp } from './os/apps/soulwareStore.js';

// Import new apps
import { soulSummonerApp } from './os/apps/soulSummoner.js';
import { taskManagerAppNew } from './os/apps/taskManagerApp.js';
import { mailClientApp } from './os/apps/mailClient.js';
import { taskSchedulerUIApp } from './os/apps/taskSchedulerApp.js';
import { researchLabApp } from './os/apps/researchLab.js';
import { speculationTerminalApp } from './os/apps/speculationTerminal.js';
import { settingsApp, initSettings } from './os/apps/settingsApp.js';

// NEW APPS (Phase 1)
import { musicPlayer } from './os/apps/musicPlayer.js';
import { skillTreeApp } from './os/apps/skillTreeApp.js';
import { defragger } from './os/apps/defragger.js';

// NEW APPS (Phase 2)
import { firewallDefense } from './os/apps/firewallDefense.js';
import { cosmeticTerminal } from './os/apps/cosmeticTerminal.js';

// NEW APPS (Systems & Features)
import { eBuyApp } from './os/apps/eBuy.js';

// Import new game systems
import { ResourceManager } from './state/resourceManager.js';
import { TaskScheduler } from './state/taskScheduler.js';
import { initSynergySystem } from './state/heroSynergies.js';
import { audioManager } from './state/audioManager.js';
import { eventBus } from './state/eventBus.js';
import { themeManager } from './state/themeManager.js';
import { tasksSystem } from './state/tasksSystem.js';
import { setResearchBonusesGetter } from './state/heroSystem.js';

// Make gameState available globally for debugging
window.gameState = gameState;

// Initialize toast notification system
initToastManager();

// Initialize settings system
initSettings();

// Detect and set mobile mode
updateMobileMode();

// Initialize UI
const root = document.getElementById('app');
const { desktopEl, windowLayerEl } = createDesktop();
root.appendChild(desktopEl);

// Initialize window manager
windowManager.init(windowLayerEl);

// Initialize new game systems
const resourceManager = new ResourceManager(gameState);
const taskScheduler = new TaskScheduler(resourceManager);

// Set resource manager for apps that need it
skillTreeApp.setResourceManager(resourceManager);
defragger.setResourceManager(resourceManager);
firewallDefense.setResourceManager(resourceManager);
cosmeticTerminal.setResourceManager(resourceManager);
eBuyApp.setResourceManager(resourceManager);

// Initialize adaptive music (Phase 2)
audioManager.initEventListeners(eventBus);
audioManager.loadState();

// Initialize theme manager (Phase 3)
themeManager.loadTheme();

// Initialize tasks system (Phase 3)
tasksSystem.init();

// Register all apps
windowManager.registerApp(questExplorerApp);
windowManager.registerApp(soulSummonerApp);
windowManager.registerApp(mailClientApp);
windowManager.registerApp(taskSchedulerUIApp);
windowManager.registerApp(researchLabApp);
windowManager.registerApp(lootDownloadsApp);
windowManager.registerApp(soulwareStoreApp);
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

// NEW APPS (Systems & Features)
windowManager.registerApp(eBuyApp);

// Start game systems
startCombatLoop();
startAutoSave();

// Initialize synergy system
initSynergySystem();

// Set up research bonuses getter for hero system
setResearchBonusesGetter(() => gameState.research);

// Start task scheduler tick loop (updates every 100ms)
setInterval(() => {
  taskScheduler.tick();
  resourceManager.tick(0.1); // 0.1 seconds
}, 100);

console.log('ReincarnOS booted - All systems active');

// Welcome message
console.log('='.repeat(50));
console.log('ReincarnOS v2.0 - Enhanced Edition');
console.log('='.repeat(50));
console.log('All systems online.');
console.log(`Heroes: ${gameState.heroes.length}`);
console.log(`Soul Cores: ${gameState.soulCores}`);
console.log(`Gold: ${gameState.gold}`);
console.log('='.repeat(50));
console.log('Available commands:');
console.log('  gameState - View current game state');
console.log('  saveGame() - Manual save');
console.log('  loadGame() - Manual load');
console.log('='.repeat(50));
