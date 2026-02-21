import Phaser from 'phaser';
import { GameState } from '../systems/gameState';
import { SaveSystem } from '../systems/saveSystem';
import { Player } from '../entities/player';
import { Hud } from '../ui/hud';
import { MAPS } from '../data/maps';
import { SHOPS } from '../data/shops';
import { ITEMS } from '../data/items';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.state = new GameState();
    if (data.save) {
      this.state.fromJSON(data.save);
    }
    if (data.look) {
      this.state.player.look = data.look;
    }
    this.currentMap = this.state.player.map;
    this.selectedSlot = this.state.selectedSlot || 0;
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN,E,F,P,K');
    this.player = new Player(this, this.state.player.x, this.state.player.y, this.state.player.look.suit);
    this.player.sprite.setStrokeStyle(2, this.state.player.look.visor);
    this.hud = new Hud(this);
    this.mapTitle = this.add.text(250, 30, '', { fontSize: '14px', color: '#f9ffab' });
    this.renderLayer = this.add.container(0, 0);

    this.drawMap();
    this.registerInputs();
  }

  registerInputs() {
    const nums = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN'];
    nums.forEach((key, i) => {
      this.keys[key].on('down', () => {
        this.selectedSlot = i;
        this.state.selectedSlot = i;
      });
    });

    this.keys.E.on('down', () => this.handleUse());
    this.keys.F.on('down', () => this.handleCombat());
    this.keys.P.on('down', () => {
      SaveSystem.save(this.buildSave());
      this.hud.flash('Game Saved');
    });
    this.keys.K.on('down', () => {
      const save = SaveSystem.load();
      if (save) {
        this.state.fromJSON(save);
        this.currentMap = this.state.player.map;
        this.player.sprite.setPosition(this.state.player.x, this.state.player.y);
        this.drawMap();
        this.hud.flash('Game Loaded');
      }
    });
  }

  buildSave() {
    this.state.player = {
      map: this.currentMap,
      x: this.player.sprite.x,
      y: this.player.sprite.y,
      look: this.state.player.look
    };
    return this.state.toJSON();
  }

  update(_, delta) {
    const deltaSec = delta / 1000;
    this.player.update(this.cursors, deltaSec);

    const tick = this.state.time.update(deltaSec);
    this.state.npcs.update(this.state.time.minutes);
    if (tick?.event === 'passOut') {
      this.sleepFlow('Passed out. Auto-transported to ship.');
    }

    this.handleTransitions();
    this.renderMapDynamics();

    this.hud.update({
      time: { ...this.state.time.getState(), weekday: this.state.time.weekday },
      inventory: this.state.inventory,
      selectedSlot: this.selectedSlot,
      mapName: MAPS[this.currentMap].name,
      prompt: this.getContextPrompt()
    });
  }

  drawMap() {
    this.cameras.main.setBackgroundColor(MAPS[this.currentMap].bgColor);
    this.renderLayer.removeAll(true);
    const map = MAPS[this.currentMap];
    this.mapTitle.setText(map.name);

    map.transitions.forEach((t) => {
      this.renderLayer.add(this.add.rectangle(t.x + t.w / 2, t.y + t.h / 2, t.w, t.h, 0x6ef2ff, 0.2).setStrokeStyle(1, 0x6ef2ff));
    });

    if (this.currentMap === 'farm') {
      for (let gx = 128; gx <= 320; gx += 32) {
        for (let gy = 96; gy <= 224; gy += 32) {
          this.renderLayer.add(this.add.rectangle(gx, gy, 30, 30, 0x2f614d, 0.6).setStrokeStyle(1, 0x67a888));
        }
      }
      this.renderLayer.add(this.add.rectangle(430, 170, 80, 80, 0xffd580, 0.3).setStrokeStyle(1, 0xffd580));
    }
    if (this.currentMap === 'mine') {
      this.renderLayer.add(this.add.rectangle(300, 180, 100, 100, 0xff7d7d, 0.15).setStrokeStyle(1, 0xff7d7d));
    }
    if (this.currentMap === 'ship') {
      const bed = MAPS.ship.bed;
      this.renderLayer.add(this.add.rectangle(bed.x + bed.w / 2, bed.y + bed.h / 2, bed.w, bed.h, 0xc2c7ff, 0.25).setStrokeStyle(1, 0xc2c7ff));
      this.renderLayer.add(this.add.rectangle(350, 130, 22, 22, 0xb7b7b7));
    }
  }

  renderMapDynamics() {
    this.dynamicLayer?.removeAll(true);
    this.dynamicLayer = this.add.container(0, 0);

    if (this.currentMap === 'farm') {
      Object.entries(this.state.farming.tiles).forEach(([key, tile]) => {
        const [x, y] = key.split(',').map(Number);
        if (tile.tilled) this.dynamicLayer.add(this.add.rectangle(x, y, 26, 26, 0x7a5435, 0.8));
        if (tile.cropId) {
          const color = tile.ready ? 0xefff8c : 0x62e38f;
          this.dynamicLayer.add(this.add.circle(x, y, 8, color));
          if (tile.watered) this.dynamicLayer.add(this.add.circle(x + 10, y - 10, 3, 0x83d3ff));
        }
      });
    }

    const npcs = this.state.npcs.getForMap(this.currentMap);
    npcs.forEach((npc) => {
      this.dynamicLayer.add(this.add.rectangle(npc.x, npc.y, 16, 20, npc.color).setStrokeStyle(1, 0xffffff));
      this.dynamicLayer.add(this.add.text(npc.x - 16, npc.y - 20, npc.name, { fontSize: '10px' }));
    });

    Object.values(SHOPS)
      .filter((s) => s.map === this.currentMap)
      .forEach((shop) => {
        const open = this.state.time.minutes >= shop.open && this.state.time.minutes < shop.close;
        this.dynamicLayer.add(this.add.rectangle(shop.x, shop.y, 34, 28, open ? 0x93ffcb : 0x555555, 0.8));
        this.dynamicLayer.add(this.add.text(shop.x - 26, shop.y - 24, shop.name, { fontSize: '10px', color: open ? '#a8ffdf' : '#888' }));
      });

    if (this.currentMap === 'mine' && this.state.combat.enemy.alive) {
      const e = this.state.combat.enemy;
      this.dynamicLayer.add(this.add.rectangle(e.x, e.y, 24, 24, 0xff8080).setStrokeStyle(1, 0xffd5d5));
      this.dynamicLayer.add(this.add.text(e.x - 15, e.y - 26, `HP:${e.hp}`, { fontSize: '10px' }));
    }
  }

  handleTransitions() {
    const map = MAPS[this.currentMap];
    const p = this.player.sprite;
    const hit = map.transitions.find((t) => p.x >= t.x && p.x <= t.x + t.w && p.y >= t.y && p.y <= t.y + t.h);
    if (hit) {
      this.currentMap = hit.to;
      p.setPosition(hit.spawn.x, hit.spawn.y);
      this.drawMap();
    }
  }

  getContextPrompt() {
    const nearNpc = this.state.npcs.getForMap(this.currentMap).find((n) => Math.hypot(n.x - this.player.sprite.x, n.y - this.player.sprite.y) < 32);
    if (nearNpc) return `E: Talk to ${nearNpc.name}`;

    const nearShop = Object.values(SHOPS).find((s) => s.map === this.currentMap && Math.hypot(s.x - this.player.sprite.x, s.y - this.player.sprite.y) < 32);
    if (nearShop) return 'E: Shop / Sell';

    if (this.currentMap === 'farm') return 'E: Use equipped item on tile | F no-op';
    if (this.currentMap === 'mine') return 'F: Fire blaster at drone';
    if (this.currentMap === 'ship') return 'E near bed: Sleep';
    return 'Explore station sectors';
  }

  handleUse() {
    const p = this.player.sprite;
    const nearNpc = this.state.npcs.getForMap(this.currentMap).find((n) => Math.hypot(n.x - p.x, n.y - p.y) < 32);
    if (nearNpc) {
      this.hud.flash(`${nearNpc.name}: ${nearNpc.currentBlock.dialogue}`);
      return;
    }

    const nearShop = Object.values(SHOPS).find((s) => s.map === this.currentMap && Math.hypot(s.x - p.x, s.y - p.y) < 34);
    if (nearShop) {
      const open = this.state.time.minutes >= nearShop.open && this.state.time.minutes < nearShop.close;
      if (!open) {
        this.hud.flash(`${nearShop.name} is closed (${nearShop.open / 60}:00-${nearShop.close / 60}:00).`);
        return;
      }
      const stock = nearShop.stock[0];
      if (this.state.inventory.gold >= stock.price) {
        this.state.inventory.gold -= stock.price;
        this.state.inventory.addItem(stock.itemId, 1);
        this.hud.flash(`Bought 1 ${ITEMS[stock.itemId].name}`);
      } else if (this.state.inventory.queueShipping('turnip', 1) || this.state.inventory.queueShipping('glowBean', 1) || this.state.inventory.queueShipping('ore', 1)) {
        this.hud.flash('Queued 1 item for shipping bin settlement.');
      } else {
        this.hud.flash('Not enough gold, and nothing to ship.');
      }
      return;
    }

    if (this.currentMap === 'ship') {
      const bed = MAPS.ship.bed;
      if (p.x >= bed.x && p.x <= bed.x + bed.w && p.y >= bed.y && p.y <= bed.y + bed.h) {
        this.sleepFlow('Slept until morning.');
        return;
      }
    }

    if (this.currentMap === 'farm') {
      const target = this.player.getInteractionPoint();
      const heldId = this.state.inventory.hotbar[this.selectedSlot];
      if (!heldId) return;
      if (heldId === 'hoe') {
        this.state.farming.till(target.x, target.y);
        this.hud.flash('Soil tilled.');
      } else if (heldId === 'can') {
        const ok = this.state.farming.water(target.x, target.y);
        this.hud.flash(ok ? 'Crop watered.' : 'Need a planted crop.');
      } else if (ITEMS[heldId]?.type === 'seed') {
        if (this.state.inventory.removeItem(heldId, 1)) {
          const cropId = ITEMS[heldId].cropId;
          const ok = this.state.farming.plant(target.x, target.y, cropId, this.state.time.day);
          if (!ok) this.state.inventory.addItem(heldId, 1);
          this.hud.flash(ok ? `Planted ${ITEMS[heldId].name}.` : 'Need tilled empty soil.');
        } else {
          this.hud.flash('No seeds in inventory stack.');
        }
      } else {
        const harvested = this.state.farming.harvest(target.x, target.y);
        if (harvested) {
          this.state.inventory.addItem(harvested, 1);
          this.hud.flash(`Harvested ${ITEMS[harvested].name}`);
        } else {
          this.hud.flash('Nothing to harvest.');
        }
      }
    }
  }

  handleCombat() {
    if (this.currentMap !== 'mine') return;
    const held = this.state.inventory.hotbar[this.selectedSlot];
    if (held !== 'blaster') {
      this.hud.flash('Equip Pulse Blaster on hotbar slot.');
      return;
    }
    const result = this.state.combat.attackEnemy(this.player.sprite.x, this.player.sprite.y, ITEMS.blaster.damage);
    if (!result?.hit) this.hud.flash('Missed. Move closer to the drone.');
    else if (result.defeated) {
      this.state.inventory.addItem(result.loot, 1);
      this.hud.flash(`Drone defeated. Looted ${ITEMS[result.loot].name}.`);
    } else {
      this.hud.flash('Direct hit!');
    }
  }

  sleepFlow(message) {
    this.currentMap = 'ship';
    this.player.sprite.setPosition(230, 220);
    this.state.settleNewDay();
    this.state.time.sleepUntilMorning();
    this.hud.flash(`${message} Shipping payout: ${this.state.lastSettlement}g`);
  }
}
