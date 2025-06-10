import Phaser from "phaser";
import { Player } from "./Player";
import { Item } from "./Item";

export class Chest extends Item {
  private readonly SCALE_ANIMATION = {
    duration: 200,
    ease: "Sine.easeInOut",
    scale: 1.2,
  };
  private readonly INTERACTION_DISTANCE = 50;
  private isOpened = false;
  private enlargedTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number, frame: number) {
    super(scene, x, y, "icons");
    this.setFrame(frame);
  }

  public isChestOpened(): boolean {
    return this.isOpened;
  }

  public markAsCollected() {
    this.isOpened = true;
    this.setTint(0x666666);
    this.disableInteractive();
    this.animateScale(1);
  }

  highlight() {
    if (this.isOpened) return;

    if (!this.isHighlighted) {
      this.isHighlighted = true;
      this.setInteractive({ useHandCursor: true });
      this.on(
        "pointerdown",
        () => this.currentPlayer && this.onInteract(this.currentPlayer)
      );
      this.animateScale(this.SCALE_ANIMATION.scale);
    }
  }

  unhighlight() {
    if (this.isOpened) return;

    if (this.isHighlighted) {
      this.isHighlighted = false;
      this.disableInteractive();
      this.removeAllListeners("pointerdown");
      this.animateScale(1);
    }
  }

  onInteract(player?: Phaser.Physics.Arcade.Sprite): void {
    if (!this.isOpened) {
      this.tryOpen();
    }
  }

  private animateScale(targetScale: number) {
    if (this.enlargedTween) {
      this.enlargedTween.stop();
      this.enlargedTween = undefined;
    }

    this.enlargedTween = this.scene.tweens.add({
      targets: this,
      scale: targetScale,
      duration: this.SCALE_ANIMATION.duration,
      ease: this.SCALE_ANIMATION.ease,
    });
  }

  private tryOpen() {
    if (this.isOpened) return;

    const player = this.scene.children.list.find(
      (child) => child instanceof Player
    ) as Player;

    if (!player) return;

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      player.x,
      player.y
    );

    if (distance < this.INTERACTION_DISTANCE) {
      this.open();
    }
  }

  private open() {
    if (this.isOpened) return;
    this.scene.scene.launch("PuzzleScene");
    this.scene.scene.pause("MainScene");
  }

  destroy() {
    if (this.enlargedTween) {
      this.enlargedTween.stop();
      this.enlargedTween = undefined;
    }
    super.destroy();
  }
}
