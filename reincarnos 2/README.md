# ReincarnOS – Browser-Based OS Idle RPG (Vite + Vanilla)

ReincarnOS is a modern HTML5 **browser-based OS idle game** where the entire game loop lives inside a fake operating system desktop.

- OS-style desktop (taskbar, windows, icons).
- Isekai-flavored **autobattler** living inside a “browser” app (`Quest Explorer`).
- Other OS apps map to systems:
  - `Soulware Store` – unlock apps, upgrades, relics, cosmetics.
  - `Loot Downloads` – inventory & power-ups as “files”.
  - `Recycle Shrine` – disassemble gear into resources.
  - `System Sigils` – meta progression across “OS update” resets.

The UI layout is designed in Figma (see `design/figma_link.txt`) and implemented as a **Vite-powered vanilla JS app**.

> ⚠️ **Important tech constraint:**  
> The *runtime* should stay **framework-free** (no React/Vue/Angular). Vite is used only as a dev server + bundler.  
> The game must be able to run as a static build (HTML/CSS/JS) fully offline, and be easy to port visually and mechanically to Love2D later.

---

## 1. Design Reference

- Figma design: see `design/figma_link.txt` for the ReincarnOS UI concept link.
- Exported PNG/SVG assets from Figma should live in:

```text
design/exports/
```

Key screens the code should eventually reflect:

- **Desktop**
  - Wallpaper with fantasy x circuit-board vibes.
  - Desktop icons: `Quest Explorer`, `Soulware Store`, `Loot Downloads`, `Recycle Shrine`, `System Sigils`.
  - Bottom taskbar with pinned apps, system tray, and clock.

- **Quest Explorer – Dungeon.exe**
  - Party panel (left), battle viewport (center), quest/rewards panel (right).

- **Soulware Store**
  - App / upgrade cards, currencies, and “User Rank”.

- **Loot Downloads**
  - Inventory grid (items as files), item details, actions (Equip / Install / Recycle).

- **Recycle Shrine**
  - UI for disassembling items into resources (e.g. code fragments, dust).

- **System Sigils**
  - Persistent bonuses that survive “OS Update” resets (prestige).

---

## 2. Tech Stack & Constraints

- **Vite (build & dev)** – vanilla template.
- **Vanilla JavaScript** – no React or heavy JS frameworks.
- **Plain CSS** (or minimal preprocessor) – keep styling portable.
- **Offline-friendly** – final `dist` build should run without network once assets are downloaded.

### Why Vite is OK here

- Gives you:
  - Fast dev server with HMR.
  - Simple build into `dist/`.
- But we treat it as **optional tooling**:
  - No runtime dependency on external CDNs.
  - No need to pull in SPA frameworks.

---

## 3. Suggested Project Structure

```text
reincarnos/
├─ index.html                # Vite entry HTML (root)
├─ vite.config.js
├─ package.json
├─ src/
│  ├─ main.js                # JS entry (imported by index.html)
│  ├─ style.css              # Global styles
│  ├─ os/
│  │  ├─ desktop.js          # Desktop & taskbar logic
│  │  ├─ windowManager.js    # Generic window open/close/focus behavior
│  │  └─ apps/
│  │     ├─ questExplorer.js
│  │     ├─ soulwareStore.js
│  │     ├─ lootDownloads.js
│  │     ├─ recycleShrine.js
│  │     └─ systemSigils.js
│  └─ state/
│     ├─ gameState.js        # Core game state (currencies, waves, items)
│     └─ config.js           # Tunable constants, initial data
├─ design/
│  ├─ figma_link.txt         # Raw Figma URL for ReincarnOS UI
│  └─ exports/               # PNG/SVG exports from Figma
└─ docs/
   └─ LLM_HANDOFF.md         # LLM directives & To-Dos
```

You don’t need this exact structure; it’s a **recommended direction** that plays nicely with LLMs.

---

## 4. Getting Started (Local Dev with Vite)

### 4.1 Install dependencies

```bash
npm install
```

### 4.2 Run dev server

```bash
npm run dev
```

Visit the printed localhost URL (usually `http://localhost:5173/`).

### 4.3 Build for production

```bash
npm run build
npm run preview   # optional: run a local preview server
```

- Production build output goes to `dist/`.
- That `dist/` folder should:
  - Be static (HTML/CSS/JS only).
  - Work offline when hosted or opened from a simple static file server.

---

## 5. Putting It on GitHub

```bash
git init
git add .
git commit -m "Initial ReincarnOS Vite vanilla scaffold"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ReincarnOS.git
git push -u origin main
```

---

## 6. Working with Codex / Other LLMs

When using GitHub Copilot / GPT / Codex for implementation:

- Point them to:
  - `README.md`
  - `docs/LLM_HANDOFF.md`
  - The Figma URL in `design/figma_link.txt`
- Explicitly remind them:
  - **Do not** add React or other SPA frameworks.
  - Respect the OS metaphor (desktop + windows).
  - Keep logic modular and easy to reimplement in Lua for Love2D.

---

## 7. Roadmap Overview

High-level plan (details in `docs/LLM_HANDOFF.md`):

1. **Shell:** Desktop, taskbar, icons, base styles.
2. **Window Manager:** Open/close/focus windows.
3. **Quest Explorer Stub:** Visual layout + simple wave counter.
4. **Resource Loop:** Idle gold/xp generation hooked to Quest Explorer.
5. **Store & Inventory:** Simple Soulware Store + Loot Downloads.
6. **Recycle & Sigils:** Disassembly and simple prestige/reset.

---

## 8. License

(Choose a license later; MIT is a common default.)
