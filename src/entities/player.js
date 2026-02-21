export class Player {
  constructor(scene, x, y, color = 0x6ef2ff) {
    this.scene = scene;
    this.speed = 140;
    this.facing = { x: 1, y: 0 };
    this.sprite = scene.add.rectangle(x, y, 18, 18, color).setStrokeStyle(2, 0xffffff);
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
      this.sprite.x = Phaser.Math.Clamp(this.sprite.x, 10, 630);
      this.sprite.y = Phaser.Math.Clamp(this.sprite.y, 10, 350);
    }
  }

  getInteractionPoint() {
    return {
      x: Math.round((this.sprite.x + this.facing.x * 24) / 32) * 32,
      y: Math.round((this.sprite.y + this.facing.y * 24) / 32) * 32
    };
  }
}
