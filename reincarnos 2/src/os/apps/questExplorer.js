export const questExplorerApp = {
  id: 'questExplorer',
  title: 'Quest Explorer – Dungeon.exe',
  createContent(rootEl) {
    rootEl.innerHTML = `
      <div class="window-content quest-explorer">
        <div class="qe-column qe-party">
          <h2 class="window-subtitle">Party</h2>
          <ul class="party-list">
            <li>Hero 1 (Lvl 1)</li>
            <li>Hero 2 (Lvl 1)</li>
            <li>Hero 3 (Lvl 1)</li>
            <li>Hero 4 (Lvl 1)</li>
          </ul>
        </div>
        <div class="qe-column qe-battle">
          <h2 class="window-subtitle">Battle</h2>
          <div class="battle-viewport">
            <p>Wave <span id="qe-wave">1</span></p>
            <p>Enemies incoming...</p>
            <p style="opacity:0.7;">(Hook real combat here later)</p>
          </div>
        </div>
        <div class="qe-column qe-quests">
          <h2 class="window-subtitle">Quests</h2>
          <ul class="quest-list">
            <li>Clear 10 waves</li>
            <li>Earn 100 gold</li>
            <li>Defeat a Boss</li>
          </ul>
        </div>
      </div>
    `;
  },
};
