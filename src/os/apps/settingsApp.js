// ===== Settings App =====
// Game configuration and preferences

import { showToast } from '../toastManager.js';

// Default settings
const DEFAULT_SETTINGS = {
  // Gameplay
  autoBattle: true,
  combatSpeed: 1.0, // Multiplier for combat tick rate

  // UI Preferences
  showBattleTracker: true,
  enableAnimations: true,
  compactMode: false,

  // Notifications
  toastDuration: 3000,
  showCombatToasts: true,
  showLootToasts: true,
  showLevelUpToasts: true,

  // Future: Audio
  masterVolume: 0.7,
  musicVolume: 0.5,
  sfxVolume: 0.8,
  muteAll: false
};

// Load settings from localStorage
export function loadSettings() {
  const stored = localStorage.getItem('reincarnos_settings');
  if (stored) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
      console.warn('Failed to load settings, using defaults', e);
      return { ...DEFAULT_SETTINGS };
    }
  }
  return { ...DEFAULT_SETTINGS };
}

// Save settings to localStorage
export function saveSettings(settings) {
  try {
    localStorage.setItem('reincarnos_settings', JSON.stringify(settings));
    return true;
  } catch (e) {
    console.error('Failed to save settings', e);
    return false;
  }
}

// Current settings (loaded on app init)
export let gameSettings = loadSettings();

export const settingsApp = {
  id: 'settings',
  title: 'Settings – Config.exe',

  createContent(rootEl) {
    render(rootEl);
  }
};

function render(rootEl) {
  rootEl.innerHTML = `
    <div class="window-content settings-app">
      <div class="settings-header">
        <h2 class="window-subtitle">Game Configuration</h2>
        <div class="settings-actions">
          <button id="settings-reset" class="btn btn-secondary">Reset to Defaults</button>
          <button id="settings-save" class="btn">Save Settings</button>
        </div>
      </div>

      <div class="settings-panels">
        <!-- Gameplay Settings -->
        <div class="settings-panel">
          <h3 class="settings-panel-title">⚔️ Gameplay</h3>

          <div class="settings-group">
            <label class="setting-item">
              <span class="setting-label">Auto-Battle</span>
              <input type="checkbox" id="setting-auto-battle" ${gameSettings.autoBattle ? 'checked' : ''}>
              <span class="setting-description">Automatically start dungeon on wave completion</span>
            </label>
          </div>

          <div class="settings-group">
            <label class="setting-item">
              <span class="setting-label">Combat Speed</span>
              <div class="setting-slider-container">
                <input type="range" id="setting-combat-speed" min="0.5" max="2.0" step="0.1" value="${gameSettings.combatSpeed}">
                <span id="combat-speed-value">${gameSettings.combatSpeed}x</span>
              </div>
              <span class="setting-description">Adjust combat tick rate (0.5x = slower, 2.0x = faster)</span>
            </label>
          </div>
        </div>

        <!-- UI Preferences -->
        <div class="settings-panel">
          <h3 class="settings-panel-title">🖥️ Interface</h3>

          <div class="settings-group">
            <label class="setting-item">
              <span class="setting-label">Show Battle Tracker</span>
              <input type="checkbox" id="setting-show-tracker" ${gameSettings.showBattleTracker ? 'checked' : ''}>
              <span class="setting-description">Display floating battle tracker widget</span>
            </label>
          </div>

          <div class="settings-group">
            <label class="setting-item">
              <span class="setting-label">Enable Animations</span>
              <input type="checkbox" id="setting-animations" ${gameSettings.enableAnimations ? 'checked' : ''}>
              <span class="setting-description">CSS animations and transitions</span>
            </label>
          </div>

          <div class="settings-group">
            <label class="setting-item">
              <span class="setting-label">Compact Mode</span>
              <input type="checkbox" id="setting-compact" ${gameSettings.compactMode ? 'checked' : ''}>
              <span class="setting-description">Reduce spacing and font sizes</span>
            </label>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="settings-panel">
          <h3 class="settings-panel-title">🔔 Notifications</h3>

          <div class="settings-group">
            <label class="setting-item">
              <span class="setting-label">Toast Duration</span>
              <div class="setting-slider-container">
                <input type="range" id="setting-toast-duration" min="1000" max="10000" step="500" value="${gameSettings.toastDuration}">
                <span id="toast-duration-value">${gameSettings.toastDuration / 1000}s</span>
              </div>
              <span class="setting-description">How long notifications stay on screen</span>
            </label>
          </div>

          <div class="settings-group">
            <label class="setting-item">
              <span class="setting-label">Show Combat Toasts</span>
              <input type="checkbox" id="setting-combat-toasts" ${gameSettings.showCombatToasts ? 'checked' : ''}>
              <span class="setting-description">Notifications for combat events</span>
            </label>
          </div>

          <div class="settings-group">
            <label class="setting-item">
              <span class="setting-label">Show Loot Toasts</span>
              <input type="checkbox" id="setting-loot-toasts" ${gameSettings.showLootToasts ? 'checked' : ''}>
              <span class="setting-description">Notifications for item drops</span>
            </label>
          </div>

          <div class="settings-group">
            <label class="setting-item">
              <span class="setting-label">Show Level Up Toasts</span>
              <input type="checkbox" id="setting-levelup-toasts" ${gameSettings.showLevelUpToasts ? 'checked' : ''}>
              <span class="setting-description">Notifications when heroes level up</span>
            </label>
          </div>
        </div>

        <!-- Audio Settings (Future) -->
        <div class="settings-panel">
          <h3 class="settings-panel-title">🔊 Audio (Coming Soon)</h3>

          <div class="settings-group">
            <label class="setting-item">
              <span class="setting-label">Mute All</span>
              <input type="checkbox" id="setting-mute-all" ${gameSettings.muteAll ? 'checked' : ''} disabled>
              <span class="setting-description">Disable all game sounds</span>
            </label>
          </div>

          <div class="settings-group">
            <label class="setting-item">
              <span class="setting-label">Master Volume</span>
              <div class="setting-slider-container">
                <input type="range" id="setting-master-volume" min="0" max="1" step="0.1" value="${gameSettings.masterVolume}" disabled>
                <span id="master-volume-value">${Math.floor(gameSettings.masterVolume * 100)}%</span>
              </div>
              <span class="setting-description">Overall game volume</span>
            </label>
          </div>

          <div class="settings-group">
            <label class="setting-item">
              <span class="setting-label">Music Volume</span>
              <div class="setting-slider-container">
                <input type="range" id="setting-music-volume" min="0" max="1" step="0.1" value="${gameSettings.musicVolume}" disabled>
                <span id="music-volume-value">${Math.floor(gameSettings.musicVolume * 100)}%</span>
              </div>
              <span class="setting-description">Background music volume</span>
            </label>
          </div>

          <div class="settings-group">
            <label class="setting-item">
              <span class="setting-label">SFX Volume</span>
              <div class="setting-slider-container">
                <input type="range" id="setting-sfx-volume" min="0" max="1" step="0.1" value="${gameSettings.sfxVolume}" disabled>
                <span id="sfx-volume-value">${Math.floor(gameSettings.sfxVolume * 100)}%</span>
              </div>
              <span class="setting-description">Sound effects volume</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  `;

  // Wire up event listeners
  wireUpListeners(rootEl);
}

function wireUpListeners(rootEl) {
  // Combat speed slider
  const combatSpeedSlider = rootEl.querySelector('#setting-combat-speed');
  const combatSpeedValue = rootEl.querySelector('#combat-speed-value');
  if (combatSpeedSlider && combatSpeedValue) {
    combatSpeedSlider.addEventListener('input', (e) => {
      combatSpeedValue.textContent = `${parseFloat(e.target.value).toFixed(1)}x`;
    });
  }

  // Toast duration slider
  const toastDurationSlider = rootEl.querySelector('#setting-toast-duration');
  const toastDurationValue = rootEl.querySelector('#toast-duration-value');
  if (toastDurationSlider && toastDurationValue) {
    toastDurationSlider.addEventListener('input', (e) => {
      toastDurationValue.textContent = `${parseInt(e.target.value) / 1000}s`;
    });
  }

  // Volume sliders (for future use)
  const masterVolumeSlider = rootEl.querySelector('#setting-master-volume');
  const masterVolumeValue = rootEl.querySelector('#master-volume-value');
  if (masterVolumeSlider && masterVolumeValue) {
    masterVolumeSlider.addEventListener('input', (e) => {
      masterVolumeValue.textContent = `${Math.floor(parseFloat(e.target.value) * 100)}%`;
    });
  }

  const musicVolumeSlider = rootEl.querySelector('#setting-music-volume');
  const musicVolumeValue = rootEl.querySelector('#music-volume-value');
  if (musicVolumeSlider && musicVolumeValue) {
    musicVolumeSlider.addEventListener('input', (e) => {
      musicVolumeValue.textContent = `${Math.floor(parseFloat(e.target.value) * 100)}%`;
    });
  }

  const sfxVolumeSlider = rootEl.querySelector('#setting-sfx-volume');
  const sfxVolumeValue = rootEl.querySelector('#sfx-volume-value');
  if (sfxVolumeSlider && sfxVolumeValue) {
    sfxVolumeSlider.addEventListener('input', (e) => {
      sfxVolumeValue.textContent = `${Math.floor(parseFloat(e.target.value) * 100)}%`;
    });
  }

  // Save button
  rootEl.querySelector('#settings-save')?.addEventListener('click', () => {
    saveCurrentSettings(rootEl);
  });

  // Reset button
  rootEl.querySelector('#settings-reset')?.addEventListener('click', () => {
    resetToDefaults(rootEl);
  });
}

function saveCurrentSettings(rootEl) {
  // Gather all settings from form
  const newSettings = {
    autoBattle: rootEl.querySelector('#setting-auto-battle')?.checked ?? DEFAULT_SETTINGS.autoBattle,
    combatSpeed: parseFloat(rootEl.querySelector('#setting-combat-speed')?.value ?? DEFAULT_SETTINGS.combatSpeed),
    showBattleTracker: rootEl.querySelector('#setting-show-tracker')?.checked ?? DEFAULT_SETTINGS.showBattleTracker,
    enableAnimations: rootEl.querySelector('#setting-animations')?.checked ?? DEFAULT_SETTINGS.enableAnimations,
    compactMode: rootEl.querySelector('#setting-compact')?.checked ?? DEFAULT_SETTINGS.compactMode,
    toastDuration: parseInt(rootEl.querySelector('#setting-toast-duration')?.value ?? DEFAULT_SETTINGS.toastDuration),
    showCombatToasts: rootEl.querySelector('#setting-combat-toasts')?.checked ?? DEFAULT_SETTINGS.showCombatToasts,
    showLootToasts: rootEl.querySelector('#setting-loot-toasts')?.checked ?? DEFAULT_SETTINGS.showLootToasts,
    showLevelUpToasts: rootEl.querySelector('#setting-levelup-toasts')?.checked ?? DEFAULT_SETTINGS.showLevelUpToasts,
    muteAll: rootEl.querySelector('#setting-mute-all')?.checked ?? DEFAULT_SETTINGS.muteAll,
    masterVolume: parseFloat(rootEl.querySelector('#setting-master-volume')?.value ?? DEFAULT_SETTINGS.masterVolume),
    musicVolume: parseFloat(rootEl.querySelector('#setting-music-volume')?.value ?? DEFAULT_SETTINGS.musicVolume),
    sfxVolume: parseFloat(rootEl.querySelector('#setting-sfx-volume')?.value ?? DEFAULT_SETTINGS.sfxVolume)
  };

  // Update global settings
  Object.assign(gameSettings, newSettings);

  // Save to localStorage
  if (saveSettings(newSettings)) {
    showToast('Settings saved successfully!', 'success');
    applySettings(newSettings);
  } else {
    showToast('Failed to save settings', 'error');
  }
}

function resetToDefaults(rootEl) {
  // Reset to defaults
  Object.assign(gameSettings, DEFAULT_SETTINGS);
  saveSettings(DEFAULT_SETTINGS);

  // Re-render
  render(rootEl);

  showToast('Settings reset to defaults', 'info');
  applySettings(DEFAULT_SETTINGS);
}

function applySettings(settings) {
  // Apply battle tracker visibility
  const tracker = document.getElementById('battle-tracker');
  if (tracker) {
    tracker.style.display = settings.showBattleTracker ? 'flex' : 'none';
  }

  // Apply animations
  if (settings.enableAnimations) {
    document.body.classList.remove('no-animations');
  } else {
    document.body.classList.add('no-animations');
  }

  // Apply compact mode
  if (settings.compactMode) {
    document.body.classList.add('compact-mode');
  } else {
    document.body.classList.remove('compact-mode');
  }

  console.log('Applied settings:', settings);
}

// Apply settings on initial load
export function initSettings() {
  applySettings(gameSettings);
}
