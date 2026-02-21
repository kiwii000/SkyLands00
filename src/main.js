import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { CharacterCreateScene } from './scenes/CharacterCreateScene';
import { GameScene } from './scenes/GameScene';
import { GAME_HEIGHT, GAME_WIDTH } from './utils/constants';

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'app',
  pixelArt: true,
  backgroundColor: '#0b1020',
  scene: [BootScene, MenuScene, CharacterCreateScene, GameScene]
};

new Phaser.Game(config);
