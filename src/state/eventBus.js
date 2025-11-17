// ===== EventBus System =====
// Decoupled communication system for modules
// Allows apps and systems to communicate without tight coupling

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Handler function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Handler function
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`EventBus error in ${event}:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to an event once
   * @param {string} event - Event name
   * @param {Function} callback - Handler function
   */
  once(event, callback) {
    const onceWrapper = (data) => {
      callback(data);
      this.off(event, onceWrapper);
    };
    this.on(event, onceWrapper);
  }

  /**
   * Clear all listeners for an event
   * @param {string} event - Event name
   */
  clear(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// Export singleton instance
export const eventBus = new EventBus();

// ===== Event Constants =====
// Centralized event names to prevent typos

export const EVENTS = {
  // Resource events
  RESOURCE_CHANGED: 'resource:changed',
  RESOURCE_INSUFFICIENT: 'resource:insufficient',

  // Combat events
  WAVE_STARTED: 'combat:wave_started',
  WAVE_COMPLETED: 'combat:wave_completed',
  ENEMY_DEFEATED: 'combat:enemy_defeated',
  HERO_DEFEATED: 'combat:hero_defeated',
  BOSS_DEFEATED: 'combat:boss_defeated',

  // Quest events
  QUEST_ACCEPTED: 'quest:accepted',
  QUEST_COMPLETED: 'quest:completed',
  QUEST_FAILED: 'quest:failed',
  QUEST_PROGRESS: 'quest:progress',

  // Task events
  TASK_STARTED: 'task:started',
  TASK_COMPLETED: 'task:completed',
  TASK_CANCELLED: 'task:cancelled',

  // Research events
  RESEARCH_STARTED: 'research:started',
  RESEARCH_COMPLETED: 'research:completed',

  // Item events
  ITEM_ACQUIRED: 'item:acquired',
  ITEM_EQUIPPED: 'item:equipped',
  ITEM_RECYCLED: 'item:recycled',

  // Hero events
  HERO_ADDED: 'hero:added',
  HERO_REMOVED: 'hero:removed',
  HERO_LEVELED_UP: 'hero:leveled_up',

  // Synergy events
  SYNERGIES_UPDATED: 'synergy:updated',

  // Status effect events
  STATUS_EFFECT_APPLIED: 'status:applied',
  STATUS_EFFECT_REMOVED: 'status:removed',
  STATUS_EFFECT_TICK: 'status:tick',
  DAMAGE_ABSORBED: 'status:damage_absorbed',

  // UI events
  NOTIFICATION_SHOW: 'ui:notification',
  WINDOW_OPENED: 'ui:window_opened',
  WINDOW_CLOSED: 'ui:window_closed',

  // Game events
  GAME_SAVED: 'game:saved',
  GAME_LOADED: 'game:loaded',
  PRESTIGE_ACTIVATED: 'game:prestige',

  // Dynamic events
  GLITCH_STORM_START: 'event:glitch_storm_start',
  GLITCH_STORM_END: 'event:glitch_storm_end',
  WEATHER_CHANGED: 'event:weather_changed',
  FACTION_EVENT: 'event:faction',
};
