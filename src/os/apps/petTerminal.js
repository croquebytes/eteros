export const petTerminalApp = {
  id: 'petTerminal',
  title: 'Daemonling Pet',
  createContent(rootEl) {
    const petState = {
      name: 'Daemonling',
      hunger: 72,
      energy: 65,
      mood: 45,
      stability: 70,
      curiosity: 55,
      lastLog: 'Wakes up and blinks at the cursor.',
    };

    const actions = [
      { key: 'feed', label: 'Feed', effect: () => { petState.hunger = clamp(petState.hunger + 12); petState.mood = clamp(petState.mood + 4, -50, 100); setLog('Crunches on code crumbs.'); } },
      { key: 'play', label: 'Play', effect: () => { petState.mood = clamp(petState.mood + 8, -50, 100); petState.energy = clamp(petState.energy - 5); petState.curiosity = clamp(petState.curiosity + 6); setLog('Chases a packet sprite.'); } },
      { key: 'rest', label: 'Rest', effect: () => { petState.energy = clamp(petState.energy + 15); petState.stability = clamp(petState.stability + 4); setLog('Enters low-power hibernation.'); } },
      { key: 'debug', label: 'Debug', effect: () => { petState.stability = clamp(petState.stability + 10); petState.mood = clamp(petState.mood - 2, -50, 100); setLog('You patch a flickering glyph.'); } },
      { key: 'praise', label: 'Praise', effect: () => { petState.mood = clamp(petState.mood + 5, -50, 100); petState.curiosity = clamp(petState.curiosity + 2); setLog('It hums happily.'); } },
    ];

    rootEl.innerHTML = `
      <div class="pet-terminal">
        <div class="pet-header">
          <div class="pet-avatar">✨</div>
          <div class="pet-meta">
            <div class="pet-name">${petState.name}</div>
            <div class="pet-status">Daemon Familiar • Cozy Dark</div>
          </div>
        </div>
        <div class="pet-stats" id="pet-stats"></div>
        <div class="pet-actions" id="pet-actions"></div>
        <div class="pet-log" id="pet-log"></div>
      </div>
    `;

    const statsEl = rootEl.querySelector('#pet-stats');
    const actionsEl = rootEl.querySelector('#pet-actions');
    const logEl = rootEl.querySelector('#pet-log');

    renderStats();
    renderActions();
    renderLog();

    function renderStats() {
      const stats = [
        { key: 'hunger', label: 'Hunger', value: petState.hunger, color: '#9ad' },
        { key: 'energy', label: 'Energy', value: petState.energy, color: '#a9d' },
        { key: 'mood', label: 'Mood', value: petState.mood, color: '#8dd' },
        { key: 'stability', label: 'Stability', value: petState.stability, color: '#9df' },
        { key: 'curiosity', label: 'Curiosity', value: petState.curiosity, color: '#c9f' },
      ];

      statsEl.innerHTML = stats.map(stat => `
        <div class="pet-stat-row">
          <div class="pet-stat-label">${stat.label}</div>
          <div class="pet-stat-bar">
            <div class="pet-stat-fill" style="width:${Math.max(0, Math.min(100, stat.value))}%; background:${stat.color};"></div>
          </div>
          <div class="pet-stat-value">${Math.round(stat.value)}%</div>
        </div>
      `).join('');
    }

    function renderActions() {
      actionsEl.innerHTML = '';
      actions.forEach(action => {
        const btn = document.createElement('button');
        btn.className = 'pet-action-btn';
        btn.textContent = action.label;
        btn.addEventListener('click', () => {
          action.effect();
          renderStats();
          renderLog();
        });
        actionsEl.appendChild(btn);
      });
    }

    function renderLog() {
      logEl.textContent = petState.lastLog;
    }

    function setLog(message) {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      petState.lastLog = `[${timeString}] ${message}`;
    }

    function clamp(value, min = 0, max = 100) {
      return Math.max(min, Math.min(max, value));
    }
  }
};
