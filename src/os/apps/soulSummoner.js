// ===== Soul Summoner App (Simplified) =====
// Minimal hero recruiting interface tied to core game state

import { CONFIG } from '../../state/config.js';
import { gameState, recruitHero } from '../../state/gameState.js';

const classPool = Object.keys(CONFIG.heroClasses);
const summonCost = CONFIG.summonCostGold || 50;
const nameCounters = {};

function getNextName(classType) {
  nameCounters[classType] = (nameCounters[classType] || 0) + 1;
  const className = CONFIG.heroClasses[classType]?.name || classType;
  return `${className} Recruit #${nameCounters[classType]}`;
}

function renderRoster(rootEl) {
  const rosterList = rootEl.querySelector('#summon-roster');
  if (!rosterList) return;

  rosterList.innerHTML = '';
  gameState.heroes.forEach(hero => {
    const li = document.createElement('li');
    li.className = 'roster-entry';
    li.innerHTML = `
      <div class="roster-name">${hero.name}</div>
      <div class="roster-meta">${hero.class} • Lv.${hero.level} • ${hero.skillPoints || 0} SP</div>
    `;
    rosterList.appendChild(li);
  });
}

function renderResult(rootEl, hero) {
  const results = rootEl.querySelector('#summon-results');
  if (!results) return;

  const card = document.createElement('div');
  card.className = 'summon-result-card';
  card.innerHTML = `
    <div class="result-title">New Hero Recruited!</div>
    <div class="result-name">${hero.name}</div>
    <div class="result-details">${hero.class} • Lv.${hero.level}</div>
    <div class="result-points">Starting Skill Points: ${hero.skillPoints || 0}</div>
  `;
  results.prepend(card);
}

function updateCurrency(rootEl) {
  const goldEl = rootEl.querySelector('#summon-gold');
  if (goldEl) {
    goldEl.textContent = gameState.gold;
  }
}

function performSummon(rootEl) {
  if (gameState.gold < summonCost) {
    alert(`You need ${summonCost} gold to summon a hero.`);
    return;
  }

  gameState.gold -= summonCost;
  const classType = classPool[Math.floor(Math.random() * classPool.length)];
  const heroName = getNextName(classType);
  const hero = recruitHero(classType, heroName, 1);

  updateCurrency(rootEl);
  renderResult(rootEl, hero);
  renderRoster(rootEl);
}

export const soulSummonerApp = {
  id: 'soulSummoner',
  title: 'Summon Heroes.exe',

  createContent(rootEl) {
    rootEl.innerHTML = `
      <div class="summon-app">
        <div class="summon-header">
          <div>
            <h2>Summon Heroes</h2>
            <p>Spend gold to recruit new party members with starting skill points.</p>
          </div>
          <div class="summon-currencies">
            <div class="currency">Gold: <span id="summon-gold">${gameState.gold}</span></div>
            <div class="currency muted">Cost per summon: ${summonCost} gold</div>
          </div>
        </div>

        <div class="summon-actions">
          <button class="summon-btn" id="summon-once">Summon Hero</button>
        </div>

        <div class="summon-results" id="summon-results"></div>

        <div class="summon-roster">
          <h3>Your Heroes</h3>
          <ul id="summon-roster"></ul>
        </div>
      </div>
    `;

    rootEl.querySelector('#summon-once')?.addEventListener('click', () => {
      performSummon(rootEl);
    });

    renderRoster(rootEl);
  }
};
