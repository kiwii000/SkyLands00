# SkyLands Foundation v1 (Vertical Slice)

Top-down 2D pixel-art cozy sci-fi farming/life game foundation built with **Phaser 3 + Vite + JavaScript**.

## Quickstart
1. `npm install`
2. `npm run dev`
3. Open the local Vite URL shown in terminal.

## Controls
- **Arrow Keys**: Move
- **1..7**: Select hotbar slot
- **E**: Interact / use equipped item / talk / shop / sleep
- **F**: Fire blaster (mine only)
- **P**: Save game
- **K**: Load game
- **N** on title: New game
- **L** on title: Load game

## First 10 Minutes Guide
1. Start a new game (`N`) and customize suit/visor (`A/D`, `W/S`, `R`, `Enter`).
2. Walk in the **Starter Ship** and press `E` near bed to test sleep/day rollover.
3. Exit to **Station Hub** and visit both shops:
   - Supply Kiosk (opens 08:00, closes 18:00)
   - Medbay Cafe (opens 10:00, closes 20:00)
4. Use left transition to **Hydro Farm**:
   - Slot with Hoe: till
   - Seed slot: plant turnip or glow bean
   - Water Can: water crop
   - Sleep to next day and harvest.
5. Use right transition to **Ore Mine**:
   - Equip blaster slot and press `F` near enemy drone.
   - Defeat drone and collect loot.
6. Press `P` to save and `K` to load to verify continuity.

## Foundation Scope Implemented
- Authoritative time/day/weekday system and pass-out handling.
- 3 NPCs with schedule blocks across maps and behavior modes.
- 2 shops with open/close windows and closed feedback.
- Farming loop for 2 crop types (till/plant/water/overnight/harvest).
- Inventory + hotbar + HUD + prompts.
- Buy and ship-sell economy with next-day settlement.
- Combat baseline with one weapon and one enemy + loot.
- Character customization + randomize + persistence.
- Save/load baseline for required state continuity.

## Implemented Now vs Deferred Next
### Implemented now
- Single stable day-loop vertical slice.
- Handcrafted station hub + farm + mine + ship interior with transitions.
- Data-driven config in `src/data` and systems split in `src/systems`.

### Deferred next (explicitly not in Foundation v1)
- Creature taming/breeding/hybrid pipelines.
- Deep ecology simulation and advanced genetics archive.
- Multi-ship ownership progression depth.
- Co-op/networking.

## Next 8 Expansion Prompts
1. Add tilemap art pass with collision layers while preserving current systems contracts.
2. Expand combat with 2 additional enemy archetypes and telegraphed attacks.
3. Add quest board tied to NPC schedule/time windows.
4. Introduce crafting station with ore-to-tool upgrades.
5. Add weather and station event modifiers affecting crop growth and shop demand.
6. Implement richer dialogue trees with relationship points per NPC.
7. Add second farm deck with unlock progression and power-grid upkeep.
8. Add analytics/debug overlay for schedule state, save snapshot, and economy flow.
