import Phaser from "phaser";
import { COIN_SCORE } from "../utils/Constants";

export class Coin extends Phaser.Physics.Arcade.Sprite {
  private value: number = COIN_SCORE;
  private collected: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, value: number = COIN_SCORE) {
    super(scene, x, y, "coin");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.value = value;
    this.setupAnimations();
  }

  setupAnimations() {
    if (!this.anims.exists("spin")) {
      this.scene.anims.create({
        key: "spin",
        frames: this.anims.generateFrameNumbers("coin", {
          start: 0,
          end: 3,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    this.anims.play("spin", true);
  }

  collect() {
    if (this.collected) return 0;

    this.collected = true;
    this.disableBody(true, true);
    return this.value;
  }
}
