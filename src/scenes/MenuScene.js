import Phaser from 'phaser';
import { SaveSystem } from '../systems/saveSystem';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.add.text(140, 80, 'SkyLands Foundation v1', { fontSize: '24px', color: '#6ef2ff' });
    this.add.text(140, 130, 'N: New Game', { fontSize: '16px' });
    this.add.text(140, 160, 'L: Load Game', { fontSize: '16px' });
    this.add.text(140, 190, 'Controls shown in README + in HUD', { fontSize: '14px', color: '#c7ffd9' });

    this.input.keyboard.on('keydown-N', () => this.scene.start('CharacterCreateScene', { load: false }));
    this.input.keyboard.on('keydown-L', () => {
      const save = SaveSystem.load();
      if (save) this.scene.start('GameScene', { save });
      else this.add.text(140, 230, 'No save found.', { fontSize: '14px', color: '#ff9a9a' });
    });
  }
}
