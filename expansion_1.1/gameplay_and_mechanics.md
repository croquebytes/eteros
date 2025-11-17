# Gameplay and Mechanics

This document details how the new systems, resources and apps integrate into engaging gameplay loops.  Idle games thrive on simple core interactions layered with deeper meta loops【992881712478561†L133-L177】.  The mechanics below aim to provide satisfying time sinks, meaningful decisions and clear progression paths while supporting offline play and prestige resets【992881712478561†L224-L232】【883629799932199†L230-L248】.

## Core Loop and Economy

At the heart of ReincarnOS is the process of assigning heroes to quests, earning rewards and investing those rewards into upgrades.  Each quest yields **gold**, **XP**, **Code Fragments** and occasionally **items** or **Entropy Dust**.  A **tick** occurs every second; during each tick heroes attack enemies, collect resources and progress through encounters.

### Resource Generation Example

To model gold generation, consider the following variables:

* `baseGold` – baseline gold per tick per hero
* `heroDPS` – combined damage per second of heroes
* `goldMultiplier` – sum of percentage bonuses from items, research and upgrades

A simple formula might be:

```js
function calculateGoldPerTick(baseGold, heroDPS, goldMultiplier) {
  // heroDPS scales rewards; higher DPS clears waves faster
  const dpsFactor = 1 + heroDPS / 100;
  return baseGold * dpsFactor * (1 + goldMultiplier);
}

// Example usage
const goldThisTick = calculateGoldPerTick(1, 50, 0.15); // returns 1 * 1.5 * 1.15
```

Display per‑minute or per‑hour projections in the UI to satisfy the idle game desire to watch numbers rise【992881712478561†L110-L131】.

## Resource and Time‑Sink Mechanics

Time sinks encourage players to engage repeatedly and plan their sessions.  The following systems use the new currencies described in `items_and_resources.md`.

### Research Projects

Research is queued in the **Research Lab** and runs for minutes or hours.  Projects require **Code Fragments** and **CPU Cycles**; some may also consume **Entropy Dust**.

```js
class ResearchProject {
  constructor(name, duration, cost, effect) {
    this.name = name;
    this.duration = duration; // in milliseconds
    this.cost = cost; // { codeFragments, cpuCycles, entropyDust }
    this.effect = effect; // function to apply upon completion
    this.startTime = Date.now();
  }
  get remainingTime() {
    const elapsed = Date.now() - this.startTime;
    return Math.max(this.duration - elapsed, 0);
  }
  isComplete() {
    return this.remainingTime === 0;
  }
}

// Example effect: increase gold multiplier by 10%
const increaseGoldResearch = new ResearchProject(
  'Gold Algorithms 1.0',
  3 * 60 * 60 * 1000, // three hours
  { codeFragments: 500, cpuCycles: 1000, entropyDust: 0 },
  (gameState) => { gameState.goldMultiplier += 0.10; }
);
```

### Compilation Tasks

Compilation consumes **CPU Cycles** and time.  Use the **Task Scheduler** to queue compile tasks.  Example skeleton:

```js
class CompileTask {
  constructor(template, requiredCycles, duration) {
    this.template = template; // hero or item blueprint
    this.requiredCycles = requiredCycles;
    this.duration = duration;
    this.startTime = Date.now();
  }
  isComplete() {
    return Date.now() - this.startTime >= this.duration;
  }
  finish(player) {
    player.addHeroOrItem(this.template);
  }
}
```

### Defragmentation and Cleanup

Defragmenter tasks require heroes and time.  They yield **Memory Blocks** and occasionally rare items.  For example:

* **Minor Defrag** – Takes 30 minutes, yields 1–3 Memory Blocks and a small chance of rare `.sys` file.
* **Major Defrag** – Takes 4 hours, yields 5–8 Memory Blocks and a chance at an `.iso` legendary file.

### Back‑ups and Restore Points

Creating a restore point consumes **Memory Blocks** and **CPU Cycles**.  Each snapshot stores the current hero roster, resources and progression variables.  Restoring reverts the game state to the snapshot and invalidates progress made since then.

```js
function createRestorePoint(gameState) {
  const snapshot = JSON.stringify(gameState);
  localStorage.setItem('restorePoint', snapshot);
  // deduct resources here
}

function restoreFromPoint() {
  const snapshot = localStorage.getItem('restorePoint');
  if (snapshot) {
    return JSON.parse(snapshot);
  }
  throw new Error('No restore point found');
}
```

## Prestige: System Reset

After reaching a certain threshold of total gold or XP, players may perform a **System Reset** (prestige).  This resets most progress but awards **System Sigils**, permanent upgrades that persist across runs.  The number of sigils earned should be calculated using a square‑root or cube‑root formula to keep numbers manageable and rewarding【883629799932199†L230-L248】.

```js
function performSystemReset(gameState) {
  const totalGold = gameState.lifetimeGold;
  const sigilsEarned = Math.floor(Math.sqrt(totalGold / 1_000_000));
  gameState.sigils += sigilsEarned;
  // Reset resources and progress
  gameState.gold = 0;
  gameState.codeFragments = 0;
  // Reset heroes, quests and inventory but keep unlocked themes and log entries
  gameState.heroes = [];
  gameState.inventory = [];
  gameState.currentQuests = [];
  // Optionally keep a fraction of items or upgrades based on research
  return sigilsEarned;
}
```

Prestige resets serve two purposes: they create a ladder‑climbing effect that makes players feel powerful and they control exponential growth in an idle game【883629799932199†L257-L267】.

## Hero Classes and Synergies

Heroes fall into archetypes—**Tank**, **DPS**, **Healer** and **Support**.  Each class has unique abilities and can synergize with others.  Synergies encourage players to diversify their roster rather than optimizing a single strategy【992881712478561†L133-L177】.

* **Tank** – High HP and defense; can generate **Threat** to draw enemy attacks.  Synergy: increases DPS heroes’ damage by 5% when a tank is present.
* **DPS** – High attack power; deals burst damage.  Synergy: increases chance of critical hits when paired with a support hero.
* **Healer** – Restores HP and removes debuffs; has lower attack.  Synergy: reduces skill cooldowns of all allies by 10% when paired with two DPS heroes.
* **Support** – Buffs allies and debuffs enemies; flexible stats.  Synergy: grants a shield when the party includes a tank and a healer.

Synergies can be implemented as functions evaluated at the start of a quest:

```js
function applySynergies(party) {
  const classes = party.map(h => h.class);
  if (classes.includes('Tank') && classes.includes('DPS')) {
    party.forEach(h => { h.damageMultiplier += 0.05; });
  }
  // Add other synergy checks here
}
```

## Status Effects and Buffs

Status effects add depth to combat.  They can originate from items, abilities or anomalies.

| Effect | Description |
| --- | --- |
| **Overclocked** | Increase attack and movement speed for a duration. |
| **Defragged** | Reduce damage taken and gradually heal HP over time. |
| **Infected** | Continuous damage over time; may spread to other heroes if not cured. |
| **Lagged** | Reduces speed and attack frequency. |
| **Quarantined** | Prevents an enemy from acting for a period but also stops it from dropping loot. |

Use a status manager to apply, update and remove effects:

```js
class StatusManager {
  constructor() { this.statuses = []; }
  addStatus(target, effect, duration) {
    this.statuses.push({ target, effect, expires: Date.now() + duration });
    effect.apply(target);
  }
  update() {
    const now = Date.now();
    this.statuses = this.statuses.filter(s => {
      if (now > s.expires) {
        s.effect.remove(s.target);
        return false;
      }
      return true;
    });
  }
}
```

## Dynamic Quests and Events

Random and dynamic events keep players engaged and create unpredictability.【992881712478561†L133-L177】

### Glitch Storms & Pop‑ups

Glitch Storms temporarily increase enemy spawn rates and alter UI elements.  Random pop‑ups may appear with puzzles or ads; clicking them can trigger positive or negative effects.

### Cosmic Weather

Weather patterns (Solar Flare, Quantum Drizzle) modify drop rates or damage multipliers.  A scheduler determines when weather changes:

```js
function updateWeather(gameState) {
  const now = Date.now();
  if (now > gameState.nextWeatherChange) {
    gameState.currentWeather = pickRandomWeather();
    gameState.nextWeatherChange = now + 6 * 60 * 60 * 1000; // change every 6 hours
  }
}
```

### Faction Events and Choices

Periodically, SysOps, Hackers or Archivists may ask for aid.  Choosing to help one faction could anger another, affecting available quests and rewards.  These branching choices provide meaningful consequences【992881712478561†L253-L263】.

## Offline Progress and Return Rewards

Players must be rewarded for returning to the game.  When the player closes the game, store the current timestamp.  Upon re‑opening, calculate the elapsed time and simulate resource generation and task completion.  Optionally cap offline progress to a maximum (e.g., 8 hours) to encourage frequent check‑ins【992881712478561†L224-L232】.

```js
function processOfflineProgress(gameState) {
  const lastActive = gameState.lastActive;
  const now = Date.now();
  const elapsed = now - lastActive;
  const offlineTicks = Math.floor(elapsed / 1000);
  const goldEarned = offlineTicks * calculateGoldPerTick(
    gameState.baseGold,
    gameState.heroDPS,
    gameState.goldMultiplier
  );
  gameState.gold += goldEarned;
  // Update tasks and research
  gameState.tasks.forEach(task => {
    task.startTime -= elapsed;
  });
  gameState.lastActive = now;
  return goldEarned;
}
```

Provide a summary screen when the player returns: “While you were away, your heroes earned X gold, completed Y tasks and found Z items.”  This reinforces the feeling of progress and motivates further play【992881712478561†L224-L232】.

## Balanced Difficulty and Tuning

Difficulty should scale smoothly so players always have a goal but never feel stuck.  Use scaling functions (linear or exponential) for enemy health and attack, ensuring the player’s upgrades outpace the increase in enemy difficulty early on and then level off.  Playtesting is crucial; gather data and adjust coefficients to maintain a satisfying challenge curve.

---

These mechanics combine to create a layered idle experience.  The core loop of questing and resource collection feeds into time‑sink tasks and prestige loops.  Dynamic events and faction choices add variety and narrative weight.  Offline progress ensures that players feel rewarded even when the game isn’t open.  Following these principles will help the LLM implement a compelling expansion for ReincarnOS.