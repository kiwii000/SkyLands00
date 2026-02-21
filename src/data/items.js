export const ITEMS = {
  hoe: { id: 'hoe', name: 'Rusty Hoe', type: 'tool', stackable: false, sellPrice: 0 },
  can: { id: 'can', name: 'Water Can', type: 'tool', stackable: false, sellPrice: 0 },
  blaster: { id: 'blaster', name: 'Pulse Blaster', type: 'weapon', stackable: false, sellPrice: 0, damage: 3 },
  turnipSeed: { id: 'turnipSeed', name: 'Turnip Seeds', type: 'seed', stackable: true, buyPrice: 20, sellPrice: 10, cropId: 'turnip' },
  glowBeanSeed: { id: 'glowBeanSeed', name: 'Glow Bean Seeds', type: 'seed', stackable: true, buyPrice: 35, sellPrice: 15, cropId: 'glowBean' },
  turnip: { id: 'turnip', name: 'Turnip', type: 'crop', stackable: true, sellPrice: 55 },
  glowBean: { id: 'glowBean', name: 'Glow Bean', type: 'crop', stackable: true, sellPrice: 85 },
  ore: { id: 'ore', name: 'Iron Ore', type: 'loot', stackable: true, sellPrice: 25 },
  scrap: { id: 'scrap', name: 'Drone Scrap', type: 'loot', stackable: true, sellPrice: 18 }
};

export const STARTER_HOTBAR = ['hoe', 'can', 'turnipSeed', 'glowBeanSeed', 'blaster', null, null, null];
