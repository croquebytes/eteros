// ===== Task Scheduler System =====
// Manages time-based tasks (research, compilation, defragmentation)

import { eventBus, EVENTS } from './eventBus.js';
import { ResourceManager } from './resourceManager.js';

export class TaskScheduler {
  constructor(gameState) {
    this.state = gameState;
    this.resourceManager = new ResourceManager(gameState);
  }

  /**
   * Start a new task
   * @param {Object} taskConfig - Task configuration
   * @returns {boolean} Success
   */
  startTask(taskConfig) {
    const { id, name, type, duration, cost, reward, onComplete } = taskConfig;

    // Check if can afford
    if (!this.resourceManager.canAfford(cost)) {
      console.log(`Cannot afford task: ${name}`);
      return false;
    }

    // Deduct cost immediately
    if (!this.resourceManager.spendMultiple(cost)) {
      return false;
    }

    // Create task object
    const task = {
      id: id || `task_${Date.now()}_${Math.random()}`,
      name,
      type,
      duration,
      cost,
      reward,
      startTime: Date.now(),
      completionTime: Date.now() + duration,
      onComplete,
      progress: 0
    };

    // Add to active tasks
    this.state.activeTasks.push(task);

    // Emit event
    eventBus.emit(EVENTS.TASK_STARTED, task);

    console.log(`Task started: ${name} (${duration}ms)`);
    return true;
  }

  /**
   * Cancel an active task
   * @param {string} taskId - Task ID
   * @param {boolean} refund - Whether to refund costs
   * @returns {boolean} Success
   */
  cancelTask(taskId, refund = false) {
    const taskIndex = this.state.activeTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return false;
    }

    const task = this.state.activeTasks[taskIndex];

    // Refund if requested
    if (refund) {
      for (const [resource, amount] of Object.entries(task.cost)) {
        this.resourceManager.add(resource, amount, 'task_refund');
      }
    }

    // Remove from active tasks
    this.state.activeTasks.splice(taskIndex, 1);

    // Emit event
    eventBus.emit(EVENTS.TASK_CANCELLED, task);

    console.log(`Task cancelled: ${task.name}`);
    return true;
  }

  /**
   * Update all active tasks
   * Called each game tick
   */
  tick() {
    const now = Date.now();
    const completedTasks = [];

    // Update progress and check for completion
    for (const task of this.state.activeTasks) {
      const elapsed = now - task.startTime;
      task.progress = Math.min(1, elapsed / task.duration);

      if (now >= task.completionTime) {
        completedTasks.push(task);
      }
    }

    // Complete finished tasks
    for (const task of completedTasks) {
      this.completeTask(task);
    }
  }

  /**
   * Complete a task
   * @param {Object} task - Task object
   */
  completeTask(task) {
    // Remove from active tasks
    const index = this.state.activeTasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      this.state.activeTasks.splice(index, 1);
    }

    // Add to completed tasks
    this.state.completedTasks.push({
      ...task,
      completedAt: Date.now()
    });

    // Grant rewards
    if (task.reward) {
      for (const [resource, amount] of Object.entries(task.reward)) {
        this.resourceManager.add(resource, amount, `task:${task.name}`);
      }
    }

    // Execute completion callback
    if (task.onComplete) {
      try {
        task.onComplete(this.state);
      } catch (error) {
        console.error('Task completion callback error:', error);
      }
    }

    // Emit event
    eventBus.emit(EVENTS.TASK_COMPLETED, task);

    console.log(`Task completed: ${task.name}`);
  }

  /**
   * Get all active tasks
   * @returns {Array} Active tasks
   */
  getActiveTasks() {
    return [...this.state.activeTasks];
  }

  /**
   * Get task by ID
   * @param {string} taskId - Task ID
   * @returns {Object|null} Task or null
   */
  getTask(taskId) {
    return this.state.activeTasks.find(t => t.id === taskId) || null;
  }

  /**
   * Accelerate a task (spend resources to speed up)
   * @param {string} taskId - Task ID
   * @param {number} multiplier - Speed multiplier (2x, 4x, etc.)
   * @param {Object} cost - Cost to accelerate
   * @returns {boolean} Success
   */
  accelerateTask(taskId, multiplier, cost) {
    const task = this.getTask(taskId);
    if (!task) return false;

    if (!this.resourceManager.canAfford(cost)) {
      return false;
    }

    if (!this.resourceManager.spendMultiple(cost)) {
      return false;
    }

    // Reduce remaining time
    const now = Date.now();
    const remaining = task.completionTime - now;
    const reduction = remaining * (1 - 1/multiplier);

    task.completionTime -= reduction;

    console.log(`Task accelerated: ${task.name} (${multiplier}x)`);
    return true;
  }
}

// ===== Task Templates =====
export const TASK_TEMPLATES = {
  // Research tasks
  research_basic_cpu: {
    type: 'research',
    name: 'Basic CPU Optimization',
    duration: 60000, // 1 minute
    cost: { codeFragments: 10, cpuCycles: 50 },
    reward: {},
    onComplete: (state) => {
      state.research.cpuBoost += 0.5;
      state.research.completed.push('basic_cpu');
    }
  },

  research_memory_management: {
    type: 'research',
    name: 'Memory Management',
    duration: 120000, // 2 minutes
    cost: { codeFragments: 25, memoryBlocks: 5 },
    reward: {},
    onComplete: (state) => {
      state.maxInventorySlots += 10;
      state.research.completed.push('memory_management');
    }
  },

  // Compilation tasks
  compile_hero_blueprint: {
    type: 'compilation',
    name: 'Compile Hero Blueprint',
    duration: 180000, // 3 minutes
    cost: { codeFragments: 50, cpuCycles: 100 },
    reward: {},
    onComplete: (state) => {
      // TODO: Add hero blueprint to rewards
      console.log('Hero blueprint ready!');
    }
  },

  // Defragmentation tasks
  defrag_minor: {
    type: 'defragmentation',
    name: 'Minor Defragmentation',
    duration: 30000, // 30 seconds
    cost: { cpuCycles: 30 },
    reward: { memoryBlocks: 1 }
  },

  defrag_major: {
    type: 'defragmentation',
    name: 'Major Defragmentation',
    duration: 240000, // 4 minutes
    cost: { cpuCycles: 200 },
    reward: { memoryBlocks: 10, codeFragments: 25 }
  }
};
