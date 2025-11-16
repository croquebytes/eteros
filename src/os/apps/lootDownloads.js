// ===== Loot Downloads App =====
// Inventory management and equipment system

import { gameState } from '../../state/gameState.js';
import { CONFIG } from '../../state/config.js';
import { equipItem, unequipItem } from '../../state/combatEngine.js';

export const lootDownloadsApp = {
  id: 'lootDownloads',
  title: 'Loot Downloads – Inventory.exe',

  createContent(rootEl) {
    render(rootEl);
  }
};

function render(rootEl) {
  const maxSlots = CONFIG.maxInventorySlots + (gameState.upgrades.inventorySlots * CONFIG.upgrades.inventorySlots.effect);
  const usedSlots = gameState.inventory.length;

  rootEl.innerHTML = `
    <div class="window-content loot-downloads">
      <div class="inventory-panel">
        <div class="inventory-header">
          <h2 class="window-subtitle">Inventory (${usedSlots}/${maxSlots})</h2>
          <button class="btn-sort" id="btn-sort-rarity">Sort by Rarity</button>
        </div>
        <div class="inventory-grid" id="inventory-grid"></div>
      </div>
      <div class="equipment-panel">
        <h2 class="window-subtitle">Heroes</h2>
        <div id="hero-equipment-list"></div>
      </div>
    </div>
  `;

  // Render inventory
  renderInventory(rootEl);

  // Render hero equipment
  renderHeroEquipment(rootEl);

  // Add event listeners
  document.getElementById('btn-sort-rarity')?.addEventListener('click', () => {
    sortInventoryByRarity();
    render(rootEl);
  });
}

function renderInventory(rootEl) {
  const grid = rootEl.querySelector('#inventory-grid');
  if (!grid) return;

  if (gameState.inventory.length === 0) {
    grid.innerHTML = '<div class="inventory-empty">No items yet. Defeat enemies to find loot!</div>';
    return;
  }

  grid.innerHTML = gameState.inventory.map(item => {
    const rarityColor = CONFIG.itemRarities[item.rarity].color;
    const statsText = Object.entries(item.stats)
      .map(([stat, value]) => `${formatStatName(stat)}: +${value}`)
      .join('<br>');

    return `
      <div class="inventory-item" style="border-color: ${rarityColor};">
        <div class="item-header">
          <span class="item-slot-icon">${getSlotIcon(item.slot)}</span>
          <span class="item-rarity" style="color: ${rarityColor};">${item.rarity.toUpperCase()}</span>
        </div>
        <div class="item-name">${item.name}</div>
        <div class="item-level">Level ${item.level}</div>
        <div class="item-stats">${statsText}</div>
        <div class="item-actions">
          <button class="btn-item-action" onclick="window.showEquipDialog('${item.id}')">Equip</button>
          <button class="btn-item-action btn-recycle" onclick="window.recycleItem('${item.id}')">Recycle</button>
        </div>
      </div>
    `;
  }).join('');

  // Expose functions to window for onclick handlers
  window.showEquipDialog = (itemId) => showEquipDialog(itemId, rootEl);
  window.recycleItem = (itemId) => recycleItemPrompt(itemId, rootEl);
}

function renderHeroEquipment(rootEl) {
  const list = rootEl.querySelector('#hero-equipment-list');
  if (!list) return;

  list.innerHTML = gameState.heroes.map(hero => {
    const classGlyph = CONFIG.heroClasses[hero.class]?.glyph || '⚔️';

    return `
      <div class="hero-equipment-card">
        <div class="hero-card-header">
          <span class="hero-glyph">${classGlyph}</span>
          <span class="hero-name">${hero.name}</span>
          <span class="hero-level">Lv${hero.level}</span>
        </div>
        <div class="equipment-slots">
          ${renderEquipmentSlot(hero, 'weapon')}
          ${renderEquipmentSlot(hero, 'armor')}
          ${renderEquipmentSlot(hero, 'accessory')}
        </div>
      </div>
    `;
  }).join('');
}

function renderEquipmentSlot(hero, slot) {
  const item = hero.equipment[slot];
  const slotIcon = getSlotIcon(slot);

  if (!item) {
    return `
      <div class="equipment-slot empty">
        <span class="slot-icon">${slotIcon}</span>
        <span class="slot-name">${slot}</span>
        <span class="slot-empty">Empty</span>
      </div>
    `;
  }

  const rarityColor = CONFIG.itemRarities[item.rarity].color;
  const statsText = Object.entries(item.stats)
    .map(([stat, value]) => `${formatStatName(stat)}: +${value}`)
    .join(', ');

  return `
    <div class="equipment-slot filled" style="border-color: ${rarityColor};">
      <div class="slot-header">
        <span class="slot-icon">${slotIcon}</span>
        <span class="slot-name" style="color: ${rarityColor};">${item.rarity}</span>
      </div>
      <div class="slot-item-name">${item.name}</div>
      <div class="slot-stats">${statsText}</div>
      <button class="btn-unequip" onclick="window.unequipFromHero('${hero.id}', '${slot}')">Unequip</button>
    </div>
  `;
}

function showEquipDialog(itemId, rootEl) {
  const item = gameState.inventory.find(i => i.id === itemId);
  if (!item) return;

  // Find heroes that can equip this item type
  const eligibleHeroes = gameState.heroes.filter(h => h.currentHp > 0);

  if (eligibleHeroes.length === 0) {
    alert('No living heroes available to equip this item!');
    return;
  }

  // Create a simple selection dialog
  const heroNames = eligibleHeroes.map((h, i) => `${i + 1}. ${h.name} (${h.class})`).join('\n');
  const selection = prompt(`Equip ${item.name} to which hero?\n\n${heroNames}\n\nEnter number (1-${eligibleHeroes.length}):`);

  if (selection) {
    const index = parseInt(selection) - 1;
    if (index >= 0 && index < eligibleHeroes.length) {
      const hero = eligibleHeroes[index];
      if (equipItem(hero.id, itemId)) {
        alert(`${item.name} equipped to ${hero.name}!`);
        render(rootEl);
      } else {
        alert('Failed to equip item.');
      }
    }
  }
}

function recycleItemPrompt(itemId, rootEl) {
  const item = gameState.inventory.find(i => i.id === itemId);
  if (!item) return;

  // Calculate recycle value (based on item level and rarity)
  const rarityMultiplier = CONFIG.itemRarities[item.rarity].statMultiplier;
  const goldValue = Math.floor(item.level * 2 * rarityMultiplier);
  const fragmentValue = Math.floor(rarityMultiplier);

  const confirmed = confirm(`Recycle ${item.name}?\n\nYou will receive:\n+${goldValue} Gold\n+${fragmentValue} Fragments`);

  if (confirmed) {
    gameState.gold += goldValue;
    gameState.fragments += fragmentValue;
    gameState.inventory = gameState.inventory.filter(i => i.id !== itemId);
    console.log(`Recycled ${item.name} for ${goldValue} gold and ${fragmentValue} fragments`);
    render(rootEl);
  }
}

window.unequipFromHero = (heroId, slot, rootEl) => {
  const hero = gameState.heroes.find(h => h.id === heroId);
  if (unequipItem(heroId, slot)) {
    alert(`Unequipped ${hero.equipment[slot]?.name || 'item'} from ${hero.name}`);
    // Find the root element - this is a bit hacky but works
    const appWindow = document.querySelector('[data-app-id="lootDownloads"] .os-window-body');
    if (appWindow) {
      render(appWindow);
    }
  }
};

function sortInventoryByRarity() {
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
  gameState.inventory.sort((a, b) => {
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });
}

function getSlotIcon(slot) {
  const icons = {
    weapon: '⚔️',
    armor: '🛡️',
    accessory: '💍'
  };
  return icons[slot] || '📦';
}

function formatStatName(stat) {
  const names = {
    attack: 'ATK',
    defense: 'DEF',
    maxHp: 'HP',
    speed: 'SPD',
    critChance: 'Crit',
    critMultiplier: 'Crit DMG'
  };
  return names[stat] || stat;
}
