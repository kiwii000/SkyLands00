import { formatTime } from '../utils/timeFormat';
import { ITEMS } from '../data/items';

export class Hud {
  constructor(scene) {
    this.scene = scene;
    this.text = scene.add.text(8, 6, '', { fontSize: '12px', color: '#d7e1ff' }).setDepth(1000);
    this.prompt = scene.add.text(8, 328, '', { fontSize: '12px', color: '#fff2a8' }).setDepth(1000);
    this.hotbar = scene.add.text(8, 344, '', { fontSize: '11px', color: '#9fe3ff' }).setDepth(1000);
    this.inventory = scene.add.text(440, 6, '', { fontSize: '11px', color: '#c7ffd9', align: 'left' }).setDepth(1000);
    this.message = scene.add.text(200, 6, '', { fontSize: '12px', color: '#ffcccb' }).setDepth(1000);
  }

  flash(msg) {
    this.message.setText(msg);
    this.scene.time.delayedCall(2200, () => this.message.setText(''));
  }

  update(state) {
    const { time, inventory, selectedSlot, mapName } = state;
    this.text.setText(`${mapName} | Day ${time.day} ${time.weekday} ${formatTime(time.minutes)} | Gold: ${inventory.gold}`);
    this.prompt.setText(state.prompt || '');
    this.hotbar.setText(
      inventory.hotbar
        .map((id, idx) => `${idx === selectedSlot ? '>' : ' '}[${idx + 1}] ${id ? ITEMS[id].name : 'Empty'}`)
        .join('  ')
    );
    const itemLines = inventory.slots
      .map((slot, idx) => (slot ? `${idx + 1}. ${ITEMS[slot.itemId].name} x${slot.count}` : `${idx + 1}. -`))
      .slice(0, 10)
      .join('\n');
    this.inventory.setText(`Inventory\n${itemLines}`);
  }
}
