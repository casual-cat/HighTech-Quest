import Phaser from "phaser";

export abstract class Item extends Phaser.Physics.Arcade.Sprite {
  private interactionRange: number = 50;
  protected isHighlighted: boolean = false;
  private interactionKey: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    if (!scene.input.keyboard) {
      throw new Error("Keyboard input is not available");
    }
    this.interactionKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );
  }

  isPlayerInRange(player: Phaser.Physics.Arcade.Sprite): boolean {
    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      player.x,
      player.y
    );
    return distance <= this.interactionRange;
  }

  highlight() {
    if (!this.isHighlighted) {
      this.isHighlighted = true;
    }
  }

  unhighlight() {
    if (this.isHighlighted) {
      this.isHighlighted = false;
    }
  }

  abstract onInteract(player: Phaser.Physics.Arcade.Sprite): void;

  update(player: Phaser.Physics.Arcade.Sprite) {
    if (this.isPlayerInRange(player)) {
      this.highlight();
      if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
        this.onInteract(player);
      }
    } else {
      this.unhighlight();
    }
  }
}
