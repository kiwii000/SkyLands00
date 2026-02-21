export const SHOPS = {
  supply: {
    id: 'supply',
    name: 'Supply Kiosk',
    open: 480,
    close: 1080,
    map: 'hub',
    x: 300,
    y: 90,
    stock: [
      { itemId: 'turnipSeed', price: 20 },
      { itemId: 'glowBeanSeed', price: 35 }
    ]
  },
  medbay: {
    id: 'medbay',
    name: 'Medbay Cafe',
    open: 600,
    close: 1200,
    map: 'hub',
    x: 420,
    y: 160,
    stock: [
      { itemId: 'turnip', price: 80 },
      { itemId: 'glowBean', price: 120 }
    ]
  }
};
