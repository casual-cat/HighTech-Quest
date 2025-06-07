import Phaser from "phaser";

export abstract class Item extends Phaser.Physics.Arcade.Sprite {
  private readonly INTERACTION_RANGE = 50;
  protected isHighlighted = false;
  private interactionKey: Phaser.Input.Keyboard.Key;
  protected currentPlayer?: Phaser.Physics.Arcade.Sprite;

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

  update(player: Phaser.Physics.Arcade.Sprite) {
    this.currentPlayer = player;
    const isInRange = this.isPlayerInRange(player);

    if (isInRange) {
      this.handleInRange(player);
    } else {
      this.handleOutOfRange();
    }
  }

  private handleInRange(player: Phaser.Physics.Arcade.Sprite) {
    this.highlight();
    if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
      this.onInteract(player);
    }
  }

  private handleOutOfRange() {
    this.unhighlight();
  }

  private isPlayerInRange(player: Phaser.Physics.Arcade.Sprite): boolean {
    return (
      Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y) <=
      this.INTERACTION_RANGE
    );
  }

  highlight() {
    if (!this.isHighlighted) {
      this.isHighlighted = true;
      this.setInteractive({ useHandCursor: true });
      this.on(
        "pointerdown",
        () => this.currentPlayer && this.onInteract(this.currentPlayer)
      );
    }
  }

  unhighlight() {
    if (this.isHighlighted) {
      this.isHighlighted = false;
      this.disableInteractive();
      this.removeAllListeners("pointerdown");
    }
  }

  abstract onInteract(player: Phaser.Physics.Arcade.Sprite): void;
}
