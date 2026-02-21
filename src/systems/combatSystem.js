export class CombatSystem {
  constructor() {
    this.enemy = { hp: 6, x: 300, y: 180, alive: true };
  }

  attackEnemy(playerX, playerY, damage) {
    if (!this.enemy.alive) return null;
    const dist = Math.hypot(this.enemy.x - playerX, this.enemy.y - playerY);
    if (dist > 70) return { hit: false };
    this.enemy.hp -= damage;
    if (this.enemy.hp <= 0) {
      this.enemy.alive = false;
      return { hit: true, defeated: true, loot: Math.random() > 0.4 ? 'ore' : 'scrap' };
    }
    return { hit: true, defeated: false };
  }

  resetDaily() {
    if (!this.enemy.alive) {
      this.enemy = { hp: 6, x: 300, y: 180, alive: true };
    }
  }

  toJSON() {
    return { enemy: this.enemy };
  }

  fromJSON(state) {
    this.enemy = state?.enemy || this.enemy;
  }
}
