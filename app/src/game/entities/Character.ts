import Phaser from "phaser";
import EasyStar from "easystarjs";
import { WORLD, CHARACTER } from "../constants/game";
import { SpeechManager } from "../../managers/SpeechManager";

export class Character extends Phaser.Physics.Arcade.Sprite {
  private characterSpeed: number = CHARACTER.SPEED;
  private lastDirection: "up" | "down" | "left" | "right" = "down";
  private health: number;
  private maxHealth: number;
  private isMovementEnabled: boolean = true;
  private easyStar?: EasyStar.js;
  private pathfindingGrid?: number[][];
  private acceptableTiles?: number[];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    maxHealth: number = CHARACTER.HEALTH.MAX,
    textureKey: string = "character"
  ) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHealth = maxHealth;
    this.health = maxHealth;

    this.setCollideWorldBounds(true);
    this.setupCollisionBody();
    this.createAnimations(textureKey);
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
  }

  updateAnimation(
    leftPressed: any,
    rightPressed: any,
    upPressed: any,
    downPressed: any
  ) {}

  update() {
    this.handleMovement();
  }

  setupCollisionBody() {
    const spriteWidth = this.width;
    const spriteHeight = this.height;

    const collisionWidth = 24;
    const collisionHeight = 24;

    const offsetX = (spriteWidth - collisionWidth) / 2;
    const offsetY = spriteHeight - collisionHeight;

    if (this.body) {
      this.body.setSize(collisionWidth, collisionHeight);
      this.body.setOffset(offsetX, offsetY);
    }
  }

  public getLastDirection() {
    return this.lastDirection;
  }

  public setLastDirection(direction: "up" | "down" | "left" | "right") {
    this.lastDirection = direction;
  }

  public setPathfindingGrid(grid: number[][], acceptableTiles: number[] = [0]) {
    this.pathfindingGrid = grid;
    this.acceptableTiles = acceptableTiles;
    if (!this.easyStar) {
      this.easyStar = new EasyStar.js();
    }
    this.easyStar.setGrid(grid);
    this.easyStar.setAcceptableTiles(acceptableTiles);
  }

  public findPathTo(
    targetTileX: number,
    targetTileY: number,
    onComplete: (path: { x: number; y: number }[] | null) => void
  ) {
    if (!this.easyStar || !this.pathfindingGrid) {
      console.warn("Pathfinding grid not set for character");
      onComplete(null);
      return;
    }
    const startTileX = Math.floor(this.x / WORLD.TILE.WIDTH);
    const startTileY = Math.floor(this.y / WORLD.TILE.HEIGHT);
    this.easyStar.findPath(
      startTileX,
      startTileY,
      targetTileX,
      targetTileY,
      (path: any) => {
        onComplete(path);
      }
    );
    this.easyStar.calculate();
  }

  public followPath(path: { x: number; y: number }[], onComplete?: () => void) {
    if (!path || path.length === 0) {
      if (onComplete) onComplete();
      return;
    }
    this.disableMovement();
    let step = 0;
    const moveToNext = () => {
      if (step >= path.length) {
        this.anims.play(`idle-${this.getLastDirection()}`, true);
        this.enableMovement();
        if (onComplete) onComplete();
        return;
      }
      const { x, y } = path[step];
      const worldX = x * WORLD.TILE.WIDTH + WORLD.TILE.WIDTH / 2;
      const worldY = y * WORLD.TILE.HEIGHT + WORLD.TILE.HEIGHT / 2;
      let direction: "up" | "down" | "left" | "right" = this.getLastDirection();
      if (step > 0) {
        const prev = path[step - 1];
        if (x > prev.x) direction = "right";
        else if (x < prev.x) direction = "left";
        else if (y > prev.y) direction = "down";
        else if (y < prev.y) direction = "up";
      }
      if (direction === "left" || direction === "right") {
        this.anims.play("walk_horizontal", true);
        this.flipX = direction === "left";
      } else if (direction === "up") {
        this.anims.play("walk_up", true);
        this.flipX = true;
      } else if (direction === "down") {
        this.anims.play("walk_down", true);
        this.flipX = false;
      }
      this.setLastDirection(direction);
      this.scene.tweens.add({
        targets: this,
        x: worldX,
        y: worldY,
        duration: 200,
        onComplete: () => {
          step++;
          moveToNext();
        },
      });
    };
    moveToNext();
  }

  public say(
    speechManager: SpeechManager,
    lines: string[],
    options?: {
      onStart?: () => void;
      onComplete?: () => void;
      duration?: number;
    }
  ): void {
    speechManager.showSpeech(lines, {
      ...options,
      target: this,
    });
  }
}
