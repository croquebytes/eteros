/**
 * Music Player App
 * OS app for controlling background music playback
 */

import { audioManager } from '../../state/audioManager.js';

export const musicPlayer = {
  id: 'musicPlayer',
  title: 'ReincarnOS Jukebox',

  createContent(rootEl) {
    // Load saved state
    audioManager.loadState();
    const state = audioManager.getState();
    const tracks = audioManager.getTracks();

    rootEl.innerHTML = `
      <div class="music-player-container">
        <!-- Header -->
        <div class="music-player-header">
          <h3>🎵 ReincarnOS Jukebox</h3>
          <p class="music-player-subtitle">Control your gaming atmosphere</p>
        </div>

        <!-- Now Playing -->
        <div class="music-player-now-playing">
          <div class="now-playing-label">Now Playing:</div>
          <div class="now-playing-track" id="mp-current-track">
            ${state.currentTrack ? tracks[state.currentTrack].name : 'No track selected'}
          </div>
        </div>

        <!-- Track List -->
        <div class="music-player-section">
          <h4>Track Library</h4>
          <div class="music-player-tracklist" id="mp-tracklist">
            <!-- Tracks will be rendered here -->
          </div>
        </div>

        <!-- Playback Controls -->
        <div class="music-player-section">
          <h4>Playback Controls</h4>
          <div class="music-player-controls">
            <button id="mp-play" class="mp-btn mp-btn-play" ${state.isPlaying ? 'disabled' : ''}>
              ▶ Play
            </button>
            <button id="mp-pause" class="mp-btn mp-btn-pause" ${!state.isPlaying ? 'disabled' : ''}>
              ⏸ Pause
            </button>
            <button id="mp-stop" class="mp-btn mp-btn-stop">
              ⏹ Stop
            </button>
          </div>
        </div>

        <!-- Volume Control -->
        <div class="music-player-section">
          <h4>Volume</h4>
          <div class="music-player-volume">
            <span class="volume-label">🔇</span>
            <input
              type="range"
              id="mp-volume"
              class="volume-slider"
              min="0"
              max="100"
              value="${Math.round(state.volume * 100)}"
            >
            <span class="volume-label">🔊</span>
            <span class="volume-value" id="mp-volume-value">${Math.round(state.volume * 100)}%</span>
          </div>
        </div>

        <!-- Music Mode -->
        <div class="music-player-section">
          <h4>Playback Mode</h4>
          <div class="music-player-mode">
            <label class="mode-option">
              <input
                type="radio"
                name="music-mode"
                value="manual"
                ${state.mode === 'manual' ? 'checked' : ''}
              >
              <span>Manual Selection</span>
              <small>You control which track plays</small>
            </label>
            <label class="mode-option">
              <input
                type="radio"
                name="music-mode"
                value="adaptive"
                ${state.mode === 'adaptive' ? 'checked' : ''}
              >
              <span>Follow Game State</span>
              <small>Music changes with gameplay (combat, idle, etc.)</small>
            </label>
          </div>
        </div>

        <!-- Music On/Off -->
        <div class="music-player-section">
          <label class="music-player-toggle">
            <input
              type="checkbox"
              id="mp-enabled"
              ${state.enabled ? 'checked' : ''}
            >
            <span>Music Enabled</span>
          </label>
        </div>

        <!-- Info Note -->
        <div class="music-player-note">
          <small>
            📝 Note: Audio files not included. Place music files in <code>assets/audio/</code>
            or update track paths in <code>audioManager.js</code>.
          </small>
        </div>
      </div>
    `;

    // Render track list
    this.renderTrackList(rootEl, tracks, state);

    // Attach event listeners
    this.attachEventListeners(rootEl);
  },

  /**
   * Render the track list
   */
  renderTrackList(rootEl, tracks, state) {
    const tracklistEl = rootEl.querySelector('#mp-tracklist');
    if (!tracklistEl) return;

    tracklistEl.innerHTML = '';

    Object.values(tracks).forEach(track => {
      const trackEl = document.createElement('div');
      trackEl.className = 'track-item' + (state.currentTrack === track.id ? ' track-active' : '');
      trackEl.dataset.trackId = track.id;

      trackEl.innerHTML = `
        <div class="track-info">
          <div class="track-name">${track.name}</div>
          <div class="track-meta">
            <span class="track-category">${this.getCategoryIcon(track.category)} ${track.category}</span>
            <span class="track-duration">${this.formatDuration(track.duration)}</span>
          </div>
        </div>
        <button class="track-play-btn" data-track-id="${track.id}">
          ${state.currentTrack === track.id && state.isPlaying ? '⏸' : '▶'}
        </button>
      `;

      tracklistEl.appendChild(trackEl);
    });
  },

  /**
   * Attach all event listeners
   */
  attachEventListeners(rootEl) {
    // Track selection (double-click)
    rootEl.querySelectorAll('.track-item').forEach(trackEl => {
      trackEl.addEventListener('dblclick', (e) => {
        const trackId = trackEl.dataset.trackId;
        audioManager.playTrack(trackId, true);
        this.updateUI(rootEl);
      });
    });

    // Track play buttons
    rootEl.querySelectorAll('.track-play-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const trackId = btn.dataset.trackId;
        const state = audioManager.getState();

        if (state.currentTrack === trackId && state.isPlaying) {
          audioManager.pause();
        } else {
          audioManager.playTrack(trackId, true);
        }
        this.updateUI(rootEl);
      });
    });

    // Playback controls
    rootEl.querySelector('#mp-play')?.addEventListener('click', () => {
      audioManager.resume();
      this.updateUI(rootEl);
    });

    rootEl.querySelector('#mp-pause')?.addEventListener('click', () => {
      audioManager.pause();
      this.updateUI(rootEl);
    });

    rootEl.querySelector('#mp-stop')?.addEventListener('click', () => {
      audioManager.stop();
      this.updateUI(rootEl);
    });

    // Volume control
    const volumeSlider = rootEl.querySelector('#mp-volume');
    volumeSlider?.addEventListener('input', (e) => {
      const volume = parseInt(e.target.value) / 100;
      audioManager.setVolume(volume);
      const volumeValue = rootEl.querySelector('#mp-volume-value');
      if (volumeValue) {
        volumeValue.textContent = `${Math.round(volume * 100)}%`;
      }
      audioManager.saveState();
    });

    // Music mode
    rootEl.querySelectorAll('input[name="music-mode"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        audioManager.setMode(e.target.value);
        audioManager.saveState();
      });
    });

    // Music enabled toggle
    rootEl.querySelector('#mp-enabled')?.addEventListener('change', (e) => {
      audioManager.setEnabled(e.target.checked);
      this.updateUI(rootEl);
      audioManager.saveState();
    });

    // Auto-update UI every second when playing
    this.startUIUpdateLoop(rootEl);
  },

  /**
   * Update UI to reflect current state
   */
  updateUI(rootEl) {
    const state = audioManager.getState();
    const tracks = audioManager.getTracks();

    // Update now playing
    const nowPlayingEl = rootEl.querySelector('#mp-current-track');
    if (nowPlayingEl) {
      nowPlayingEl.textContent = state.currentTrack ? tracks[state.currentTrack].name : 'No track selected';
    }

    // Update play/pause buttons
    const playBtn = rootEl.querySelector('#mp-play');
    const pauseBtn = rootEl.querySelector('#mp-pause');
    if (playBtn) playBtn.disabled = state.isPlaying;
    if (pauseBtn) pauseBtn.disabled = !state.isPlaying;

    // Update track list
    this.renderTrackList(rootEl, tracks, state);
  },

  /**
   * Start UI update loop (while app is open)
   */
  startUIUpdateLoop(rootEl) {
    // Clear any existing interval
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Update every second
    this.updateInterval = setInterval(() => {
      // Only update if window is still open
      if (rootEl.isConnected) {
        this.updateUI(rootEl);
      } else {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
    }, 1000);
  },

  /**
   * Get category icon
   */
  getCategoryIcon(category) {
    const icons = {
      idle: '🏠',
      combat: '⚔️',
      boss: '👹',
      shop: '🛒',
      jingle: '🎉'
    };
    return icons[category] || '🎵';
  },

  /**
   * Format duration in seconds to MM:SS
   */
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
};
