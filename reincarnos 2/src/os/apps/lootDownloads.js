export const lootDownloadsApp = {
  id: 'lootDownloads',
  title: 'Loot Downloads',
  createContent(rootEl) {
    rootEl.innerHTML = `
      <div class="window-content loot-downloads">
        <div class="qe-column">
          <h2 class="window-subtitle">Inventory</h2>
          <p>Inventory grid stub – items as files will show here.</p>
        </div>
      </div>
    `;
  },
};
