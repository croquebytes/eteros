# ReincarnOS – Game Systems Design Document

> **Version:** 1.0
> **Date:** 2025-11-17
> **Purpose:** Comprehensive design for hero leveling, gacha, items, dungeons, AFK loops, gambling, and supporting systems

---

## Table of Contents

1. [Core Fantasy & Pillars](#1-core-fantasy--pillars)
2. [Core Loop & Supporting Loops](#2-core-loop--supporting-loops)
3. [Detailed System Designs](#3-detailed-system-designs)
   - [3.1 Hero Leveling](#31-hero-leveling)
   - [3.2 Gacha / Summon System](#32-gacha--summon-system)
   - [3.3 Party Boosters from Items](#33-party-boosters-from-items)
   - [3.4 Dungeons](#34-dungeons)
   - [3.5 AFK / Mail / Dispatch Quests](#35-afk--mail--dispatch-quests)
   - [3.6 Gambling & Resource Sinks](#36-gambling--resource-sinks)
   - [3.7 Additional Systems](#37-additional-systems)
4. [Progression: Early / Mid / Late Game](#4-progression-early--mid--late-game)
5. [Risks, Pitfalls & Mitigations](#5-risks-pitfalls--mitigations)
6. [Implementation Hooks for Dev LLM](#6-implementation-hooks-for-dev-llm)

---

## 1. Core Fantasy & Pillars

### The Fantasy

**You are a reincarnated soul awakened inside ReincarnOS, a mystical operating system that exists between dimensions.** You were once a legendary administrator of this OS in a previous life, but corruption has infected the system. Malicious processes, rogue programs, and corrupted data plague every directory and server node.

**Your purpose:** Recruit heroic "Soul Threads" (heroes manifested as executable processes), equip them with "Soulware" (mystical software that enhances their abilities), and deploy them to cleanse corrupted Dungeons (infected directories and servers). As you progress, you'll unlock deeper system privileges, install powerful Sigils (OS-level blessings), and discover the truth behind the corruption.

**Moment-to-moment gameplay:** You check in every few hours to:
- See how your party progressed through automated dungeon runs
- Collect loot from completed AFK dispatch missions
- Spend resources on gacha pulls to expand your hero roster
- Equip new Soulware items to optimize party synergies
- Route heroes to new dungeons or dispatch contracts
- Fine-tune automation settings (Task Scheduler) for maximum efficiency
- Occasionally engage in active loops: gambling mini-games, Debug Console challenges, or manual dungeon runs when you want to focus

**The vibe is cozy yet crunchy:** satisfying number growth, meaningful roster-building decisions, and a rewarding sense of progression without oppressive timers or FOMO mechanics.

### Design Pillars

1. **OS-as-World Consistency**
   Every system, mechanic, and UI element reinforces the "fake desktop OS" metaphor. Apps are game systems. Heroes are processes. Items are software. Dungeons are corrupted file systems. This isn't just aesthetic—it's the core identity.

2. **Roster Depth Over Raw Power**
   Success comes from building a diverse roster of heroes with complementary abilities, not grinding a single overpowered unit. Lower-rarity heroes remain viable through synergies, Soulware buffs, and smart composition.

3. **Low-Friction Idle with Strategic Depth**
   70% of the game runs while you're AFK. But the 20% management time is rich with choices: which heroes to level, which dungeons to farm, which items to keep, how to spend limited gacha currency. Depth without busywork.

4. **Generous but Meaningful Sinks**
   The game is F2P-friendly and non-predatory, but progression still requires choices. Gambling apps and resource conversion create optional, fun sinks for excess resources—not mandatory gates.

5. **Systemic Interconnection**
   No isolated mini-games. Every system feeds into others: Dungeons drop items and XP → Items buff heroes → Heroes enable harder dungeons → Harder dungeons unlock prestige currencies → Prestige currencies enable better gacha/AFK loops → Repeat.

---

## 2. Core Loop & Supporting Loops

### Main Daily Loop (5–15 minute check-in)

1. **Collect Rewards**
   - Gather loot from idle dungeon progression (auto-runs while offline)
   - Retrieve completed AFK dispatch mission rewards from "Task Manager" app
   - Check "Mailbox" app for completed contract quests

2. **Manage Inventory**
   - Open "Loot Downloads" app (inventory)
   - Equip new Soulware items on heroes
   - Recycle unwanted items at "Recycle Shrine" for crafting materials

3. **Spend Resources**
   - Use Soul Cores (gacha currency) for summons in "Soul Summoner" app
   - Purchase upgrades/unlocks in "Soulware Store"
   - Optional: Burn excess gold/materials in "Speculation Station" (gambling) for cosmetics or jackpot items

4. **Optimize Progression**
   - Assign heroes to new AFK dispatch missions (1–8 hour timers)
   - Switch dungeon target if farming different rewards (XP vs gold vs items)
   - Level up heroes with accumulated XP
   - Adjust "Task Scheduler" automation rules (auto-recycle junk, auto-retry dungeons, etc.)

5. **Active Engagement (Optional)**
   - Attempt a Challenge Dungeon or Boss Raid manually
   - Play a Debug Console ritual (active puzzle/combat challenge)
   - Gamble in Speculation Station for fun

6. **Long-Term Planning**
   - Decide which heroes to invest Awakening Shards into (duplicate system)
   - Plan next prestige cycle (System Sigils app)
   - Experiment with party compositions and Soulware synergies

### Supporting Loops & Frequency

| Loop | Engagement Frequency | Primary Function |
|------|---------------------|------------------|
| **Idle Dungeon Progression** | Always running (24/7) | Main source of gold, XP, and common items |
| **AFK Dispatch Missions** | 2–6 times/day (1–8 hour timers) | Guaranteed rewards, rare currencies, specific item types |
| **Mailbox Quests** | 1–3 times/day (contracts refresh daily) | Special currencies, unique items, story flavor |
| **Gacha Pulls** | 1–5 times/week (limited by Soul Core income) | Roster expansion, endgame merges |
| **Store Purchases** | As resources allow (daily refresh for some items) | Guaranteed hero unlocks, specific Soulware, convenience |
| **Recycle Shrine** | Daily (after inventory fills) | Material conversion, clears inventory bloat |
| **Gambling (Speculation Station)** | Optional, 0–2 times/day | Fun resource sink, cosmetic rewards |
| **Task Scheduler Setup** | Once per major progression milestone | Automation setup, reduces manual busywork |
| **Debug Console Challenges** | 1–3 times/week (active engagement) | Skill-based rewards, rare unlocks |
| **Prestige (System Sigils)** | Every 1–4 weeks | Hard reset with permanent bonuses |

---

## 3. Detailed System Designs

### 3.1 Hero Leveling

**Core Concept:** Heroes gain XP from dungeons, dispatch missions, and consumed XP items. Leveling increases stats and unlocks ability slots, dispatch tiers, and equipment slots.

#### How XP is Earned

- **Primary: Dungeon Combat**
  Heroes in the active party earn XP from each defeated wave/enemy. Amount scales with dungeon tier and wave number.
  _Example: Wave 10 of a Tier 2 dungeon = 50 XP per hero. Wave 100 = 800 XP per hero._

- **Secondary: AFK Dispatch Missions**
  Heroes sent on dispatch earn XP as a mission reward (usually 20–40% of what they'd earn in equivalent dungeon time).
  _Example: 4-hour dispatch = 2000 XP on success._

- **Tertiary: Consumable XP Items**
  Special items dropped from dungeons or bought from store ("XP Patch v1.2", "Training Daemon") grant flat XP when used.
  _Example: "Minor XP Patch" = 500 XP to one hero._

- **Bonus: Recycle Shrine Conversion**
  Recycling duplicate heroes or certain items grants "Knowledge Fragments" (currency) that can be converted to XP items.

#### Level Curve Shape

- **Early Game (Levels 1–20):** Fast. Each level requires 100 × level XP.
  _Level 1 → 2 = 100 XP. Level 19 → 20 = 1900 XP._
  **Intent:** Players quickly get heroes to viability (unlock first abilities, feel progression).

- **Mid Game (Levels 21–50):** Moderate exponential. Each level requires 150 × level XP.
  _Level 20 → 21 = 3150 XP. Level 49 → 50 = 7350 XP._
  **Intent:** Progress slows but still feels attainable. Players start specializing heroes.

- **Late Game (Levels 51–100):** Steep but not oppressive. Each level requires 200 × level × (1 + level/100) XP.
  _Level 50 → 51 ≈ 10,200 XP. Level 99 → 100 ≈ 39,800 XP._
  **Intent:** High-level heroes are long-term projects. Encourages broad roster building.

- **Soft Cap:** Level 100 is the practical cap for most content. Prestige (System Sigils) can raise the cap to 120, then 150.

#### Stat Growth

Heroes have 5 core stats:
- **HP** (Health Points) – determines survivability
- **ATK** (Attack) – physical/magical damage output
- **DEF** (Defense) – damage reduction
- **SPD** (Speed) – turn order, cooldown reduction
- **LCK** (Luck) – crit rate, drop rate, dispatch success rate

**Growth Per Level:**
- Each hero has a "growth profile" (Balanced, Tank, DPS, Support, etc.)
- Stats increase by a base amount + rarity multiplier per level
- Example for a Rare (3★) Tank hero:
  - HP: +15 per level
  - ATK: +3 per level
  - DEF: +8 per level
  - SPD: +2 per level
  - LCK: +1 per level

**Breakpoints:**
- Every 10 levels, heroes unlock a new ability slot or passive slot
- Level 25: Unlock "Dispatch Tier 2" (can do harder AFK missions)
- Level 50: Unlock "Dispatch Tier 3"
- Level 75: Unlock "Ultimate Ability Slot"

#### Example Hero Progression

**Hero:** "Firewall Knight Ignis" (Epic 4★ Tank)

| Level | HP | ATK | DEF | SPD | LCK | Unlocks |
|-------|-----|-----|-----|-----|-----|---------|
| 1 | 120 | 8 | 18 | 5 | 2 | Basic Attack, Taunt |
| 10 | 300 | 35 | 108 | 23 | 11 | Passive Slot 1 |
| 25 | 600 | 80 | 243 | 53 | 26 | Dispatch Tier 2, Ability Slot 2 |
| 50 | 1200 | 155 | 468 | 103 | 51 | Dispatch Tier 3, Passive Slot 2 |
| 75 | 1950 | 230 | 693 | 153 | 76 | Ultimate Ability |
| 100 | 3000 | 305 | 918 | 203 | 101 | Final Passive |

**Early Game (Lvl 1–25):** Ignis is a reliable tank, protects the party, learns core abilities.
**Mid Game (Lvl 25–75):** Can handle Tier 2–3 dispatches, gains ultimate ability, becomes cornerstone of boss raids.
**Late Game (Lvl 75–100):** Max potential, can tackle Challenge Dungeons, synergizes with Epic+ Soulware items.

---

### 3.2 Gacha / Summon System

**Core Concept:** Players spend "Soul Cores" (premium gacha currency) to summon random heroes from a pool. Rarity tiers, pity mechanics, and duplicate handling ensure F2P viability and long-term engagement.

#### Rarity Tiers

| Rarity | Symbol | Pull Rate (Standard Banner) | Growth Multiplier | Notes |
|--------|--------|------------------------------|-------------------|-------|
| **Common** | 1★ | 50% | 0.8× | Starter heroes, easily replaced, recycle fodder |
| **Uncommon** | 2★ | 30% | 0.9× | Early-mid game workhorses, niche uses late game |
| **Rare** | 3★ | 15% | 1.0× | Solid all-around, viable endgame with investment |
| **Epic** | 4★ | 4.5% | 1.2× | Powerful kits, long-term projects |
| **Legendary** | 5★ | 0.5% | 1.5× | Top-tier, game-changing abilities |

**Rarity Meaning:**
- **1★–2★:** Tutorial and early progression. Useful for AFK dispatches and filling roles initially.
- **3★:** The "baseline viable" tier. With good Soulware and leveling, 3★ heroes can clear 70% of content.
- **4★–5★:** Power spikes. Rare pulls that define builds and enable the hardest challenges.

#### Banner Types

1. **Standard Banner (Always Available)**
   - Contains all heroes from 1★ to 5★
   - Rates as listed above
   - Pity: Guaranteed 4★+ at 90 pulls (0.5% → 100% at pull 90)
   - Soft pity: 4★+ rate increases by +1% per pull after pull 70

2. **Rate-Up Banner (Rotates Weekly)**
   - Features 3–5 specific heroes with 2× rate
   - Still uses standard rarity distribution, but if you hit 4★ or 5★, 50% chance it's a rate-up hero
   - Same pity as Standard Banner (shared or separate depending on tuning)

3. **Beginner Banner (Once Per Account)**
   - First 10-pull guaranteed to include one 4★ hero
   - Costs 50% fewer Soul Cores (5 instead of 10 per pull)
   - Limited to 20 pulls total, then disappears

4. **Event Banner (Monthly)**
   - Limited-time heroes or cosmetic variants
   - Separate pity counter
   - Higher 4★ rate (6% instead of 4.5%) but no 5★ pool (to avoid FOMO pressure)

#### Pull Costs & Currency Income

**Pull Costs:**
- **Single Pull:** 10 Soul Cores
- **10-Pull:** 100 Soul Cores (same price, but guarantees at least one 2★+)

**Soul Core Income (F2P, per week):**
- Daily login: 5/day × 7 = 35
- Dungeon clear milestones: ~20/week
- AFK Dispatch missions: ~15/week
- Mailbox quest contracts: ~10/week
- Event/challenge rewards: ~10/week
- **Total: ~90 Soul Cores/week = 9 pulls/week or ~36 pulls/month**

**Light Spender Option:**
- "Monthly Soul Pass" ($5): +300 Soul Cores/month
- One-time "New Admin Bundle" ($10): 500 Soul Cores + 3 guaranteed 4★ tickets

**Intent:** F2P can do 1–2 ten-pulls per week. Light spenders can do 3–4. Generous enough to build a diverse roster without feeling starved.

#### Pity Mechanics

**Hard Pity (Standard & Rate-Up Banners):**
- Counter tracks total pulls on that banner type
- At 90 pulls without a 4★+, the next pull is guaranteed 4★ or 5★
- 5★ is NOT guaranteed at 90—only 4★+. This keeps 5★special.
- If you want a guaranteed 5★, there's a separate "Legendary Pity" at 180 pulls (guarantees one 5★)

**Soft Pity:**
- Starting at pull 71, each pull without a 4★+ increases the 4★+ rate by +1%
- By pull 90, rate is effectively 100%

**Pity Carryover:**
- Standard Banner pity carries between sessions
- Rate-Up Banner pity does NOT carry between different rate-ups (resets each week)
- Event Banner has separate pity that resets when event ends

**UI Transparency:**
- Pity counter always visible in summon app
- "Next 4★+ guaranteed in X pulls" shown clearly

#### Duplicate Handling

**When you pull a hero you already own:**

1. **Common/Uncommon (1★–2★) Duplicates**
   - Auto-convert to "Memory Fragments" (minor currency)
   - 1★ duplicate = 10 Memory Fragments
   - 2★ duplicate = 25 Memory Fragments
   - Memory Fragments can be spent in Soulware Store for XP items or low-tier Soulware

2. **Rare (3★) Duplicates**
   - Convert to "Awakening Shards" (25 shards per duplicate)
   - 100 Awakening Shards can be used to "Awaken" a 3★ hero (raises level cap from 100 → 110, +10% stats)
   - Can awaken up to 5 times (max level 150)

3. **Epic/Legendary (4★–5★) Duplicates**
   - Convert to "Legendary Shards" (50 shards for 4★, 100 for 5★)
   - 150 Legendary Shards = 1 "Legendary Selector Ticket" (choose any 4★ hero)
   - 300 Legendary Shards = 1 "5★ Selector Ticket"
   - Alternatively, can awaken Epic/Legendary heroes (same as 3★ system)

**Intent:**
- Dupes are never "wasted" pulls
- Low-rarity dupes fuel early progression (XP items)
- High-rarity dupes fuel long-term min-maxing (awakenings, selectors)

---

### 3.3 Party Boosters from Items (Soulware)

**Core Concept:** Items ("Soulware") are equippable software that buff heroes or the entire party. They drop from dungeons, are crafted at Recycle Shrine, bought from Soulware Store, or unlocked via System Sigils.

#### Soulware Categories

1. **Individual Gear (per-hero slots)**
   - Each hero has 3 equipment slots: Weapon, Armor, Accessory
   - These boost the hero's personal stats or grant abilities
   - Examples:
     - **"Crit Driver v2.0"** (Weapon) – +15% ATK, +10% crit rate
     - **"Firewall Firmware"** (Armor) – +20% DEF, +5% damage reduction
     - **"Overclocking Daemon"** (Accessory) – +10% SPD, abilities cooldown 5% faster

2. **Party-Wide Buffs (limited slots)**
   - 3 "System-Wide Soulware" slots shared by the party
   - These affect all heroes in the active party
   - Examples:
     - **"Healing Protocol v3.1"** – Party heals 2% HP every 5 seconds
     - **"Gold Multiplier Patch"** – +25% gold from dungeons
     - **"XP Boost Script"** – +15% XP gain

3. **Conditional/Synergy Boosters**
   - Items that activate under specific conditions
   - Examples:
     - **"Tank Synergy Relay"** – If party has 2+ Tank heroes, all Tanks gain +20% DEF
     - **"DPS Overclock Module"** – If party has 3+ DPS heroes, all DPS gain +15% ATK and SPD
     - **"Low-Rarity Amplifier"** – All heroes 3★ or lower gain +30% stats (encourages using low-rarity heroes)

4. **Dungeon-Specific Modifiers**
   - Items that only work in certain dungeon types
   - Examples:
     - **"Boss Slayer Codec"** – +50% damage vs bosses (only active in Boss Raid dungeons)
     - **"Speed Run Optimizer"** – +20% SPD in Challenge Dungeons
     - **"AFK Auto-Repair Script"** – Party auto-heals 10% HP per wave in idle dungeons

#### Rarity & Power Scaling

Soulware items also have rarity tiers:

| Rarity | Drop Rate (farming dungeons) | Stat Bonus Range | Special Effect Chance |
|--------|------------------------------|------------------|----------------------|
| **Common** | 60% | +5–10% single stat | 10% |
| **Uncommon** | 25% | +10–15% single stat or +5% dual stats | 30% |
| **Rare** | 10% | +15–25% mixed stats | 60% |
| **Epic** | 4% | +25–40% mixed stats + unique passive | 90% |
| **Legendary** | 1% | +40–60% mixed stats + powerful unique passive | 100% |

**Example Legendary Soulware:**

**"Admin's Legacy Kernel"** (System-Wide slot)
- +30% HP to all heroes
- +20% ATK to all heroes
- Passive: "Root Access" – Once per dungeon, if party would be defeated, restore 50% HP to all heroes and gain +50% damage for 30 seconds
- Obtained: Only from prestige (System Sigils) or extremely rare Boss Raid drop

#### How Boosters Are Obtained

1. **Dungeon Drops (Primary)**
   - Common/Uncommon from all dungeons
   - Rare from Tier 2+ dungeons
   - Epic from Tier 3+ and Challenge Dungeons
   - Legendary from Boss Raids and prestige rewards

2. **Soulware Store (Guaranteed Purchase)**
   - Rotate daily selection of Common–Rare items for gold
   - Weekly Epic item for premium currency (Soul Cores)
   - Monthly Legendary item for rare currency (Legendary Shards)

3. **Recycle Shrine (Crafting)**
   - Disassemble unwanted Soulware into "Code Fragments"
   - Combine Code Fragments to craft specific items (recipes unlocked via progression)
   - Example: 50 Rare Code Fragments + 500 gold = craft one Rare Soulware of your choice from a list

4. **AFK Dispatch Rewards**
   - Certain dispatch missions guarantee specific Soulware types
   - Example: "Data Mining Operation" (6 hours) – always drops one Uncommon+ Weapon

5. **System Sigils (Prestige)**
   - Prestige unlocks permanent bonuses AND exclusive Soulware sets
   - Example: "Sigil of the First Admin" prestige unlock grants "Admin's Starter Kit" (3 Epic items)

#### Synergy Example: The "Low-Budget Tank Comp"

**Party Composition:**
- 3× Uncommon (2★) Tank heroes (levels 30–40)
- 1× Rare (3★) Healer hero (level 35)

**Equipped Soulware:**
- **System-Wide Slot 1:** "Low-Rarity Amplifier" (Epic) – +30% stats to 3★ and below
- **System-Wide Slot 2:** "Tank Synergy Relay" (Rare) – +20% DEF to all Tanks (party has 3 Tanks)
- **System-Wide Slot 3:** "Healing Protocol v3.1" (Uncommon) – Party heals 2% HP/5s
- **Individual Gear (on Tanks):** 3× "Firewall Firmware" (Uncommon Armor) – +20% DEF each

**Result:**
- Each 2★ Tank has base stats boosted by +30% (Low-Rarity Amplifier)
- Then +20% DEF again (Tank Synergy Relay)
- Then +20% DEF from individual armor
- Healer keeps everyone topped off
- This comp can punch above its rarity weight class and handle Tier 2 dungeons despite being mostly 2★ heroes

**Intent:** Rewards creative team-building. High-rarity heroes aren't mandatory if you leverage synergies and Soulware.

---

### 3.4 Dungeons

**Core Concept:** Dungeons are the primary active/idle content where heroes fight waves of enemies. Different dungeon types emphasize different rewards and challenge styles.

#### Dungeon Categories (5 Types)

##### 1. Story Nodes (Linear Progression)

**Theme:** Corrupted system directories with narrative flavor ("Infected Registry", "Malware Quarantine Zone", "Root Directory Abyss")

**Structure:**
- 10 waves per node, each wave is a combat encounter
- Completing all 10 waves "clears" the node and unlocks the next
- First-time clear grants milestone rewards (Soul Cores, hero unlock, app unlock)

**Difficulty Scaling:**
- Each Story Node is tuned for a specific party level range
- Node 1: Levels 1–5
- Node 5: Levels 15–20
- Node 10: Levels 40–50
- Node 15: Levels 70–80
- Final Node (20): Levels 90–100

**Rewards:**
- Moderate gold and XP
- Guaranteed Soulware item on first clear (rarity scales with node tier)
- Story unlocks (new apps, prestige features, lore entries)

**Example Story Nodes:**
- **Node 1: "Startup Errors"** – Tutorial node, introduces combat
- **Node 5: "Spam Filter Breakdown"** – Unlocks Mailbox app
- **Node 10: "Kernel Panic Zone"** – Unlocks System Sigils app (prestige)
- **Node 15: "Administrator's Tomb"** – Unlocks Task Scheduler automation
- **Node 20: "Core Corruption Source"** – Final story boss, hardest content (for now)

##### 2. Farming Nodes (Repeatable Resource Grind)

**Theme:** "Servers" with specific resource emphasis ("Gold Server Farm", "XP Training Grounds", "Loot Drop Network")

**Structure:**
- Endless waves (no fixed endpoint)
- Difficulty scales gradually every 10 waves
- Can be run idle (auto-progress while offline)
- Player sets a "stop condition" (e.g., stop after 50 waves, or stop if HP drops below 20%)

**Specializations (3 types):**

1. **Gold Farming Node** – "Crypto Mining Cluster"
   - +100% gold drop rate, -50% XP, -50% item drop rate
   - Best for: Stockpiling gold for store purchases, gambling, leveling costs

2. **XP Farming Node** – "Training Simulation Server"
   - +100% XP gain, -50% gold, -50% item drop rate
   - Best for: Power-leveling new heroes or pushing to level cap

3. **Item Farming Node** – "Loot Repository Network"
   - +100% item drop rate, -50% gold, -50% XP
   - Best for: Hunting specific Soulware or crafting materials

**Scaling:**
- Waves 1–10: Trivial (level 10 party)
- Waves 11–30: Easy (level 20 party)
- Waves 31–60: Moderate (level 40 party)
- Waves 61–100: Hard (level 60+ party)
- Waves 101–200: Very Hard (level 80+ party, requires good Soulware)
- Waves 201+: Endgame (level 100 party with Epic+ gear)

**Rewards:**
- Consistent, predictable resource income
- Scales infinitely (core idle loop)

##### 3. Challenge Dungeons (Skill-Based, High Difficulty)

**Theme:** "Hardened Security Nodes" with special modifiers ("No-Heal Firewall", "Speed Run Protocol", "Boss Rush Archive")

**Structure:**
- Fixed 20-wave dungeon with a specific challenge modifier
- Can only be attempted 3 times per day (resets daily)
- Requires manual play or well-tuned automation

**Challenge Modifier Examples:**
- **"No Healing Allowed"** – Party cannot heal HP during combat (tests burst damage and survivability)
- **"Speed Run Protocol"** – Must clear in under 5 minutes (tests DPS and SPD)
- **"Boss Rush"** – All 20 waves are boss enemies (tests endurance and cooldown management)
- **"Low Power Challenge"** – Party total stats reduced by 50% (tests synergy and Soulware optimization)
- **"Permadeath Mode"** – If a hero dies, they can't be used for the rest of the run (tests positioning and protection)

**Rewards:**
- High-tier Soulware (guaranteed Epic on first clear, Rare on repeat clears)
- Rare currencies (Legendary Shards, Awakening Shards)
- Cosmetic unlocks (desktop wallpapers, hero skins, app themes)

**Rotation:**
- 3 Challenge Dungeons active at any time, rotated weekly

##### 4. Boss Raids (Multi-Wave, High-Value Loot)

**Theme:** "Admin-Level Threats" – single massive boss fights ("Megacorp Malware CEO", "Corrupted Kernel Lord", "Infinite Loop Wyrm")

**Structure:**
- 5-phase boss fight (each phase is a distinct "wave" with different mechanics)
- Boss has 10–50× the HP of normal enemies
- Requires coordinated party (specific role coverage: Tank, Healer, DPS)
- Weekly rotation (one raid available per week, refreshes Monday)

**Mechanics:**
- Bosses have unique abilities (AoE attacks, debuffs, enrage timers)
- Party must survive all 5 phases to win
- Failing mid-raid costs no resources (can retry unlimited times during the week)

**Rewards (First Clear Each Week):**
- 1 guaranteed Epic or Legendary Soulware
- 50 Legendary Shards
- 500 Soul Cores
- Unique cosmetic (mount, pet, wallpaper)

**Repeat Clears (After First):**
- 50% reduced rewards
- Still drops Rare Soulware and good gold/XP

**Example Boss Raid:**

**"Infinite Loop Wyrm" (Week 1 Raid)**
- **Phase 1:** Wyrm summons endless low-HP adds (tests AoE damage)
- **Phase 2:** Wyrm gains +200% DEF (tests sustain damage)
- **Phase 3:** Wyrm deals massive single-target damage (tests Tank survivability)
- **Phase 4:** Wyrm disables healing (tests burst DPS before wipe)
- **Phase 5:** Enrage timer – 60 seconds to finish or instant wipe (tests DPS check)

##### 5. Event Nodes (Temporary, Special Rewards)

**Theme:** Seasonal or monthly events tied to game lore ("Valentine's Firewall Breach", "Summer Server Cooldown", "Black Friday Data Leak")

**Structure:**
- Available for 1–2 weeks
- Mix of farming, challenge, and boss raid elements
- Unique currency that only drops during event ("Event Tokens")
- Event Shop sells exclusive Soulware, heroes, cosmetics for Event Tokens

**Rewards:**
- Limited-time cosmetics (desktop themes, hero skins)
- Exclusive Epic Soulware (often themed, e.g., "Cupid's Crit Driver" for Valentine's)
- Event-exclusive 4★ hero (can only be obtained during event)

**Intent:** Creates urgency without FOMO pressure (events repeat yearly, cosmetics eventually added to permanent store at higher cost)

---

### 3.5 AFK / Mail / Dispatch Quests

**Core Concept:** Long-duration missions that heroes complete while you're offline. Two systems: **Task Manager** (generic dispatches) and **Mailbox** (story-driven contracts).

#### Task Manager (AFK Dispatch System)

**UI:** "Task Manager.exe" app – looks like Windows Task Manager but lists hero "processes" being assigned to "tasks"

**Mechanics:**
- Player has 4 dispatch slots initially (unlocks +1 slot per prestige, max 8 slots)
- Assign 1–4 heroes per dispatch (more heroes = higher success rate and better rewards)
- Dispatches have durations: 1 hour, 2 hours, 4 hours, 8 hours
- Success rate is calculated based on hero stats vs dispatch difficulty

**Success Rate Formula (conceptual):**
```
Base Success = (Average Party Level / Dispatch Requirement Level) × 100%
Cap at 95% (always 5% chance of failure)
Minimum 10% (even if undergeared)
LCK stat adds +0.5% per 10 LCK
```

**Failure States:**
- **Success:** Full rewards
- **Partial Success (50–99% success roll):** 50% rewards, heroes return unharmed
- **Failure (0–49% success roll):** 10% rewards, heroes return with "Fatigue" debuff (-20% stats for 1 hour real-time)

**Dispatch Tiers:**

| Tier | Unlock Requirement | Duration Range | Reward Types |
|------|-------------------|----------------|--------------|
| **Tier 1** | Always available | 1–2 hours | Gold, XP, Common Soulware |
| **Tier 2** | Hero level 25+ | 2–4 hours | Gold, XP, Uncommon+ Soulware, Memory Fragments |
| **Tier 3** | Hero level 50+ | 4–8 hours | Gold, XP, Rare+ Soulware, Awakening Shards |
| **Tier 4** | Hero level 75+ | 8–12 hours | Legendary Shards, Epic Soulware, Soul Cores |

**Example Dispatches:**

1. **"Memory Leak Patrol"** (Tier 1, 1 hour)
   - Requirement: Any hero level 5+
   - Success Rate: 90% with level 10 hero
   - Rewards: 100 gold, 200 XP, 10% chance for Common Soulware

2. **"Firewall Inspection"** (Tier 2, 4 hours)
   - Requirement: 2+ heroes, average level 30+
   - Success Rate: 75% with level 30 party
   - Rewards: 500 gold, 1000 XP, 1 Uncommon Soulware guaranteed, 30 Memory Fragments

3. **"Deep Registry Dive"** (Tier 3, 8 hours)
   - Requirement: 3+ heroes, average level 60+
   - Success Rate: 60% with level 60 party
   - Rewards: 1500 gold, 3000 XP, 1 Rare Soulware guaranteed, 25 Awakening Shards

4. **"Admin Vault Retrieval"** (Tier 4, 12 hours)
   - Requirement: 4 heroes, average level 80+, must include 1 Tank and 1 Healer
   - Success Rate: 50% with level 80 balanced party
   - Rewards: 50 Soul Cores, 100 Legendary Shards, 1 Epic Soulware, 5000 XP per hero

**Intent:**
- Dispatches are "set and forget" for guaranteed progress
- Higher tiers offer better rewards but require investment (high-level heroes unavailable for dungeons during dispatch)
- Risk/reward: Send your best heroes on long dispatch for great rewards, or keep them in dungeons?

#### Mailbox (Contract Quest System)

**UI:** "Mailbox.app" – looks like an email client, each contract is an "email" from an NPC

**Mechanics:**
- 5 contract slots available daily (refreshes at daily reset)
- Each contract is a short narrative quest (flavor text + requirements)
- Completing contracts grants rewards + "Reputation" with NPC factions
- Reputation unlocks store discounts, exclusive Soulware, and hero unlocks

**Contract Structure:**
- **Sender:** NPC name (e.g., "Firewall Guild", "Data Merchant Collective", "Recycle Shrine Monks")
- **Subject Line:** Quest name (e.g., "URGENT: Spam Cleanup Needed", "Courier Contract: Deliver Data Packet")
- **Requirements:** Specific task (assign heroes to contract for X hours, or complete Y waves in Z dungeon type)
- **Rewards:** Gold, XP, rare currency, Reputation points
- **Flavor Text:** 1–2 sentences giving context (reinforces world-building)

**Example Contracts:**

1. **"Spam Filter Emergency"**
   - **Sender:** Firewall Guild
   - **Subject:** URGENT: Spam Cleanup Needed
   - **Requirements:** Assign 2+ heroes for 2 hours (auto-completes, no fail state)
   - **Rewards:** 200 gold, 50 Reputation (Firewall Guild)
   - **Flavor:** "Our spam filters are overwhelmed. Send a cleanup crew to purge the inbox before the malware spreads."

2. **"Courier Run: Data Packet Delivery"**
   - **Sender:** Data Merchant Collective
   - **Subject:** Courier Contract: Rush Delivery
   - **Requirements:** Assign 1 hero with 50+ SPD for 4 hours
   - **Rewards:** 30 Soul Cores, 100 Reputation (Data Merchants)
   - **Flavor:** "Time-sensitive data packet needs transport to Sector 7. High-speed courier only."

3. **"Boss Bounty: Corrupted Process Termination"**
   - **Sender:** Admin Council
   - **Subject:** BOUNTY: Eliminate Kernel Panic Entity
   - **Requirements:** Complete Boss Raid "Kernel Panic Lord" this week
   - **Rewards:** 100 Legendary Shards, 200 Reputation (Admin Council), 1 Epic Soulware Selector Ticket
   - **Flavor:** "The Kernel Panic Lord threatens system stability. Authorized admins: terminate with extreme prejudice."

4. **"Recycle Request: Junk Data Disposal"**
   - **Sender:** Recycle Shrine Monks
   - **Subject:** Donation Drive: Recycle 10 Items
   - **Requirements:** Recycle any 10 Soulware items at Recycle Shrine
   - **Rewards:** 50 Awakening Shards, 150 Reputation (Recycle Monks)
   - **Flavor:** "The Shrine seeks offerings. Recycle unwanted Soulware to fuel the next cycle."

5. **"Mystery Contract: ???"**
   - **Sender:** [REDACTED]
   - **Subject:** Re: Re: Fwd: CHECK THIS OUT
   - **Requirements:** Open 5 gacha pulls this week
   - **Rewards:** 500 gold, 1 Rare XP Patch, ???
   - **Flavor:** "Curious? Don't ask questions. Just pull."

**Reputation System:**
- Each NPC faction tracks Reputation (0–10,000 scale)
- Milestones unlock rewards:
  - **500 Rep:** 5% discount at that faction's store section
  - **1000 Rep:** Unlock exclusive Soulware item for purchase
  - **2500 Rep:** Unlock exclusive 4★ hero (recruit via store)
  - **5000 Rep:** Unlock Legendary Soulware set
  - **10,000 Rep (max):** Unlock cosmetic title, mount, and permanent +10% rewards from that faction's contracts

**Faction Examples:**
- **Firewall Guild:** Defensive Soulware, Tank heroes
- **Data Merchant Collective:** Currency rewards, speed-focused Soulware
- **Recycle Shrine Monks:** Crafting materials, awakening items
- **Admin Council:** Prestige unlocks, exclusive Epic/Legendary items

---

### 3.6 Gambling & Resource Sinks

**Core Concept:** A fun, optional mini-game app where players can spend excess resources on high-variance, cosmetic-focused gambling. Designed to be entertaining and fair, not predatory or mandatory.

#### The App: "Speculation Station.exe"

**UI:** Looks like a flashy casino app window with neon accents, spinning icons, and a retro 90s aesthetic

**Philosophy:**
- **Never required for progression** – all rewards are cosmetic, luxury, or "jackpot" bonuses
- **Transparent EV (Expected Value)** – House edge clearly displayed (e.g., "Long-term EV: 90%" means you get back 90% of what you spend on average)
- **No real money** – Only in-game currencies (gold, Memory Fragments, event tokens)
- **Hard caps** – Daily/weekly limits on max bets to prevent feel-bad moments

#### Gambling Mini-Games (4 Types)

##### 1. Soul Slots (Slot Machine)

**How it Works:**
- Spend gold to spin a 3-reel slot machine
- Match 3 symbols to win prizes
- Symbols: Common (50% chance), Uncommon (30%), Rare (15%), Epic (4%), Legendary (1%)

**Bet Sizes:**
- Small Bet: 100 gold → max payout 500 gold (5× multiplier on Legendary match)
- Medium Bet: 500 gold → max payout 3000 gold (6× multiplier)
- Large Bet: 2000 gold → max payout 15,000 gold (7.5× multiplier)

**Payout Table (Medium Bet example):**
| Match | Payout | Probability |
|-------|--------|-------------|
| 3× Common | 100 gold | 12.5% |
| 3× Uncommon | 300 gold | 2.7% |
| 3× Rare | 1000 gold | 0.3% |
| 3× Epic | 3000 gold | 0.006% |
| 3× Legendary | 15,000 gold + Cosmetic Item | 0.0001% |

**House Edge:** ~10% (EV = 90%)

**Daily Limit:** 50 spins/day (prevents obsessive grinding)

##### 2. High/Low Card Game

**How it Works:**
- Dealer shows a card (2–Ace, standard deck)
- Player bets whether the next card will be Higher or Lower
- Correct guess = 2× payout (minus house edge)
- Can chain wins for multipliers (2×, 4×, 8×, 16×) but can cash out at any time

**Bet Currency:** Memory Fragments (the low-tier dupe currency)

**Bet Size:** 50–500 Memory Fragments per round

**House Edge:** 5% (slightly better odds than slots, but lower ceiling)

**Daily Limit:** 20 rounds/day

**Rewards:**
- Gold (if you cash out)
- Cosmetic card backs (unlock after winning 5× chain or higher)

##### 3. Jackpot Accumulator (Passive Lottery)

**How it Works:**
- Global jackpot pool that accumulates from all players' dungeon runs (1% of all gold earned server-wide goes into jackpot)
- Buy "lottery tickets" (100 gold each, max 10/day)
- Daily drawing at reset – 1 random ticket wins the jackpot
- Jackpot rolls over if no one wins (cap at 10 million gold)

**Odds:**
- Depends on total tickets sold (true lottery)
- Average odds: 1 in 50,000 tickets (if 500k tickets sold/day globally)
- Solo offline players: jackpot still accumulates from their own dungeon runs (smaller pool, better odds)

**Rewards:**
- Gold jackpot (split if multiple winners)
- Exclusive "Lottery Winner" cosmetic title

**Intent:** Fun long-shot dream with negligible cost

##### 4. Mystery Box Roulette (Event Currency Sink)

**How it Works:**
- Spend Event Tokens (from limited-time events) on mystery boxes
- Each box contains a random cosmetic or Soulware item
- Weighted RNG (common cosmetics frequent, rare cosmetics uncommon)
- **No dupes** – if you already own an item, it re-rolls automatically

**Box Tiers:**
- **Bronze Box:** 50 Event Tokens → Common–Uncommon cosmetics
- **Silver Box:** 150 Event Tokens → Uncommon–Rare cosmetics, small chance at Epic Soulware
- **Gold Box:** 500 Event Tokens → Rare–Epic cosmetics, guaranteed Epic Soulware

**Contents Examples:**
- Desktop wallpapers (50+ variations)
- Hero skins (recolors, alternate outfits)
- App icon themes (cyberpunk, fantasy, retro)
- Pet followers (cosmetic companions that follow your cursor)
- Emotes/animations for hero idle poses

**Intent:** Event currency sink that feels rewarding, not predatory (no dupes + transparent odds)

#### Safeguards & Ethical Design

1. **Daily Limits:**
   - Slots: 50 spins/day
   - High/Low: 20 rounds/day
   - Lottery: 10 tickets/day
   - Mystery Boxes: No limit (event currency is time-gated anyway)

2. **Transparent Odds:**
   - Every mini-game shows exact odds and house edge
   - "Info" button explains probability and EV

3. **No Real Money:**
   - Cannot buy gambling currency with real money (only earn in-game)
   - Gambling is a sink, not a monetization vector

4. **Cosmetic Focus:**
   - Best rewards are cosmetics (titles, skins, wallpapers)
   - No power locked behind gambling (Epic Soulware from Mystery Boxes is obtainable elsewhere)

5. **Opt-In Experience:**
   - Speculation Station is never forced or tutorialized
   - It's a fun bonus for players who enjoy it

---

### 3.7 Additional Systems

Beyond the core systems, here are 4 complementary systems that deepen strategy and reinforce the OS metaphor.

#### 1. Task Scheduler (Automation & Macros)

**App Name:** "Task Scheduler.exe"

**Purpose:** Automate repetitive tasks to reduce busywork and let players focus on strategy.

**Features:**

- **Auto-Recycle Rules**
  - Set thresholds to auto-recycle Soulware (e.g., "Auto-recycle all Common items", "Auto-recycle duplicates of items I already have 3+ copies of")
  - Prevents inventory bloat

- **Auto-Retry Dungeons**
  - If party is defeated in a dungeon, auto-retry up to X times before stopping
  - Useful for pushing progression overnight

- **Auto-Dispatch Assignment**
  - When a dispatch mission completes, auto-assign the same heroes to the same mission again
  - Perfect for overnight AFK farming

- **Auto-Level Heroes**
  - Automatically spend XP to level heroes when they have enough (can set priority order: "Level highest-rarity first" or "Level evenly")

- **Notification Rules**
  - Set alerts for specific events (e.g., "Notify me when a Legendary item drops", "Notify me when Boss Raid is completable")

**Unlock Requirement:**
- Unlocked by completing Story Node 15
- 3 automation slots initially
- Unlock +1 slot per prestige (max 8 slots)

**Ties Into:**
- Reduces friction for idle gameplay (70% AFK goal)
- Frees up mental bandwidth for strategic decisions (party comp, Soulware optimization)
- Makes prestige resets less painful (automation carries over)

#### 2. Debug Console (Ritual Challenges)

**App Name:** "Debug Console.exe"

**Purpose:** Active, skill-based challenges that reward execution and puzzle-solving.

**Mechanics:**

- **Ritual Challenges** are single-attempt, high-stakes puzzles/combat scenarios
- Each ritual has unique rules (e.g., "Defeat boss using only 1 hero", "Clear dungeon in 60 seconds", "Survive 10 waves without healing")
- Completing a ritual grants a "Debug Token"
- Debug Tokens can be spent in the Debug Console shop for exclusive rewards

**Challenge Types:**

1. **Time Trials**
   - Clear a dungeon faster than target time
   - Rewards: Cosmetics, rare currencies

2. **Solo Hero Challenges**
   - Defeat a boss using only 1 hero (tests hero builds and Soulware optimization)
   - Rewards: Hero-specific skins, titles

3. **Puzzle Battles**
   - Combat scenarios with unique mechanics (e.g., "Enemy is immune to damage, must push them into hazards", "All heroes have 1 HP, must win in 3 turns")
   - Rewards: Unique Soulware with niche effects

4. **Permadeath Gauntlets**
   - 10-wave gauntlet where defeated heroes can't be revived
   - Rewards: High-tier Awakening Shards, Legendary Shards

**Challenge Rotation:**
- 3 rituals active per week
- Completing all 3 grants a bonus reward (e.g., 1 Epic Soulware Selector Ticket)

**Difficulty Tiers:**
- **Normal:** Doable with good planning
- **Hard:** Requires optimization
- **Nightmare:** Requires near-perfect execution and top-tier gear

**Ties Into:**
- Satisfies the 10% active engagement pillar
- Rewards player skill (not just time investment or gacha luck)
- Debug Tokens are a separate progression currency (not RNG-gated)

#### 3. Firewall Defense (Tower Defense Mini-Game)

**App Name:** "Firewall Defense.exe"

**Purpose:** A tower defense mini-game that uses heroes as "towers."

**Mechanics:**

- **Map:** A grid-based path where enemies spawn at one end and march toward your "Core" at the other
- **Deploy Heroes:** Place heroes on the grid as stationary towers (they auto-attack enemies in range)
- **Waves:** 15 waves of increasingly tough enemies
- **Win Condition:** Prevent enemies from reaching the Core (Core has HP; if it hits 0, you lose)

**Hero Behavior:**
- Each hero has a range, attack speed, and damage (based on their stats)
- Tanks have short range but high HP (act as blockers)
- DPS have long range but low HP (act as damage dealers)
- Support heroes buff nearby towers (e.g., "Healer grants regen aura to adjacent towers")

**Upgrade System:**
- Earn "Firewall Points" during the match (from defeating enemies)
- Spend points mid-match to upgrade hero towers (increase damage, range, or attack speed)

**Rewards:**
- **First Clear:** 50 Soul Cores, 1 Epic Soulware
- **Repeat Clears:** Memory Fragments, gold, XP
- **Perfect Clear (No Core Damage):** Exclusive cosmetic (Firewall Defense themed)

**Weekly Rotation:**
- New map each week with different enemy types and layouts

**Ties Into:**
- Uses existing hero roster (encourages building diverse heroes)
- Tests strategic positioning and resource management
- Adds variety to combat (not just DPS checks)

#### 4. Registry Editor (Deep Customization)

**App Name:** "Registry Editor.exe"

**Purpose:** Advanced customization and "modding" tools for power users.

**Features:**

- **Stat Reallocation**
  - Spend rare currency to reallocate a hero's stat points (e.g., convert 50 ATK into 25 DEF and 25 SPD)
  - Allows fine-tuning heroes for specific roles

- **Ability Swapping**
  - Unlock alternate abilities for heroes (via progression or drops)
  - Swap out default abilities for situational ones (e.g., replace Tank's "Taunt" with "Reflect Damage" for a boss fight)

- **Cosmetic Modding**
  - Upload custom desktop wallpapers (local images)
  - Recolor hero sprites (basic palette swaps)
  - Rename heroes (personalization)

- **Balance Tweaks (Prestige Unlock)**
  - After 3+ prestiges, unlock "Admin Mode" which lets you tweak game balance for your own save (e.g., increase gold gain by 20%, decrease XP curve, etc.)
  - Changes only affect your save (not competitive)

**Unlock Requirement:**
- Unlocked after completing Story Node 20 (final story node)
- Some features locked behind prestige

**Ties Into:**
- Rewards long-term players with deep customization
- Encourages experimentation (ability swapping adds replayability)
- Personalization increases player investment in their save

---

## 4. Progression: Early / Mid / Late Game

### Early Game (First 2–5 Hours)

**Player Experience:**
"I just reincarnated into ReincarnOS. I need to understand what's happening and build my first team."

**What the Player is Doing:**

1. **Tutorial (First 30 Minutes):**
   - Complete Story Node 1 ("Startup Errors") – introduces combat basics
   - Receive 3 starter heroes (all 2★, different roles: Tank, DPS, Healer)
   - Unlock Quest Explorer app (main autobattler)
   - Unlock Loot Downloads app (inventory)
   - First gacha pull (Beginner Banner) – guaranteed 4★ hero

2. **Early Progression (30 Minutes – 2 Hours):**
   - Clear Story Nodes 2–5
   - Level starter heroes to 10–15
   - Unlock Mailbox app (Node 5 clear reward)
   - Complete first Mailbox contract (easy 2-hour dispatch)
   - Collect first Soulware drops (Common/Uncommon items)
   - Equip Soulware on heroes
   - Unlock Farming Nodes (after Node 3)
   - Switch to idle Gold Farming Node overnight

3. **First Milestones (2–5 Hours):**
   - Reach hero level 20 (unlocks first passive slot)
   - Clear Story Node 7 – unlocks Recycle Shrine app
   - Recycle first batch of junk items, get Memory Fragments
   - Save up 100 Soul Cores (from story rewards + dailies)
   - Do first 10-pull on Standard Banner
   - Expand roster to 6–8 heroes
   - Unlock Soulware Store (Node 6 reward)
   - Buy first Uncommon Soulware from store

**Pacing:**
- **Fast and rewarding:** New unlocks every 20–40 minutes
- **Clear goals:** Story Nodes guide progression
- **No walls:** Early game is tuned to be smooth (no grinding required)

**Key Moment:**
- **"Aha" at 2 hours:** Player completes first 10-pull, gets a new 3★ or 4★ hero, and realizes they can build different party comps. The synergy between heroes and Soulware clicks.

---

### Mid Game (5–30 Hours)

**Player Experience:**
"I have a solid roster and understand the systems. Now I'm optimizing and exploring deeper content."

**What the Player is Doing:**

1. **Roster Expansion (5–15 Hours):**
   - Complete Story Nodes 8–12
   - Reach hero levels 30–50
   - Unlock AFK Dispatch Tier 2 (hero level 25+)
   - Send heroes on 4-hour dispatches overnight
   - Diversify roster: build 2–3 different party comps for different dungeons
   - Start farming specific Soulware from Item Farming Nodes
   - Unlock first Challenge Dungeon (after Node 10)
   - Attempt Challenge Dungeons (may fail first time, come back stronger)

2. **First Boss Raid (10–15 Hours):**
   - Unlock Boss Raid access (after Node 11)
   - Attempt first Boss Raid (Infinite Loop Wyrm)
   - May fail first time – requires optimizing party comp and Soulware
   - Succeed on 2nd or 3rd attempt
   - Get first Epic Soulware drop
   - Epic item feels like a huge power spike

3. **Prestige Unlock (15–30 Hours):**
   - Clear Story Node 10 ("Kernel Panic Zone") – unlocks System Sigils app
   - Learn about prestige system (hard reset with permanent bonuses)
   - Decide whether to prestige now (faster 2nd loop) or push further (more resources before reset)
   - Most players prestige around 20–25 hours

4. **Deep Optimization (20–30 Hours):**
   - Experiment with Soulware synergies (e.g., Low-Rarity Amplifier + Tank Synergy Relay)
   - Unlock Mailbox Reputation rewards (hit 1000 Rep with first faction)
   - Purchase first exclusive 4★ hero from Reputation shop
   - Unlock Task Scheduler app (after Node 15)
   - Set up automation rules (auto-recycle, auto-dispatch)
   - Push Farming Nodes to wave 100+

**Pacing:**
- **Slower but deliberate:** Progression is about optimization, not just "next unlock"
- **Choice-driven:** Players choose which dungeons to farm, which heroes to level, which Soulware to keep

**Key Moment:**
- **"Aha" at 15 hours:** Player unlocks System Sigils and realizes prestige is coming. They start planning their first reset and strategizing which prestige bonuses to pick.

---

### Late Game (30+ Hours)

**Player Experience:**
"I've prestiged multiple times. Now I'm chasing perfect builds, rare heroes, and endgame challenges."

**What the Player is Doing:**

1. **Prestige Loops (30–50 Hours):**
   - Complete 2–5 prestige cycles
   - Each cycle is faster (permanent bonuses from Sigils)
   - Unlock higher prestige-gated content:
     - Story Nodes 16–20 (requires 2+ prestiges)
     - Dispatch Tier 4 (requires 3+ prestiges)
     - Registry Editor app (requires 3+ prestiges)
   - Prestige bonuses stack (e.g., +50% gold gain, +30% XP gain, +2 automation slots)

2. **Endgame Challenges (40–80 Hours):**
   - Clear all Story Nodes (Node 20 is final boss, very hard)
   - Clear all Challenge Dungeons on first try (requires deep optimization)
   - Complete all Boss Raids (weekly rotation)
   - Unlock Nightmare difficulty Debug Console rituals
   - Push Farming Nodes to wave 500+ (endgame idle flex)

3. **Roster Perfection (50–100+ Hours):**
   - Collect all 5★ heroes (very rare, takes many gacha pulls or Legendary Selectors)
   - Awaken favorite heroes to max (5 awakenings = level 150 cap)
   - Build multiple optimized party comps for different content
   - Experiment with meme builds (e.g., "All 1★ hero team with synergy Soulware")

4. **Cosmetic Collection (60–150+ Hours):**
   - Collect all desktop wallpapers
   - Unlock all hero skins
   - Complete all Reputation factions to max (10,000 Rep each)
   - Win Lottery Jackpot (unlikely but possible)
   - Collect all Debug Console cosmetics

5. **Admin Mode Experimentation (80+ Hours):**
   - Unlock Registry Editor Admin Mode (3+ prestiges)
   - Tweak game balance for personal save (e.g., make game harder for challenge runs)
   - Speedrun prestige cycles with custom balance tweaks

**Pacing:**
- **Infinite scaling:** Farming Nodes have no cap (can push to wave 1000+)
- **Cosmetic goals:** Most late-game is cosmetic collection (skins, titles, wallpapers)
- **Self-directed:** Players set their own goals (speedrun prestiges, collect all heroes, etc.)

**Key Moment:**
- **"Aha" at 50+ hours:** Player realizes they can play ReincarnOS indefinitely. The prestige loop is satisfying, there's always a new cosmetic to chase, and the idle nature means they can leave it running forever.

---

## 5. Risks, Pitfalls & Mitigations

### Risk 1: Power Creep (Rarity Inflation)

**Problem:** Over time, new heroes/Soulware must be stronger to feel exciting, making old content trivial and old heroes obsolete.

**Mitigation:**
- **Horizontal Progression:** New heroes/Soulware offer different playstyles, not just higher stats
  - Example: New 4★ hero has unique mechanic (e.g., "Gains ATK when allies die") rather than just "10% more ATK than existing 4★ heroes"
- **Prestige Scaling:** Content difficulty scales with prestige level, so new power helps with higher-prestige content (not just trivializing early game)
- **Regular Balance Passes:** Buff underused heroes/Soulware instead of only adding stronger options
- **Cap on Awakening:** Limit awakenings to 5 (prevents infinite power scaling)

---

### Risk 2: Gacha Frustration (Bad Luck Streaks)

**Problem:** Players go 50+ pulls without a 4★ and feel cheated.

**Mitigation:**
- **Transparent Pity:** Pity counter always visible, players know exactly when they'll hit pity
- **Soft Pity at 70 Pulls:** Rates increase gradually, reducing "all-or-nothing" feeling at pull 90
- **Selector Tickets:** Duplicate system converts dupes into Selectors (eventually get the hero you want)
- **Store Heroes:** Every 4★ hero is eventually available for purchase via Reputation or Legendary Shards (gacha is faster, but store is guaranteed)
- **3★ Viability:** Lower-rarity heroes remain viable with Soulware synergies (less pressure to pull 5★)

---

### Risk 3: Dead Content (Loops Become Irrelevant)

**Problem:** As players progress, early dungeons, dispatches, or systems stop being useful.

**Mitigation:**
- **Prestige Resets:** Prestige resets progression, making early content relevant again (but faster due to bonuses)
- **Rotating Challenge Dungeons:** Challenge Dungeons rotate weekly, always offering new rewards
- **Boss Raid Rotation:** Weekly Boss Raids keep endgame players logging in
- **Mailbox Contracts Scale:** Mailbox contracts have "late game" versions that require high-level heroes
- **Registry Editor:** Late-game players can use Registry Editor to self-impose challenges (e.g., "Beat Story Node 20 with only 2★ heroes")

---

### Risk 4: Overly Strong Resource Sinks (Feels Mandatory)

**Problem:** Gambling or other sinks become the "optimal" strategy, making them feel required instead of optional.

**Mitigation:**
- **Cosmetic-Only Best Rewards:** Speculation Station's best rewards are cosmetics (titles, skins), not power
- **Transparent EV:** Show exact house edge and expected value (players understand it's a fun sink, not a strategy)
- **Daily Caps:** Limit how much you can gamble per day (prevents "I must gamble 1000 times to optimize")
- **Never Best-in-Slot:** No unique power items locked behind gambling (Epic Soulware from Mystery Boxes is always obtainable elsewhere)

---

### Risk 5: Idle Becomes Boring (No Active Engagement)

**Problem:** 70% idle sounds good on paper, but if idle is too passive, players disengage.

**Mitigation:**
- **Meaningful Check-Ins:** Every check-in has decisions (which dungeon to farm, which dispatch to send, which Soulware to equip)
- **Active Mini-Games:** Debug Console, Firewall Defense, Speculation Station offer 10% active engagement
- **Prestige Resets:** Prestige adds a sense of "restart with purpose" (not just infinite idle)
- **Events:** Monthly events create urgency and new goals (limited-time cosmetics, event-exclusive heroes)

---

### Risk 6: Prestige Feels Punishing (Losing Progress)

**Problem:** Players resist prestiging because they don't want to lose their heroes/items.

**Mitigation:**
- **Keep Cosmetics:** All cosmetics, titles, and desktop themes carry over
- **Keep Unlocks:** Apps, automation slots, and permanent bonuses carry over
- **Huge Bonuses:** Prestige bonuses make 2nd loop 2–3× faster (feels like cheating, in a good way)
- **Optional Content:** Prestige is required for Nodes 16–20 and some endgame content, but not required to "finish" the game (Node 15 is a satisfying endpoint)
- **Transparent Preview:** Show exactly what you'll keep and what you'll lose before confirming prestige

---

### Risk 7: Gacha is the Only Roster Expansion

**Problem:** Players feel forced to pull gacha to progress.

**Mitigation:**
- **Store Heroes:** Every 4★ hero is eventually available for purchase (gold, Legendary Shards, or Reputation)
- **Mailbox Rewards:** Some Mailbox contracts reward hero unlock tickets
- **Event Heroes:** Events grant exclusive heroes without gacha (complete event challenges)
- **Starter Generosity:** Beginner Banner gives guaranteed 4★, and early Story Nodes give several 3★ heroes

---

### Risk 8: Inventory Bloat (Too Many Items)

**Problem:** Loot Downloads app overflows with junk Soulware, feels overwhelming.

**Mitigation:**
- **Auto-Recycle Rules:** Task Scheduler can auto-recycle Common items or duplicates
- **Recycle in Bulk:** Recycle Shrine has "Recycle All Commons" button
- **Sort/Filter UI:** Loot Downloads has robust filters (by rarity, by type, by equipped status)
- **Stacking Duplicates:** Identical Soulware items stack (e.g., "Crit Driver v2.0 ×3")

---

### Risk 9: Complexity Overwhelms New Players

**Problem:** 7 systems + automation + prestige is a lot to learn.

**Mitigation:**
- **Gradual Unlocks:** Story Nodes unlock one app at a time (Quest Explorer → Loot Downloads → Mailbox → Recycle Shrine → Store → Sigils → Task Scheduler)
- **Tooltips Everywhere:** Every system has "?" tooltips explaining mechanics
- **Optional Systems:** Speculation Station, Debug Console, Firewall Defense are 100% optional (core loop works without them)
- **Tutorial Contracts:** Early Mailbox contracts are tutorial-style (e.g., "Equip your first Soulware item" → rewards XP Patch)

---

### Risk 10: Long-Term Retention (Players Run Out of Goals)

**Problem:** After 100+ hours, players have done everything and quit.

**Mitigation:**
- **Infinite Farming Nodes:** No cap on wave progression (always a new record to chase)
- **Weekly Boss Raids:** New raid every week keeps endgame players engaged
- **Rotating Challenge Dungeons:** New challenges weekly
- **Monthly Events:** New cosmetics, heroes, and event-exclusive Soulware
- **Seasonal Leaderboards (Future):** Compete for fastest prestige speed, highest wave reached, etc.
- **User-Generated Content (Future):** Registry Editor could allow sharing custom balance mods or challenge runs

---

## 6. Implementation Hooks for Dev LLM

This section provides data structures and entity definitions for a coding-focused LLM to implement the systems.

---

### 6.1 Hero System

**Core Entity: `Hero`**

```javascript
// src/state/config.js or src/state/heroes.js

const Hero = {
  id: "string",               // Unique identifier (e.g., "firewall_knight_ignis")
  name: "string",             // Display name (e.g., "Firewall Knight Ignis")
  rarity: "number",           // 1–5 (1★ to 5★)
  role: "string",             // "Tank", "DPS", "Healer", "Support"
  level: "number",            // Current level (1–150)
  xp: "number",               // Current XP
  xpToNextLevel: "number",    // XP required for next level

  // Base stats (at level 1)
  baseStats: {
    hp: "number",
    atk: "number",
    def: "number",
    spd: "number",
    lck: "number"
  },

  // Growth rates (per level)
  growthRates: {
    hp: "number",
    atk: "number",
    def: "number",
    spd: "number",
    lck: "number"
  },

  // Computed current stats (base + level × growth)
  currentStats: {
    hp: "number",
    atk: "number",
    def: "number",
    spd: "number",
    lck: "number"
  },

  // Abilities
  abilities: [
    {
      id: "string",           // e.g., "taunt"
      name: "string",         // e.g., "Taunt"
      description: "string",  // e.g., "Force all enemies to attack this hero for 2 turns"
      unlockLevel: "number",  // e.g., 1
      cooldown: "number"      // e.g., 3 turns
    }
  ],

  // Equipment slots
  equipment: {
    weapon: "SoulwareItem | null",
    armor: "SoulwareItem | null",
    accessory: "SoulwareItem | null"
  },

  // Awakening
  awakenings: "number",       // 0–5 (each awakening raises level cap by 10)

  // Dispatch status
  dispatchStatus: {
    onDispatch: "boolean",    // Is hero currently on a dispatch?
    dispatchId: "string | null" // ID of current dispatch mission
  }
};
```

**Key Config Tables:**

```javascript
// src/state/config.js

export const HERO_CONFIG = {
  // XP curve formula: XP required for level N → N+1
  xpCurve: {
    // Level 1–20: 100 × level
    early: (level) => 100 * level,
    // Level 21–50: 150 × level
    mid: (level) => 150 * level,
    // Level 51–100: 200 × level × (1 + level/100)
    late: (level) => Math.floor(200 * level * (1 + level / 100))
  },

  // Rarity growth multipliers
  rarityMultipliers: {
    1: 0.8,  // Common
    2: 0.9,  // Uncommon
    3: 1.0,  // Rare
    4: 1.2,  // Epic
    5: 1.5   // Legendary
  },

  // Level breakpoints (unlocks)
  levelUnlocks: {
    10: "passiveSlot1",
    20: "abilitySlot2",
    25: "dispatchTier2",
    30: "passiveSlot2",
    50: "dispatchTier3",
    75: "ultimateAbility",
    100: "finalPassive"
  },

  // Awakening rules
  awakening: {
    maxAwakenings: 5,
    levelCapIncreasePerAwakening: 10,
    statBonusPerAwakening: 0.1  // +10% stats per awakening
  }
};

// Example hero definitions
export const HERO_TEMPLATES = [
  {
    id: "firewall_knight_ignis",
    name: "Firewall Knight Ignis",
    rarity: 4,
    role: "Tank",
    baseStats: { hp: 120, atk: 8, def: 18, spd: 5, lck: 2 },
    growthRates: { hp: 15, atk: 3, def: 8, spd: 2, lck: 1 },
    abilities: [
      { id: "taunt", name: "Taunt", description: "Force all enemies to attack this hero for 2 turns", unlockLevel: 1, cooldown: 3 },
      { id: "shield_bash", name: "Shield Bash", description: "Deal damage and stun target for 1 turn", unlockLevel: 20, cooldown: 4 },
      { id: "ultimate_fortress", name: "Ultimate: Fortress", description: "Become invincible for 3 turns", unlockLevel: 75, cooldown: 10 }
    ]
  },
  // ... more hero templates
];
```

---

### 6.2 Gacha System

**Core Entity: `GachaBanner`**

```javascript
const GachaBanner = {
  id: "string",               // e.g., "standard_banner"
  name: "string",             // e.g., "Standard Soul Summon"
  type: "string",             // "standard", "rateUp", "beginner", "event"

  // Pull costs
  singlePullCost: "number",   // e.g., 10 Soul Cores
  tenPullCost: "number",      // e.g., 100 Soul Cores

  // Rarity rates
  rarityRates: {
    1: "number",              // e.g., 0.50 (50%)
    2: "number",              // e.g., 0.30 (30%)
    3: "number",              // e.g., 0.15 (15%)
    4: "number",              // e.g., 0.045 (4.5%)
    5: "number"               // e.g., 0.005 (0.5%)
  },

  // Pity settings
  pity: {
    hardPity: "number",       // e.g., 90 (guaranteed 4★+ at pull 90)
    softPityStart: "number",  // e.g., 70 (soft pity starts at pull 71)
    softPityIncrement: "number", // e.g., 0.01 (+1% per pull after 70)
    legendaryPity: "number"   // e.g., 180 (guaranteed 5★ at pull 180)
  },

  // Rate-up heroes (if type === "rateUp")
  rateUpHeroes: ["heroId1", "heroId2"],
  rateUpMultiplier: "number", // e.g., 2.0 (2× rate for rate-up heroes)

  // Available heroes pool
  heroPool: {
    1: ["heroId1", "heroId2"],
    2: ["heroId3", "heroId4"],
    3: ["heroId5", "heroId6"],
    4: ["heroId7", "heroId8"],
    5: ["heroId9", "heroId10"]
  },

  // Player's pity counter state
  playerPityCounter: "number", // Tracks pulls since last 4★+
  playerLegendaryCounter: "number" // Tracks pulls since last 5★
};
```

**Key Functions:**

```javascript
// Pull logic (conceptual)
function performGachaPull(banner, isTenPull = false) {
  const pulls = isTenPull ? 10 : 1;
  const results = [];

  for (let i = 0; i < pulls; i++) {
    banner.playerPityCounter++;
    banner.playerLegendaryCounter++;

    // Calculate effective rates (soft pity)
    let effectiveRates = { ...banner.rarityRates };
    if (banner.playerPityCounter > banner.pity.softPityStart) {
      const increase = (banner.playerPityCounter - banner.pity.softPityStart) * banner.pity.softPityIncrement;
      effectiveRates[4] += increase;
      effectiveRates[5] += increase / 2;
    }

    // Hard pity
    if (banner.playerPityCounter >= banner.pity.hardPity) {
      effectiveRates = { 4: 0.5, 5: 0.5 }; // Guaranteed 4★ or 5★
    }

    // Legendary pity
    if (banner.playerLegendaryCounter >= banner.pity.legendaryPity) {
      effectiveRates = { 5: 1.0 }; // Guaranteed 5★
    }

    // Roll rarity
    const rarity = rollRarity(effectiveRates);

    // Roll hero from pool
    const heroPool = banner.heroPool[rarity];
    const heroId = heroPool[Math.floor(Math.random() * heroPool.length)];

    results.push({ heroId, rarity });

    // Reset pity if 4★+
    if (rarity >= 4) {
      banner.playerPityCounter = 0;
    }
    if (rarity === 5) {
      banner.playerLegendaryCounter = 0;
    }
  }

  return results;
}
```

---

### 6.3 Soulware (Items/Boosters)

**Core Entity: `SoulwareItem`**

```javascript
const SoulwareItem = {
  id: "string",               // e.g., "crit_driver_v2"
  name: "string",             // e.g., "Crit Driver v2.0"
  rarity: "number",           // 1–5
  type: "string",             // "weapon", "armor", "accessory", "systemWide"

  // Stat bonuses (flat or percentage)
  statBonuses: {
    hp: "number | null",      // e.g., 50 (flat) or null
    hpPercent: "number | null", // e.g., 0.15 (15%) or null
    atk: "number | null",
    atkPercent: "number | null",
    def: "number | null",
    defPercent: "number | null",
    spd: "number | null",
    spdPercent: "number | null",
    lck: "number | null",
    lckPercent: "number | null"
  },

  // Special effects
  passiveEffect: {
    id: "string",             // e.g., "crit_boost"
    description: "string",    // e.g., "+10% crit rate"
    value: "number | object"  // e.g., 0.10 or { critRate: 0.10, critDmg: 0.25 }
  },

  // Conditional/synergy effects
  conditionalEffects: [
    {
      condition: "string",    // e.g., "partyHas2Tanks"
      effect: "object"        // e.g., { defPercent: 0.20 }
    }
  ],

  // Dungeon-specific modifiers
  dungeonModifiers: {
    bossRaid: "object | null",    // e.g., { damageVsBoss: 0.50 }
    challenge: "object | null",
    farming: "object | null"
  },

  // Acquisition metadata
  source: "string",           // e.g., "dungeon_drop", "store", "craft", "prestige"
  dropLocations: ["string"]   // e.g., ["tier2_farming_node", "boss_raid_1"]
};
```

**Example Soulware Items:**

```javascript
export const SOULWARE_TEMPLATES = [
  {
    id: "crit_driver_v2",
    name: "Crit Driver v2.0",
    rarity: 3,
    type: "weapon",
    statBonuses: { atkPercent: 0.15 },
    passiveEffect: { id: "crit_boost", description: "+10% crit rate", value: { critRate: 0.10 } },
    conditionalEffects: [],
    dungeonModifiers: {},
    source: "dungeon_drop",
    dropLocations: ["tier2_farming_node_items"]
  },
  {
    id: "low_rarity_amplifier",
    name: "Low-Rarity Amplifier",
    rarity: 4,
    type: "systemWide",
    statBonuses: {},
    passiveEffect: { id: "low_rarity_boost", description: "All heroes 3★ or lower gain +30% stats", value: 0.30 },
    conditionalEffects: [
      { condition: "heroRarity <= 3", effect: { allStatsPercent: 0.30 } }
    ],
    dungeonModifiers: {},
    source: "store",
    dropLocations: []
  },
  {
    id: "admin_legacy_kernel",
    name: "Admin's Legacy Kernel",
    rarity: 5,
    type: "systemWide",
    statBonuses: { hpPercent: 0.30, atkPercent: 0.20 },
    passiveEffect: {
      id: "root_access",
      description: "Once per dungeon, if party would be defeated, restore 50% HP to all heroes and gain +50% damage for 30s",
      value: { reviveOnce: true, hpRestore: 0.50, damageBoost: 0.50, boostDuration: 30 }
    },
    conditionalEffects: [],
    dungeonModifiers: {},
    source: "prestige",
    dropLocations: []
  }
];
```

---

### 6.4 Dungeon System

**Core Entity: `DungeonTemplate`**

```javascript
const DungeonTemplate = {
  id: "string",               // e.g., "story_node_1"
  name: "string",             // e.g., "Startup Errors"
  type: "string",             // "story", "farming", "challenge", "bossRaid", "event"

  // Structure
  waves: "number",            // e.g., 10 (story), Infinity (farming), 20 (challenge)

  // Difficulty scaling
  baseEnemyLevel: "number",   // e.g., 5 (recommended party level)
  enemyLevelPerWave: "number", // e.g., 0.5 (enemies gain 0.5 levels per wave)

  // Enemy composition (per wave)
  enemyComposition: [
    {
      enemyId: "string",      // e.g., "corrupt_process_1"
      count: "number",        // e.g., 3
      waveRange: "object"     // e.g., { min: 1, max: 5 } (appears waves 1–5)
    }
  ],

  // Rewards
  rewards: {
    goldPerWave: "number",    // e.g., 10
    xpPerWave: "number",      // e.g., 50
    itemDropRate: "number",   // e.g., 0.10 (10% per wave)
    itemDropTable: [
      { itemId: "string", weight: "number" } // e.g., { itemId: "crit_driver_v2", weight: 5 }
    ],
    firstClearRewards: {
      soulCores: "number",
      guaranteedItem: "string | null",
      unlocks: ["string"]     // e.g., ["mailbox_app"]
    }
  },

  // Modifiers (for Challenge Dungeons)
  modifiers: [
    {
      id: "string",           // e.g., "no_healing"
      name: "string",         // e.g., "No Healing Allowed"
      description: "string",  // e.g., "Party cannot heal HP during combat"
      effect: "object"        // e.g., { disableHealing: true }
    }
  ],

  // Unlock requirements
  unlockRequirements: {
    minStoryNodeCleared: "number | null",
    minPrestigeLevel: "number | null",
    minHeroLevel: "number | null"
  }
};
```

**Example Dungeon Templates:**

```javascript
export const DUNGEON_TEMPLATES = [
  {
    id: "story_node_1",
    name: "Startup Errors",
    type: "story",
    waves: 10,
    baseEnemyLevel: 1,
    enemyLevelPerWave: 0.2,
    enemyComposition: [
      { enemyId: "corrupt_process_basic", count: 2, waveRange: { min: 1, max: 10 } }
    ],
    rewards: {
      goldPerWave: 5,
      xpPerWave: 20,
      itemDropRate: 0.05,
      itemDropTable: [{ itemId: "common_weapon_1", weight: 10 }],
      firstClearRewards: { soulCores: 50, guaranteedItem: "uncommon_weapon_1", unlocks: ["loot_downloads_app"] }
    },
    modifiers: [],
    unlockRequirements: { minStoryNodeCleared: null, minPrestigeLevel: null, minHeroLevel: null }
  },

  {
    id: "farming_node_gold",
    name: "Crypto Mining Cluster",
    type: "farming",
    waves: Infinity,
    baseEnemyLevel: 10,
    enemyLevelPerWave: 0.5,
    enemyComposition: [
      { enemyId: "gold_hoarding_bot", count: 3, waveRange: { min: 1, max: Infinity } }
    ],
    rewards: {
      goldPerWave: 20,  // 2× normal
      xpPerWave: 10,    // 0.5× normal
      itemDropRate: 0.02, // 0.5× normal
      itemDropTable: [{ itemId: "common_weapon_1", weight: 10 }],
      firstClearRewards: null
    },
    modifiers: [],
    unlockRequirements: { minStoryNodeCleared: 3, minPrestigeLevel: null, minHeroLevel: null }
  },

  {
    id: "challenge_no_healing",
    name: "No-Heal Firewall",
    type: "challenge",
    waves: 20,
    baseEnemyLevel: 40,
    enemyLevelPerWave: 1,
    enemyComposition: [
      { enemyId: "firewall_enforcer", count: 2, waveRange: { min: 1, max: 20 } }
    ],
    rewards: {
      goldPerWave: 30,
      xpPerWave: 100,
      itemDropRate: 0.30,
      itemDropTable: [{ itemId: "epic_weapon_1", weight: 5 }, { itemId: "rare_weapon_1", weight: 10 }],
      firstClearRewards: { soulCores: 100, guaranteedItem: "epic_weapon_challenge_1", unlocks: [] }
    },
    modifiers: [
      { id: "no_healing", name: "No Healing Allowed", description: "Party cannot heal HP during combat", effect: { disableHealing: true } }
    ],
    unlockRequirements: { minStoryNodeCleared: 10, minPrestigeLevel: null, minHeroLevel: 40 }
  }
];
```

---

### 6.5 AFK Dispatch System

**Core Entity: `DispatchMission`**

```javascript
const DispatchMission = {
  id: "string",               // e.g., "memory_leak_patrol"
  name: "string",             // e.g., "Memory Leak Patrol"
  tier: "number",             // 1–4

  // Requirements
  duration: "number",         // Duration in milliseconds (e.g., 3600000 = 1 hour)
  requiredHeroes: "number",   // e.g., 1 (min 1 hero)
  requiredLevel: "number",    // e.g., 5 (recommended hero level)
  roleRequirements: [         // e.g., [{ role: "Tank", count: 1 }]
    { role: "string", count: "number" }
  ],

  // Success rate calculation
  successRateFormula: "function", // (heroStats) => number (0–1)

  // Rewards
  rewards: {
    onSuccess: {
      gold: "number",
      xp: "number",
      items: [{ itemId: "string", dropRate: "number" }],
      currencies: { soulCores: "number", memoryFragments: "number" }
    },
    onPartialSuccess: {
      gold: "number",         // 50% of success
      xp: "number",
      items: [],
      currencies: {}
    },
    onFailure: {
      gold: "number",         // 10% of success
      xp: "number",
      items: [],
      currencies: {}
    }
  },

  // Failure penalty
  failurePenalty: {
    fatigue: "boolean",       // Apply fatigue debuff?
    fatigueDebuff: "object"   // e.g., { statsMultiplier: 0.8, duration: 3600000 }
  }
};
```

**Example Dispatch Missions:**

```javascript
export const DISPATCH_MISSIONS = [
  {
    id: "memory_leak_patrol",
    name: "Memory Leak Patrol",
    tier: 1,
    duration: 3600000, // 1 hour
    requiredHeroes: 1,
    requiredLevel: 5,
    roleRequirements: [],
    successRateFormula: (heroStats) => {
      const avgLevel = heroStats.reduce((sum, h) => sum + h.level, 0) / heroStats.length;
      return Math.min(0.95, Math.max(0.10, (avgLevel / 10) * 1.0));
    },
    rewards: {
      onSuccess: { gold: 100, xp: 200, items: [{ itemId: "common_weapon_1", dropRate: 0.10 }], currencies: {} },
      onPartialSuccess: { gold: 50, xp: 100, items: [], currencies: {} },
      onFailure: { gold: 10, xp: 20, items: [], currencies: {} }
    },
    failurePenalty: { fatigue: true, fatigueDebuff: { statsMultiplier: 0.8, duration: 3600000 } }
  },

  {
    id: "admin_vault_retrieval",
    name: "Admin Vault Retrieval",
    tier: 4,
    duration: 43200000, // 12 hours
    requiredHeroes: 4,
    requiredLevel: 80,
    roleRequirements: [{ role: "Tank", count: 1 }, { role: "Healer", count: 1 }],
    successRateFormula: (heroStats) => {
      const avgLevel = heroStats.reduce((sum, h) => sum + h.level, 0) / heroStats.length;
      const hasRequiredRoles = true; // Check role requirements
      return hasRequiredRoles ? Math.min(0.95, (avgLevel / 100) * 0.60) : 0.10;
    },
    rewards: {
      onSuccess: {
        gold: 0,
        xp: 5000,
        items: [{ itemId: "epic_weapon_1", dropRate: 1.0 }],
        currencies: { soulCores: 50, legendaryShards: 100 }
      },
      onPartialSuccess: { gold: 0, xp: 2500, items: [], currencies: { soulCores: 25 } },
      onFailure: { gold: 0, xp: 500, items: [], currencies: {} }
    },
    failurePenalty: { fatigue: true, fatigueDebuff: { statsMultiplier: 0.7, duration: 7200000 } }
  }
];
```

---

### 6.6 Mailbox Contracts

**Core Entity: `MailboxContract`**

```javascript
const MailboxContract = {
  id: "string",               // e.g., "spam_filter_emergency"
  sender: "string",           // e.g., "Firewall Guild"
  subject: "string",          // e.g., "URGENT: Spam Cleanup Needed"
  flavorText: "string",       // e.g., "Our spam filters are overwhelmed..."

  // Requirements
  requirements: {
    type: "string",           // "dispatch", "dungeonClear", "recycle", "gacha"
    details: "object"         // e.g., { dispatchDuration: 7200000, minHeroes: 2 }
  },

  // Rewards
  rewards: {
    gold: "number",
    xp: "number",
    soulCores: "number",
    reputation: { faction: "string", amount: "number" }
  },

  // Availability
  refreshType: "string",      // "daily", "weekly", "oneTime"
  unlockRequirement: "number | null" // e.g., minStoryNodeCleared: 5
};
```

**Example Contracts:**

```javascript
export const MAILBOX_CONTRACTS = [
  {
    id: "spam_filter_emergency",
    sender: "Firewall Guild",
    subject: "URGENT: Spam Cleanup Needed",
    flavorText: "Our spam filters are overwhelmed. Send a cleanup crew to purge the inbox before the malware spreads.",
    requirements: { type: "dispatch", details: { dispatchDuration: 7200000, minHeroes: 2 } },
    rewards: { gold: 200, xp: 0, soulCores: 0, reputation: { faction: "firewall_guild", amount: 50 } },
    refreshType: "daily",
    unlockRequirement: 5
  },

  {
    id: "boss_bounty_kernel_panic",
    sender: "Admin Council",
    subject: "BOUNTY: Eliminate Kernel Panic Entity",
    flavorText: "The Kernel Panic Lord threatens system stability. Authorized admins: terminate with extreme prejudice.",
    requirements: { type: "dungeonClear", details: { dungeonId: "boss_raid_kernel_panic" } },
    rewards: { gold: 0, xp: 0, soulCores: 0, reputation: { faction: "admin_council", amount: 200 }, currencies: { legendaryShards: 100 }, items: ["epic_soulware_selector"] },
    refreshType: "weekly",
    unlockRequirement: 10
  }
];
```

---

### 6.7 Speculation Station (Gambling)

**Core Entity: `GamblingGame`**

```javascript
const GamblingGame = {
  id: "string",               // e.g., "soul_slots"
  name: "string",             // e.g., "Soul Slots"
  type: "string",             // "slots", "highLow", "lottery", "mysteryBox"

  // Currency
  currency: "string",         // e.g., "gold", "memoryFragments", "eventTokens"

  // Bet limits
  minBet: "number",
  maxBet: "number",
  dailyLimit: "number",       // Max plays per day

  // House edge
  houseEdge: "number",        // e.g., 0.10 (10% house edge, EV = 90%)

  // Payout table (specific to game type)
  payoutTable: [
    { condition: "string", multiplier: "number", probability: "number" }
  ],

  // Special rewards
  jackpotRewards: [
    { reward: "string", triggerCondition: "string" }
  ]
};
```

**Example Gambling Games:**

```javascript
export const GAMBLING_GAMES = [
  {
    id: "soul_slots",
    name: "Soul Slots",
    type: "slots",
    currency: "gold",
    minBet: 100,
    maxBet: 2000,
    dailyLimit: 50,
    houseEdge: 0.10,
    payoutTable: [
      { condition: "3x Common", multiplier: 1.0, probability: 0.125 },
      { condition: "3x Uncommon", multiplier: 3.0, probability: 0.027 },
      { condition: "3x Rare", multiplier: 10.0, probability: 0.003 },
      { condition: "3x Epic", multiplier: 30.0, probability: 0.00006 },
      { condition: "3x Legendary", multiplier: 75.0, probability: 0.000001 }
    ],
    jackpotRewards: [
      { reward: "cosmetic_wallpaper_jackpot", triggerCondition: "3x Legendary" }
    ]
  },

  {
    id: "high_low_cards",
    name: "High/Low Card Game",
    type: "highLow",
    currency: "memoryFragments",
    minBet: 50,
    maxBet: 500,
    dailyLimit: 20,
    houseEdge: 0.05,
    payoutTable: [
      { condition: "Correct guess (1 chain)", multiplier: 2.0, probability: 0.50 },
      { condition: "Correct guess (2 chain)", multiplier: 4.0, probability: 0.25 },
      { condition: "Correct guess (3 chain)", multiplier: 8.0, probability: 0.125 },
      { condition: "Correct guess (4 chain)", multiplier: 16.0, probability: 0.0625 }
    ],
    jackpotRewards: [
      { reward: "cosmetic_card_back_rare", triggerCondition: "5+ chain" }
    ]
  }
];
```

---

### 6.8 System Sigils (Prestige)

**Core Entity: `PrestigeBonus`**

```javascript
const PrestigeBonus = {
  id: "string",               // e.g., "gold_bonus_1"
  name: "string",             // e.g., "Gold Multiplier I"
  description: "string",      // e.g., "+20% gold gain from all sources"

  // Cost
  cost: {
    prestigePoints: "number"  // e.g., 10 (earned per prestige)
  },

  // Effect
  effect: {
    type: "string",           // e.g., "goldMultiplier", "xpMultiplier", "unlockSlot"
    value: "number | string"  // e.g., 0.20 (20%) or "automationSlot"
  },

  // Unlock requirement
  unlockRequirement: {
    minPrestigeCount: "number" // e.g., 1 (unlocks after 1st prestige)
  },

  // Stackable?
  stackable: "boolean",       // Can you buy this bonus multiple times?
  maxStacks: "number | null"  // e.g., 5 (max 5× stacks)
};
```

**Example Prestige Bonuses:**

```javascript
export const PRESTIGE_BONUSES = [
  {
    id: "gold_bonus_1",
    name: "Gold Multiplier I",
    description: "+20% gold gain from all sources",
    cost: { prestigePoints: 10 },
    effect: { type: "goldMultiplier", value: 0.20 },
    unlockRequirement: { minPrestigeCount: 1 },
    stackable: true,
    maxStacks: 5
  },

  {
    id: "automation_slot_unlock",
    name: "Automation Slot Unlock",
    description: "Unlock +1 Task Scheduler automation slot",
    cost: { prestigePoints: 15 },
    effect: { type: "unlockSlot", value: "automationSlot" },
    unlockRequirement: { minPrestigeCount: 1 },
    stackable: true,
    maxStacks: 5
  },

  {
    id: "legendary_starter_kit",
    name: "Admin's Starter Kit",
    description: "Start each prestige with 3 Epic Soulware items",
    cost: { prestigePoints: 50 },
    effect: { type: "starterKit", value: ["epic_weapon_1", "epic_armor_1", "epic_accessory_1"] },
    unlockRequirement: { minPrestigeCount: 3 },
    stackable: false,
    maxStacks: null
  }
];
```

---

## Summary

This design document provides a complete, interconnected system design for ReincarnOS. All systems reinforce the OS metaphor, support the 70/20/10 engagement model (idle/management/active), and create meaningful long-term progression without predatory monetization.

**Next Steps for Dev LLM:**
1. Implement core data structures in `src/state/` (Hero, Soulware, Dungeon, Dispatch, Mailbox, Gacha, Gambling, Prestige)
2. Wire UI apps in `src/os/apps/` to read from and mutate these structures
3. Build game loop logic (dungeon combat, dispatch timers, gacha pulls, prestige resets)
4. Add save/load to localStorage
5. Tune balance constants in `src/state/config.js`

**Design Philosophy Reminder:**
- **Simple core, deep optimization** – The core loop is idle dungeon runs + check-ins. Depth comes from roster building, Soulware synergies, and resource routing.
- **Interconnected systems** – Every system feeds into others (dungeons → items → hero builds → harder dungeons → prestige → repeat).
- **Non-predatory F2P** – Generous gacha income, transparent odds, no FOMO pressure, cosmetic-focused sinks.
- **OS metaphor always** – Every feature is an app. Every mechanic has an OS-flavored name.

---

**End of Game Systems Design Document**
