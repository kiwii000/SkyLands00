import { STARTER_HOTBAR } from '../data/items';

const INV_SIZE = 24;

export class InventorySystem {
  constructor() {
    this.slots = Array.from({ length: INV_SIZE }, () => null);
    this.hotbar = [...STARTER_HOTBAR];
    this.gold = 200;
    this.shippingBin = {};
  }

  addItem(itemId, count = 1) {
    for (let i = 0; i < this.slots.length; i += 1) {
      const slot = this.slots[i];
      if (slot && slot.itemId === itemId) {
        slot.count += count;
        return true;
      }
    }
    const empty = this.slots.findIndex((slot) => !slot);
    if (empty >= 0) {
      this.slots[empty] = { itemId, count };
      return true;
    }
    return false;
  }

  removeItem(itemId, count = 1) {
    for (let i = 0; i < this.slots.length; i += 1) {
      const slot = this.slots[i];
      if (slot && slot.itemId === itemId && slot.count >= count) {
        slot.count -= count;
        if (slot.count <= 0) this.slots[i] = null;
        return true;
      }
    }
    return false;
  }

  getCount(itemId) {
    return this.slots.reduce((sum, slot) => sum + (slot?.itemId === itemId ? slot.count : 0), 0);
  }

  queueShipping(itemId, count) {
    if (!this.removeItem(itemId, count)) return false;
    this.shippingBin[itemId] = (this.shippingBin[itemId] || 0) + count;
    return true;
  }

  settleShipping(priceLookup) {
    let payout = 0;
    Object.entries(this.shippingBin).forEach(([itemId, count]) => {
      payout += (priceLookup[itemId] || 0) * count;
    });
    this.gold += payout;
    this.shippingBin = {};
    return payout;
  }

  toJSON() {
    return { slots: this.slots, hotbar: this.hotbar, gold: this.gold, shippingBin: this.shippingBin };
  }

  fromJSON(state) {
    this.slots = state.slots;
    this.hotbar = state.hotbar;
    this.gold = state.gold;
    this.shippingBin = state.shippingBin || {};
  }
}
