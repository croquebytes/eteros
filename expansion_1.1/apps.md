# New Applications and Tools

An essential part of ReincarnOS is its diegetic interface: every subsystem appears as an **app** on the desktop.  The OS metaphor invites endless possibilities for creative tools, each with its own UI, mechanics and narrative hooks.  This document describes new apps and how they integrate with the world and game systems.  Wherever possible, follow modern UI principles of clarity, minimalism and personalization【360791380958821†L471-L487】【360791380958821†L506-L521】 and keep interactions unobtrusive so players can continue working on their real‑world desktop【605826546517230†L50-L56】.

## Mail Client

The Mail app functions as the primary quest hub.  It organizes messages into tabs (Inbox, Spam, System Alerts) and provides search and filter options.  Players accept quests, receive bug bounty notices and read lore entries here.

* **Features**:
  - **Quest Acceptance** – Accept and decline missions; accepted missions populate the Quest Explorer.
  - **Spam Detection** – Some messages are obvious spam; others hide secret quests.  Players can enable a *Spam Filter* upgrade to auto‑discard unwanted emails.
  - **Attachments** – Messages may include items, memory blocks or code fragments.
* **UI Notes**: Use a familiar two‑pane layout (list of messages on the left, message body on the right).  Include icons to indicate unread, urgent or faction‑specific emails.  Provide keyboard shortcuts for navigation (e.g., `J`/`K` to move through messages).
* **Implementation**: Represent messages as objects with `id`, `sender`, `subject`, `body`, `attachments` and `tags`.  Persist messages in local storage so that offline progress is preserved【992881712478561†L224-L232】.

## Parody News Reader

The News app delivers humorous headlines and micro‑stories.  It parodies tech journalism while foreshadowing in‑game events.

* **Features**:
  - **Daily Headlines** – Display a rotating set of headlines such as “Kernel Panic at Dawn: SysOps Pull All‑Nighter” or “Hackers Protest: Demanding More CPU Cycles.”
  - **Event Teasers** – Hints about upcoming Glitch Storms, OS Updates or seasonal events.
  - **Clickable Stories** – Some headlines open a short article with lore or a mini‑quest.
* **UI Notes**: A simple scrollable feed with cards for each story.  Allow players to mark stories as favorites or share them via the Terminal app.

## Task Scheduler

This utility manages long‑running tasks such as research projects, compilation and defragmentation.  It provides an at‑a‑glance view of current tasks and allows players to prioritize or cancel them.

* **Features**:
  - **Queue Management** – Tasks are queued and executed sequentially or in parallel depending on available CPU Cycles.
  - **Prioritization** – Drag and drop tasks to reorder them; change priority to allocate more cycles to a job.
  - **Accelerate/Clear** – Spend additional resources to speed up or instantly finish tasks.
* **UI Notes**: Use a list or Kanban board style; each task card displays remaining time, resources consumed and expected reward.  Provide tooltip descriptions.
* **Implementation**: Store tasks with properties such as `type`, `startTime`, `duration`, `resourceCost`, `onComplete`.  Use `setTimeout` or a game loop to update progress.

## Terminal (DevShell)

For advanced users, the Terminal provides a command‑line interface.  It supports built‑in commands and hidden developer cheats.

* **Features**:
  - **System Commands** – Commands like `stats` (view current resources), `tasks` (list scheduled tasks), `sigils` (view prestige progress) or `heroes` (list hero roster).
  - **Script Execution** – Players discover or craft scripts (.js files) that automate repetitive actions.  Running a script consumes CPU cycles.
  - **Secret Commands** – Hidden codes unlocked through quests or faction alignment (e.g., `hack portal` to access the Hacker hideout).
* **UI Notes**: Minimalistic black console with coloured text for output.  Autocomplete suggestions and command history improve usability.

## Antivirus / Firewall

This app protects the system from malware.  Running scans reduces the chance of random negative events.

* **Features**:
  - **Quick Scan** – A short mini‑game (e.g., matching patterns) that takes 30 seconds and uses few resources.
  - **Deep Scan** – Takes several minutes and consumes CPU cycles; offers higher chance to find viruses and yield rewards.
  - **Quarantine** – List detected malware; players choose to quarantine or exploit them (Hackers may want to harness viruses).
* **UI Notes**: Use visual indicators like progress bars and radar displays.  Provide alerts when threats are detected.

## Bug Tracker

An interface for bug bounty missions.  Players pick from an array of bugs (mini‑bosses) and assign heroes to fix them.

* **Features**:
  - **Bug List** – Display active bugs with difficulty ratings, rewards and time estimates.
  - **Assignment** – Drag heroes into a bug slot to assign them.  Heroes become unavailable until the bug is fixed.
  - **Reward Scaling** – Harder bugs yield more Code Fragments and rare items.
* **UI Notes**: Represent bugs as stylized creatures or error codes.  The tracker can be a simple table with sorting by difficulty or reward.

## Gallery / Wallpaper Manager

Personalization is a key UI trend【360791380958821†L506-L521】.  This app allows players to change wallpapers, themes and UI skins.

* **Features**:
  - **Wallpapers** – Unlock new backgrounds through achievements or events; preview before applying.
  - **Themes** – Switch between dark mode, neon cyberpunk or retro pixel art.  Changing themes could also slightly alter sound effects.
  - **Hero Art** – View unlocked hero portraits and concept art.

## Calculator & Productivity Tools

ReincarnOS can include small productivity tools that double as mini‑games, offering light interaction during idle periods.

* **Calculator** – Solve math puzzles or compute prestige formulas.  Completing daily challenges yields a small reward.
* **Notepad** – Jot down notes or decode lore clues.  The Notepad may contain pre‑seeded hints that appear as players progress.
* **Clock and Timer** – Display the current cycle time.  Players can set reminders for research completions.

## Music Player / Radio

An in‑universe music player lets players customize the soundtrack.  Unlock new tracks by exploring sectors or completing events.

* **Features**:
  - **Playlists** – Organize unlocked tracks into playlists.  Playing certain tracks during combat may grant minor bonuses.
  - **Radio Station** – A random shuffle mode that occasionally plays “ads” or news bulletins hinting at future content.
* **UI Notes**: Use a compact player with play/pause, next, previous and volume controls.  Display album art featuring circuit motifs.

## Weather Widget & Clock

Show cosmic weather (e.g., Solar Flare, Cosmic Storm, Quantum Drizzle).  Different weather patterns affect drop rates or enemy behavior.

* **Features**:
  - **Dynamic Weather** – Changes every few hours; influences drop multipliers or enemy buffs.  For example, a Solar Flare increases gold drop rates by 10%.
  - **Time of Day** – Display the current cycle number and day/night in ReincarnOS.  Certain quests or events only occur at specific times.
* **Implementation**: Use a scheduler to update weather status; store the current weather in the game state so offline time is accounted for【992881712478561†L224-L232】.

## Terminal‑Based Arcade

Host retro mini‑games within the Terminal—simple experiences like **Snake**, **Minesweeper** or **Tetris**.  Playing them grants minor resources or achievements.

* **Features**:
  - **Scoreboard** – Track high scores locally and, optionally, share them with friends when online.
  - **Integration** – Achieving a high score could trigger special events or secret messages.
* **UI Notes**: Use ASCII art or simple canvas rendering; keep controls intuitive.

## Research Lab

An app for investing resources into long‑term upgrades.  Research projects unlock new abilities, improve drop rates or add new mechanics【992881712478561†L133-L177】.

* **Features**:
  - **Project Tree** – A branching tree of upgrades; players choose which path to pursue, creating meaningful decisions【992881712478561†L253-L263】.
  - **Resource Costs** – Projects require Code Fragments, CPU Cycles and sometimes rare items.  Longer projects yield more powerful effects.
  - **Project Queue** – Only a limited number of projects can run at once, tying back into the Task Scheduler.

## Compilation & Build

Heroes and gear aren’t simply purchased; they are *compiled*.  Compiling consumes CPU Cycles and time; better heroes require more cycles and longer compile times.

* **Features**:
  - **Hero Compilation** – Select hero templates and feed Code Fragments, Memory Blocks and CPU Cycles.  Compilation times increase with hero tier.
  - **Item Compilation** – Combine fragments and patterns to create rare gear.  Blueprints may drop from bosses.
* **Implementation**: Leverage the Task Scheduler.  Store compile tasks in the queue; when complete, deliver the hero/item to the player.

## Defragmenter & Disk Cleanup

Allocate heroes to defragment the disk and clean up clutter.

* **Features**:
  - **Defrag Jobs** – Running a defrag yields Memory Blocks and occasionally uncovers hidden files.
  - **Cleanup Tasks** – Remove unused files to gain Code Fragments and reduce chance of glitch storms.
  - **Chore Loop** – These tasks take time and encourage players to check back later, aligning with the time‑sink mechanics of idle games【992881712478561†L133-L177】.

## Back‑ups & Restore Points

Players can create restore points of their progress by spending Memory Blocks and CPU Cycles.  Restore points let players experiment with different upgrade paths or story choices.

* **Features**:
  - **Manual Backups** – Create snapshots that can be loaded later at a cost.  Loading a backup may require forgoing rewards gained after the snapshot.
  - **Auto Backups** – Automatically save at the end of major milestones (e.g., finishing a sector).  Auto saves cost nothing but cannot be restored to after a prestige reset.
  - **Branching Paths** – Restoring to an older point opens alternative storylines.

---

**Implementation patterns**: Each app should be a self‑contained module with its own window and state.  Use a central **Window Manager** to open, minimize, resize and close apps.  The following is a simplified example of launching an app:

```js
// Pseudo‑code to register and launch apps
class WindowManager {
  constructor() { this.windows = {}; }
  registerApp(name, componentFactory) {
    this.windows[name] = { factory: componentFactory, instance: null };
  }
  openApp(name) {
    if (!this.windows[name].instance) {
      this.windows[name].instance = this.windows[name].factory();
      document.body.appendChild(this.windows[name].instance.element);
    }
    this.windows[name].instance.show();
  }
}

// Register the Mail app
windowManager.registerApp('Mail', () => new MailApp());

// Launch on icon click
mailIcon.addEventListener('click', () => windowManager.openApp('Mail'));
```

Apps can communicate via an event bus or by reading the shared `GameState`.  Ensure that app state persists when minimized or closed so players can switch between tasks without losing progress.  This modular architecture makes it straightforward to add future tools and systems.