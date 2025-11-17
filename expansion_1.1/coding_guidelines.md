# Coding Guidelines and Implementation Concepts

This document provides practical advice and code patterns for implementing the expansion content described in other files.  ReincarnOS is built with vanilla JavaScript and plain CSS; no front‑end frameworks are allowed【465890114087061†L37-L46】.  The game should run offline and support portability to other runtimes like Love2D【465890114087061†L55-L80】, so the code must be modular and free of external dependencies.  The guidelines below help structure the project for maintainability and ease of integration by a large language model (LLM).

## Project Structure

Organize the expansion into modules that mirror game systems:

```
src/
  core/
    gameState.js      // central state management
    eventBus.js       // publish/subscribe system
    resourceManager.js
    taskScheduler.js
  apps/
    mail.js
    news.js
    taskSchedulerApp.js
    terminal.js
    antivirus.js
    bugTracker.js
    gallery.js
    productivity.js
    musicPlayer.js
    weather.js
    researchLab.js
    compilation.js
    defragmenter.js
    restorePoints.js
  heroes/
    classes.js
    heroes.js
  items/
    items.js
    lootTables.js
  ui/
    windowManager.js
    desktop.js
    taskbar.js
    notifications.js
  utils/
    storage.js
    timers.js
    random.js
```

Use ES6 modules (`export`/`import`) to separate concerns.  Avoid bundling external libraries; Vite can handle module resolution without frameworks.

## Game State Management

Centralize all mutable game data in a `GameState` object.  This includes resources, heroes, inventory, tasks, research projects and current weather.  Encapsulate modifications through methods to enforce invariants and trigger events.

```js
// src/core/gameState.js
import { ResourceManager } from './resourceManager.js';

export class GameState {
  constructor() {
    this.resources = new ResourceManager();
    this.heroes = [];
    this.inventory = [];
    this.tasks = [];
    this.researchProjects = [];
    this.currentWeather = null;
    this.nextWeatherChange = Date.now();
    this.goldMultiplier = 0;
    this.lifetimeGold = 0;
    this.sigils = 0;
    this.lastActive = Date.now();
  }
  loadFromStorage() {
    const saved = localStorage.getItem('gameState');
    if (saved) Object.assign(this, JSON.parse(saved));
  }
  saveToStorage() {
    localStorage.setItem('gameState', JSON.stringify(this));
  }
}
```

Persist the `GameState` in `localStorage` every few seconds or after significant changes (quest completion, resource spending).  When the game loads, call `loadFromStorage()`, process offline progress, then continue the game loop【992881712478561†L224-L232】.

## Event Bus

Use a simple event bus to decouple modules.  Instead of calling functions directly, publish events that subscribers respond to.

```js
// src/core/eventBus.js
export const EventBus = {
  events: {},
  on(event, handler) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(handler);
  },
  off(event, handler) {
    this.events[event] = (this.events[event] || []).filter(h => h !== handler);
  },
  emit(event, payload) {
    (this.events[event] || []).forEach(h => h(payload));
  },
};

// Example usage:
EventBus.on('resourceChanged', (data) => {
  // update UI counters
});
EventBus.emit('resourceChanged', { type: 'gold', amount: 100 });
```

With this pattern, the Mail app doesn’t need to know how the resource manager works; it simply emits an event when a quest is completed.

## Window and Desktop Management

The **Window Manager** controls opening, closing, minimizing and focusing windows.  Each app component should extend a base `Window` class that defines lifecycle methods such as `show()`, `hide()` and `render()`.

```js
// src/ui/windowManager.js
class Window {
  constructor(title) {
    this.title = title;
    this.element = document.createElement('div');
    this.element.classList.add('window');
    // header, content, controls
  }
  show() { this.element.style.display = 'block'; }
  hide() { this.element.style.display = 'none'; }
  render() { /* to be overridden */ }
}

export class WindowManager {
  constructor() { this.windows = {}; }
  register(name, windowClass) { this.windows[name] = new windowClass(); }
  open(name) { this.windows[name]?.show(); }
  close(name) { this.windows[name]?.hide(); }
}
```

The desktop and taskbar maintain a list of active windows.  Clicking an icon calls `windowManager.open('Mail')` etc.  Provide keyboard shortcuts for window management (e.g., `Alt+Tab` or `Ctrl+W`) to enhance accessibility【470556324449136†L70-L79】.

## Task Scheduler

Create a scheduler to handle timed tasks (research, compilation, defrag).  Tasks should have start times, durations, costs and completion callbacks.

```js
// src/core/taskScheduler.js
export class TaskScheduler {
  constructor(gameState) {
    this.gameState = gameState;
  }
  addTask(task) {
    this.gameState.tasks.push(task);
    // Immediately deduct resource costs
    for (const [type, amount] of Object.entries(task.cost)) {
      this.gameState.resources.spend(type, amount);
    }
  }
  update() {
    const now = Date.now();
    this.gameState.tasks = this.gameState.tasks.filter(task => {
      if (now - task.startTime >= task.duration) {
        task.onComplete(this.gameState);
        EventBus.emit('taskCompleted', { task });
        return false;
      }
      return true;
    });
  }
}

// Called in the main game loop
taskScheduler.update();
```

## Timers and Game Loop

Implement a game loop using `requestAnimationFrame` or `setInterval`.  The loop should:

1. Compute resource gains (gold, code fragments).
2. Update tasks and research projects.
3. Process status effects and hero actions.
4. Check for weather changes and random events.
5. Render updated UI components.

```js
function gameLoop() {
  // 1. Process resource generation
  const goldGain = calculateGoldPerTick(gameState.baseGold, gameState.heroDPS, gameState.goldMultiplier);
  gameState.resources.add('gold', goldGain);
  gameState.lifetimeGold += goldGain;
  // 2. Update scheduled tasks
  taskScheduler.update();
  // 3. Process status effects, hero actions...
  statusManager.update();
  // 4. Update weather
  updateWeather(gameState);
  // 5. Render UI
  renderUI();
  requestAnimationFrame(gameLoop);
}

// Start the loop
gameLoop();
```

Persist critical values (resources, timestamps) at regular intervals so offline progress can be calculated later【992881712478561†L224-L232】.

## Data Modeling

Define classes or factory functions for heroes, items, quests and events.  Use separate modules for definitions and instances.  For example:

```js
// src/heroes/classes.js
export const HeroClasses = {
  Tank: {
    baseStats: { hp: 100, attack: 10, defense: 20 },
    abilities: ['taunt', 'shieldWall'],
  },
  DPS: {
    baseStats: { hp: 70, attack: 20, defense: 10 },
    abilities: ['rapidStrike', 'criticalHit'],
  },
  // ...
};

export class Hero {
  constructor(id, heroClass) {
    this.id = id;
    this.class = heroClass;
    this.level = 1;
    this.stats = { ...HeroClasses[heroClass].baseStats };
    this.equipment = {};
  }
}
```

## Persisting Data and Offline Compatibility

Because the game must be playable offline, all data should be stored locally.  Use `localStorage` or `indexedDB` to save game state.  Consider adopting `localForage` if you need asynchronous storage but avoid heavy libraries.  Service workers can cache assets and API responses to support offline play.

## Coding Conventions

* **Naming**: Use camelCase for variables and methods; PascalCase for classes.
* **Commenting**: Document functions, especially those that modify state or handle asynchronous behavior.
* **Modularity**: Keep each module focused; avoid monolithic files.
* **Accessibility**: Use semantic HTML elements and ARIA labels; ensure keyboard navigation works throughout the UI.
* **Testing**: Write unit tests for core logic (e.g., resource calculations, prestige formulas) using a lightweight test runner.

## Potential Future Integration

These guidelines assume a browser environment.  When porting to Love2D or another platform, reuse the core logic (GameState, resource and task management) but replace the UI layer.  Abstract file system and storage operations behind an interface so the same game logic can run on the new platform.

---

Following these guidelines will help the LLM or human developers implement the expansion in a clean, maintainable way while respecting the constraints of ReincarnOS’s tech stack and design philosophy.