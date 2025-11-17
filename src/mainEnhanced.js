// ===== ReincarnOS Main Entry Point (Enhanced) =====
// Bootstrap application with all new game systems

import './style.css';
import { createDesktop } from './os/desktop.js';
import { windowManager } from './os/windowManager.js';
import { gameState, startAutoSave, updateGameState } from './state/enhancedGameState.js';

// Import existing apps
import { questExplorerApp } from './os/apps/questExplorer.js';
import { lootDownloadsApp } from './os/apps/lootDownloads.js';
import { recycleShrineApp } from './os/apps/recycleShrine.js';
import { systemSigilsApp } from './os/apps/systemSigils.js';
import { soulwareStoreApp } from './os/apps/soulwareStore.js';

// Import new apps
import { soulSummonerApp } from './os/apps/soulSummoner.js';
import { taskManagerAppNew } from './os/apps/taskManagerApp.js';

// Make gameState available globally for debugging
window.gameState = gameState;

// Initialize UI
const root = document.getElementById('app');
const { desktopEl, windowLayerEl } = createDesktop();
root.appendChild(desktopEl);

// Initialize window manager
windowManager.init(windowLayerEl);

// Register all apps
windowManager.registerApp(questExplorerApp);
windowManager.registerApp(soulSummonerApp);
windowManager.registerApp(lootDownloadsApp);
windowManager.registerApp(taskManagerAppNew);
windowManager.registerApp(soulwareStoreApp);
windowManager.registerApp(recycleShrineApp);
windowManager.registerApp(systemSigilsApp);

// Start auto-save
startAutoSave();

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
