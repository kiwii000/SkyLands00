import Phaser from 'phaser';

const SUITS = [0x6ef2ff, 0xff8bf3, 0xa4ff9b, 0xffd580];
const VISORS = [0xffffff, 0xfff4a8, 0xc2c7ff, 0xb9ffe2];

export class CharacterCreateScene extends Phaser.Scene {
  constructor() {
    super('CharacterCreateScene');
    this.suitIndex = 0;
    this.visorIndex = 0;
  }

  create() {
    this.add.text(170, 50, 'Character Creator', { fontSize: '24px', color: '#6ef2ff' });
    this.preview = this.add.rectangle(320, 170, 40, 40, SUITS[this.suitIndex]).setStrokeStyle(5, VISORS[this.visorIndex]);

    const updateLabel = () => {
      this.label?.destroy();
      this.label = this.add.text(180, 240, `Suit [A/D]: ${this.suitIndex + 1}  |  Visor [W/S]: ${this.visorIndex + 1}`, { fontSize: '14px' });
      this.preview.setFillStyle(SUITS[this.suitIndex]);
      this.preview.setStrokeStyle(5, VISORS[this.visorIndex]);
    };

    updateLabel();
    this.add.text(180, 270, 'R: Randomize  ENTER: Start', { fontSize: '14px', color: '#c7ffd9' });

    this.input.keyboard.on('keydown-A', () => { this.suitIndex = (this.suitIndex + SUITS.length - 1) % SUITS.length; updateLabel(); });
    this.input.keyboard.on('keydown-D', () => { this.suitIndex = (this.suitIndex + 1) % SUITS.length; updateLabel(); });
    this.input.keyboard.on('keydown-W', () => { this.visorIndex = (this.visorIndex + 1) % VISORS.length; updateLabel(); });
    this.input.keyboard.on('keydown-S', () => { this.visorIndex = (this.visorIndex + VISORS.length - 1) % VISORS.length; updateLabel(); });
    this.input.keyboard.on('keydown-R', () => {
      this.suitIndex = Phaser.Math.Between(0, SUITS.length - 1);
      this.visorIndex = Phaser.Math.Between(0, VISORS.length - 1);
      updateLabel();
    });
    this.input.keyboard.on('keydown-ENTER', () => {
      this.scene.start('GameScene', { look: { suit: SUITS[this.suitIndex], visor: VISORS[this.visorIndex] } });
    });
  }
}
