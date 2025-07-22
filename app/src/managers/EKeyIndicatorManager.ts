import Phaser from "phaser";
import { Player } from "../game/entities/Player";

export class EKeyIndicator {
  private scene: Phaser.Scene;
  private player: Player;
  private interactableGroup: Phaser.Physics.Arcade.StaticGroup;

  private eKeyIndicator?: Phaser.GameObjects.Image;
  private eKeyTween?: Phaser.Tweens.Tween;

  private lastObject?: Phaser.GameObjects.Sprite;
  private lastY?: number;
  private targetObject?: Phaser.GameObjects.Sprite;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    interactableGroup: Phaser.Physics.Arcade.StaticGroup
  ) {
    this.scene = scene;
    this.player = player;
    this.interactableGroup = interactableGroup;
  }

  update() {
    if (!this.player || !this.interactableGroup) return;

    let closestObject: Phaser.GameObjects.Sprite | null = null;
    let minDistance = 64;

    this.interactableGroup.children.each((obj) => {
      const sprite = obj as Phaser.Physics.Arcade.Sprite;
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        sprite.x,
        sprite.y
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestObject = sprite;
      }
      return true;
    });

    if (closestObject) {
      const obj = closestObject as Phaser.Physics.Arcade.Sprite;
      const topY = obj.y;

      if (this.lastObject !== obj || this.lastY !== topY) {
        if (!this.eKeyIndicator) {
          this.eKeyIndicator = this.scene.add
            .image(0, 0, "eKey")
            .setOrigin(0, 1);
          this.eKeyIndicator.setDepth(10);
        }

        this.eKeyIndicator.setVisible(true);
        this.eKeyIndicator.setPosition(obj.x, topY);

        if (this.eKeyTween) this.eKeyTween.stop();

        this.eKeyTween = this.scene.tweens.add({
          targets: this.eKeyIndicator,
          y: { from: topY, to: topY - 8 },
          duration: 500,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });

        this.lastObject = obj;
        this.lastY = topY;
        this.targetObject = obj;
      }
    } else {
      if (this.eKeyIndicator) {
        this.eKeyIndicator.setVisible(false);
      }
      if (this.eKeyTween) {
        this.eKeyTween.stop();
        this.eKeyTween = undefined;
      }

      this.lastObject = undefined;
      this.lastY = undefined;
      this.targetObject = undefined;
    }
  }

  getTarget(): Phaser.GameObjects.Sprite | undefined {
    return this.targetObject;
  }

  destroy() {
    this.eKeyIndicator?.destroy();
    this.eKeyTween?.stop();
  }
}
