import { ITEMS, STARTER_HOTBAR } from '../data/items';

const INV_SIZE = 24;
const DEFAULT_MAX_STACK = 99;

export class InventorySystem {
  constructor() {
    this.slots = Array.from({ length: INV_SIZE }, () => null);
    this.hotbar = [...STARTER_HOTBAR];
    this.gold = 200;
    this.shippingBin = {};
  }

  getMaxStack(itemId) {
    const item = ITEMS[itemId];
    if (!item) return 1;
    if (!item.stackable) return 1;
    return item.maxStack || DEFAULT_MAX_STACK;
  }

  getUsedSlots() {
    return this.slots.filter(Boolean).length;
  }

  hasSpaceFor(itemId, count = 1) {
    let remaining = count;
    const maxStack = this.getMaxStack(itemId);

    for (const slot of this.slots) {
      if (slot?.itemId === itemId) {
        const room = maxStack - slot.count;
        remaining -= Math.max(room, 0);
        if (remaining <= 0) return true;
      }
    }

    const emptySlots = this.slots.filter((slot) => !slot).length;
    return emptySlots * maxStack >= remaining;
  }

  addItem(itemId, count = 1) {
    if (!this.hasSpaceFor(itemId, count)) return false;

    const maxStack = this.getMaxStack(itemId);
    let remaining = count;

    for (let i = 0; i < this.slots.length && remaining > 0; i += 1) {
      const slot = this.slots[i];
      if (slot?.itemId === itemId && slot.count < maxStack) {
        const add = Math.min(maxStack - slot.count, remaining);
        slot.count += add;
        remaining -= add;
      }
    }

    for (let i = 0; i < this.slots.length && remaining > 0; i += 1) {
      if (!this.slots[i]) {
        const add = Math.min(maxStack, remaining);
        this.slots[i] = { itemId, count: add };
        remaining -= add;
      }
    }

    return remaining <= 0;
  }

  removeItem(itemId, count = 1) {
    if (this.getCount(itemId) < count) return false;

    let remaining = count;
    for (let i = 0; i < this.slots.length && remaining > 0; i += 1) {
      const slot = this.slots[i];
      if (slot?.itemId === itemId) {
        const remove = Math.min(slot.count, remaining);
        slot.count -= remove;
        remaining -= remove;
        if (slot.count <= 0) this.slots[i] = null;
      }
    }
    return true;
  }

  splitStack(index) {
    const slot = this.slots[index];
    if (!slot || slot.count < 2) return false;
    const empty = this.slots.findIndex((s) => !s);
    if (empty < 0) return false;
    const splitAmount = Math.floor(slot.count / 2);
    slot.count -= splitAmount;
    this.slots[empty] = { itemId: slot.itemId, count: splitAmount };
    return true;
  }

  moveSlot(fromIndex, toIndex) {
    if (fromIndex === toIndex) return true;
    const from = this.slots[fromIndex];
    const to = this.slots[toIndex];
    if (!from) return false;

    if (!to) {
      this.slots[toIndex] = from;
      this.slots[fromIndex] = null;
      return true;
    }

    if (to.itemId === from.itemId) {
      const maxStack = this.getMaxStack(from.itemId);
      const room = maxStack - to.count;
      if (room <= 0) {
        this.slots[toIndex] = from;
        this.slots[fromIndex] = to;
        return true;
      }
      const transfer = Math.min(room, from.count);
      to.count += transfer;
      from.count -= transfer;
      if (from.count <= 0) this.slots[fromIndex] = null;
      return true;
    }

    this.slots[toIndex] = from;
    this.slots[fromIndex] = to;
    return true;
  }

  swapHotbarWithInventory(hotbarIndex, invIndex) {
    const invSlot = this.slots[invIndex];
    const hotbarItemId = this.hotbar[hotbarIndex];

    if (!invSlot && !hotbarItemId) return false;

    if (!hotbarItemId) {
      this.hotbar[hotbarIndex] = invSlot.itemId;
      this.slots[invIndex] = null;
      return true;
    }

    if (!invSlot) {
      if (!this.addItem(hotbarItemId, 1)) return false;
      this.hotbar[hotbarIndex] = null;
      return true;
    }

    this.hotbar[hotbarIndex] = invSlot.itemId;
    this.slots[invIndex] = null;
    this.addItem(hotbarItemId, 1);
    return true;
  }

  autoSort() {
    const filled = this.slots
      .filter(Boolean)
      .sort((a, b) => ITEMS[a.itemId].name.localeCompare(ITEMS[b.itemId].name));

    const consolidated = [];
    filled.forEach((entry) => {
      const maxStack = this.getMaxStack(entry.itemId);
      let remaining = entry.count;
      while (remaining > 0) {
        const existing = consolidated.find((s) => s.itemId === entry.itemId && s.count < maxStack);
        if (existing) {
          const amount = Math.min(maxStack - existing.count, remaining);
          existing.count += amount;
          remaining -= amount;
        } else {
          const amount = Math.min(maxStack, remaining);
          consolidated.push({ itemId: entry.itemId, count: amount });
          remaining -= amount;
        }
      }
    });

    this.slots = Array.from({ length: INV_SIZE }, (_, i) => consolidated[i] || null);
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
