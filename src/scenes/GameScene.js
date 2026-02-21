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
  }

  create() {
    registerPixelTextures(this, this.state.player.look);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN,E,F,P,K,T');
    this.player = new Player(this, this.state.player.x, this.state.player.y);
    this.hud = new Hud(this);
    this.mapTitle = this.add.text(270, 34, '', { fontSize: '14px', color: '#f9ffab' }).setDepth(600);
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

  buildSave() {
    this.state.player = { map: this.currentMap, x: this.player.sprite.x, y: this.player.sprite.y, look: this.state.player.look };
    return this.state.toJSON();
  }

  update(_, delta) {
    const deltaSec = delta / 1000;
    this.player.update(this.cursors, deltaSec);

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
      prompt: this.getContextPrompt()
    });
  }

  drawMap() {
    this.renderLayer.removeAll(true);
    const map = MAPS[this.currentMap];
    this.cameras.main.setBackgroundColor(map.bgColor);
    this.mapTitle.setText(map.name);

    for (let x = 0; x < 640; x += 32) {
      for (let y = 0; y < 360; y += 32) {
        const shade = (x / 32 + y / 32) % 2 === 0 ? 0x283753 : 0x24324c;
        if (this.currentMap === 'farm') {
          this.renderLayer.add(this.add.rectangle(x + 16, y + 16, 32, 32, (x / 32 + y / 32) % 2 ? 0x32594d : 0x2f4f44, 1));
        } else if (this.currentMap === 'mine') {
          this.renderLayer.add(this.add.rectangle(x + 16, y + 16, 32, 32, (x / 32 + y / 32) % 2 ? 0x3b3548 : 0x342f40, 1));
        } else {
          this.renderLayer.add(this.add.rectangle(x + 16, y + 16, 32, 32, shade, 1));
        }
      }
    }

    map.transitions.forEach((t) => {
      this.renderLayer.add(this.add.rectangle(t.x + t.w / 2, t.y + t.h / 2, t.w, t.h, 0x6ef2ff, 0.22).setStrokeStyle(2, 0xb2ffff));
    });

    if (this.currentMap === 'farm') {
      for (let x = FARM_BOUNDS.minX; x <= FARM_BOUNDS.maxX; x += 32) {
        for (let y = FARM_BOUNDS.minY; y <= FARM_BOUNDS.maxY; y += 32) {
          this.renderLayer.add(this.add.rectangle(x, y, 30, 30, 0x6b8f6a, 0.75).setStrokeStyle(1, 0xa8c79e));
        }
      }
      this.renderLayer.add(this.add.text(398, 126, 'Teleport beacon\n(T)', { fontSize: '11px', color: '#d3ffe2' }));
    }

    if (this.currentMap === 'ship') {
      const bed = MAPS.ship.bed;
      this.renderLayer.add(this.add.rectangle(bed.x + bed.w / 2, bed.y + bed.h / 2, bed.w, bed.h, 0xc2c7ff, 0.35).setStrokeStyle(2, 0xe8ebff));
      this.renderLayer.add(this.add.rectangle(350, 130, 24, 24, this.state.flags.openedSeedCache ? 0x7a7a7a : 0xe0c58a).setStrokeStyle(2, 0x2f2f2f));
      this.renderLayer.add(this.add.text(328, 148, 'Seed Cache', { fontSize: '9px', color: '#fff8d2' }));
    }
  }

  renderMapDynamics() {
    this.dynamicLayer.removeAll(true);

    if (this.currentMap === 'farm') {
      Object.entries(this.state.farming.tiles).forEach(([key, tile]) => {
        const [x, y] = key.split(',').map(Number);
        if (tile.tilled) this.dynamicLayer.add(this.add.rectangle(x, y, 26, 26, 0x6d4a2c, 1).setStrokeStyle(1, 0x8f6b42));
        if (tile.cropId) {
          this.dynamicLayer.add(this.add.image(x, y + 2, tile.ready ? 'crop-ready' : 'crop-sprout'));
          if (tile.watered) this.dynamicLayer.add(this.add.rectangle(x + 12, y - 12, 5, 5, 0x80d2ff));
        }
      });
    }

    this.state.npcs.getForMap(this.currentMap).forEach((npc) => {
      const body = this.add.image(npc.x, npc.y, 'npc-pixel').setTint(npc.color);
      this.dynamicLayer.add(body);
      this.dynamicLayer.add(this.add.text(npc.x - 16, npc.y - 22, npc.name, { fontSize: '10px', color: '#fff3ca' }));
    });

    Object.values(SHOPS).filter((s) => s.map === this.currentMap).forEach((shop) => {
      const open = this.state.time.minutes >= shop.open && this.state.time.minutes < shop.close;
      this.dynamicLayer.add(this.add.rectangle(shop.x, shop.y, 38, 28, open ? 0x89e7a9 : 0x686868, 0.95).setStrokeStyle(2, 0x2d2d2d));
      this.dynamicLayer.add(this.add.text(shop.x - 28, shop.y - 24, shop.name, { fontSize: '10px', color: open ? '#d6ffe2' : '#aeaeae' }));
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
    this.tileCursor.setVisible(this.currentMap === 'farm');
  }

  handleTransitions() {
    const map = MAPS[this.currentMap];
    const p = this.player.sprite;
    const hit = map.transitions.find((t) => p.x >= t.x && p.x <= t.x + t.w && p.y >= t.y && p.y <= t.y + t.h);
    if (!hit) return;
    this.currentMap = hit.to;
    p.setPosition(hit.spawn.x, hit.spawn.y);
    this.drawMap();
  }

  getContextPrompt() {
    const p = this.player.sprite;
    const nearNpc = this.state.npcs.getForMap(this.currentMap).find((n) => Math.hypot(n.x - p.x, n.y - p.y) < 30);
    if (nearNpc) return `E: Talk ${nearNpc.name}`;

    const nearShop = Object.values(SHOPS).find((s) => s.map === this.currentMap && Math.hypot(s.x - p.x, s.y - p.y) < 34);
    if (nearShop) return 'E: Buy / Sell';

    if (this.currentMap === 'farm') return 'E: Hoe/Seed/Water/Harvest   | T: Teleport to plot';
    if (this.currentMap === 'mine') return 'F: Fire blaster';
    if (this.currentMap === 'ship') return 'E: Bed sleep or open seed cache';
    return 'Explore station. T teleports to farm plot.';
  }

  isFarmTile(x, y) {
    return x >= FARM_BOUNDS.minX && x <= FARM_BOUNDS.maxX && y >= FARM_BOUNDS.minY && y <= FARM_BOUNDS.maxY;
  }

  handleUse() {
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
