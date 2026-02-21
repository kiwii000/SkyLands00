import { CROPS } from '../data/crops';

export class FarmingSystem {
  constructor() {
    this.tiles = {};
  }

  key(x, y) {
    return `${x},${y}`;
  }

  till(x, y) {
    const k = this.key(x, y);
    this.tiles[k] = this.tiles[k] || { tilled: true, watered: false, cropId: null, plantedDay: null, ready: false };
    this.tiles[k].tilled = true;
  }

  plant(x, y, cropId, day) {
    const tile = this.tiles[this.key(x, y)];
    if (!tile || !tile.tilled || tile.cropId) return false;
    tile.cropId = cropId;
    tile.plantedDay = day;
    tile.ready = false;
    return true;
  }

  water(x, y) {
    const tile = this.tiles[this.key(x, y)];
    if (!tile || !tile.cropId) return false;
    tile.watered = true;
    return true;
  }

  overnightGrowth(day) {
    Object.values(this.tiles).forEach((tile) => {
      if (tile.cropId && tile.watered) {
        const crop = CROPS[tile.cropId];
        if (day - tile.plantedDay >= crop.daysToGrow) {
          tile.ready = true;
        }
        tile.watered = false;
      }
    });
  }

  harvest(x, y) {
    const tile = this.tiles[this.key(x, y)];
    if (!tile?.ready) return null;
    const crop = CROPS[tile.cropId];
    tile.cropId = null;
    tile.plantedDay = null;
    tile.ready = false;
    return crop.harvestItem;
  }

  toJSON() {
    return this.tiles;
  }

  fromJSON(state) {
    this.tiles = state || {};
  }
}
