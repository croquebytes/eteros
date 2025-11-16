export const recycleShrineApp = {
  id: 'recycleShrine',
  title: 'Recycle Shrine',
  createContent(rootEl) {
    rootEl.innerHTML = `
      <div class="window-content recycle-shrine">
        <div class="qe-column">
          <h2 class="window-subtitle">Disassembly</h2>
          <p>Drop items here (conceptually) to break them into resources.</p>
        </div>
      </div>
    `;
  },
};
