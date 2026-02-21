import Phaser from 'phaser';

export class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.speed = 140;
    this.facing = { x: 1, y: 0 };
    this.sprite = scene.add.image(x, y, 'player-humanoid').setScale(1).setDepth(30);
  }

  update(cursors, deltaSec) {
    let dx = 0;
    let dy = 0;
    if (cursors.left.isDown) dx = -1;
    else if (cursors.right.isDown) dx = 1;
    if (cursors.up.isDown) dy = -1;
    else if (cursors.down.isDown) dy = 1;
    if (dx !== 0 || dy !== 0) {
      this.facing = { x: dx || this.facing.x, y: dy || this.facing.y };
      this.sprite.x += dx * this.speed * deltaSec;
      this.sprite.y += dy * this.speed * deltaSec;
      this.sprite.x = Phaser.Math.Clamp(this.sprite.x, 14, 626);
      this.sprite.y = Phaser.Math.Clamp(this.sprite.y, 14, 346);
    }
  }

  getInteractionPoint() {
    return {
      x: Math.round((this.sprite.x + this.facing.x * 28) / 32) * 32,
      y: Math.round((this.sprite.y + this.facing.y * 28) / 32) * 32
    };
  }
}
