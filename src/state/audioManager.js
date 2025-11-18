/**
 * Audio Manager
 * Manages background music playback with fade transitions and adaptive behavior
 */

export class AudioManager {
  constructor() {
    this.audioElement = null;
    this.currentTrack = null;
    this.volume = 0.5; // 0 to 1
    this.enabled = true;
    this.mode = 'manual'; // 'manual' or 'adaptive'
    this.tracks = this.initializeTracks();
    this.fadeInterval = null;
    this.isTransitioning = false;
  }

  /**
   * Initialize track library
   * Note: Using placeholder paths - replace with actual audio files
   */
  initializeTracks() {
    return {
      desktopTheme: {
        id: 'desktopTheme',
        name: 'Desktop Ambience',
        path: 'assets/audio/desktop-theme.mp3',
        category: 'idle',
        duration: 180 // seconds (placeholder)
      },
      battleTheme: {
        id: 'battleTheme',
        name: 'Combat Protocol',
        path: 'assets/audio/battle-theme.mp3',
        category: 'combat',
        duration: 120
      },
      bossTheme: {
        id: 'bossTheme',
        name: 'System Override',
        path: 'assets/audio/boss-theme.mp3',
        category: 'boss',
        duration: 150
      },
      shopTheme: {
        id: 'shopTheme',
        name: 'Merchant Protocol',
        path: 'assets/audio/shop-theme.mp3',
        category: 'shop',
        duration: 90
      },
      victoryJingle: {
        id: 'victoryJingle',
        name: 'Quest Complete',
        path: 'assets/audio/victory.mp3',
        category: 'jingle',
        duration: 5
      }
    };
  }

  /**
   * Initialize the audio element
   */
  init() {
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.loop = true;
      this.audioElement.volume = this.volume;

      // Event listeners
      this.audioElement.addEventListener('ended', () => {
        if (this.mode === 'adaptive') {
          this.handleTrackEnd();
        }
      });

      this.audioElement.addEventListener('error', (e) => {
        console.warn('Audio playback error:', e);
        // Fail silently - audio files may not exist yet
      });
    }
  }

  /**
   * Play a specific track
   * @param {string} trackId - ID of track to play
   * @param {boolean} fade - Whether to fade in (default: true)
   */
  playTrack(trackId, fade = true) {
    if (!this.enabled) return;

    const track = this.tracks[trackId];
    if (!track) {
      console.warn(`Track ${trackId} not found`);
      return;
    }

    // Already playing this track
    if (this.currentTrack === trackId && !this.audioElement.paused) {
      return;
    }

    this.init();

    // If currently playing, fade out first
    if (this.currentTrack && !this.audioElement.paused) {
      this.fadeOut(() => {
        this.loadAndPlay(track, fade);
      });
    } else {
      this.loadAndPlay(track, fade);
    }
  }

  /**
   * Load and play a track
   * @private
   */
  loadAndPlay(track, fade) {
    this.currentTrack = track.id;
    this.audioElement.src = track.path;

    if (fade) {
      this.audioElement.volume = 0;
      this.audioElement.play().catch(e => {
        // Browser may block autoplay - log but don't crash
        console.log('Audio autoplay prevented:', e.message);
      });
      this.fadeIn();
    } else {
      this.audioElement.volume = this.volume;
      this.audioElement.play().catch(e => {
        console.log('Audio autoplay prevented:', e.message);
      });
    }
  }

  /**
   * Pause current track
   */
  pause() {
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
    }
  }

  /**
   * Resume current track
   */
  resume() {
    if (this.audioElement && this.audioElement.paused && this.enabled) {
      this.audioElement.play().catch(e => {
        console.log('Audio resume prevented:', e.message);
      });
    }
  }

  /**
   * Stop playback completely
   */
  stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.currentTrack = null;
    }
  }

  /**
   * Set volume (0 to 1)
   * @param {number} volume - Volume level (0-1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
  }

  /**
   * Toggle music on/off
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  /**
   * Set playback mode
   * @param {string} mode - 'manual' or 'adaptive'
   */
  setMode(mode) {
    this.mode = mode;
  }

  /**
   * Fade in over 500ms
   * @private
   */
  fadeIn() {
    if (!this.audioElement || this.isTransitioning) return;

    this.isTransitioning = true;
    const startVolume = 0;
    const targetVolume = this.volume;
    const fadeTime = 500; // ms
    const steps = 20;
    const stepTime = fadeTime / steps;
    const volumeStep = (targetVolume - startVolume) / steps;

    let currentStep = 0;
    this.audioElement.volume = startVolume;

    this.fadeInterval = setInterval(() => {
      currentStep++;
      const newVolume = startVolume + (volumeStep * currentStep);
      this.audioElement.volume = Math.min(newVolume, targetVolume);

      if (currentStep >= steps) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        this.isTransitioning = false;
      }
    }, stepTime);
  }

  /**
   * Fade out over 500ms, then execute callback
   * @private
   */
  fadeOut(callback) {
    if (!this.audioElement || this.isTransitioning) {
      if (callback) callback();
      return;
    }

    this.isTransitioning = true;
    const startVolume = this.audioElement.volume;
    const targetVolume = 0;
    const fadeTime = 500; // ms
    const steps = 20;
    const stepTime = fadeTime / steps;
    const volumeStep = (startVolume - targetVolume) / steps;

    let currentStep = 0;

    this.fadeInterval = setInterval(() => {
      currentStep++;
      const newVolume = startVolume - (volumeStep * currentStep);
      this.audioElement.volume = Math.max(newVolume, targetVolume);

      if (currentStep >= steps) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        this.audioElement.pause();
        this.isTransitioning = false;
        if (callback) callback();
      }
    }, stepTime);
  }

  /**
   * Handle track ending (for adaptive mode)
   * @private
   */
  handleTrackEnd() {
    // Auto-replay same track or pick next based on game state
    if (this.currentTrack) {
      this.playTrack(this.currentTrack, false);
    }
  }

  /**
   * Get all available tracks
   * @returns {Object} Track library
   */
  getTracks() {
    return this.tracks;
  }

  /**
   * Get current playback state
   * @returns {Object} State info
   */
  getState() {
    return {
      currentTrack: this.currentTrack,
      isPlaying: this.audioElement && !this.audioElement.paused,
      volume: this.volume,
      enabled: this.enabled,
      mode: this.mode
    };
  }

  /**
   * Adaptive music: switch track based on game state
   * @param {string} gameStateMode - 'idle', 'combat', 'boss', 'shop'
   */
  adaptToGameState(gameStateMode) {
    if (this.mode !== 'adaptive') return;

    const trackMap = {
      idle: 'desktopTheme',
      combat: 'battleTheme',
      boss: 'bossTheme',
      shop: 'shopTheme'
    };

    const trackId = trackMap[gameStateMode];
    if (trackId && trackId !== this.currentTrack) {
      this.playTrack(trackId, true);
    }
  }

  /**
   * Persist state to localStorage
   */
  saveState() {
    const state = {
      volume: this.volume,
      enabled: this.enabled,
      mode: this.mode,
      currentTrack: this.currentTrack
    };
    localStorage.setItem('audioManagerState', JSON.stringify(state));
  }

  /**
   * Load state from localStorage
   */
  loadState() {
    const saved = localStorage.getItem('audioManagerState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        this.volume = state.volume ?? 0.5;
        this.enabled = state.enabled ?? true;
        this.mode = state.mode ?? 'manual';
        this.currentTrack = state.currentTrack ?? null;

        if (this.audioElement) {
          this.audioElement.volume = this.volume;
        }
      } catch (e) {
        console.warn('Failed to load audio state:', e);
      }
    }
  }
}

// Export singleton instance
export const audioManager = new AudioManager();
