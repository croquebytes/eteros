# CLAUDE.md – AI Assistant Guide for ReincarnOS

> **Last Updated:** 2025-11-16
> **Purpose:** This document helps AI assistants (Claude, Copilot, ChatGPT, etc.) understand the ReincarnOS codebase structure, constraints, and development conventions.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Critical Constraints](#critical-constraints)
3. [Repository Structure](#repository-structure)
4. [Development Workflow](#development-workflow)
5. [Code Patterns & Conventions](#code-patterns--conventions)
6. [Key Systems & Architecture](#key-systems--architecture)
7. [Implementation Status](#implementation-status)
8. [Common Development Tasks](#common-development-tasks)
9. [Important Files Reference](#important-files-reference)
10. [What NOT to Do](#what-not-to-do)

---

## Project Overview

**ReincarnOS** is a browser-based OS-style idle RPG where gameplay occurs inside a fake desktop operating system interface. The entire game runs as an Isekai-flavored autobattler within OS applications.

### Core Concept
- **Genre:** Idle RPG / Autobattler
- **UI Metaphor:** Desktop OS (Windows/Mac-like)
- **Apps Map to Game Systems:**
  - `Quest Explorer` → Main autobattler gameplay
  - `Soulware Store` → Upgrades and unlocks
  - `Loot Downloads` → Inventory system
  - `Recycle Shrine` → Item disassembly
  - `System Sigils` → Meta progression/prestige

### Technology Stack
- **Build Tool:** Vite 5.0+ (dev dependency only)
- **Runtime:** Pure vanilla JavaScript (ES6 modules)
- **Styling:** Plain CSS (single global stylesheet)
- **Dependencies:** ZERO runtime dependencies
- **Target:** Modern browsers (ES6+ support required)

### Design Philosophy
1. **Framework-free runtime** – No React, Vue, Angular, or similar
2. **Offline-capable** – Must work as static files without network
3. **Future portability** – Code should be easy to port to Love2D (Lua)
4. **OS metaphor consistency** – Maintain desktop/window paradigm throughout

---

## Critical Constraints

### ⛔ HARD CONSTRAINTS (NEVER VIOLATE)

1. **NO RUNTIME FRAMEWORKS**
   - Do NOT add React, Vue, Angular, Svelte, Solid, or any SPA framework
   - Do NOT add jQuery, Lodash, or heavy utility libraries
   - Vite is build-time only – never add runtime framework features

2. **OFFLINE-FIRST REQUIREMENT**
   - Final build must work without network access
   - No CDN dependencies
   - All assets must be bundled or self-contained
   - Relative paths only (`base: './'` in vite.config.js)

3. **VANILLA JAVASCRIPT ONLY**
   - Use native DOM APIs (`createElement`, `querySelector`, etc.)
   - No JSX, no template literals beyond basic HTML strings
   - No build-time transpilation beyond ES6 → ES5 if needed

4. **MAINTAIN OS METAPHOR**
   - All gameplay features must be apps in the OS
   - Use windows, taskbar, desktop icons consistently
   - Avoid breaking the "fake OS" immersion

5. **PORTABILITY CONSIDERATIONS**
   - Keep logic separate from rendering
   - Use plain objects/arrays for state (not classes or complex structures)
   - Avoid browser-specific APIs where possible
   - Think "could this be reimplemented in Lua?"

---

## Repository Structure

```
/home/user/eteros/
├── design/                    # Design assets and references
│   ├── figma_link.txt        # Figma UI design URL
│   └── exports/              # (future) PNG/SVG assets from Figma
│
├── docs/                      # Documentation
│   └── LLM_HANDOFF.md        # Detailed task breakdown and LLM directives
│
├── src/                       # Source code (all JavaScript and CSS)
│   ├── os/                   # OS layer (desktop, windows, apps)
│   │   ├── apps/             # Individual application modules
│   │   │   ├── questExplorer.js     # Main autobattler UI
│   │   │   ├── soulwareStore.js     # Upgrade shop
│   │   │   ├── lootDownloads.js     # Inventory
│   │   │   ├── recycleShrine.js     # Item disassembly
│   │   │   └── systemSigils.js      # Prestige/meta progression
│   │   ├── desktop.js        # Desktop environment (wallpaper, icons, taskbar)
│   │   └── windowManager.js  # Window lifecycle management
│   │
│   ├── state/                # Game state and configuration
│   │   ├── gameState.js      # Core game state object
│   │   └── config.js         # Tunable constants and initial data
│   │
│   ├── main.js               # Application entry point (bootstrapping)
│   └── style.css             # Global styles (215 lines)
│
├── index.html                # HTML entry point (Vite loads this)
├── package.json              # NPM config (Vite dev dependency only)
├── vite.config.js            # Vite configuration (minimal)
├── README.md                 # User-facing project documentation
└── CLAUDE.md                 # This file (AI assistant guide)
```

### Key Directories

- **`src/os/`** – All UI and desktop metaphor code lives here
- **`src/state/`** – Game logic, state management, configuration
- **`design/`** – Design references (Figma link, future asset exports)
- **`docs/`** – Documentation for developers and AI assistants

---

## Development Workflow

### Installation & Setup

```bash
# Install Vite dev dependency
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview production build
npm run preview
```

### Development Server
- **URL:** `http://localhost:5173/` (default)
- **Hot Module Replacement (HMR):** Enabled for instant CSS updates
- **Source Maps:** Available in dev mode for debugging

### Production Build
- **Output:** `dist/` folder
- **Contents:** Bundled HTML, CSS, JS (minified)
- **Deployment:** Can be served from any static file host
- **Offline Test:** Open `dist/index.html` in browser directly

### Git Workflow
- **Main Branch:** Development occurs on main branch
- **Commits:** Descriptive messages following conventional commits style
- **No CI/CD:** Manual builds and deployments for now

---

## Code Patterns & Conventions

### File Naming
- **JavaScript files:** `camelCase.js` (e.g., `windowManager.js`)
- **CSS files:** `style.css` (single global stylesheet)
- **HTML files:** `index.html` (entry point only)

### Code Naming
- **Variables/Functions:** `camelCase` (e.g., `gameState`, `createDesktop`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `CONFIG.waveIntervalMs`)
- **CSS Classes:** `kebab-case` (e.g., `.os-window`, `.desktop-icon`)
- **HTML IDs:** `kebab-case` (e.g., `#app`, `#desktop-wallpaper`)

### Module Pattern

**All modules use ES6 export/import:**

```javascript
// exporting.js
export const myModule = {
  id: 'myId',
  someMethod() { /* ... */ }
};

export function myFunction() { /* ... */ }

// importing.js
import { myModule, myFunction } from './exporting.js';
```

**Avoid default exports** – use named exports for clarity.

### App Registration Pattern

Every OS app follows this structure:

```javascript
// src/os/apps/exampleApp.js
export const exampleApp = {
  id: 'exampleApp',           // Unique identifier (camelCase)
  title: 'Example App Name',  // Display name for window title bar

  createContent(rootEl) {
    // Render app UI into rootEl
    rootEl.innerHTML = `
      <div class="app-container">
        <h2>App Content</h2>
      </div>
    `;

    // Add event listeners if needed
    const button = rootEl.querySelector('button');
    button.addEventListener('click', () => {
      // Handle interaction
    });
  }
};
```

**Key Points:**
- `id` must be unique and match the desktop icon's `data-app-id`
- `title` appears in the window title bar
- `createContent(rootEl)` receives an empty DOM element to populate
- App is responsible for its own event listeners
- Apps should be self-contained (no global state pollution)

### DOM Manipulation

**Use vanilla DOM APIs exclusively:**

```javascript
// Creating elements
const div = document.createElement('div');
div.className = 'my-class';
div.textContent = 'Hello';

// Querying
const element = document.querySelector('#my-id');
const elements = document.querySelectorAll('.my-class');

// Events
element.addEventListener('click', (e) => {
  // Handle event
});

// Appending
parentElement.appendChild(childElement);

// Static content (safe for trusted strings)
element.innerHTML = `<div>Static HTML</div>`;
```

**Avoid:**
- Template literal libraries
- Virtual DOM abstractions
- Heavy DOM utility libraries

### State Management Pattern

**Global singleton objects in `src/state/`:**

```javascript
// src/state/gameState.js
export const gameState = {
  wave: 1,
  gold: 0,
  xp: 0,
  // Add more properties as needed
};

// Direct mutation (no reactivity system)
gameState.gold += 10;
```

**Current Approach:**
- Plain JavaScript objects (no classes, no proxies)
- Direct mutation (no setState() or similar)
- Manual UI updates when state changes
- Console logging for debugging

**Future Considerations:**
- localStorage for save/load
- Simple pub/sub for UI updates
- Keep state structure flat for Lua portability

### CSS Organization

**Single global stylesheet:** `src/style.css`

**Structure (in order):**
1. Reset & Base Styles (lines 1-16)
2. Desktop Environment (lines 18-73)
3. Window System (lines 74-122)
4. Taskbar (lines 123-169)
5. App-Specific Styles (lines 170+)

**Naming Convention:**
- Component-based classes (e.g., `.os-window`, `.desktop-icon`)
- Modifier classes with hyphens (e.g., `.os-window-titlebar`)
- No BEM strict notation, but similar spirit

**Color Palette:**
```css
/* Dark theme (fantasy + circuit board vibes) */
--bg-dark: #050815;
--bg-darker: #02040a;
--accent-blue: #223355;
--accent-light: #1b2943;
--text-light: #f5f5f5;
--hover-blue: rgba(41, 140, 255, 0.25);
```

### Error Handling

**Currently minimal – use console logging:**

```javascript
console.log('Debug info:', value);
console.warn('Warning:', issue);
console.error('Error:', error);
```

**Future:** Add proper error boundaries and user-facing error messages.

---

## Key Systems & Architecture

### 1. Desktop Environment (`src/os/desktop.js`)

**Responsibility:** Creates the core OS UI (wallpaper, icons, taskbar)

**Exports:**
- `createDesktop()` → Returns `{ desktopEl, windowLayerEl }`

**Features:**
- Radial gradient wallpaper (fantasy theme)
- 5 desktop icons (double-click to open apps)
- Bottom taskbar with app buttons and clock
- Real-time clock updates every 60 seconds

**App Configuration:**
```javascript
const apps = [
  { id: 'questExplorer', title: 'Quest Explorer', glyph: '⚔' },
  { id: 'soulwareStore', title: 'Soulware Store', glyph: '🛒' },
  { id: 'lootDownloads', title: 'Loot Downloads', glyph: '📦' },
  { id: 'recycleShrine', title: 'Recycle Shrine', glyph: '♻' },
  { id: 'systemSigils', title: 'System Sigils', glyph: '🔮' }
];
```

**Desktop Icon Structure:**
```html
<div class="desktop-icon" data-app-id="appId">
  <div class="desktop-icon-glyph">glyph</div>
  <div class="desktop-icon-label">App Name</div>
</div>
```

### 2. Window Manager (`src/os/windowManager.js`)

**Responsibility:** Window lifecycle, focus management, z-index layering

**Exports:**
- `windowManager` (singleton object)

**API:**
```javascript
windowManager.init(windowLayerEl);           // Initialize with container
windowManager.registerApp(appConfig);        // Register an app
windowManager.openWindow(appId);             // Open/show window
windowManager.closeWindow(appId);            // Hide window
```

**Key Features:**
- **Lazy Creation:** Windows created on first open (not at startup)
- **Window Reuse:** Close hides window (doesn't destroy DOM)
- **Focus Management:** Click to bring window to front (z-index++)
- **Title Bar:** Each window has title and close button

**Window Structure:**
```html
<div class="os-window" data-app-id="appId" style="display:flex; z-index:100;">
  <div class="os-window-titlebar">
    <span>Window Title</span>
    <button class="os-window-close">×</button>
  </div>
  <div class="os-window-body">
    <!-- App content rendered here via createContent() -->
  </div>
</div>
```

**Internal State:**
- `apps` – Map of registered app configs
- `windows` – Map of created window DOM elements
- `windowLayer` – Container element reference
- `nextZ` – Counter for z-index management

### 3. Application Layer (`src/os/apps/*.js`)

**5 Apps (all follow same pattern):**

#### Quest Explorer (`questExplorer.js`)
- **Status:** UI layout complete, no game logic
- **Layout:** 3-column design (party, battle, quests)
- **Party Column:** 4 placeholder heroes (Level 1)
- **Battle Column:** Wave counter, enemy placeholder, combat viewport
- **Quests Column:** 3 dummy quests
- **Next Steps:** Connect to gameState, implement combat logic

#### Soulware Store (`soulwareStore.js`)
- **Status:** Stub only
- **Purpose:** Upgrade shop (unlock apps, relics, cosmetics)
- **Next Steps:** Define upgrade data structure, implement purchase logic

#### Loot Downloads (`lootDownloads.js`)
- **Status:** Stub only
- **Purpose:** Inventory system (items as "files")
- **Next Steps:** Item data structure, grid layout, equip/install/recycle actions

#### Recycle Shrine (`recycleShrine.js`)
- **Status:** Stub only
- **Purpose:** Disassemble items into resources
- **Next Steps:** Resource system, disassembly logic

#### System Sigils (`systemSigils.js`)
- **Status:** Stub only
- **Purpose:** Meta progression (prestige system)
- **Next Steps:** Define sigil data, reset mechanics, persistent bonuses

### 4. Game State (`src/state/gameState.js`)

**Current State Structure:**
```javascript
export const gameState = {
  wave: 1,    // Current wave/stage number
  gold: 0,    // Primary currency
  xp: 0       // Experience points
};
```

**Game Loop:**
```javascript
export function initGameLoop() {
  setInterval(() => {
    gameState.wave += 1;
    gameState.gold += CONFIG.baseGoldPerWave;
    console.log(`Wave ${gameState.wave} | Gold: ${gameState.gold}`);
  }, CONFIG.waveIntervalMs);
}
```

**Important:** Loop runs but UI doesn't update yet – needs connection to Quest Explorer.

**Future State Properties (to add):**
- `heroes` – Party composition
- `inventory` – Items array
- `upgrades` – Purchased upgrades
- `sigils` – Persistent bonuses
- `resources` – Crafting materials

### 5. Configuration (`src/state/config.js`)

**Current Constants:**
```javascript
export const CONFIG = {
  waveIntervalMs: 5000,      // 5 seconds per wave
  baseGoldPerWave: 5         // Gold earned per wave
};
```

**Expand as needed** for:
- Enemy stats per wave
- Hero base stats
- Upgrade costs
- Item drop rates
- Prestige formulas

---

## Implementation Status

### ✅ COMPLETE (Tasks 1-2 from LLM_HANDOFF.md)

- [x] Desktop environment (wallpaper, icons, taskbar, clock)
- [x] Window manager (open, close, focus, lazy creation)
- [x] Basic Quest Explorer UI layout (3 columns)
- [x] Idle game loop (wave progression, gold accumulation)
- [x] All 5 apps registered with window manager
- [x] CSS styling for OS theme and windows

### 🚧 PARTIALLY COMPLETE (Task 3)

- [~] Quest Explorer visual stub
  - UI layout exists
  - Wave counter placeholder present
  - NOT connected to gameState (no live updates)
  - No combat logic implemented

### ❌ NOT STARTED (Tasks 4-6)

- [ ] Quest Explorer combat logic
- [ ] UI ↔ State binding (live updates)
- [ ] Soulware Store functionality
- [ ] Loot Downloads inventory system
- [ ] Recycle Shrine mechanics
- [ ] System Sigils prestige system
- [ ] Save/load to localStorage
- [ ] Settings/options app
- [ ] Sound effects and music

### 🐛 KNOWN GAPS

1. **No .gitignore file** – Should add to exclude `node_modules/` and `dist/`
2. **No state → UI updates** – Game loop runs but Quest Explorer doesn't reflect changes
3. **No data persistence** – Refreshing browser loses all progress
4. **No error handling** – Console-only debugging
5. **No build optimization** – Default Vite settings (could tune for smaller bundle)

---

## Common Development Tasks

### Adding a New Desktop App

1. **Create app module** in `src/os/apps/newApp.js`:
```javascript
export const newApp = {
  id: 'newApp',
  title: 'New App Name',
  createContent(rootEl) {
    rootEl.innerHTML = `<div>App content here</div>`;
  }
};
```

2. **Import in `main.js`:**
```javascript
import { newApp } from './os/apps/newApp.js';
```

3. **Register app:**
```javascript
windowManager.registerApp(newApp);
```

4. **Add to desktop apps array** in `desktop.js`:
```javascript
const apps = [
  // ... existing apps
  { id: 'newApp', title: 'New App', glyph: '🆕' }
];
```

5. **Add app-specific styles** to `style.css` if needed.

### Connecting State to UI

**Example: Display live wave count in Quest Explorer**

1. **In `questExplorer.js`, add an ID to the wave element:**
```javascript
rootEl.innerHTML = `
  <div class="battle-viewport">
    <div>Wave: <span id="qe-wave-display">1</span></div>
  </div>
`;
```

2. **In `gameState.js`, create an update function:**
```javascript
export function updateWaveDisplay() {
  const waveEl = document.querySelector('#qe-wave-display');
  if (waveEl) {
    waveEl.textContent = gameState.wave;
  }
}
```

3. **Call update function in game loop:**
```javascript
setInterval(() => {
  gameState.wave += 1;
  gameState.gold += CONFIG.baseGoldPerWave;
  updateWaveDisplay();
}, CONFIG.waveIntervalMs);
```

4. **Better approach (pub/sub):** Create event system for decoupling (future enhancement).

### Adding New State Properties

1. **Define in `gameState.js`:**
```javascript
export const gameState = {
  wave: 1,
  gold: 0,
  xp: 0,
  heroes: [  // NEW PROPERTY
    { name: 'Hero 1', level: 1, hp: 100, attack: 10 }
  ]
};
```

2. **Add related configuration to `config.js`:**
```javascript
export const CONFIG = {
  waveIntervalMs: 5000,
  baseGoldPerWave: 5,
  heroBaseStats: {  // NEW CONFIG
    hp: 100,
    attack: 10,
    defense: 5
  }
};
```

3. **Update UI to reflect new state.**

### Adding CSS Styles

**Append to `src/style.css` (keeping sections organized):**

```css
/* ===== New App Name ===== */
.new-app-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.new-app-button {
  padding: 0.5rem 1rem;
  background: var(--accent-blue);
  color: var(--text-light);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.new-app-button:hover {
  background: var(--accent-light);
}
```

**Use existing color variables** for consistency (see CSS Organization above).

### Debugging Tips

1. **Check console** – All errors and logs appear in browser console
2. **Inspect gameState** – In browser console: `window.gameState` (if exposed)
3. **Check window manager state** – `window.windowManager` (if exposed for debugging)
4. **Use breakpoints** – Browser DevTools debugger works with source maps
5. **HMR issues** – If styles don't update, refresh browser manually

---

## Important Files Reference

### Must-Read for Context

1. **`docs/LLM_HANDOFF.md`** (259 lines)
   - Primary directive document for AI assistants
   - Task breakdown (6 phases)
   - Code style guidelines
   - Example prompts for implementation

2. **`README.md`** (179 lines)
   - Project overview and rationale
   - Tech stack explanation
   - Development workflow
   - Roadmap summary

3. **`src/main.js`** (~40 lines)
   - Application entry point
   - Shows initialization order
   - All imports visible here

### Core System Files

4. **`src/os/windowManager.js`** (~80 lines)
   - Window lifecycle logic
   - Critical for understanding app rendering

5. **`src/os/desktop.js`** (~120 lines)
   - Desktop UI creation
   - App registry definition
   - Clock update logic

6. **`src/state/gameState.js`** (~20 lines)
   - Current state structure
   - Game loop implementation

### Design Reference

7. **`design/figma_link.txt`**
   - Figma URL: `https://www.figma.com/design/aWgMylkJjXCNjPUwTwgIrE/ReincarnOS-UI-Concept-Design`
   - Reference for UI decisions
   - Consult before making major layout changes

### Configuration

8. **`vite.config.js`**
   - Minimal config (just `base: './'`)
   - Modify if adding plugins or build optimizations

9. **`package.json`**
   - Shows Vite as only dependency
   - Defines npm scripts

---

## What NOT to Do

### ❌ Forbidden Actions

1. **DO NOT add runtime frameworks or libraries**
   - No `npm install react`, `vue`, `angular`, etc.
   - No `axios`, `lodash`, `moment`, or heavy utility libs
   - Exception: Small single-purpose utils if absolutely necessary (discuss first)

2. **DO NOT break the OS metaphor**
   - Don't create full-screen game modes that hide the desktop
   - Don't add modal dialogs that feel out-of-place in an OS
   - Every major feature should be an "app" in the OS

3. **DO NOT use framework-specific patterns**
   - No components, hooks, or reactive primitives
   - No JSX or template syntax beyond template literals
   - No virtual DOM concepts

4. **DO NOT add CDN dependencies**
   - All assets must be local or bundled
   - No `<script src="https://cdn...">` tags
   - No external font/icon CDNs (use bundled assets or system fonts)

5. **DO NOT use complex build tooling**
   - Vite is sufficient – don't add Webpack, Rollup, Parcel
   - No TypeScript (project is vanilla JS)
   - No preprocessors (SASS, LESS, PostCSS) unless critical

6. **DO NOT ignore the Love2D portability constraint**
   - Avoid browser-specific APIs (e.g., WebGL, Web Audio) if logic-related
   - Keep game logic separate from DOM rendering
   - Think: "Could I rewrite this logic in Lua without major changes?"

7. **DO NOT create separate files for every small function**
   - Keep related code together
   - Only split into new files when modules exceed ~200-300 lines
   - Avoid over-engineering the structure for a small project

### ⚠️ Proceed with Caution

1. **Adding new top-level directories**
   - Stick to existing `src/os/`, `src/state/` organization
   - Discuss before creating new top-level folders

2. **Changing the window manager API**
   - This is a core system – changes affect all apps
   - Ensure backward compatibility or update all apps

3. **Modifying vite.config.js**
   - Current config is minimal and works
   - Only change if adding essential build features (e.g., asset optimization)

4. **Large CSS refactors**
   - The single-file approach works for this project size
   - Don't split into multiple CSS files without good reason

5. **Global state structure changes**
   - Adding properties is fine
   - Changing existing properties may break code
   - Ensure all references are updated

---

## Additional Context

### Design Intent (from Figma)

The UI aims for a **dark fantasy + cyberpunk aesthetic**:
- Dark blue-black backgrounds (#050815, #02040a)
- Circuit-board-like wallpaper pattern (radial gradient)
- Glowing blue accents for hover states
- Isekai/RPG iconography (swords, shields, magic)
- Clean, modern OS window chrome

### Target Audience

- **Players:** Fans of idle games, incremental games, and Isekai anime
- **Developers:** Solo dev or small team using LLM assistance
- **Platform:** Desktop browsers (primary), mobile browsers (secondary)

### Performance Considerations

- **Idle Game Requirements:** Low CPU/memory usage during idle
- **Rendering:** Simple DOM updates, no canvas/WebGL (yet)
- **State Updates:** Currently every 5 seconds (configurable)
- **Target:** Should run smoothly on 5+ year old laptops

### Future Expansion Ideas (Not Yet Planned)

- **Multiplayer:** Guild/friend systems
- **Events:** Limited-time challenges
- **Themes:** Unlockable desktop themes/wallpapers
- **Mods:** User-created content (long-term)
- **Mobile App:** Cordova/Capacitor wrapper

---

## Changelog

- **2025-11-16:** Initial CLAUDE.md creation
  - Documented current codebase structure (11 source files)
  - Implementation status: Tasks 1-2 complete, Task 3 partial
  - Repository contains no CLAUDE.md prior to this

---

## Questions or Issues?

If you're an AI assistant and encounter:
- **Ambiguous requirements** → Check `docs/LLM_HANDOFF.md` for detailed task breakdown
- **Design questions** → Consult Figma link in `design/figma_link.txt`
- **Technical constraints** → Re-read "Critical Constraints" section above
- **Code pattern questions** → Look at existing apps in `src/os/apps/` for examples

**When in doubt:**
1. Check if existing code has a pattern to follow
2. Prioritize simplicity and vanilla JS
3. Keep the OS metaphor intact
4. Ask the user for clarification if fundamentally unclear

---

**End of CLAUDE.md**
