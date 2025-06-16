import Phaser from "phaser";
import { Item } from "./Item";

export class Envelope extends Item {
  private floatTween?: Phaser.Tweens.Tween;
  private originalY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, frame: number) {
    super(scene, x, y, "icons");
    this.setFrame(frame);
    this.originalY = y;
  }

  highlight() {
    if (!this.isHighlighted) {
      super.highlight();

      this.floatTween = this.scene.tweens.add({
        targets: this,
        y: this.originalY - 5,
        duration: 400,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      });
    }
  }

  unhighlight() {
    if (this.isHighlighted) {
      super.unhighlight();

      if (this.floatTween) {
        this.floatTween.stop();
        this.floatTween = undefined;
        this.y = this.originalY;
      }
    }
  }

  onInteract(_player?: Phaser.Physics.Arcade.Sprite): void {
    console.log("Envelope interacted with!");
  }

  destroy() {
    if (this.floatTween) {
      this.floatTween.stop();
    }
    super.destroy();
  }
}
