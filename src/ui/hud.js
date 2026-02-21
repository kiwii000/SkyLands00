import { formatTime } from '../utils/timeFormat';
import { ITEMS } from '../data/items';

const INV_COLS = 6;

export class Hud {
  constructor(scene) {
    this.scene = scene;
    this.topPanel = scene.add.rectangle(320, 16, 628, 28, 0x1f2a3d, 0.92).setStrokeStyle(2, 0xf4dca2).setDepth(1000);
    this.bottomPanel = scene.add.rectangle(320, 344, 628, 30, 0x1f2a3d, 0.92).setStrokeStyle(2, 0xf4dca2).setDepth(1000);
    this.rightPanel = scene.add.rectangle(556, 180, 156, 292, 0x1a2233, 0.9).setStrokeStyle(2, 0x9fd5b3).setDepth(1000);

    this.text = scene.add.text(14, 8, '', { fontSize: '12px', color: '#fff6d1' }).setDepth(1001);
    this.prompt = scene.add.text(14, 332, '', { fontSize: '12px', color: '#ffe8a3' }).setDepth(1001);
    this.hotbar = scene.add.text(14, 346, '', { fontSize: '11px', color: '#b8e9ff' }).setDepth(1001);
    this.inventory = scene.add.text(412, 38, '', { fontSize: '10px', color: '#d2ffd9', align: 'left' }).setDepth(1001);
    this.message = scene.add.text(200, 8, '', { fontSize: '12px', color: '#ffc5c5' }).setDepth(1001);
  }

  flash(msg) {
    this.message.setText(msg);
    this.scene.time.delayedCall(2400, () => this.message.setText(''));
  }

  slotLabel(slot) {
    if (!slot) return '---';
    const item = ITEMS[slot.itemId];
    return `${item.name.slice(0, 9).padEnd(9, ' ')} x${String(slot.count).padStart(2, '0')}`;
  }

  update(state) {
    const { time, inventory, selectedSlot, mapName, inventoryOpen, inventoryCursor } = state;
    const usedSlots = inventory.getUsedSlots();
    this.text.setText(`${mapName}  •  Day ${time.day} ${time.weekday}  •  ${formatTime(time.minutes)}  •  ${inventory.gold}g  •  Bag ${usedSlots}/24`);
    this.prompt.setText(state.prompt || '');

    this.hotbar.setText(
      inventory.hotbar.map((id, idx) => {
        const marker = idx === selectedSlot ? '▣' : '□';
        return `${marker}${idx + 1}:${id ? ITEMS[id].name : 'Empty'}`;
      }).join('  ')
    );

    const rows = [];
    for (let i = 0; i < inventory.slots.length; i += INV_COLS) {
      const row = [];
      for (let j = 0; j < INV_COLS; j += 1) {
        const idx = i + j;
        const slot = inventory.slots[idx];
        const prefix = inventoryOpen && inventoryCursor === idx ? '▶' : ' ';
        row.push(`${prefix}${String(idx + 1).padStart(2, '0')}:${this.slotLabel(slot)}`);
      }
      rows.push(row.join('  '));
    }

    const shipping = Object.entries(inventory.shippingBin)
      .map(([k, v]) => `${ITEMS[k].name} x${v}`)
      .join(' | ') || 'Empty';

    this.inventory.setText(
      `Inventory ${inventoryOpen ? '(OPEN)' : '(CLOSED)'}\n${rows.join('\n')}\n\nShipping: ${shipping}\n\nInv controls:\nI toggle • J/L/U/O move\nE move with active hotbar\nX split • R auto-sort`
    );
  }
}
