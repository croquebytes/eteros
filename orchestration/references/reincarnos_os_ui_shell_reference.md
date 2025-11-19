# ReincarnOS OS UI Shell – Implementation Reference (LLM-Ready)

This document is a **spec + prompt scaffold** for implementing the mock OS shell:

- Desktop, windows, taskbar
- Dragging, snapping, minimizing
- Movable desktop icons (with grouping later)
- Local, browser-only persistence
- Offline-friendly, Vite + vanilla HTML/CSS/JS

Use this as **reference + context** when prompting LLMs to write or extend code.

---

## 0. Project Constraints

- **Project name:** ReincarnOS (working title)
- **Platform:** Browser-only
- **Build tooling:** Vite (no React / no heavy frameworks)
- **Runtime stack:** HTML + CSS + vanilla JS modules
- **Offline:** Must be able to run offline once loaded (ideal PWA later).
- **Theme:** Modern pixel-style OS desktop with taskbar and draggable windows.

When prompting an LLM, always restate:

> “Use vanilla JS modules with Vite, no React, and keep everything browser-only with `localStorage` persistence. This is a mock OS shell for an idle game.”

---

## 1. High-Level UI Architecture

The UI is conceptually split into:

1. **Desktop**
   - Background area
   - Holds **desktop icons** (shortcuts to apps/windows)
2. **Windows**
   - Movable, possibly resizable panels with:
     - Title bar
     - Minimize / close buttons
     - Content area (rendered by app module)
3. **Taskbar**
   - Pinned app icons
   - Running windows as buttons
   - Clicking buttons toggles minimize/restore or focuses windows

All of this is driven by a single in-memory **state tree** synced to `localStorage`.

---

## 2. Core State Shape (Desktop Shell)

This is the **canonical shape** the LLM should target for shell features.

```js
const desktopState = {
  profileId: "default",

  windows: {
    /* windowId: WindowState */
  },

  icons: {
    /* iconId: IconState */
  },

  taskbar: {
    pinnedAppIds: ["system-monitor", "cpu-miner"],
    runningWindowIds: [] // ordered list (z-order-friendly)
  },

  settings: {
    theme: "default",
    snapEnabled: true,
    snapMode: "halves", // "halves" | "quarters" | "grid"
    iconGridSize: 64
  },

  game: {
    // reserved for game state (see gameplay doc)
  }
};
```

### 2.1 `WindowState`

```js
const windowState = {
  id: "win-1",
  appId: "system-monitor",
  title: "System Monitor",

  x: 120,
  y: 80,
  width: 420,
  height: 260,

  zIndex: 10,
  isFocused: true,
  isMinimized: false,
  isMaximized: false,
  snap: null, // e.g. "left", "right", "topleft", etc.

  // Optional for later:
  tabs: [],
  activeTabId: null
};
```

### 2.2 `IconState`

```js
const iconState = {
  id: "icon-1",
  label: "System Monitor",
  appId: "system-monitor",
  x: 24,
  y: 24,
  groupId: null // for folders/grouping later
};
```

> **LLM Directive:** When adding/using UI features, extend these shapes instead of inventing new, incompatible ones.

---

## 3. Desktop Icons – Drag, Drop, Snap-to-Grid

### 3.1 Behavior

- Each icon is absolutely positioned on the desktop.
- User can drag icons; on drop:
  - Position is updated in `desktopState.icons[iconId].x/y`.
  - Position is snapped to a grid (e.g., 64px).
  - New state is saved via `localStorage`.

### 3.2 Logic Sketch

On pointer down:

```js
iconEl.addEventListener("pointerdown", (e) => {
  dragState = {
    offsetX: e.clientX - icon.x,
    offsetY: e.clientY - icon.y
  };
  iconEl.setPointerCapture(e.pointerId);
});
```

On move:

```js
iconEl.addEventListener("pointermove", (e) => {
  if (!dragState) return;
  icon.x = e.clientX - dragState.offsetX;
  icon.y = e.clientY - dragState.offsetY;
  iconEl.style.left = icon.x + "px";
  iconEl.style.top = icon.y + "px";
});
```

On up (snap + persist):

```js
const size = desktopState.settings.iconGridSize;
icon.x = Math.round(icon.x / size) * size;
icon.y = Math.round(icon.y / size) * size;
// then save state to localStorage
```

---

## 4. Window Manager – Dragging, Snapping, Focus, Minimize

### 4.1 Dragging Windows

**Goal:** Drag only via title bar, update `WindowState` position, and then optionally snap.

Core idea:

- `pointerdown` on `.window-titlebar` captures pointer.
- While moving:
  - Update `win.x`, `win.y` and inline CSS.
- On release:
  - Call simple snap function (if snapping enabled).
  - Save updated state.

### 4.2 Simple Snap-to-Edge (Halves)

MVP: Snap left/right when window is dragged to screen edges.

Pseudo:

```js
function maybeSnapWindow(win, viewportWidth, viewportHeight, taskbarHeight = 40) {
  const margin = 32;
  const centerX = win.x + win.width / 2;

  if (centerX < margin) {
    // left half
    win.x = 0;
    win.y = 0;
    win.width = viewportWidth / 2;
    win.height = viewportHeight - taskbarHeight;
    win.snap = "left";
  } else if (centerX > viewportWidth - margin) {
    // right half
    win.x = viewportWidth / 2;
    win.y = 0;
    win.width = viewportWidth / 2;
    win.height = viewportHeight - taskbarHeight;
    win.snap = "right";
  } else {
    win.snap = null;
  }
}
```

### 4.3 Focus & Z-Index

When clicking a window:

- Mark all windows `isFocused = false`.
- Set clicked window `isFocused = true`.
- Set its `zIndex` to `maxZ + 1`.
- Ensure its ID is in `taskbar.runningWindowIds`.

---

## 5. Taskbar – Pinned Apps & Running Windows

### 5.1 App Registry

Central registry describing apps:

```js
const appRegistry = {
  "system-monitor": {
    id: "system-monitor",
    name: "System Monitor",
    emoji: "💻",
    defaultWidth: 360,
    defaultHeight: 220,
    renderContent(container, env) {
      // render UI into container
    }
  },
  "cpu-miner": {
    id: "cpu-miner",
    name: "CPU Miner",
    emoji: "⚙️",
    defaultWidth: 360,
    defaultHeight: 200,
    renderContent(container, env) { /* ... */ }
  }
};
```

### 5.2 Taskbar Rules

- Pinned apps: always visible on left.
- Running windows: show as buttons (with active/highlight for focused window).
- Click behavior:
  - If clicking **running window button**:
    - If window is minimized → restore + focus.
    - If focused → minimize.
    - Otherwise → focus (bring to front).
  - If clicking **pinned app**:
    - If app already has a window → focus that window.
    - Else → create new window from `appRegistry`.

### 5.3 Window Creation

Create window from app:

```js
function createWindowForApp(app) {
  const id = generateWindowId();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = app.defaultWidth || 420;
  const height = app.defaultHeight || 260;

  return {
    id,
    appId: app.id,
    title: app.name,
    x: Math.round(vw / 2 - width / 2),
    y: Math.round(vh / 2 - height / 2),
    width,
    height,
    zIndex: 1,
    isFocused: true,
    isMinimized: false,
    isMaximized: false,
    snap: null,
    tabs: [],
    activeTabId: null
  };
}
```

---

## 6. Persistence (localStorage)

**Key idea:** `desktopState` is serialized and stored under a single key.

Example:

```js
const STORAGE_KEY = "reincarnos:profiles";

function loadDesktopState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const all = JSON.parse(raw);
  const profileId = all.lastProfileId || "default";
  return all[profileId] || null;
}

function saveDesktopState(state) {
  const raw = localStorage.getItem(STORAGE_KEY);
  const all = raw ? JSON.parse(raw) : {};
  all[state.profileId] = state;
  all.lastProfileId = state.profileId;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
```

**When to save:**

- After:
  - Window move/snap
  - Minimize / maximize / close
  - Icon move
  - Settings change

Optional: debounce saves during drag.

---

## 7. Offline-First Notes

- At MVP, just ensure **no required network calls**.
- Later: add service worker / PWA to cache:
  - `index.html`, JS bundles, CSS, pixel assets.
- All shell state & game state is in `localStorage`.

---

## 8. LLM Prompt Skeleton (For Shell Tasks)

When you want an LLM to implement or extend shell features, you can start with:

> You are helping build a browser-only, offline-friendly mock OS called ReincarnOS using Vite + vanilla JS (no React).  
> The OS has:
> - A desktop with draggable icons.
> - A taskbar with pinned apps and running window buttons.
> - Draggable windows with snap-to-edge and minimize/close/focus.
>  
> The core `desktopState` object looks like this:  
> [paste relevant parts of Section 2 here]  
>  
> Please implement/extend:  
> - [short list of features, e.g. “add snapping,” “add icon grouping,” “add OS theme toggle,” etc.]  
> Use modules and keep state changes immutable-friendly where possible, then call `saveDesktopState(state)` after relevant changes.

This MD is the **source of truth** for shell behavior and data shapes.
