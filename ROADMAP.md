# ARRC-Game — Roadmap & Design Backlog

A living to-do list and design scratchpad for getting **ARRC-Game** ready for public release.

---

## ✅ Completed
- **Cross-device & Mobile Fixes**
  - Dynamic viewport (`100dvh`, `visualViewport` sync, safe-area insets) and bus lane centered cleanly between gate and screen bottom (Samsung Flip 4 / A80 / mobile browsers).
  - Nearest-bin drag-and-drop resolver, dedicated top `dragLayer`, enlarged touch grab zones, live cyan drop-target highlight, pull-to-refresh lock, and mid-drag protection.
  - Non-overlapping responsive layout across 16 tested portrait/landscape device configs.
- **Quick Polish Pass**
  - Disabled holding `Space` to auto-spam the gate (`e.repeat` guard).
  - Added Auto-Sort pause/resume toggle inside Conveyor upgrades (while keeping the quick toggle on the queue) + floating `🤖 +1 <Type>` feedback.
  - Wider PC modals flush with the sky horizon line (`splitY`).
  - Hold-on-bin opens that specific bin's settings/upgrades.
  - Arcade Mode polish (no passing buses, real game sky/ground/decorations background, real animated bin sprites, toggleable rubbish circle backgrounds defaulting OFF, wall-clock timers that don't pause on tab-out, progressive Dumpster Fire speed ramp).
  - Fixed boot-time `Cannot set properties of undefined (setting 'width')` refresh error.
- **PC / Widescreen Visual Polish**
  - Added smooth proportional `desktopScale` (up to `1.5x` on 1080p+ monitors) scaling up **bins, people (gate & shop queues), Store & Factory buildings, rubbish items, conveyor queue + industrial conveyor belt track, gate, bus, HUD, XP bar, nav buttons, toolbar, and Arcade mode** while keeping mobile layouts untouched.

---

## 🧭 1. Progression, Levels & Skill Tree *(Needs Design Lock-In)*
- **Cleaner Upgrade Visibility (No Wall of "Need Prev Upgrade")**
  - Only show `[ Need prev upgrade ]` for the **immediate next** locked tier; hide deeper tiers or mask them as subtle mystery/grey placeholder cards.
  - Keep level-gated milestones visible below current-level upgrades (e.g., *"Reach Level 2 to unlock"*) to pace discovery and give players clear short-term goals.
- **Clearer Currency Roles**
  - **Money → Money loop:** Gate upgrades (gate fee, foot traffic, etc.) cost cash so early money has an immediate sink.
  - **Tokens → Token/Sorting loop:** Conveyor & bin upgrades (double-token chance, colored backgrounds, capacity/yield) cost tokens so early tokens have an immediate purpose.
- **Paced Level-by-Level Onboarding (Draft Idea)**
  - **Level 1:** Learn the core loop — Gate, Conveyor, Sorting. Simple early sinks for cash (e.g., Gate Fee) and tokens.
  - **Level 2 (First Skill Point!):** Unlock the **Skill Tree** & introduce automation/QoL upgrades (e.g., spend 1 SP to unlock **Auto-Gate**, which then opens its upgrade track in Upgrades; introduce colored rubbish backgrounds, double-token chance).
- **Making Skill Points Meaningful & Fixing the SP / Factory Disconnect**
  - Currently SP unlocks `unlockedRecipes` while the Factory checks `binUpgrades`. Unify this into a clear **Skill Tree** where SP unlocks major milestones/systems (e.g., Auto-Gate, Store, Factory, new branches) rather than feeling redundant.
  - Decide progression order between **Store** and **Factory**:
    - *Option A:* Unlock **Store** early (with 1–2 tokens of each variety or 1 SP) to sell raw tokens first, then unlock **Factory** to craft higher-value items.
    - *Option B:* Unlock **Factory** first (use crafted items for missions/decorating), then unlock **Store** to sell crafted goods.
    - *Option C:* Let players choose Store vs. Factory branch via the Skill Tree.
- **Guided Quest Chain (Organic Progression & Tutorial)**
  - Replace/unify onboarding with lightweight sequential **Quests** that naturally guide players through each mechanic as it unlocks:
    - *Level 1:* Accept 5 customers' rubbish → Sort 5 pieces of rubbish → Buy Gate Fee upgrade (introduces Upgrades).
    - *Level 2:* Open the Skill Tree & buy your first skill.
    - *Mid-Game / World Transformation:* Craft items like **Organic Fertilizer** and use them on the dirt to grow the **Grass Lawn** (connecting the **Decor** system directly to **Crafting** rather than only raw tokens!).
- **Circular Economy Endgame & Prestige ("Upgrading to a New Tip")**
  - Core circular economy loop: **Rubbish → Sort → Manufacture → Sell → Rubbish**.
  - **Prestige = Upgrading to a New Tip / Recovery Facility:** Graduating from a small dirt tip to progressively bigger/better recovery centres, resetting the run in exchange for permanent prestige bonuses/multipliers and higher-tier progression.

---

## 🏭 2. Crafting & Store Mechanics (Shop Titans–Inspired)
- **Top-Half "Interior" Views for Store & Factory**
  - Clicking **Store** or **Factory** opens that building's interior view in the **top half of the screen** (the same sky-box region used by Upgrades), keeping the bottom sorting loop live and playable underneath.
  - **Outside on the meadow:** Customers queue outside the Store with animated **thinking bubbles (`•` → `••` → `•••`)**, and the Store displays a **`!` badge** when customers inside are ready to buy — keeping the main screen clean and uncluttered.
  - **Inside the Store view:** Customers request single or multiple items from what you've chosen to sell; clicking a customer opens an above-head **Accept / Decline** popup, and you can select which tokens/crafted goods are stocked for sale.
- **Real-Time Crafting "Cook" Timers**
  - Replace the flat 1-second craft with real per-recipe cook times (e.g., early items `10s → 6s` upgraded; late-game items `5m → 3m` upgraded), ticking accurately in real time even when tabbed out.
- **Per-Item Upgrades & Mastery XP**
  - Each craftable item earns its own crafting XP and levels up (Shop Titans style) — unlocking reduced craft times, cheaper token costs, or higher sell value.
- **Crafting ↔ Decor Integration**
  - Crafted items can be used not only for Store sales/quests, but also to transform the tip itself (e.g., using crafted Fertilizer on the dirt to grow grass, and similar crafted upgrades for bushes/decor).

---

## ✨ 3. Quality of Life & UI Polish
- **AFK / Post-Arcade Summary Toast**
  - When returning from another tab or exiting an Arcade mini-game, show a subtle, non-blocking fade-up summary near the wallet (`+$X`, `+Y Glass`, `+Z Green`, etc.) with no click required to dismiss.
- **Upgrade Mode — Live World Highlighting & Quick-Switch Badges**
  - Clicking **Upgrades** opens the top-half upgrades menu as normal while keeping the bottom sorting area playable.
  - The object matching the currently open sidebar tab (e.g., **Gate**, **Conveyor**, **Bins**, or a specific bin) gets a clear highlight/circle in the bottom half, updating live as you switch tabs in the sidebar.
  - Other upgradeable world objects show small, non-blocking upgrade buttons (`⬆️`) beside them (instead of hijacking the whole object's tap/sort area) so you can still tap/drag to sort while the Upgrades menu is open, or tap an `⬆️` button to jump straight to that object's upgrades.

---

## 💾 4. Save System *(Do Last — Once Data Model Is Finalized)*
- Multiple **Save Slots** (`localStorage` + versioned schema) so players can save progress and start fresh runs without losing existing saves.
- Auto-save + manual slot management (Create / Load / Delete / New Game).

