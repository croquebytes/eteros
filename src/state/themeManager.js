/**
 * Theme Manager
 * Manages application of cosmetic items (wallpapers, window frames, icon packs)
 * Integrates with Cosmetic Terminal for unlocked items
 */

export class ThemeManager {
  constructor() {
    this.currentTheme = {
      wallpaper: 'default',
      windowFrame: 'default',
      iconPack: 'default'
    };

    this.wallpapers = this.initializeWallpapers();
    this.windowFrames = this.initializeWindowFrames();
    this.iconPacks = this.initializeIconPacks();
  }

  /**
   * Initialize wallpaper definitions
   */
  initializeWallpapers() {
    return {
      default: {
        id: 'default',
        name: 'Default Radial',
        style: {
          background: 'radial-gradient(circle at 30% 30%, #1a2744 0%, #050815 60%)'
        }
      },
      wallpaper_grid: {
        id: 'wallpaper_grid',
        name: 'Grid Wallpaper',
        style: {
          background: '#050815',
          backgroundImage: `
            linear-gradient(rgba(34, 51, 85, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 51, 85, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }
      },
      wallpaper_waves: {
        id: 'wallpaper_waves',
        name: 'Wave Wallpaper',
        style: {
          background: 'linear-gradient(135deg, #050815 0%, #0a1020 25%, #050815 50%, #0a1020 75%, #050815 100%)',
          backgroundSize: '400% 400%'
        }
      },
      wallpaper_nebula: {
        id: 'wallpaper_nebula',
        name: 'Nebula Wallpaper',
        style: {
          background: 'radial-gradient(ellipse at 20% 40%, #4a1a5a 0%, #050815 50%), radial-gradient(ellipse at 80% 60%, #1a3a5a 0%, transparent 50%)'
        }
      },
      wallpaper_circuit: {
        id: 'wallpaper_circuit',
        name: 'Circuit Board',
        style: {
          background: '#050815',
          backgroundImage: `
            linear-gradient(rgba(68, 136, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(68, 136, 255, 0.1) 1px, transparent 1px),
            radial-gradient(circle at 25% 25%, rgba(68, 136, 255, 0.2) 0%, transparent 20%),
            radial-gradient(circle at 75% 75%, rgba(68, 136, 255, 0.2) 0%, transparent 20%)
          `,
          backgroundSize: '30px 30px, 30px 30px, 200px 200px, 200px 200px'
        }
      },
      wallpaper_matrix: {
        id: 'wallpaper_matrix',
        name: 'Matrix Rain',
        style: {
          background: 'linear-gradient(180deg, #001a00 0%, #000d00 100%)'
        },
        animated: true
      },
      wallpaper_galaxy: {
        id: 'wallpaper_galaxy',
        name: 'Galaxy Spiral',
        style: {
          background: 'radial-gradient(ellipse at center, #2a1a4a 0%, #050815 50%, #000000 100%)'
        },
        animated: true
      }
    };
  }

  /**
   * Initialize window frame definitions
   */
  initializeWindowFrames() {
    return {
      default: {
        id: 'default',
        name: 'Default Frame',
        cssVars: {
          '--window-border': '1px solid #334',
          '--window-titlebar-bg': '#1b2943',
          '--window-titlebar-color': '#f5f5f5'
        }
      },
      frame_blue: {
        id: 'frame_blue',
        name: 'Blue Window Frame',
        cssVars: {
          '--window-border': '2px solid #4488ff',
          '--window-titlebar-bg': 'linear-gradient(135deg, #2244aa, #4488ff)',
          '--window-titlebar-color': '#ffffff'
        }
      },
      frame_green: {
        id: 'frame_green',
        name: 'Green Window Frame',
        cssVars: {
          '--window-border': '2px solid #44ff44',
          '--window-titlebar-bg': 'linear-gradient(135deg, #228822, #44ff44)',
          '--window-titlebar-color': '#000000'
        }
      },
      frame_gold: {
        id: 'frame_gold',
        name: 'Gold Window Frame',
        cssVars: {
          '--window-border': '2px solid #ffaa00',
          '--window-titlebar-bg': 'linear-gradient(135deg, #aa6600, #ffcc44)',
          '--window-titlebar-color': '#000000'
        }
      },
      frame_rainbow: {
        id: 'frame_rainbow',
        name: 'RGB Window Frame',
        cssVars: {
          '--window-border': '2px solid #ff44ff',
          '--window-titlebar-bg': 'linear-gradient(135deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff)',
          '--window-titlebar-color': '#ffffff'
        },
        animated: true
      }
    };
  }

  /**
   * Initialize icon pack definitions
   */
  initializeIconPacks() {
    return {
      default: {
        id: 'default',
        name: 'Default Icons',
        style: {
          fontSize: '2rem',
          filter: 'none'
        }
      },
      icon_minimal: {
        id: 'icon_minimal',
        name: 'Minimal Icons',
        style: {
          fontSize: '1.5rem',
          filter: 'grayscale(0.5)'
        }
      },
      icon_retro: {
        id: 'icon_retro',
        name: 'Retro Icons',
        style: {
          fontSize: '2.5rem',
          filter: 'contrast(1.2) saturate(1.5)'
        }
      },
      icon_neon: {
        id: 'icon_neon',
        name: 'Neon Icons',
        style: {
          fontSize: '2rem',
          filter: 'brightness(1.5) saturate(2)',
          textShadow: '0 0 10px currentColor'
        }
      },
      icon_animated: {
        id: 'icon_animated',
        name: 'Animated Icons',
        style: {
          fontSize: '2rem',
          filter: 'none'
        },
        animated: true,
        animation: 'icon-float 3s ease-in-out infinite'
      }
    };
  }

  /**
   * Apply wallpaper
   * @param {string} wallpaperId - ID of wallpaper to apply
   */
  applyWallpaper(wallpaperId) {
    const wallpaper = this.wallpapers[wallpaperId];
    if (!wallpaper) {
      console.warn(`Wallpaper ${wallpaperId} not found`);
      return false;
    }

    const desktopWallpaper = document.getElementById('desktop-wallpaper');
    if (!desktopWallpaper) return false;

    // Apply styles
    Object.assign(desktopWallpaper.style, wallpaper.style);

    // Handle animated wallpapers
    if (wallpaper.animated) {
      desktopWallpaper.classList.add('wallpaper-animated');
    } else {
      desktopWallpaper.classList.remove('wallpaper-animated');
    }

    this.currentTheme.wallpaper = wallpaperId;
    this.saveTheme();
    return true;
  }

  /**
   * Apply window frame
   * @param {string} frameId - ID of window frame to apply
   */
  applyWindowFrame(frameId) {
    const frame = this.windowFrames[frameId];
    if (!frame) {
      console.warn(`Window frame ${frameId} not found`);
      return false;
    }

    const root = document.documentElement;

    // Apply CSS variables
    Object.entries(frame.cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Handle animated frames
    if (frame.animated) {
      root.classList.add('frame-animated');
    } else {
      root.classList.remove('frame-animated');
    }

    this.currentTheme.windowFrame = frameId;
    this.saveTheme();
    return true;
  }

  /**
   * Apply icon pack
   * @param {string} iconPackId - ID of icon pack to apply
   */
  applyIconPack(iconPackId) {
    const iconPack = this.iconPacks[iconPackId];
    if (!iconPack) {
      console.warn(`Icon pack ${iconPackId} not found`);
      return false;
    }

    const icons = document.querySelectorAll('.desktop-icon-glyph');

    icons.forEach(icon => {
      // Apply styles
      Object.assign(icon.style, iconPack.style);

      // Handle animated icons
      if (iconPack.animated && iconPack.animation) {
        icon.style.animation = iconPack.animation;
      } else {
        icon.style.animation = '';
      }
    });

    this.currentTheme.iconPack = iconPackId;
    this.saveTheme();
    return true;
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return { ...this.currentTheme };
  }

  /**
   * Apply a complete theme
   * @param {Object} theme - Theme object with wallpaper, windowFrame, iconPack
   */
  applyTheme(theme) {
    if (theme.wallpaper) {
      this.applyWallpaper(theme.wallpaper);
    }
    if (theme.windowFrame) {
      this.applyWindowFrame(theme.windowFrame);
    }
    if (theme.iconPack) {
      this.applyIconPack(theme.iconPack);
    }
  }

  /**
   * Reset to default theme
   */
  resetTheme() {
    this.applyTheme({
      wallpaper: 'default',
      windowFrame: 'default',
      iconPack: 'default'
    });
  }

  /**
   * Save current theme to localStorage
   */
  saveTheme() {
    localStorage.setItem('currentTheme', JSON.stringify(this.currentTheme));
  }

  /**
   * Load theme from localStorage
   */
  loadTheme() {
    const saved = localStorage.getItem('currentTheme');
    if (saved) {
      try {
        const theme = JSON.parse(saved);
        this.currentTheme = theme;
        // Apply loaded theme after a short delay to ensure DOM is ready
        setTimeout(() => {
          this.applyTheme(theme);
        }, 100);
      } catch (e) {
        console.warn('Failed to load theme:', e);
      }
    }
  }

  /**
   * Get cosmetic info by ID (for Cosmetic Terminal integration)
   */
  getCosmeticInfo(cosmeticId) {
    // Check all cosmetic types
    if (this.wallpapers[cosmeticId]) {
      return { ...this.wallpapers[cosmeticId], type: 'wallpaper' };
    }
    if (this.windowFrames[cosmeticId]) {
      return { ...this.windowFrames[cosmeticId], type: 'windowFrame' };
    }
    if (this.iconPacks[cosmeticId]) {
      return { ...this.iconPacks[cosmeticId], type: 'iconPack' };
    }
    return null;
  }

  /**
   * Check if cosmetic is currently applied
   */
  isCosmeticApplied(cosmeticId) {
    return Object.values(this.currentTheme).includes(cosmeticId);
  }
}

// Export singleton instance
export const themeManager = new ThemeManager();
