import Phaser from 'phaser';
import { GameState } from '../systems/gameState';
import { SaveSystem } from '../systems/saveSystem';
import { Player } from '../entities/player';
import { Hud } from '../ui/hud';
import { MAPS } from '../data/maps';
import { SHOPS } from '../data/shops';
import { ITEMS } from '../data/items';
import { registerPixelTextures } from '../utils/pixelArt';

const FARM_BOUNDS = { minX: 128, maxX: 320, minY: 96, maxY: 224 };
const INV_COLS = 6;
const INV_ROWS = 4;

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.state = new GameState();
    if (data.save) this.state.fromJSON(data.save);
    if (data.look) this.state.player.look = data.look;
    this.currentMap = this.state.player.map;
    this.selectedSlot = this.state.selectedSlot || 0;
    this.inventoryOpen = false;
    this.inventoryCursor = 0;
  }

  create() {
    registerPixelTextures(this, this.state.player.look);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN,E,F,P,K,T,I,J,L,U,O,X,R');
    this.player = new Player(this, this.state.player.x, this.state.player.y);
    this.hud = new Hud(this);
    this.mapTitle = this.add.text(260, 34, '', { fontSize: '14px', color: '#f9ffab' }).setDepth(600);
    this.renderLayer = this.add.container(0, 0).setDepth(2);
    this.dynamicLayer = this.add.container(0, 0).setDepth(10);
    this.tileCursor = this.add.rectangle(0, 0, 32, 32, 0xf8e48f, 0.15).setStrokeStyle(1, 0xf8e48f).setDepth(20);

    this.drawMap();
    this.registerInputs();
    this.state.npcs.update(this.state.time.minutes);
  }

  registerInputs() {
    ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN'].forEach((key, i) => {
      this.keys[key].on('down', () => {
        this.selectedSlot = i;
        this.state.selectedSlot = i;
      });
    });

    this.keys.I.on('down', () => {
      this.inventoryOpen = !this.inventoryOpen;
      this.hud.flash(this.inventoryOpen ? 'Inventory opened.' : 'Inventory closed.');
    });
    this.keys.J.on('down', () => this.inventoryOpen && this.moveInventoryCursor(-1, 0));
    this.keys.L.on('down', () => this.inventoryOpen && this.moveInventoryCursor(1, 0));
    this.keys.U.on('down', () => this.inventoryOpen && this.moveInventoryCursor(0, -1));
    this.keys.O.on('down', () => this.inventoryOpen && this.moveInventoryCursor(0, 1));
    this.keys.X.on('down', () => this.inventoryOpen && this.handleInventorySplit());
    this.keys.R.on('down', () => this.inventoryOpen && this.handleInventorySort());

    this.keys.E.on('down', () => this.handleUse());
    this.keys.F.on('down', () => this.handleCombat());
    this.keys.T.on('down', () => {
      this.currentMap = 'farm';
      this.player.sprite.setPosition(430, 180);
      this.drawMap();
      this.hud.flash('Teleported to Hydro Farm plot.');
    });

    this.keys.P.on('down', () => {
      SaveSystem.save(this.buildSave());
      this.hud.flash('Game Saved');
    });
    this.keys.K.on('down', () => {
      const save = SaveSystem.load();
      if (!save) return;
      this.state.fromJSON(save);
      this.currentMap = this.state.player.map;
      this.player.sprite.setPosition(this.state.player.x, this.state.player.y);
      this.drawMap();
      this.hud.flash('Game Loaded');
    });
  }

  moveInventoryCursor(dx, dy) {
    const col = (this.inventoryCursor % INV_COLS + dx + INV_COLS) % INV_COLS;
    const row = (Math.floor(this.inventoryCursor / INV_COLS) + dy + INV_ROWS) % INV_ROWS;
    this.inventoryCursor = row * INV_COLS + col;
  }

  handleInventoryUse() {
    const ok = this.state.inventory.swapHotbarWithInventory(this.selectedSlot, this.inventoryCursor);
    this.hud.flash(ok ? `Swapped hotbar slot ${this.selectedSlot + 1}.` : 'Nothing to move.');
  }

  handleInventorySplit() {
    const ok = this.state.inventory.splitStack(this.inventoryCursor);
    this.hud.flash(ok ? 'Split stack into two slots.' : 'Cannot split this slot.');
  }

  handleInventorySort() {
    this.state.inventory.autoSort();
    this.hud.flash('Inventory auto-sorted.');
  }

  buildSave() {
    this.state.player = { map: this.currentMap, x: this.player.sprite.x, y: this.player.sprite.y, look: this.state.player.look };
    return this.state.toJSON();
  }

  update(_, delta) {
    const deltaSec = delta / 1000;
    if (!this.inventoryOpen) this.player.update(this.cursors, deltaSec);

    const tick = this.state.time.update(deltaSec);
    this.state.npcs.update(this.state.time.minutes);
    if (tick?.event === 'passOut') this.sleepFlow('Passed out. Auto-transported to ship.');

    this.handleTransitions();
    this.renderMapDynamics();
    this.updateTileCursor();

    this.hud.update({
      time: { ...this.state.time.getState(), weekday: this.state.time.weekday },
      inventory: this.state.inventory,
      selectedSlot: this.selectedSlot,
      mapName: MAPS[this.currentMap].name,
      prompt: this.getContextPrompt(),
      inventoryOpen: this.inventoryOpen,
      inventoryCursor: this.inventoryCursor
    });
  }

  baseTileKey() {
    if (this.currentMap === 'farm') return 'tile-grass';
    if (this.currentMap === 'mine') return 'tile-mine-floor';
    if (this.currentMap === 'ship') return 'tile-ship-floor';
    return 'tile-hub-floor';
  }

  drawMap() {
    this.renderLayer.removeAll(true);
    const map = MAPS[this.currentMap];
    this.cameras.main.setBackgroundColor(map.bgColor);
    this.mapTitle.setText(map.name);

    const tileKey = this.baseTileKey();
    for (let x = 16; x < 640; x += 32) {
      for (let y = 16; y < 360; y += 32) {
        this.renderLayer.add(this.add.image(x, y, tileKey));
      }
    }

    map.transitions.forEach((t) => {
      const marker = this.add.rectangle(t.x + t.w / 2, t.y + t.h / 2, t.w, t.h, 0x6ef2ff, 0.25).setStrokeStyle(2, 0xffffff);
      const label = this.add.text(t.x + t.w / 2, t.y - 14, t.label || `To ${MAPS[t.to].name}`, {
        fontSize: '11px',
        color: '#e2fbff',
        backgroundColor: '#1d2838'
      }).setOrigin(0.5, 0.5);
      this.renderLayer.add(marker);
      this.renderLayer.add(label);
    });

    if (this.currentMap === 'farm') {
      for (let x = FARM_BOUNDS.minX; x <= FARM_BOUNDS.maxX; x += 32) {
        for (let y = FARM_BOUNDS.minY; y <= FARM_BOUNDS.maxY; y += 32) {
          this.renderLayer.add(this.add.image(x, y, 'tile-dirt').setAlpha(0.55));
        }
      }
      this.renderLayer.add(this.add.text(390, 124, 'Teleport Beacon (T)\nTarget: Hydro Farm', { fontSize: '11px', color: '#d3ffe2' }));
    }

    if (this.currentMap === 'ship') {
      const bed = MAPS.ship.bed;
      this.renderLayer.add(this.add.rectangle(bed.x + bed.w / 2, bed.y + bed.h / 2, bed.w, bed.h, 0xc2c7ff, 0.35).setStrokeStyle(2, 0xe8ebff));
      this.renderLayer.add(this.add.rectangle(350, 130, 24, 24, this.state.flags.openedSeedCache ? 0x7a7a7a : 0xe0c58a).setStrokeStyle(2, 0x2f2f2f));
      this.renderLayer.add(this.add.text(308, 148, 'Seed Cache\nStarter Seeds', { fontSize: '9px', color: '#fff8d2' }));
    }
  }

  renderMapDynamics() {
    this.dynamicLayer.removeAll(true);

    if (this.currentMap === 'farm') {
      Object.entries(this.state.farming.tiles).forEach(([key, tile]) => {
        const [x, y] = key.split(',').map(Number);
        if (tile.tilled) this.dynamicLayer.add(this.add.image(x, y, 'tile-dirt'));
        if (tile.cropId) {
          this.dynamicLayer.add(this.add.image(x, y + 2, tile.ready ? 'crop-ready' : 'crop-sprout'));
          if (tile.watered) this.dynamicLayer.add(this.add.rectangle(x + 12, y - 12, 5, 5, 0x80d2ff));
        }
      });
    }

    this.state.npcs.getForMap(this.currentMap).forEach((npc) => {
      const body = this.add.image(npc.x, npc.y, 'npc-humanoid').setTint(npc.color);
      this.dynamicLayer.add(body);
      this.dynamicLayer.add(this.add.text(npc.x - 20, npc.y - 26, npc.name, { fontSize: '10px', color: '#fff3ca', backgroundColor: '#1f2230' }));
    });

    Object.values(SHOPS).filter((s) => s.map === this.currentMap).forEach((shop) => {
      const open = this.state.time.minutes >= shop.open && this.state.time.minutes < shop.close;
      this.dynamicLayer.add(this.add.rectangle(shop.x, shop.y, 40, 30, open ? 0x89e7a9 : 0x686868, 0.95).setStrokeStyle(2, 0x2d2d2d));
      this.dynamicLayer.add(this.add.text(shop.x - 32, shop.y - 26, `${shop.name}\n${open ? 'OPEN' : 'CLOSED'}`, { fontSize: '9px', color: open ? '#d6ffe2' : '#aeaeae' }));
    });

    if (this.currentMap === 'mine' && this.state.combat.enemy.alive) {
      const e = this.state.combat.enemy;
      this.dynamicLayer.add(this.add.image(e.x, e.y, 'enemy-drone'));
      this.dynamicLayer.add(this.add.text(e.x - 16, e.y - 26, `HP ${e.hp}`, { fontSize: '10px', color: '#ffd8d8' }));
    }
  }

  updateTileCursor() {
    const t = this.player.getInteractionPoint();
    this.tileCursor.setPosition(t.x, t.y);
    this.tileCursor.setVisible(this.currentMap === 'farm' && !this.inventoryOpen);
  }

  handleTransitions() {
    if (this.inventoryOpen) return;
    const map = MAPS[this.currentMap];
    const p = this.player.sprite;
    const hit = map.transitions.find((t) => p.x >= t.x && p.x <= t.x + t.w && p.y >= t.y && p.y <= t.y + t.h);
    if (!hit) return;
    this.currentMap = hit.to;
    p.setPosition(hit.spawn.x, hit.spawn.y);
    this.drawMap();
  }

  getContextPrompt() {
    if (this.inventoryOpen) {
      return 'Inventory: J/L/U/O move • E transfer • X split • R sort • I close';
    }

    const p = this.player.sprite;
    const nearNpc = this.state.npcs.getForMap(this.currentMap).find((n) => Math.hypot(n.x - p.x, n.y - p.y) < 30);
    if (nearNpc) return `E: Talk ${nearNpc.name}`;

    const nearShop = Object.values(SHOPS).find((s) => s.map === this.currentMap && Math.hypot(s.x - p.x, s.y - p.y) < 34);
    if (nearShop) return `E: ${nearShop.name}`;

    if (this.currentMap === 'farm') return 'E: Hoe/Seed/Water/Harvest   | T: Teleport to Hydro Farm';
    if (this.currentMap === 'mine') return 'F: Fire blaster';
    if (this.currentMap === 'ship') return 'E: Bed sleep or open Seed Cache';
    return 'Use labeled gateways to move between zones.';
  }

  isFarmTile(x, y) {
    return x >= FARM_BOUNDS.minX && x <= FARM_BOUNDS.maxX && y >= FARM_BOUNDS.minY && y <= FARM_BOUNDS.maxY;
  }

  handleUse() {
    if (this.inventoryOpen) return this.handleInventoryUse();

    const p = this.player.sprite;
    const nearNpc = this.state.npcs.getForMap(this.currentMap).find((n) => Math.hypot(n.x - p.x, n.y - p.y) < 30);
    if (nearNpc) return this.hud.flash(`${nearNpc.name}: ${nearNpc.currentBlock.dialogue}`);

    const nearShop = Object.values(SHOPS).find((s) => s.map === this.currentMap && Math.hypot(s.x - p.x, s.y - p.y) < 34);
    if (nearShop) return this.handleShopUse(nearShop);

    if (this.currentMap === 'ship') {
      const nearCache = Math.hypot(350 - p.x, 130 - p.y) < 42;
      if (nearCache && !this.state.flags.openedSeedCache) {
        this.state.flags.openedSeedCache = true;
        this.state.inventory.addItem('turnipSeed', 6);
        this.state.inventory.addItem('glowBeanSeed', 4);
        this.hud.flash('Found limited seeds in the cache!');
        this.drawMap();
        return;
      }
      const bed = MAPS.ship.bed;
      if (p.x >= bed.x && p.x <= bed.x + bed.w && p.y >= bed.y && p.y <= bed.y + bed.h) return this.sleepFlow('Slept until morning.');
    }

    if (this.currentMap !== 'farm') return;

    const target = this.player.getInteractionPoint();
    if (!this.isFarmTile(target.x, target.y)) return this.hud.flash('That tile is outside your farm plot.');

    const heldId = this.state.inventory.hotbar[this.selectedSlot];
    if (!heldId) return;

    if (heldId === 'hoe') {
      this.state.farming.till(target.x, target.y);
      return this.hud.flash('Soil tilled.');
    }

    if (heldId === 'can') {
      return this.hud.flash(this.state.farming.water(target.x, target.y) ? 'Crop watered.' : 'No planted crop there.');
    }

    if (ITEMS[heldId]?.type === 'seed') {
      if (!this.state.inventory.removeItem(heldId, 1)) return this.hud.flash('Out of that seed type.');
      const ok = this.state.farming.plant(target.x, target.y, ITEMS[heldId].cropId, this.state.time.day);
      if (!ok) this.state.inventory.addItem(heldId, 1);
      return this.hud.flash(ok ? `Planted ${ITEMS[heldId].name}.` : 'Need tilled empty soil.');
    }

    const harvested = this.state.farming.harvest(target.x, target.y);
    if (harvested) {
      this.state.inventory.addItem(harvested, 1);
      return this.hud.flash(`Harvested ${ITEMS[harvested].name}.`);
    }
    return this.hud.flash('Nothing to harvest.');
  }

  handleShopUse(shop) {
    const open = this.state.time.minutes >= shop.open && this.state.time.minutes < shop.close;
    if (!open) return this.hud.flash(`${shop.name} closed (${shop.open / 60}:00-${shop.close / 60}:00)`);

    const stock = shop.stock[0];
    if (this.state.inventory.gold >= stock.price) {
      if (!this.state.inventory.hasSpaceFor(stock.itemId, 1)) return this.hud.flash('Inventory full.');
      this.state.inventory.gold -= stock.price;
      this.state.inventory.addItem(stock.itemId, 1);
      return this.hud.flash(`Bought ${ITEMS[stock.itemId].name}.`);
    }

    if (this.state.inventory.queueShipping('turnip', 1) || this.state.inventory.queueShipping('glowBean', 1) || this.state.inventory.queueShipping('ore', 1)) {
      return this.hud.flash('Queued 1 item in shipping bin.');
    }
    return this.hud.flash('Not enough gold and nothing to ship.');
  }

  handleCombat() {
    if (this.inventoryOpen) return;
    if (this.currentMap !== 'mine') return;
    const held = this.state.inventory.hotbar[this.selectedSlot];
    if (held !== 'blaster') return this.hud.flash('Equip Pulse Blaster first.');

    const result = this.state.combat.attackEnemy(this.player.sprite.x, this.player.sprite.y, ITEMS.blaster.damage);
    if (!result?.hit) return this.hud.flash('Missed. Move closer.');
    if (result.defeated) {
      this.state.inventory.addItem(result.loot, 1);
      return this.hud.flash(`Drone down. Looted ${ITEMS[result.loot].name}.`);
    }
    return this.hud.flash('Hit confirmed.');
  }

  sleepFlow(message) {
    this.currentMap = 'ship';
    this.player.sprite.setPosition(230, 220);
    this.state.settleNewDay();
    this.state.time.sleepUntilMorning();
    this.drawMap();
    this.hud.flash(`${message} Shipping payout: ${this.state.lastSettlement}g`);
  }
}
