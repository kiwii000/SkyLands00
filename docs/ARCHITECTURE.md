# Architecture Notes - Foundation v1

## Principles
- **Data-driven definitions**: Items, crops, NPC schedules, shops, and maps are in `src/data`.
- **Systems own state**: Time, inventory/economy, farming, NPC routines, combat, save/load are isolated under `src/systems`.
- **Scene orchestration only**: `GameScene` translates input into system calls and renders state.
- **Pixel-art rendering pass**: procedural pixel textures are generated once and reused for player/NPC/enemy/crops.

## Runtime Flow
1. `MenuScene` -> new/load.
2. `CharacterCreateScene` writes initial look data.
3. `GameScene` creates `GameState` aggregate systems and runs update loop.
4. Time ticks drive:
   - pass-out trigger
   - NPC schedule transitions
   - shop availability checks
5. Sleep/new-day runs settlement and overnight growth.
6. Save snapshot serializes all baseline state required by Foundation.

## Save Contract
Persisted:
- day/time/weekday
- player map/position/look
- inventory/hotbar/gold/shipping bin
- crop tile states
- NPC routine state projection
- combat/enemy state
- decor baseline
