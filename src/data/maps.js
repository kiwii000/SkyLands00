export const MAPS = {
  hub: {
    id: 'hub',
    name: 'Station Hub',
    bgColor: 0x1a2440,
    transitions: [
      { x: 20, y: 200, w: 40, h: 80, to: 'farm', label: 'To Hydro Farm', spawn: { x: 500, y: 220 } },
      { x: 560, y: 200, w: 40, h: 80, to: 'mine', label: 'To Ore Mine', spawn: { x: 80, y: 220 } },
      { x: 270, y: 340, w: 60, h: 20, to: 'ship', label: 'To Starter Ship', spawn: { x: 300, y: 260 } }
    ]
  },
  farm: {
    id: 'farm',
    name: 'Hydro Farm',
    bgColor: 0x1f3d35,
    transitions: [{ x: 540, y: 180, w: 60, h: 120, to: 'hub', label: 'To Station Hub', spawn: { x: 80, y: 220 } }]
  },
  mine: {
    id: 'mine',
    name: 'Ore Mine',
    bgColor: 0x2f2a3a,
    transitions: [{ x: 0, y: 180, w: 60, h: 120, to: 'hub', label: 'To Station Hub', spawn: { x: 520, y: 220 } }]
  },
  ship: {
    id: 'ship',
    name: 'Starter Ship',
    bgColor: 0x303a54,
    transitions: [{ x: 270, y: 340, w: 60, h: 20, to: 'hub', label: 'To Station Hub', spawn: { x: 300, y: 300 } }],
    bed: { x: 190, y: 170, w: 100, h: 60 }
  }
};
