# Pet System Design

A cozy-dark fantasy "daemon familiar" lives inside the OS core. It idles in a small terminal-like widget and prefers low-clutter, ambient interaction that drifts into the broader desktop vibe rather than dominating the UI.

## Fantasy & Identity
- **Name/Role:** "Daemonling" — a curiosity-driven maintenance spirit that tends ReincarnOS subsystems.
- **Vibe:** Warm ghostlight + circuit glyphs; low-key, whispery tooltips rather than loud alerts.
- **Where it lives:** A compact pet window pinned by default; can minimize to a taskbar glyph and send notification toasts when it needs care.

## Core Stats
- `hunger` (0–100): Drifts down over time; feeds on "code crumbs".
- `energy` (0–100): Spent by play/exploration; regained by rest cycles.
- `mood` (-50–100): Boosted by play/praise; penalized by neglect.
- `stability` (0–100): Health of its code shell. Drops if hunger/energy are low for long; rises via maintenance/debug actions.
- `curiosity` (0–100, soft cap 120 with buffs): Grows when you browse gag sites or run OS apps; slightly decays to 50 over time.

## Tick / Decay Rules
- **Tick cadence:** Every 60s (later configurable). Each tick:
  - Hunger: `-3` (clamped ≥ 0).
  - Energy: `-2` (clamped ≥ 0).
  - Mood: `-1` (clamped ≥ -50) unless stability ≥ 80, then no decay.
  - Stability: If hunger < 25 or energy < 25 for 3 consecutive ticks, `-5`. Otherwise `+1` (cap 100).
  - Curiosity: `-1` toward 50 baseline (if >50, -1; if <50, +1) unless recently stimulated.
- **Neglect spiral:** If hunger or energy hits 0, mood `-10` and stability `-10` once per tick until recovered.
- **Recovery buffer:** Positive actions apply over-time buffs (see below) that temporarily pause decay for that stat.

## Actions & Effects
- **Feed (Code Crumbs):** `hunger +25`, `mood +5`. If over 80, grants a 2-tick hunger-freeze buff.
- **Play (Packet Chase mini-toy):** `mood +10`, `energy -5`, `curiosity +10`. If mood > 80, unlocks a cosmetic emote for 10 minutes.
- **Rest (Hibernate):** `energy +30`, `stability +5`, pauses energy decay for 2 ticks.
- **Debug/Patch:** `stability +20`, `mood -3`, applies a 3-tick stability-freeze buff.
- **Praise (Ping):** `mood +6`, minor `curiosity +3`.
- **Co-browse:** Triggered when the Gag Browser is open; `curiosity +5` per new page (cooldown 2 min) and `mood +2`.

## Rewards & Progression
- **Ambient boons:** High stability (>85) grants +5% idle gold gain (soft buff) for 10 minutes; high curiosity (>90) grants a one-time "Insight Fragment" item drop chance.
- **Cosmetics:** Emote bubbles, window tints, and cursor trails unlock at mood/stability milestones; stored as simple flags.
- **Memories:** Lightweight log of last 10 interactions for flavor text and toast notifications.

## UI Notes
- **Window layout:**
  - Header with pet name and a tiny avatar glyph.
  - Compact stat bars (hunger, energy, mood, stability, curiosity) with colored badges.
  - Action buttons in a 2-column grid; mini log panel for last interaction.
- **Notifications:** Toasts when a stat crosses <25 (needs care) or when buffs expire. Icon badge on taskbar when attention required.
- **Low clutter:** Default collapsed "mini" view shows avatar + two most critical stats (hunger, mood). Full view expands on click.

## Data Structures (portable, stub-friendly)
```js
const petState = {
  name: 'Daemonling',
  hunger: 80,
  energy: 80,
  mood: 40,
  stability: 70,
  curiosity: 50,
  buffs: {
    hungerFreeze: 0,
    energyFreeze: 0,
    stabilityFreeze: 0,
  },
  lastInteractions: [] // { action, deltaSummary, timestamp }
};

const PET_CONFIG = {
  tickMs: 60_000,
  decay: { hunger: 3, energy: 2, mood: 1, curiosityStep: 1 },
  thresholds: { low: 25, critical: 0 },
  buffs: { hungerFreezeDuration: 2, energyFreezeDuration: 2, stabilityFreezeDuration: 3 }
};
```
- Interaction handlers mutate `petState`, clamp values 0–100 (mood -50–100), decrement buff counters each tick, and push to `lastInteractions` capped at 10 entries.

# Gag Browser Design

A sandboxed, obviously fake browser called **NetSim** lives as an app window. It ships with scripted, lore-forward content and mini experiences that lean into the OS-as-world theme without implying real internet access.

## Structure & Navigation
- **Chrome:** Fake URL bar (`n://` protocol), back/forward buttons (simulated history), refresh, and sidebar of bookmarks.
- **Pages:** Rendered from an in-memory registry of routes → content templates; no external requests.
- **Affordances:** Clear "Simulated Net" badge, glitched loader animation, and lore-friendly status messages ("Resolving astral DNS").

## Site Map (sample pages)
- `/news`
  - Rotating headlines about OS-world events (e.g., "Patch Tuesday sacrifices a goblin bug"; "Memory Leak Lake frozen over").
- `/weather`
  - Region list like "CPU Peaks", "Memory Marsh", "Packet Plains" with forecasts ("Garbage collection gusts expected").
- `/minigames/packet-pop`
  - Simple clicker: pop drifting packets within 30s; track score locally.
- `/minigames/hex-words`
  - Tiny word puzzle: choose 3 glyphs to form a rune; respond with a flavorful description.
- `/classifieds`
  - Fake listings for "Spectral interns" and "Half-used encryption keys"; buttons do nothing but emit fun toasts.
- `/system-advisories`
  - Patch notes parody with random modifiers and timestamps.

## Content Examples
- **News:**
  - "Quest Explorer reports runaway recursion; heroes looped wave 999." 
  - "Soulware Store flash sale on cursed drivers ends whenever it feels like it."
- **Weather:**
  - CPU Peaks – "95% utilization heat haze; consider underclocking familiars."
  - Packet Plains – "Intermittent packet sprites; 40% chance of glittering latency." 
  - Memory Marsh – "Swap tides rising; bring floaties."
- **Advisories:**
  - "Hotfix 0xDEAD: Sealed a breach where emoticons possessed the taskbar."
  - "Patch 1.4.2-fae: Reduced goblin bug spawn rate by 12.5%."

## Mini-Game Concepts
- **Packet Pop:** Timed clicker; spawn 8–10 packets per round, score +1 per pop, show tiered medals at end.
- **Hex Words:** Choose 3 of 6 runic glyphs; combine into a generated phrase (e.g., "ether + lumen + sigil" → "Conjures a luminous checksum sprite"). Purely for flavor; no win/loss.

## Data Structures
```js
const netSimPages = {
  '/news': { type: 'list', title: 'Astral Newswire', items: [...] },
  '/weather': { type: 'weather', regions: [...] },
  '/minigames/packet-pop': { type: 'minigame', mode: 'packetPop' },
  // ...
};

const browserState = {
  history: ['/news'],
  index: 0,
  currentPath: '/news',
  scores: { packetPop: 0 },
};
```
- Rendering layer switches on `type`; mini-games share a small local state object per session.

## UI Notes
- **Sidebar bookmarks:** Predefined list of the above pages; clicking pushes to history.
- **URL bar:** Read-only display of `n://{path}` with copy button.
- **Page body:** Carded layout with headers; embedded mini-games use lightweight DOM (no canvas required).
- **Clarity:** Persistent banner: "Simulated Network — No external access".

# Implementation Stubs (JS)
- `src/os/apps/petTerminal.js` – Minimal pet UI with stat bars and action buttons calling stub handlers.
- `src/os/apps/fakeBrowser.js` – Minimal NetSim chrome with sidebar links, URL bar, and placeholder pages for news/weather/minigames.
- Register both apps in `desktop.js` (icons) and `main.js` (windowManager).

# Sanity Check Instructions
1. Run the dev server (`npm run dev`) and open the desktop.
2. Double-click **Daemonling Pet** icon → window shows stat bars and placeholder buttons; clicking buttons updates numbers locally and appends a log entry.
3. Double-click **NetSim Browser** icon → window opens with URL bar, sidebar, and placeholder content; navigating bookmarks swaps visible page content and updates the fake URL display.
