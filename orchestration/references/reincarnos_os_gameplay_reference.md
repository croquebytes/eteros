# ReincarnOS Gameplay – OS-Themed Idle Systems Reference (LLM-Ready)

This document is for implementing the **idle game** that lives inside the OS shell.

It is **inspired by**:
- Melvor Idle (multi-skill incremental RPG)
- Raid Party (auto-battler / party idle MMO)
- Q-UP (coin-flip, risk/reward, corporate ladder vibe)

Use this to guide LLM prompts for **game logic**, not UI wiring.

---

## 0. Gameplay Goals & Constraints

- **Theme:** You “run” an OS where apps, processes, and services generate resources.
- **Play style:** Idle / incremental with light management:
  - 70% idle
  - 20% management / min-max (choosing upgrades, processes, allocations)
  - 10% optional active/mini-game elements
- **Integration:** Game state lives under `desktopState.game`.
- **Persistence:** Stored locally; supports **offline progress** calculations.

---

## 1. Game State Core Structures

### 1.1 `game` root

```js
const game = {
  resources: {
    cycles: 0,    // CPU cycles
    credits: 0,   // main currency
    data: 0,      // data packets/files
    security: 0   // abstract “safety” / security rating
  },

  // One example system
  cpuMiner: {
    unlocked: true,
    baseRatePerSecond: 1,
    multiplier: 1
  },

  systems: {
    // placeholder for OS “skills” like CPU, Networking, Storage
  },

  agents: {
    // for Raid Party–style auto-units (future)
  },

  processes: {
    // job instances (downloads, scans, compiles)
  },

  lastTickAt: Date.now(),
  lastSavedAt: Date.now()
};
```

> **LLM Directive:** All gameplay systems should extend this root `game` object, not invent separate globals.

---

## 2. Core Game Loop

### 2.1 Tick Loop

- One global loop drives all game logic.
- Uses `requestAnimationFrame` but treats time as continuous (`deltaMs`).

Basic structure:

```js
function startGameLoop(onTick, getRootState) {
  let last = performance.now();

  function loop(now) {
    const dt = now - last;
    last = now;

    const root = getRootState();
    if (root && root.game) {
      updateGame(root.game, dt);
    }

    if (typeof onTick === "function") onTick();
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
```

### 2.2 `updateGame`

- Takes `game` and `deltaMs`.
- Updates:
  - Passive income (CPU Miner, other idle systems).
  - Timers for processes/jobs.
  - Agent-based actions (future raids, security scans, etc.).

Minimal CPU Miner example:

```js
function updateGame(game, deltaMs) {
  const deltaSec = deltaMs / 1000;
  const miner = game.cpuMiner;

  if (miner.unlocked) {
    const gain = miner.baseRatePerSecond * miner.multiplier * deltaSec;
    game.resources.cycles += gain;
  }

  game.lastTickAt = Date.now();
}
```

---

## 3. Offline Progress

**Goal:** When the player returns, reward them for time away.

- On load:
  - Compute `elapsed = now - game.lastSavedAt`.
  - Clamp to a max (e.g. 12 hours or 24 hours).
  - Simulate progress or apply formulas.

Simple “simulate ticks” approach:

```js
function applyOfflineProgress(game) {
  const now = Date.now();
  const elapsed = now - (game.lastSavedAt || now);
  const cap = 12 * 60 * 60 * 1000;
  const effective = Math.min(elapsed, cap);

  // For simple systems like CPU Miner, we can directly compute:
  const deltaSec = effective / 1000;
  if (game.cpuMiner?.unlocked) {
    const gain = game.cpuMiner.baseRatePerSecond * game.cpuMiner.multiplier * deltaSec;
    game.resources.cycles += gain;
  }

  game.lastTickAt = now;
  game.lastSavedAt = now;
}
```

**UI side:** On boot, show a small popup:

> “While you were away, your OS produced X cycles, Y data, Z credits.”

---

## 4. Systems & OS Metaphors

Map traditional idle-game systems onto OS concepts:

### 4.1 Resources

- **Cycles** – CPU computational effort (like basic “gold”/energy).
- **Credits** – money-like currency used for upgrades.
- **Data** – produced by downloads, transfers, scraping.
- **Security** – produced by scans, raids-side successes, or security jobs.

### 4.2 System “Skills” (Melvor-style)

Represent OS subsystems:

```js
const systemSkills = {
  cpu: {
    id: "cpu",
    name: "CPU Management",
    level: 1,
    xp: 0,
    xpToNext: 100,
    unlocked: true
  },
  net: {
    id: "net",
    name: "Networking",
    level: 1,
    xp: 0,
    xpToNext: 100,
    unlocked: false
  },
  storage: { /* ... */ }
};
```

- Each system skill:
  - Gains XP when related jobs are run.
  - Unlocks new apps, processes, or bonuses at level milestones.

---

## 5. Jobs / Processes (Task Scheduler)

A **Process** is a finite-duration, time-based job:

```js
const process = {
  id: "proc-1",
  appId: "download-manager",
  name: "Download Asset Pack",
  systemSkillId: "net",       // grants XP here
  durationMs: 60000,          // 60 seconds
  startTime: Date.now(),
  endTime: Date.now() + 60000,
  reward: {
    data: 100,
    credits: 25
  },
  completed: false
};
```

### 5.1 Job Resolution

On each tick:

- If `now >= endTime` and `!completed`:
  - Apply `reward` to `game.resources`.
  - Give XP to associated `systemSkill`.
  - Mark `completed = true`.

> **Later:** Add automation (auto-restart jobs, auto-queue from templates).

---

## 6. Agents / Raids (Raid Party–Style)

For future expansion:

- **Agents** = programs/daemons (`*.exe`) acting like heroes/fighters.
- They:
  - Have stats (DPS, speed, special effects).
  - Are assigned to “Boss processes” (raids).
  - Deal damage over time to these bosses.
  - Earn large rewards (credits, rare resources) when boss is defeated.

Example `Agent`:

```js
const agent = {
  id: "agent-1",
  name: "Defender.exe",
  level: 1,
  xp: 0,
  xpToNext: 50,
  baseDps: 10,
  dpsMultiplier: 1.0,
  assignedRaidId: null
};
```

**Raid/Boss:**

```js
const raid = {
  id: "raid-1",
  name: "MegaVirus v3.1",
  maxHp: 1000,
  hp: 1000,
  reward: {
    credits: 500,
    security: 50,
    rareItems: [/* future */]
  },
  active: true
};
```

On tick:

- For each raid, sum DPS from assigned agents.
- Reduce raid HP accordingly.
- Apply rewards when HP reaches 0.

---

## 7. Q-UP–Style Risk/Reward (Coin Flip Mechanics)

To inject risk and fun:

- Design a special “Q Mode” or “Tournament”:
  - Player stakes resources (credits, data).
  - Outcome is determined by probabilistic events (e.g. weighted coin flips).
  - Rewards scale with risk (higher stakes / lower odds → bigger returns).

### 7.1 Basic Coin-Flip Job

```js
const qJob = {
  id: "qjob-1",
  name: "Corporate Pitch",
  stakeCredits: 100,
  successChance: 0.55,
  rewardOnSuccess: {
    credits: 220
  },
  penaltyOnFail: {
    credits: -100 // lose stake
  }
};
```

Resolution:

```js
function resolveQJob(game, qJob) {
  if (game.resources.credits < qJob.stakeCredits) return;

  game.resources.credits -= qJob.stakeCredits;

  if (Math.random() < qJob.successChance) {
    game.resources.credits += qJob.rewardOnSuccess.credits;
  } else {
    // already lost stake; optional extra penalties can be applied here
  }
}
```

UI ties this to an app/window themed like promotions, corporate ladder, tournaments, etc.

---

## 8. Progression & Meta

### 8.1 Early Game

- Focus on:
  - CPU Miner (cycles).
  - Simple jobs: downloads, basic scans.
  - System Monitor showing resource growth.

Unlocks:

- After certain thresholds:
  - `Task Scheduler` app (jobs).
  - `Security Scanner`.
  - `Networking` system skill.

### 8.2 Mid Game

- Automations:
  - Auto-queue jobs.
  - Auto-upgrade low-level systems.
- More agents (defensive programs, miners, scrapers).
- Larger raids (virus bosses).

### 8.3 Late Game / Prestige

Introduce a meta-reset called e.g. **“OS Upgrade”** or **“Reformat & Reinstall”**:

- Resets:
  - Resources
  - Processes
  - Some unlocks
- Keeps:
  - “Firmware” bonuses (global multipliers)
  - Cosmetic OS skins / themes
  - Some agent/program unlocks

Sample meta currency:

```js
game.meta = {
  firmwarePoints: 0,
  firmwareUpgrades: {
    globalCycleMult: 1.0,
    globalCreditMult: 1.0
  }
};
```

When performing an OS upgrade:

- Convert some portion of lifetime resources into `firmwarePoints`.
- Each firmware upgrade costs points and grants permanent bonus.

---

## 9. Mapping to OS UI

Every major gameplay system should appear as an **app/window** in the OS:

- **System Monitor**
  - Read-only overview of resources.
  - Live bindings to `game.resources`.
- **CPU Miner**
  - Shows rates, upgrade options (later).
  - Emphasizes that it runs even minimized.
- **Task Scheduler**
  - List of active and queued jobs.
  - Controls to start/cancel jobs.
- **Security Scanner**
  - Job list with chance-based outcomes.
  - Can feed `security` and maybe `credits`.
- **Raid Console** (later)
  - Shows raids, assigned agents, damage per second, etc.
- **Q Mode / Tournament**
  - UI for risk/reward coin-flip events.

---

## 10. LLM Prompt Skeleton (For Gameplay Tasks)

When asking an LLM to implement gameplay logic, start from something like:

> You are helping implement the idle gameplay for ReincarnOS, an OS-themed incremental game that runs inside a mock OS shell (desktop + windows + taskbar).  
> The main game state lives under `desktopState.game` and has this structure:  
> [paste relevant parts of Section 1 here]  
>  
> The game loop runs via `requestAnimationFrame` and calls `updateGame(game, deltaMs)`.  
>  
> Please implement/extend the following:  
> - [e.g. add a Task Scheduler system with jobs, durations, and rewards]  
> - [e.g. add offline progress for all resources]  
> - [e.g. add an Agents + Raids system using the shapes in Section 6]  
>  
> Keep everything deterministic except where explicitly random (e.g. Q-mode coin flips), and ensure all changes to `game` remain compatible with this structure.

This MD is the **source of truth** for game mechanics and state shapes.
