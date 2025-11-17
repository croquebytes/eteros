# Items and Resources

This document outlines a comprehensive catalogue of gear and resources for the ReincarnOS universe.  Idle games rely on a satisfying drip of loot and upgrades to keep players invested【992881712478561†L110-L131】.  Diverse items and currencies support multiple progression loops and allow meaningful decisions【992881712478561†L253-L263】.  The following sections describe categories of gear, new currencies and suggested data structures for implementation.

## Item Categories

### Weapons

| Name | Type | Rarity | Effect |
| --- | --- | --- | --- |
| **RAM Blade** | Melee | Common | Fast attack speed; increases hero attack by 5% per upgrade level. |
| **Motherboard Shield** | Shield | Uncommon | Adds flat defense; reduces incoming damage by 10%. |
| **Firewall Cloak** | Cloak | Rare | Reduces virus damage by 25%; chance to block debuffs. |
| **Cache Booster** | Off‑hand | Epic | Increases gold gain by 15% per wave; stacks additively. |
| **Bug Zapper** | Ranged | Rare | Adds a 5% chance per hit to purge negative status effects on allies. |
| **Quantum Key** | Utility | Legendary | Unlocks hidden doors and encrypts sectors; grants access to secret quests. |

### Armor

| Name | Type | Rarity | Effect |
| --- | --- | --- | --- |
| **Data Plating** | Armor | Common | Increases max HP by 10%. |
| **Virus‑Proof Suit** | Armor | Rare | Grants immunity to malware damage for 10 seconds every minute. |
| **Overclock Greaves** | Boots | Uncommon | Boosts movement speed and reduces skill cooldowns by 5%. |

### Accessories

| Name | Type | Rarity | Effect |
| --- | --- | --- | --- |
| **Debug Pendant** | Amulet | Rare | Grants a small chance to auto‑fix bugs at the end of a quest. |
| **Fragment Collector** | Ring | Uncommon | Increases drop rate of Code Fragments by 20%. |
| **Entropy Core** | Trinket | Legendary | Converts excess CPU Cycles into Entropy Dust at a rate of 1:1000. |

### Consumables

| Name | Type | Effect |
| --- | --- | --- |
| **Patch File (.patch)** | Single‑use | Heals a hero for 50% HP and removes one negative status effect. |
| **Overclock Chip** | Buff | Temporarily increases a hero’s attack speed and movement speed by 25% for 60 seconds. |
| **Debug Crate** | Utility | Removes all debuffs from the party and increases defense for 10 seconds. |
| **Decryption Key** | Quest item | Opens encrypted chests found in Hidden Partitions. |
| **Boot Disk** | Revive | Revives a fallen hero with 25% HP during combat. |

### Tools and Keys

| Name | Type | Rarity | Effect |
| --- | --- | --- | --- |
| **Memory Expander** | Tool | Epic | Permanently increases the maximum number of heroes/items the player can store. |
| **Compiler Script** | Tool | Uncommon | Reduces compilation time of heroes and items by 15%. |
| **Defrag Utility** | Tool | Rare | Doubles rewards from Defragmenter tasks for the next 3 uses. |

### File Extensions and Rarity

Items in ReincarnOS are files with extensions reflecting their type.  Common items appear as `.tmp` or `.bak`, uncommon items as `.dll`, rare as `.sys`, epic as `.dat` and legendary as `.iso` or `.rom`.  Use colour‑coded icons to communicate rarity (e.g., gray for common, blue for rare, purple for epic, gold for legendary).  Drop chances should follow a weighted distribution tuned to provide a steady stream of upgrades without overwhelming players【992881712478561†L110-L131】.

## Resources and Currencies

ReincarnOS introduces several currencies beyond gold and XP.  Multiple currencies support meta loops and encourage players to engage with different systems【992881712478561†L133-L177】.

| Currency | Description | Usage |
| --- | --- | --- |
| **Gold** | Base currency earned from quests and combat | Used to purchase common upgrades and items. |
| **Code Fragments** | Salvage from recycling items and fixing bugs | Spent in crafting gear and research projects. |
| **Memory Blocks** | Blocks of storage capacity | Expand the hero roster or inventory; required for high‑tier crafting. |
| **CPU Cycles** | Represents computational power; regenerates slowly over time | Consumed to compile heroes/items, run research tasks and accelerate other processes. |
| **Entropy Dust** | Residue of defeated malware | Used for late‑game upgrades and unlocking sectors in corrupt zones. |
| **System Sigils** | Prestige currency obtained by performing a System Reset | Permanently boosts stats and unlocks new branches of progression【883629799932199†L230-L248】. |

### Generation and Regeneration

* **CPU Cycles** regenerate at a fixed rate (e.g., 1 cycle per second) up to a maximum that can be increased via upgrades.  Players can spend cycles to reduce compile/research times or execute scripts.  Idle games often track resources per minute/hour【992881712478561†L110-L131】, so display current cycle rates in the UI.
* **Code Fragments** and **Entropy Dust** drop from enemies and bug fixes.  Increasing the fragment drop rate (through items like *Fragment Collector*) provides a satisfying reward loop.
* **Memory Blocks** are scarce and primarily obtained from Defragmenter tasks or special events.  This creates a time sink and decision point—should players expand inventory or craft high‑tier gear?
* **System Sigils** are awarded using a square‑root or cube‑root formula of total gold or XP gained during a run【883629799932199†L230-L248】.  For example:

```js
// Calculate prestige currency when performing a System Reset
function calculateSigils(totalGold) {
  // Adjust divisor to tune pacing
  return Math.floor(Math.sqrt(totalGold / 1_000_000));
}
```

The formula ensures diminishing returns, preventing runaway inflation and keeping the prestige loop meaningful【883629799932199†L257-L267】.

## Data Structures and Implementation Notes

Items and resources should be represented as serializable objects.  Below is a suggested schema for items and a resource manager.

### Item Object Schema

```js
// Example of an item data structure
const exampleItem = {
  id: 'ram_blade_001',
  name: 'RAM Blade',
  type: 'weapon',
  rarity: 'common',
  levelRequirement: 1,
  description: 'Fast attack speed; increases hero attack by 5% per level.',
  stats: {
    attackModifier: 0.05,
    speedModifier: 0.0,
  },
  icon: 'icons/ram_blade.png',
};
```

Define a `RARITIES` constant for weighted drop tables:

```js
const RARITIES = {
  common: { weight: 70, color: '#CCCCCC', extension: '.tmp' },
  uncommon: { weight: 20, color: '#00AAFF', extension: '.dll' },
  rare: { weight: 8, color: '#8844FF', extension: '.sys' },
  epic: { weight: 1.5, color: '#FF00FF', extension: '.dat' },
  legendary: { weight: 0.5, color: '#FFD700', extension: '.iso' },
};

function rollRarity() {
  const totalWeight = Object.values(RARITIES).reduce((sum, r) => sum + r.weight, 0);
  let pick = Math.random() * totalWeight;
  for (const key in RARITIES) {
    pick -= RARITIES[key].weight;
    if (pick <= 0) return key;
  }
  return 'common';
}
```

### Resource Manager Skeleton

```js
class ResourceManager {
  constructor(initial = {}) {
    this.resources = {
      gold: 0,
      codeFragments: 0,
      memoryBlocks: 0,
      cpuCycles: 0,
      entropyDust: 0,
      sigils: 0,
      ...initial,
    };
  }

  add(type, amount) {
    this.resources[type] = (this.resources[type] || 0) + amount;
    // Optionally clamp values if there is a maximum
  }

  spend(type, amount) {
    if (this.resources[type] < amount) {
      throw new Error(`Not enough ${type}`);
    }
    this.resources[type] -= amount;
  }

  get(type) {
    return this.resources[type] || 0;
  }
}

// Usage
const resManager = new ResourceManager({ gold: 1000 });
resManager.add('codeFragments', 50);
resManager.spend('gold', 100);
console.log(resManager.get('cpuCycles')); // 0
```

Persist resource quantities in `localStorage` or a similar offline storage mechanism so that progress is retained between sessions【992881712478561†L224-L232】.

---

This catalogue provides the building blocks for the LLM to implement a robust loot and resource system.  Coupled with the lore and mechanics defined in other files, these items and currencies will enrich gameplay and support the meta loops vital to a compelling idle experience.