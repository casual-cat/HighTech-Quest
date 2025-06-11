import Phaser from "phaser";
import { PLAYER } from "../constants/game";

export class Player extends Phaser.Physics.Arcade.Sprite {
  private keys: any = {};
  private playerSpeed: number = PLAYER.SPEED;
  private lastDirection: "up" | "down" | "left" | "right" = "down";
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private health: number;
  private maxHealth: number;
  private isMovementEnabled: boolean = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    maxHealth: number = PLAYER.HEALTH.MAX,
    textureKey: string = "character"
  ) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHealth = maxHealth;
    this.health = maxHealth;

    this.setCollideWorldBounds(true);
    this.createAnimations(textureKey);
    this.setupInput(scene);
  }

  getHealth() {
    return this.health;
  }

  getMaxHealth() {
    return this.maxHealth;
  }

  damage(amount: number) {
    this.health = Math.max(0, this.health - amount);
    return this.health;
  }

  heal(amount: number) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    return this.health;
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

  createAnimations(textureKey: string) {
    this.anims.create({
      key: "walk_down",
      frames: this.anims.generateFrameNumbers(textureKey, {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "walk_horizontal",
      frames: this.anims.generateFrameNumbers(textureKey, {
        start: 6,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "walk_up",
      frames: this.anims.generateFrameNumbers(textureKey, {
        start: 3,
        end: 4,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "idle-down",
      frames: [{ key: textureKey, frame: 2 }],
      frameRate: 10,
    });
    this.anims.create({
      key: "idle-left",
      frames: [{ key: textureKey, frame: 8 }],
      frameRate: 10,
    });
    this.anims.create({
      key: "idle-right",
      frames: [{ key: textureKey, frame: 8 }],
      frameRate: 10,
    });
    this.anims.create({
      key: "idle-up",
      frames: [{ key: textureKey, frame: 5 }],
      frameRate: 10,
    });
  }

  disableMovement() {
    this.isMovementEnabled = false;
    this.setVelocity(0);
    this.anims.play(`idle-${this.lastDirection}`, true);
  }

  enableMovement() {
    this.isMovementEnabled = true;
  }

  handleMovement() {
    if (!this.isMovementEnabled) return;

    this.setVelocity(0);

    const leftPressed = this.cursors?.left.isDown || this.keys.A.isDown;
    const rightPressed = this.cursors?.right.isDown || this.keys.D.isDown;
    const upPressed = this.cursors?.up.isDown || this.keys.W.isDown;
    const downPressed = this.cursors?.down.isDown || this.keys.S.isDown;

    const movingDiagonally =
      (leftPressed || rightPressed) && (upPressed || downPressed);
    const speed = movingDiagonally
      ? this.playerSpeed * 0.7071 // lowers speed if moving diagonally
      : this.playerSpeed;

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
      this.lastDirection = "left";
    } else if (rightPressed && !leftPressed) {
      this.anims.play("walk_horizontal", true);
      this.flipX = false;
      this.lastDirection = "right";
    } else if (upPressed && !downPressed) {
      this.anims.play("walk_up", true);
      this.flipX = true;
      this.lastDirection = "up";
    } else if (downPressed && !upPressed) {
      this.anims.play("walk_down", true);
      this.flipX = false;
      this.lastDirection = "down";
    } else {
      this.anims.play(`idle-${this.lastDirection}`, true);
      this.flipX = this.lastDirection === "left";
    }
  }

  update() {
    this.handleMovement();
  }
}
