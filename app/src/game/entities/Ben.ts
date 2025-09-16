import Phaser from "phaser";
import { Character } from "./Character";

export class Ben extends Character {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 1, "ben");

    scene.physics.world.disable(this);

    scene.physics.add.existing(this, true);

    this.disableMovement();
    this.createAnimations();
    this.anims.play("ben-idle", true);

    this.setImmovable(true);
  }

  public override createAnimations() {
    const animKey = "ben-idle";
    if (this.scene.anims.exists(animKey)) return;

    this.scene.anims.create({
      key: animKey,
      frames: this.scene.anims.generateFrameNumbers("ben", {
        start: 2,
        end: 2,
      }),
      frameRate: 4,
      repeat: -1,
    });
  }

  public interact(): void {
    console.log("Ben interaction triggered!");
  }
}
