# ReincarnOS – LLM Handoff & To-Dos (Vite + Vanilla)

This document is written **for LLMs** (Codex, ChatGPT, Copilot, etc.) that will help build and maintain this project.

Treat this as your **project brief + guardrails + task list**.

---

## 1. TL;DR

- ReincarnOS is a **browser-based OS-style idle RPG / autobattler**.
- The app runs inside a fake OS desktop UI:
  - Desktop, taskbar, desktop icons, draggable windows (later).
- **Main gameplay loop** is the `Quest Explorer` app (autobattler).
- Meta systems are other “apps”:
  - `Soulware Store`, `Loot Downloads`, `Recycle Shrine`, `System Sigils`.
- Tech stack:
  - **Vite** (vanilla template) for dev & build.
  - **Plain HTML/CSS/JS at runtime** (no React, Vue, etc.).
  - Offline-friendly; easily portable logic to **Love2D/Lua**.

---

## 2. Hard Constraints (Do NOT break these)

When you generate or edit code:

1. **No frameworks.**
   - Do not add React, Vue, Angular, Svelte, etc.
   - Do not rewrite the app as a SPA framework project.
   - Vite is allowed as a **tool only**.

2. **Offline-capable build.**
   - Final `npm run build` output in `dist/` must:
     - Be static HTML/CSS/JS.
     - Work without external CDNs or network calls (after initial download).

3. **Maintain Vite simplicity.**
   - Keep `vite.config.js` minimal.
   - Do not introduce complicated build pipelines or plugins unless explicitly requested.

4. **OS Desktop Metaphor.**
   - Do not replace the OS-style interface with a standard full-screen single-page UI.
   - Everything core should live inside windows on a desktop.

5. **Future Love2D Portability.**
   - Keep game state representation simple:
     - Use plain objects/arrays that could translate 1:1 to Lua tables.
   - Separate “rendering” logic (DOM updates) from “simulation” logic (state updates) as much as reasonable.

---

## 3. Expected Layout & Files

If files are missing, you may create them consistent with this intent.

- `index.html` – root HTML for Vite (contains `<div id="app"></div>`).
- `src/main.js` – JS entrypoint.
- `src/style.css` – global styles (desktop, taskbar, window chrome).
- `src/os/desktop.js` – desktop & taskbar rendering + icon click handlers.
- `src/os/windowManager.js` – open/close/focus logic for windows.
- `src/os/apps/` – one module per app window:
  - `questExplorer.js`
  - `soulwareStore.js`
  - `lootDownloads.js`
  - `recycleShrine.js`
  - `systemSigils.js`
- `src/state/gameState.js` – central game state + idle loop stub.
- `src/state/config.js` – tunable constants & seed data.
- `design/figma_link.txt` – contains the Figma URL for the UI concept.

---

## 4. High-Priority Tasks

### Task 1 – Desktop & Taskbar Shell

**Goal:** Have a working desktop + taskbar using the OS metaphor.

- Ensure `index.html` has a root `<div id="app"></div>`.
- In `main.js`, create and append:
  - A full-screen desktop container.
  - A taskbar anchored to the bottom.
  - A window layer for app windows.
- In `desktop.js`:
  - Render wallpaper, a column of desktop icons, and the taskbar.
  - Hook desktop icon double-clicks to `windowManager.openWindow(appId)`.

Constraints:

- Use basic DOM APIs (no virtual DOM).
- Use CSS classes for layout (avoid inline styles where possible).

---

### Task 2 – Window Component & Window Manager

**Goal:** Basic window system that can open/close multiple app windows.

In `windowManager.js`:

- Maintain a simple registry:

  ```js
  const windows = {
    questExplorer: { app, el, isOpen: false },
    // ...
  };
  ```

- Implement methods:
  - `init(windowLayerEl)` – store reference to container.
  - `registerApp(appConfig)` – store app metadata and render function.
  - `openWindow(appId)` – create the window DOM if needed; show it; bring to front.
  - `closeWindow(appId)` – hide the window.
  - `focusWindow(appId)` – adjust z-index to be on top.

- Each window should have:
  - A title bar with title and a close button.
  - A `div` for the content (app module renders into this).

Initially, windows do **not** need to be draggable; just focusable and closeable.

---

### Task 3 – Quest Explorer UI Stub + Idle Loop

**Goal:** Non-functional but representative `Quest Explorer – Dungeon.exe` window with a basic wave/gold counter updating over time.

- In `src/os/apps/questExplorer.js`:
  - Export an `app` config object:

    ```js
    export const questExplorerApp = {
      id: 'questExplorer',
      title: 'Quest Explorer – Dungeon.exe',
      createContent(rootEl) {
        // set innerHTML with 3-column layout: party, battle, quests
      },
    };
    ```

  - Keep content simple: placeholder hero names, dummy enemies, dummy quests.

- In `src/state/gameState.js`:
  - Define:

    ```js
    export const gameState = {
      wave: 1,
      gold: 0,
      xp: 0,
    };
    ```

  - Implement `initGameLoop()` that:

    ```js
    setInterval(() => {
      gameState.wave += 1;
      gameState.gold += 5;
      console.log('Wave', gameState.wave, 'Gold', gameState.gold);
    }, 5000);
    ```

  - In a later task, this will be hooked to real UI updates.

- In `src/main.js`:
  - Call `initGameLoop()` after initializing the desktop and window manager.

---

## 5. Secondary Tasks (After Shell Works)

### Task 4 – Soulware Store: Simple Upgrades

- Implement a minimal store UI with 3+ upgrades.
- Each upgrade, when purchased:
  - Costs some gold.
  - Modifies a multiplier (e.g., gold per wave, XP per wave).
- Reflect owned upgrades visually.

### Task 5 – Loot Downloads & Recycle Shrine

- Define item structure:

  ```js
  {
    id: 'sword_001',
    name: 'Debug Sword',
    rarity: 'C',
    type: 'weapon',
    stats: { atk: 5, crit: 0.05 },
  }
  ```

- Show a grid of items in `Loot Downloads`.
- Provide a way to "send" an item to `Recycle Shrine`:
  - Remove it from inventory.
  - Add some `codeFragments` or similar resource to state.

### Task 6 – System Sigils & Soft Prestige

- Create `System Sigils` window:
  - Display one or more permanent bonuses.
  - Include a `Perform OS Update` button to:
    - Reset wave/items/currencies.
    - Increment a prestige counter and apply a permanent bonus.

---

## 6. Style & Code Guidelines

- Be modular and explicit. Prefer:

  ```js
  function renderDesktopIcons() { ... }
  ```

  over huge anonymous inline functions.

- Comment intent, not obvious syntax.

- Use descriptive names:

  - `openQuestExplorerWindow()` is better than `openQ()`.

- Keep DOM structure simple and semantic:

  - `.desktop-icon`, `.taskbar`, `.os-window`, `.window-titlebar`, etc.

---

## 7. Example Invocation Prompt for an LLM

Example starting prompt a human might use in VS Code or ChatGPT:

> “You are helping me build **ReincarnOS**, a Vite-powered vanilla JS OS-style idle RPG.  
> Read `README.md` and `docs/LLM_HANDOFF.md`, then inspect `src/main.js`, `src/os/desktop.js`, `src/os/windowManager.js`, and the `src/os/apps/*` files.  
> I need you to extend the OS desktop UI and the Quest Explorer autobattler stub while respecting the constraints (offline static build, no frameworks, Love2D-portable game state).  
> Suggest a small set of changes, then implement the code with clear comments.”

---

## 8. Future Ideas (Do Not Implement Unless Asked)

- Additional OS “apps”:
  - Mail client (quests), fake terminal (secrets/cheats), Task Scheduler (dispatch missions).
- Enhanced windowing:
  - Dragging, snapping, minimizing to taskbar thumbnails.
- Save/load:
  - `localStorage` for runs and prestige state.
- Visual polish:
  - Pixel-art icons, animated wallpaper, subtle desktop effects.

---

End of handoff.
