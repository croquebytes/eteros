/**
 * Daily/Weekly Tasks System
 * Provides hooks for time-based recurring tasks with progress tracking
 * This is a foundation system - full UI implementation in future phases
 */

export class TasksSystem {
  constructor() {
    this.dailyTasks = [];
    this.weeklyTasks = [];
    this.lastDailyReset = null;
    this.lastWeeklyReset = null;
    this.eventListeners = [];
  }

  /**
   * Initialize the tasks system
   */
  init() {
    this.loadState();
    this.initializeTasks();
    this.checkResets();
  }

  /**
   * Initialize task definitions
   * These are templates that get instantiated for each reset period
   */
  initializeTasks() {
    this.taskTemplates = {
      daily: [
        {
          id: 'daily_waves_10',
          name: 'Wave Warrior',
          description: 'Complete 10 waves',
          type: 'wave_completion',
          target: 10,
          rewards: {
            gold: 100,
            xp: 50
          }
        },
        {
          id: 'daily_minigame_3',
          name: 'Mini-Game Master',
          description: 'Play 3 mini-games',
          type: 'minigame_plays',
          target: 3,
          rewards: {
            gold: 150,
            cpuCycles: 10
          }
        },
        {
          id: 'daily_skill_unlock_1',
          name: 'Skill Seeker',
          description: 'Unlock 1 skill node',
          type: 'skill_unlocks',
          target: 1,
          rewards: {
            gold: 200,
            codeFragments: 5
          }
        },
        {
          id: 'daily_gold_1000',
          name: 'Gold Digger',
          description: 'Earn 1000 gold',
          type: 'gold_earned',
          target: 1000,
          rewards: {
            gold: 500,
            memoryBlocks: 1
          }
        }
      ],
      weekly: [
        {
          id: 'weekly_waves_100',
          name: 'Wave Legend',
          description: 'Complete 100 waves',
          type: 'wave_completion',
          target: 100,
          rewards: {
            gold: 1000,
            xp: 500,
            soulCores: 10
          }
        },
        {
          id: 'weekly_minigame_20',
          name: 'Mini-Game Veteran',
          description: 'Play 20 mini-games',
          type: 'minigame_plays',
          target: 20,
          rewards: {
            gold: 1500,
            entropyDust: 50
          }
        },
        {
          id: 'weekly_skill_unlock_10',
          name: 'Skill Master',
          description: 'Unlock 10 skill nodes',
          type: 'skill_unlocks',
          target: 10,
          rewards: {
            gold: 2000,
            codeFragments: 50,
            memoryBlocks: 5
          }
        },
        {
          id: 'weekly_cosmetic_5',
          name: 'Collector',
          description: 'Roll 5 cosmetics',
          type: 'cosmetic_rolls',
          target: 5,
          rewards: {
            gold: 500,
            soulCores: 5
          }
        }
      ]
    };
  }

  /**
   * Check if tasks need to be reset
   */
  checkResets() {
    const now = Date.now();

    // Check daily reset (resets at midnight local time)
    if (this.shouldResetDaily(now)) {
      this.resetDailyTasks();
    }

    // Check weekly reset (resets Monday midnight local time)
    if (this.shouldResetWeekly(now)) {
      this.resetWeeklyTasks();
    }
  }

  /**
   * Check if daily tasks should reset
   */
  shouldResetDaily(now) {
    if (!this.lastDailyReset) return true;

    const lastReset = new Date(this.lastDailyReset);
    const current = new Date(now);

    // Check if it's a different day
    return lastReset.getDate() !== current.getDate() ||
           lastReset.getMonth() !== current.getMonth() ||
           lastReset.getFullYear() !== current.getFullYear();
  }

  /**
   * Check if weekly tasks should reset
   */
  shouldResetWeekly(now) {
    if (!this.lastWeeklyReset) return true;

    const lastReset = new Date(this.lastWeeklyReset);
    const current = new Date(now);

    // Get Monday of current week
    const currentMonday = this.getMondayOfWeek(current);
    const lastMonday = this.getMondayOfWeek(lastReset);

    return currentMonday.getTime() !== lastMonday.getTime();
  }

  /**
   * Get Monday of a given week
   */
  getMondayOfWeek(date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  /**
   * Reset daily tasks
   */
  resetDailyTasks() {
    this.dailyTasks = this.taskTemplates.daily.map(template => ({
      ...template,
      progress: 0,
      completed: false,
      claimedReward: false
    }));

    this.lastDailyReset = Date.now();
    this.saveState();
    this.emitEvent('DAILY_TASKS_RESET', { tasks: this.dailyTasks });
  }

  /**
   * Reset weekly tasks
   */
  resetWeeklyTasks() {
    this.weeklyTasks = this.taskTemplates.weekly.map(template => ({
      ...template,
      progress: 0,
      completed: false,
      claimedReward: false
    }));

    this.lastWeeklyReset = Date.now();
    this.saveState();
    this.emitEvent('WEEKLY_TASKS_RESET', { tasks: this.weeklyTasks });
  }

  /**
   * Update task progress
   * @param {string} taskType - Type of task (wave_completion, minigame_plays, etc.)
   * @param {number} amount - Amount to add to progress
   */
  updateProgress(taskType, amount = 1) {
    let updated = false;

    // Update daily tasks
    this.dailyTasks.forEach(task => {
      if (task.type === taskType && !task.completed) {
        task.progress = Math.min(task.progress + amount, task.target);
        if (task.progress >= task.target) {
          task.completed = true;
          this.emitEvent('TASK_COMPLETED', { task, period: 'daily' });
        }
        updated = true;
      }
    });

    // Update weekly tasks
    this.weeklyTasks.forEach(task => {
      if (task.type === taskType && !task.completed) {
        task.progress = Math.min(task.progress + amount, task.target);
        if (task.progress >= task.target) {
          task.completed = true;
          this.emitEvent('TASK_COMPLETED', { task, period: 'weekly' });
        }
        updated = true;
      }
    });

    if (updated) {
      this.saveState();
      this.emitEvent('TASK_PROGRESS_UPDATED', { taskType, amount });
    }
  }

  /**
   * Claim task reward
   * @param {string} taskId - ID of task to claim
   * @param {string} period - 'daily' or 'weekly'
   * @returns {Object|null} Rewards object or null if failed
   */
  claimReward(taskId, period) {
    const tasks = period === 'daily' ? this.dailyTasks : this.weeklyTasks;
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
      console.warn(`Task ${taskId} not found`);
      return null;
    }

    if (!task.completed) {
      console.warn(`Task ${taskId} not completed`);
      return null;
    }

    if (task.claimedReward) {
      console.warn(`Task ${taskId} reward already claimed`);
      return null;
    }

    task.claimedReward = true;
    this.saveState();
    this.emitEvent('TASK_REWARD_CLAIMED', { task, period });

    return task.rewards;
  }

  /**
   * Get all daily tasks
   */
  getDailyTasks() {
    return [...this.dailyTasks];
  }

  /**
   * Get all weekly tasks
   */
  getWeeklyTasks() {
    return [...this.weeklyTasks];
  }

  /**
   * Get completion stats
   */
  getCompletionStats() {
    const dailyCompleted = this.dailyTasks.filter(t => t.completed).length;
    const dailyTotal = this.dailyTasks.length;
    const weeklyCompleted = this.weeklyTasks.filter(t => t.completed).length;
    const weeklyTotal = this.weeklyTasks.length;

    return {
      daily: {
        completed: dailyCompleted,
        total: dailyTotal,
        percentage: dailyTotal > 0 ? (dailyCompleted / dailyTotal) * 100 : 0
      },
      weekly: {
        completed: weeklyCompleted,
        total: weeklyTotal,
        percentage: weeklyTotal > 0 ? (weeklyCompleted / weeklyTotal) * 100 : 0
      }
    };
  }

  /**
   * Register event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    this.eventListeners.push({ event, callback });
  }

  /**
   * Emit event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emitEvent(event, data) {
    this.eventListeners
      .filter(listener => listener.event === event)
      .forEach(listener => listener.callback(data));
  }

  /**
   * Save state to localStorage
   */
  saveState() {
    const state = {
      dailyTasks: this.dailyTasks,
      weeklyTasks: this.weeklyTasks,
      lastDailyReset: this.lastDailyReset,
      lastWeeklyReset: this.lastWeeklyReset
    };
    localStorage.setItem('tasksSystemState', JSON.stringify(state));
  }

  /**
   * Load state from localStorage
   */
  loadState() {
    const saved = localStorage.getItem('tasksSystemState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        this.dailyTasks = state.dailyTasks || [];
        this.weeklyTasks = state.weeklyTasks || [];
        this.lastDailyReset = state.lastDailyReset;
        this.lastWeeklyReset = state.lastWeeklyReset;
      } catch (e) {
        console.warn('Failed to load tasks system state:', e);
      }
    }
  }

  /**
   * Get time until next daily reset
   * @returns {number} Milliseconds until reset
   */
  getTimeUntilDailyReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime() - now.getTime();
  }

  /**
   * Get time until next weekly reset
   * @returns {number} Milliseconds until reset
   */
  getTimeUntilWeeklyReset() {
    const now = new Date();
    const nextMonday = this.getMondayOfWeek(now);
    nextMonday.setDate(nextMonday.getDate() + 7);
    return nextMonday.getTime() - now.getTime();
  }
}

// Export singleton instance
export const tasksSystem = new TasksSystem();

/**
 * Helper function to format time until reset
 * @param {number} ms - Milliseconds
 * @returns {string} Formatted string (e.g., "5h 23m")
 */
export function formatTimeUntilReset(ms) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}
