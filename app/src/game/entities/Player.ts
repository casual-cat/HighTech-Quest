import Phaser from "phaser";
import { CHARACTER } from "../constants/game";
import { Character } from "./Character";

export class Player extends Character {
  private keys: any = {};
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    maxHealth: number = CHARACTER.HEALTH.MAX,
    textureKey: string = "character"
  ) {
    super(scene, x, y, maxHealth, textureKey);
    this.setupInput(scene);
  }

  setupInput(scene: Phaser.Scene) {
    if (!scene.input.keyboard) return;

    this.cursors = scene.input.keyboard.createCursorKeys();

    this.keys = {
      W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  handleMovement() {
    if (!(this as any).isMovementEnabled) return;
    this.setVelocity(0);

    const leftPressed = this.cursors?.left.isDown || this.keys.A.isDown;
    const rightPressed = this.cursors?.right.isDown || this.keys.D.isDown;
    const upPressed = this.cursors?.up.isDown || this.keys.W.isDown;
    const downPressed = this.cursors?.down.isDown || this.keys.S.isDown;

    const movingDiagonally =
      (leftPressed || rightPressed) && (upPressed || downPressed);
    const speed = movingDiagonally
      ? (this as any).characterSpeed * 0.7071 // lowers speed if moving diagonally
      : (this as any).characterSpeed;

    if (leftPressed) {
      this.setVelocityX(-speed);
    } else if (rightPressed) {
      this.setVelocityX(speed);
    }

    if (upPressed) {
      this.setVelocityY(-speed);
    } else if (downPressed) {
      this.setVelocityY(speed);
    }

    this.updateAnimation(leftPressed, rightPressed, upPressed, downPressed);
  }

  updateAnimation(
    leftPressed: any,
    rightPressed: any,
    upPressed: any,
    downPressed: any
  ) {
    if (leftPressed && !rightPressed) {
      this.anims.play("walk_horizontal", true);
      this.flipX = true;
      this.setLastDirection("left");
    } else if (rightPressed && !leftPressed) {
      this.anims.play("walk_horizontal", true);
      this.flipX = false;
      this.setLastDirection("right");
    } else if (upPressed && !downPressed) {
      this.anims.play("walk_up", true);
      this.flipX = true;
      this.setLastDirection("up");
    } else if (downPressed && !upPressed) {
      this.anims.play("walk_down", true);
      this.flipX = false;
      this.setLastDirection("down");
    } else {
      this.anims.play(`idle-${this.getLastDirection()}`, true);
      this.flipX = this.getLastDirection() === "left";
    }
  }

  update() {
    this.handleMovement();
  }
}
