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

export function registerPixelTextures(scene, look) {
  createPixelTexture(
    scene,
    'player-pixel',
    [
      [-1, -1, 2, 2, 2, 2, -1, -1],
      [-1, 2, 1, 1, 1, 1, 2, -1],
      [2, 1, 0, 0, 0, 0, 1, 2],
      [2, 1, 0, 3, 3, 0, 1, 2],
      [2, 1, 0, 0, 0, 0, 1, 2],
      [2, 1, 1, 1, 1, 1, 1, 2],
      [-1, 2, 1, 1, 1, 1, 2, -1],
      [-1, -1, 2, 2, 2, 2, -1, -1]
    ],
    [look.suit, look.visor, 0x1d2438, 0xffffff],
    3
  );

  createPixelTexture(scene, 'npc-pixel', [
    [-1, 2, 2, 2, 2, -1],
    [2, 1, 1, 1, 1, 2],
    [2, 1, 0, 0, 1, 2],
    [2, 1, 1, 1, 1, 2],
    [-1, 2, 1, 1, 2, -1],
    [-1, 2, -1, -1, 2, -1]
  ], [0xffffff, 0x5f6b87, 0x232838], 3);

  createPixelTexture(scene, 'enemy-drone', [
    [-1, -1, 2, 2, -1, -1],
    [-1, 2, 1, 1, 2, -1],
    [2, 1, 0, 0, 1, 2],
    [-1, 2, 1, 1, 2, -1],
    [-1, -1, 2, 2, -1, -1]
  ], [0xffa7a7, 0xe15a5a, 0x5f2121], 4);

  createPixelTexture(scene, 'crop-sprout', [
    [-1, 1, -1],
    [1, 0, 1],
    [-1, 1, -1]
  ], [0x7fde84, 0x4c9f57], 4);

  createPixelTexture(scene, 'crop-ready', [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [2, 2, 2, 2]
  ], [0xd9ff86, 0xa6dd5b, 0x5d8231], 3);
}
