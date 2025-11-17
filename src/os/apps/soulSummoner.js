// ===== Soul Summoner App =====
// Gacha / Hero Summoning System

import { gameState, spendSoulCores, addHeroToRoster } from '../../state/enhancedGameState.js';
import { GACHA_BANNERS, performGachaPull, handleDuplicate } from '../../state/gachaSystem.js';
import { HERO_TEMPLATES } from '../../state/heroTemplates.js';

export const soulSummonerApp = {
  id: 'soulSummoner',
  title: 'Soul Summoner.exe',

  createContent(rootEl) {
    rootEl.innerHTML = `
      <div class="soul-summoner-container">
        <div class="summoner-header">
          <h2>Soul Summoner</h2>
          <div class="currency-display">
            <span class="soul-cores">Soul Cores: <strong id="soul-cores-display">${gameState.soulCores}</strong></span>
          </div>
        </div>

        <div class="banner-selection">
          <button class="banner-tab active" data-banner="standard_banner">Standard Banner</button>
          <button class="banner-tab" data-banner="beginner_banner" id="beginner-tab">Beginner Banner</button>
        </div>

        <div class="banner-display" id="banner-display">
          <!-- Banner content will be loaded here -->
        </div>

        <div class="summon-results hidden" id="summon-results">
          <h3>Summon Results</h3>
          <div class="results-grid" id="results-grid"></div>
          <button id="close-results">Close</button>
        </div>
      </div>
    `;

    // Event listeners
    const bannerTabs = rootEl.querySelectorAll('.banner-tab');
    bannerTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Update active tab
        bannerTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Load banner
        const bannerId = tab.dataset.banner;
        loadBanner(rootEl, bannerId);
      });
    });

    // Load default banner (standard)
    loadBanner(rootEl, 'standard_banner');

    // Update beginner banner availability
    if (!gameState.gachaState.beginnerBannerAvailable || gameState.gachaState.beginnerBannerPulls >= 20) {
      const beginnerTab = rootEl.querySelector('#beginner-tab');
      if (beginnerTab) {
        beginnerTab.disabled = true;
        beginnerTab.textContent = 'Beginner Banner (Completed)';
      }
    }
  }
};

function loadBanner(rootEl, bannerId) {
  const banner = GACHA_BANNERS[bannerId];
  if (!banner) {
    console.error(`Banner not found: ${bannerId}`);
    return;
  }

  const bannerDisplay = rootEl.querySelector('#banner-display');

  const pityInfo = getPityInfo(banner);

  bannerDisplay.innerHTML = `
    <div class="banner-info">
      <h3>${banner.name}</h3>
      <p class="banner-description">${getBannerDescription(banner)}</p>
    </div>

    <div class="banner-rates">
      <h4>Drop Rates</h4>
      <ul>
        <li>⭐⭐⭐⭐⭐ Legendary: ${(banner.rarityRates[5] * 100).toFixed(2)}%</li>
        <li>⭐⭐⭐⭐ Epic: ${(banner.rarityRates[4] * 100).toFixed(2)}%</li>
        <li>⭐⭐⭐ Rare: ${(banner.rarityRates[3] * 100).toFixed(1)}%</li>
        <li>⭐⭐ Uncommon: ${(banner.rarityRates[2] * 100).toFixed(1)}%</li>
        <li>⭐ Common: ${(banner.rarityRates[1] * 100).toFixed(1)}%</li>
      </ul>
    </div>

    <div class="pity-info">
      <h4>Pity System</h4>
      <p>${pityInfo}</p>
    </div>

    <div class="summon-buttons">
      <button class="summon-btn single-summon" data-banner="${bannerId}" data-type="single">
        Single Summon<br>
        <span class="cost">${banner.singlePullCost} Soul Cores</span>
      </button>
      <button class="summon-btn ten-summon" data-banner="${bannerId}" data-type="ten">
        10x Summon<br>
        <span class="cost">${banner.tenPullCost} Soul Cores</span>
      </button>
    </div>

    <div class="hero-pool">
      <h4>Available Heroes</h4>
      <div class="hero-pool-grid">
        ${generateHeroPoolHTML(banner)}
      </div>
    </div>
  `;

  // Add event listeners for summon buttons
  const summonButtons = bannerDisplay.querySelectorAll('.summon-btn');
  summonButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const bannerIdAttr = btn.dataset.banner;
      const type = btn.dataset.type;
      performSummon(rootEl, bannerIdAttr, type === 'ten');
    });
  });
}

function getBannerDescription(banner) {
  if (banner.type === 'standard') {
    return 'The standard banner contains all heroes from all rarities. Features a pity system to guarantee high-rarity heroes.';
  } else if (banner.type === 'beginner') {
    return 'A special banner for new admins! Reduced cost and guaranteed 4★ hero in your first 10-pull. Limited to 20 pulls total.';
  }
  return '';
}

function getPityInfo(banner) {
  let info = `Hard Pity: Guaranteed 4★+ at ${banner.pity.hardPity} pulls. `;

  if (banner.pity.legendaryPity) {
    info += `Guaranteed 5★ at ${banner.pity.legendaryPity} pulls. `;
  }

  if (banner.type === 'standard') {
    info += `Current pity: ${gameState.gachaState.standardBannerPity} pulls since last 4★+`;
  } else if (banner.type === 'beginner') {
    info += `Pulls used: ${gameState.gachaState.beginnerBannerPulls} / ${banner.maxPulls}`;
  }

  return info;
}

function generateHeroPoolHTML(banner) {
  let html = '';

  // Group heroes by rarity (5★ to 1★)
  for (let rarity = 5; rarity >= 1; rarity--) {
    const heroIds = banner.heroPool[rarity];
    if (!heroIds || heroIds.length === 0) continue;

    html += `<div class="rarity-group rarity-${rarity}">`;
    html += `<h5>${'⭐'.repeat(rarity)} (${heroIds.length} heroes)</h5>`;

    for (const heroId of heroIds) {
      const template = HERO_TEMPLATES[heroId];
      if (template) {
        html += `
          <div class="hero-preview" title="${template.name} (${template.role})">
            <span class="hero-name">${template.name}</span>
          </div>
        `;
      }
    }

    html += `</div>`;
  }

  return html;
}

function performSummon(rootEl, bannerId, isTenPull) {
  const banner = GACHA_BANNERS[bannerId];
  const cost = isTenPull ? banner.tenPullCost : banner.singlePullCost;

  // Check if player has enough Soul Cores
  if (gameState.soulCores < cost) {
    alert(`Not enough Soul Cores! You need ${cost} but only have ${gameState.soulCores}.`);
    return;
  }

  // Spend Soul Cores
  const spendResult = spendSoulCores(cost);
  if (!spendResult.success) {
    alert(spendResult.error);
    return;
  }

  // Perform gacha pull
  const pullResult = performGachaPull(banner, gameState.gachaState, isTenPull);

  if (pullResult.error) {
    alert(pullResult.error);
    // Refund Soul Cores
    gameState.soulCores += cost;
    return;
  }

  // Process results
  const processedResults = [];
  for (const result of pullResult.results) {
    // Check if player already has this hero
    const existingHero = gameState.heroes.find(h => h.templateId === result.heroTemplateId);

    if (existingHero) {
      // Duplicate - convert to currency
      const dupeRewards = handleDuplicate(result.heroTemplateId, result.rarity);
      processedResults.push({
        ...result,
        isNew: false,
        duplicate: true,
        rewards: dupeRewards
      });

      // Add currencies
      for (const currency in dupeRewards) {
        if (gameState.currencies[currency] !== undefined) {
          gameState.currencies[currency] += dupeRewards[currency];
        }
      }
    } else {
      // New hero!
      const hero = addHeroToRoster(result.heroTemplateId);
      processedResults.push({
        ...result,
        isNew: true,
        duplicate: false,
        hero
      });
    }
  }

  // Update stats
  gameState.stats.totalGachaPulls += isTenPull ? 10 : 1;

  // Display results
  displaySummonResults(rootEl, processedResults);

  // Update currency display
  updateCurrencyDisplay(rootEl);

  // Reload banner (to update pity display)
  loadBanner(rootEl, bannerId);
}

function displaySummonResults(rootEl, results) {
  const resultsContainer = rootEl.querySelector('#summon-results');
  const resultsGrid = rootEl.querySelector('#results-grid');

  resultsGrid.innerHTML = '';

  for (const result of results) {
    const stars = '⭐'.repeat(result.rarity);
    const rarityClass = `rarity-${result.rarity}`;
    const newBadge = result.isNew ? '<span class="new-badge">NEW!</span>' : '<span class="dupe-badge">DUPE</span>';

    const card = document.createElement('div');
    card.className = `summon-result-card ${rarityClass}`;

    if (result.duplicate) {
      // Show duplicate rewards
      let rewardsText = '';
      for (const currency in result.rewards) {
        rewardsText += `+${result.rewards[currency]} ${currency}<br>`;
      }

      card.innerHTML = `
        ${newBadge}
        <div class="hero-rarity">${stars}</div>
        <div class="hero-name-result">${result.heroTemplate.name}</div>
        <div class="hero-role">${result.heroTemplate.role}</div>
        <div class="dupe-rewards">${rewardsText}</div>
      `;
    } else {
      card.innerHTML = `
        ${newBadge}
        <div class="hero-rarity">${stars}</div>
        <div class="hero-name-result">${result.heroTemplate.name}</div>
        <div class="hero-role">${result.heroTemplate.role}</div>
      `;
    }

    resultsGrid.appendChild(card);
  }

  resultsContainer.classList.remove('hidden');

  // Close button
  const closeBtn = rootEl.querySelector('#close-results');
  closeBtn.addEventListener('click', () => {
    resultsContainer.classList.add('hidden');
  });
}

function updateCurrencyDisplay(rootEl) {
  const display = rootEl.querySelector('#soul-cores-display');
  if (display) {
    display.textContent = gameState.soulCores;
  }
}
