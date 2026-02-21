import { NPCS } from '../data/npcs';

export class NpcSystem {
  constructor() {
    this.runtime = NPCS.map((npc) => ({ ...npc, currentBlock: null, x: 0, y: 0, presentMap: null }));
  }

  update(minutes) {
    this.runtime.forEach((npc) => {
      const block = npc.schedule.find((entry) => minutes >= entry.start && minutes < entry.end) || npc.schedule[npc.schedule.length - 1];
      npc.currentBlock = block;
      npc.presentMap = block.map;
      if (npc.currentBlock.behavior === 'patrol') {
        npc.x = block.x + Math.sin(minutes / 15) * 24;
        npc.y = block.y + Math.cos(minutes / 15) * 12;
      } else if (npc.currentBlock.behavior === 'idle') {
        npc.x = block.x + Math.sin(minutes / 40) * 4;
        npc.y = block.y;
      } else {
        npc.x = block.x;
        npc.y = block.y;
      }
    });
  }

  getForMap(mapId) {
    return this.runtime.filter((npc) => npc.presentMap === mapId);
  }

  getState() {
    return this.runtime.map((npc) => ({ id: npc.id, currentMap: npc.presentMap, blockStart: npc.currentBlock?.start || 0 }));
  }
}
