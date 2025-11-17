// ===== Loot Downloads App =====
// Inventory management and equipment system

import { gameState } from '../../state/enhancedGameState.js';
import { equipItem, unequipItem, updateHeroStats } from '../../state/heroSystem.js';
import { showToast, showSelectionToast, showConfirmToast } from '../toastManager.js';
import { makeDraggable, registerDropZone } from '../dragManager.js';

export const lootDownloadsApp = {
  id: 'lootDownloads',
  title: 'Loot Downloads – Inventory.exe',

  createContent(rootEl) {
    render(rootEl);
  }
};

function render(rootEl) {
  const maxSlots = gameState.maxInventorySlots || 50;
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
    const rarityLabel = getRarityLabel(item.rarity);
    const rarityColor = rarityLabel.color;
    const statsText = formatStats(item);

    return `
      <div class="inventory-item" data-item-id="${item.id}" style="border-color: ${rarityColor};">
        <div class="item-header">
          <span class="item-slot-icon">${getSlotIcon(item.type || item.slot)}</span>
          <span class="item-rarity" style="color: ${rarityColor};">${rarityLabel.text}</span>
        </div>
        <div class="item-name">${item.name}</div>
        <div class="item-level">${item.templateId ? 'Soulware' : `Level ${item.level || 1}`}</div>
        <div class="item-stats">${statsText}</div>
        <div class="item-drag-hint">✋ Drag to hero or click to equip</div>
        <div class="item-actions">
          <button class="btn-item-action" onclick="window.showEquipDialog('${item.id}')">Equip</button>
          <button class="btn-item-action btn-recycle" onclick="window.recycleItem('${item.id}')">Recycle</button>
        </div>
      </div>
    `;
  }).join('');

  // Make items draggable
  setTimeout(() => {
    gameState.inventory.forEach(item => {
      const itemEl = grid.querySelector(`[data-item-id="${item.id}"]`);
      if (itemEl) {
        const rarityLabel = getRarityLabel(item.rarity);
        makeDraggable(itemEl, { type: 'item', item }, () => {
          return `
            <div class="drag-ghost-item" style="border-color: ${rarityLabel.color};">
              <span class="ghost-icon">${getSlotIcon(item.type)}</span>
              <span class="ghost-name">${item.name}</span>
            </div>
          `;
        });
      }
    });
  }, 10);

  // Expose functions to window for onclick handlers
  window.showEquipDialog = (itemId) => showEquipDialog(itemId, rootEl);
  window.recycleItem = (itemId) => recycleItemPrompt(itemId, rootEl);
}

function renderHeroEquipment(rootEl) {
  const list = rootEl.querySelector('#hero-equipment-list');
  if (!list) return;

  list.innerHTML = gameState.heroes.map(hero => {
    const classGlyph = hero.role?.[0]?.toUpperCase() || '⚔️';

    return `
      <div class="hero-equipment-card" data-hero-id="${hero.id}">
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

  // Register drop zones for each hero's equipment slots
  setTimeout(() => {
    gameState.heroes.forEach(hero => {
      const heroCard = list.querySelector(`[data-hero-id="${hero.id}"]`);
      if (!heroCard) return;

      ['weapon', 'armor', 'accessory'].forEach(slot => {
        const slotEl = heroCard.querySelector(`[data-slot="${slot}"]`);
        if (slotEl) {
          registerDropZone(
            slotEl,
            (data) => {
              // Validate: must be an item of the correct type
              return data.type === 'item' && data.item.type === slot;
            },
            (data) => {
              // Handle drop
              handleItemDrop(hero, data.item, rootEl);
            }
          );
        }
      });
    });
  }, 10);
}

function renderEquipmentSlot(hero, slot) {
  const item = hero.equipment[slot];
  const slotIcon = getSlotIcon(slot);

  if (!item) {
    return `
      <div class="equipment-slot empty" data-slot="${slot}">
        <span class="slot-icon">${slotIcon}</span>
        <span class="slot-name">${slot}</span>
        <span class="slot-empty">Drop ${slot} here</span>
      </div>
    `;
  }

  const rarityInfo = getRarityLabel(item.rarity);
  const statsText = formatStats(item, ', ');

  return `
    <div class="equipment-slot filled" data-slot="${slot}" style="border-color: ${rarityInfo.color};">
      <div class="slot-header">
        <span class="slot-icon">${slotIcon}</span>
        <span class="slot-name" style="color: ${rarityInfo.color};">${rarityInfo.text}</span>
      </div>
      <div class="slot-item-name">${item.name}</div>
      <div class="slot-stats">${statsText}</div>
      <button class="btn-unequip" onclick="window.unequipFromHero('${hero.id}', '${slot}')">Unequip</button>
    </div>
  `;
}

function handleItemDrop(hero, item, rootEl) {
  const result = equipItem(hero, item);
  if (result.success) {
    // Remove equipped item from inventory and return old item if present
    gameState.inventory = gameState.inventory.filter(i => i.id !== item.id);
    if (result.oldItem) {
      gameState.inventory.push(result.oldItem);
    }
    updateHeroStats(hero);
    showToast(`${item.name} equipped to ${hero.name}!`, 'success');
    render(rootEl);
  } else {
    showToast(result.error || 'Failed to equip item.', 'error');
  }
}

function showEquipDialog(itemId, rootEl) {
  const item = gameState.inventory.find(i => i.id === itemId);
  if (!item) return;

  // Find heroes that can equip this item type
  const eligibleHeroes = gameState.heroes.filter(h => h.currentHp > 0);

  if (eligibleHeroes.length === 0) {
    showToast('No living heroes available to equip this item!', 'warning');
    return;
  }

  // Create a selection toast with hero options
  const heroOptions = eligibleHeroes.map(h => ({
    label: `${h.name} (Lv${h.level} ${h.role || 'Hero'})`,
    value: h
  }));

  showSelectionToast(`Equip ${item.name} to:`, heroOptions, (selectedHero) => {
    const result = equipItem(selectedHero, item);
    if (result.success) {
      // Remove equipped item from inventory and return old item if present
      gameState.inventory = gameState.inventory.filter(i => i.id !== itemId);
      if (result.oldItem) {
        gameState.inventory.push(result.oldItem);
      }
      updateHeroStats(selectedHero);
      showToast(`${item.name} equipped to ${selectedHero.name}!`, 'success');
      render(rootEl);
    } else {
      showToast(result.error || 'Failed to equip item.', 'error');
    }
  });
}

function recycleItemPrompt(itemId, rootEl) {
  const item = gameState.inventory.find(i => i.id === itemId);
  if (!item) return;

  // Calculate recycle value (based on item level and rarity)
  const rarityMultiplier = getRarityLabel(item.rarity).value;
  const goldValue = Math.max(1, Math.floor((item.level || 1) * 2 * rarityMultiplier));
  const fragmentValue = Math.max(1, Math.floor(rarityMultiplier));

  showConfirmToast(
    `Recycle ${item.name}? You will receive: +${goldValue} Gold`,
    () => {
      gameState.gold += goldValue;
      if (gameState.currencies && gameState.currencies.memoryFragments !== undefined) {
        gameState.currencies.memoryFragments += fragmentValue;
      }
      gameState.inventory = gameState.inventory.filter(i => i.id !== itemId);
      showToast(`Recycled ${item.name} for ${goldValue} gold`, 'success');
      console.log(`Recycled ${item.name} for ${goldValue} gold and ${fragmentValue} fragments`);
      render(rootEl);
    }
  );
}

window.unequipFromHero = (heroId, slot, rootEl) => {
  const hero = gameState.heroes.find(h => h.id === heroId);
  if (!hero) return;
  const result = unequipItem(hero, slot);
  if (result.success) {
    gameState.inventory.push(result.item);
    updateHeroStats(hero);
    showToast(`Unequipped ${result.item.name} from ${hero.name}`, 'success');
    const appWindow = document.querySelector('[data-app-id="lootDownloads"] .os-window-body');
    if (appWindow) {
      render(appWindow);
    }
  }
};

function sortInventoryByRarity() {
  gameState.inventory.sort((a, b) => getRarityLabel(a.rarity).value - getRarityLabel(b.rarity).value);
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
    atk: 'ATK',
    defense: 'DEF',
    def: 'DEF',
    maxHp: 'HP',
    hp: 'HP',
    speed: 'SPD',
    spd: 'SPD',
    critChance: 'Crit',
    critMultiplier: 'Crit DMG'
  };
  return names[stat] || stat;
}

function getRarityLabel(rarity) {
  const rarities = {
    1: { text: 'COMMON', color: '#9ca3af', value: 1 },
    2: { text: 'UNCOMMON', color: '#10b981', value: 2 },
    3: { text: 'RARE', color: '#3b82f6', value: 3 },
    4: { text: 'EPIC', color: '#a855f7', value: 4 },
    5: { text: 'LEGENDARY', color: '#f59e0b', value: 5 }
  };

  if (typeof rarity === 'string') {
    const text = rarity.toUpperCase();
    return Object.values(rarities).find(r => r.text === text) || { text, color: '#fff', value: 1 };
  }

  return rarities[rarity] || { text: 'COMMON', color: '#9ca3af', value: 1 };
}

function formatStats(item, separator = '<br>') {
  const stats = item.statBonuses || item.stats || {};
  const entries = Object.entries(stats).map(([stat, value]) => `${formatStatName(stat)}: +${value}`);
  return entries.length ? entries.join(separator) : 'No bonuses';
}
