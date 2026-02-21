import { TimeSystem } from './timeSystem';
import { InventorySystem } from './inventorySystem';
import { FarmingSystem } from './farmingSystem';
import { NpcSystem } from './npcSystem';
import { CombatSystem } from './combatSystem';
import { ITEMS } from '../data/items';

export class GameState {
  constructor() {
    this.time = new TimeSystem();
    this.inventory = new InventorySystem();
    this.farming = new FarmingSystem();
    this.npcs = new NpcSystem();
    this.combat = new CombatSystem();
    this.player = { map: 'ship', x: 300, y: 260, look: { suit: 0x6ef2ff, visor: 0xffffff } };
    this.selectedSlot = 0;
    this.decor = [{ map: 'ship', x: 350, y: 130, type: 'seedCache' }];
    this.lastSettlement = 0;
    this.flags = { openedSeedCache: false };
  }

  settleNewDay() {
    const prices = Object.fromEntries(Object.values(ITEMS).map((item) => [item.id, item.sellPrice || 0]));
    this.lastSettlement = this.inventory.settleShipping(prices);
    this.farming.overnightGrowth(this.time.day);
    this.combat.resetDaily();
  }

  toJSON() {
    return {
      time: this.time.getState(),
      player: this.player,
      inventory: this.inventory.toJSON(),
      farming: this.farming.toJSON(),
      npcState: this.npcs.getState(),
      combat: this.combat.toJSON(),
      decor: this.decor,
      selectedSlot: this.selectedSlot,
      lastSettlement: this.lastSettlement,
      flags: this.flags
    };
  }

  fromJSON(state) {
    this.time.setState(state.time);
    this.player = state.player;
    this.inventory.fromJSON(state.inventory);
    this.farming.fromJSON(state.farming);
    this.combat.fromJSON(state.combat);
    this.decor = state.decor || [];
    this.selectedSlot = state.selectedSlot || 0;
    this.lastSettlement = state.lastSettlement || 0;
    this.flags = state.flags || { openedSeedCache: false };
  }
}
