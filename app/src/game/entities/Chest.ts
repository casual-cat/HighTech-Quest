import Phaser from "phaser";
import { Item } from "./Item";

export class Chest extends Item {
  private enlargedTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number, frame: number) {
    super(scene, x, y, "icons");
    this.setFrame(frame);
  }

  highlight() {
    if (!this.isHighlighted) {
      super.highlight();

      this.enlargedTween = this.scene.tweens.add({
        targets: this,
        scale: 1.2,
        duration: 200,
        ease: 'Sine.easeInOut',
      });
    }
  }

  unhighlight() {
    if (this.isHighlighted) {
      super.unhighlight();
      
      if (this.enlargedTween) {
        this.enlargedTween.stop();
        this.enlargedTween = undefined;
      }

      this.scene.tweens.add({
        targets: this,
        scale: 1,
        duration: 200,
        ease: 'Sine.easeInOut'
      });
    }
  }

  onInteract(player: Phaser.Physics.Arcade.Sprite): void {
    this.scene.scene.pause();
    this.scene.scene.launch("PuzzleScene");
  }
} 