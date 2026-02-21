export function createPixelTexture(scene, key, matrix, palette, pixelSize = 2) {
  if (scene.textures.exists(key)) return;
  const h = matrix.length;
  const w = matrix[0].length;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const idx = matrix[y][x];
      if (idx < 0) continue;
      g.fillStyle(palette[idx], 1);
      g.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }
  g.generateTexture(key, w * pixelSize, h * pixelSize);
  g.destroy();
}

function makeNoiseTile(seedA, seedB, c1, c2, c3) {
  const matrix = [];
  for (let y = 0; y < 16; y += 1) {
    const row = [];
    for (let x = 0; x < 16; x += 1) {
      const v = (x * seedA + y * seedB + (x * y) % 7) % 9;
      row.push(v < 2 ? 0 : v < 6 ? 1 : 2);
    }
    matrix.push(row);
  }
  return { matrix, palette: [c1, c2, c3] };
}

export function registerPixelTextures(scene, look) {
  createPixelTexture(scene, 'player-humanoid', [
    [-1,-1,-1,4,4,4,4,-1,-1,-1],
    [-1,-1,4,2,2,2,2,4,-1,-1],
    [-1,4,2,2,2,2,2,2,4,-1],
    [-1,4,2,3,2,2,3,2,4,-1],
    [-1,4,2,2,2,2,2,2,4,-1],
    [-1,-1,4,2,2,2,2,4,-1,-1],
    [-1,-1,1,1,1,1,1,1,-1,-1],
    [-1,1,1,1,1,1,1,1,1,-1],
    [1,1,1,0,1,1,0,1,1,1],
    [1,1,1,0,1,1,0,1,1,1],
    [-1,1,1,1,1,1,1,1,1,-1],
    [-1,1,0,0,-1,-1,0,0,1,-1],
    [-1,0,0,-1,-1,-1,-1,0,0,-1],
    [-1,0,0,-1,-1,-1,-1,0,0,-1]
  ], [look.suit, 0x1b2233, look.visor, 0xffffff, 0x0f131f], 2);

  createPixelTexture(scene, 'npc-humanoid', [
    [-1,-1,-1,3,3,3,3,-1,-1,-1],
    [-1,-1,3,2,2,2,2,3,-1,-1],
    [-1,3,2,2,2,2,2,2,3,-1],
    [-1,3,2,1,2,2,1,2,3,-1],
    [-1,3,2,2,2,2,2,2,3,-1],
    [-1,-1,3,2,2,2,2,3,-1,-1],
    [-1,-1,0,0,0,0,0,0,-1,-1],
    [-1,0,0,0,0,0,0,0,0,-1],
    [0,0,0,2,0,0,2,0,0,0],
    [0,0,0,2,0,0,2,0,0,0],
    [-1,0,0,0,0,0,0,0,0,-1],
    [-1,0,2,2,-1,-1,2,2,0,-1],
    [-1,2,2,-1,-1,-1,-1,2,2,-1],
    [-1,2,2,-1,-1,-1,-1,2,2,-1]
  ], [0x7484a6, 0xf4f4f4, 0x2a3347, 0x161b28], 2);

  createPixelTexture(scene, 'enemy-drone', [
    [-1,-1,2,2,2,2,-1,-1],
    [-1,2,1,1,1,1,2,-1],
    [2,1,0,0,0,0,1,2],
    [2,1,0,1,1,0,1,2],
    [-1,2,1,1,1,1,2,-1],
    [-1,-1,2,2,2,2,-1,-1]
  ], [0xff8f8f, 0xd75a5a, 0x552323], 2);

  const hub = makeNoiseTile(3, 5, 0x2a3449, 0x313d55, 0x3a4863);
  createPixelTexture(scene, 'tile-hub-floor', hub.matrix, hub.palette, 2);
  const ship = makeNoiseTile(5, 4, 0x3a4a6a, 0x435576, 0x4b6085);
  createPixelTexture(scene, 'tile-ship-floor', ship.matrix, ship.palette, 2);
  const mine = makeNoiseTile(7, 6, 0x3a3340, 0x433b4b, 0x4d4457);
  createPixelTexture(scene, 'tile-mine-floor', mine.matrix, mine.palette, 2);
  const grass = makeNoiseTile(4, 9, 0x3f6f4f, 0x4b7f5c, 0x5f956f);
  createPixelTexture(scene, 'tile-grass', grass.matrix, grass.palette, 2);
  const dirt = makeNoiseTile(9, 5, 0x6b4d33, 0x78583b, 0x856548);
  createPixelTexture(scene, 'tile-dirt', dirt.matrix, dirt.palette, 2);

  createPixelTexture(scene, 'crop-sprout', [
    [-1,-1,1,1,-1,-1],
    [-1,1,0,0,1,-1],
    [1,0,0,0,0,1],
    [-1,1,0,0,1,-1],
    [-1,-1,1,1,-1,-1]
  ], [0x7fde84, 0x4c9f57], 2);

  createPixelTexture(scene, 'crop-ready', [
    [0,0,0,0,0,0],
    [0,1,1,1,1,0],
    [0,1,1,1,1,0],
    [0,1,1,1,1,0],
    [2,2,2,2,2,2]
  ], [0xd9ff86, 0xa6dd5b, 0x5d8231], 2);
}
