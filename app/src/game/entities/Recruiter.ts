import Phaser from "phaser";
import { Character } from "./Character";

export class Recruiter extends Character {
  constructor(scene: Phaser.Scene, x: number, y: number, textureKey: string) {
    super(scene, x, y, 1, textureKey);

    this.disableMovement();
    this.createAnimations(textureKey);
    this.anims.play(`${textureKey}-idle`, true);
  }

  public override createAnimations(textureKey: string) {
    const animKey = `${textureKey}-idle`;
    if (this.scene.anims.exists(animKey)) return;

    this.scene.anims.create({
      key: animKey,
      frames: this.scene.anims.generateFrameNumbers(textureKey, {
        start: 0,
        end: 1,
      }),
      frameRate: 4,
      repeat: -1,
    });
  }

  override update() {}
}
