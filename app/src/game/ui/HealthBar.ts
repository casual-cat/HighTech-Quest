import Phaser from "phaser";
import { UI_COLORS } from "../constants/game";

export class HealthBar {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private width: number;
  private maxHp: number;
  private currentHp: number;

  private background: Phaser.GameObjects.Rectangle;
  private fill: Phaser.GameObjects.Rectangle;
  private icon: Phaser.GameObjects.Sprite;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    maxHp: number,
    width: number = 100
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.maxHp = maxHp;
    this.currentHp = maxHp;

    this.background = this.scene.add
      .rectangle(x, y, width, 32, UI_COLORS.HEALTH_BAR_BG)
      .setOrigin(0, 0)
      .setScrollFactor(0);

    this.fill = this.scene.add
      .rectangle(x, y, width, 32, UI_COLORS.HEALTH_BAR_FILL)
      .setOrigin(0, 0)
      .setScrollFactor(0);

    this.icon = this.scene.add
      .sprite(x - 40, y + 16, "heart")
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0);

    if (!this.scene.anims.exists("heartBeat")) {
      this.scene.anims.create({
        key: "heartBeat",
        frames: this.scene.anims.generateFrameNumbers("heart", { start: 0, end: 1 }),
        frameRate: 2,
        repeat: -1
      });
    }

    this.icon.play("heartBeat");
  }

  setHealth(hp: number): HealthBar {
    this.currentHp = Phaser.Math.Clamp(hp, 0, this.maxHp);

    const fillWidth = (this.currentHp / this.maxHp) * this.width;
    this.fill.width = fillWidth;

    if (this.currentHp < this.maxHp * 0.25) {
      this.fill.fillColor = UI_COLORS.HEALTH_BAR_LOW;
    } else {
      this.fill.fillColor = UI_COLORS.HEALTH_BAR_FILL;
    }

    return this;
  }

  decrease(amount: number): HealthBar {
    this.setHealth(this.currentHp - amount);

    this.scene.tweens.add({
      targets: this.fill,
      alpha: 0.7,
      duration: 100,
      yoyo: true,
    });

    return this;
  }

  increase(amount: number): HealthBar {
    this.setHealth(this.currentHp + amount);

    this.scene.tweens.add({
      targets: this.fill,
      alpha: 1.2,
      duration: 100,
      yoyo: true,
    });

    return this;
  }

  getCurrentHealth(): number {
    return this.currentHp;
  }

  getMaxHealth(): number {
    return this.maxHp;
  }

  setPosition(x: number, y: number): HealthBar {
    const xDiff = x - this.x;
    const yDiff = y - this.y;

    this.x = x;
    this.y = y;

    this.background.x += xDiff;
    this.background.y += yDiff;
    this.fill.x += xDiff;
    this.fill.y += yDiff;
    this.icon.x += xDiff;
    this.icon.y += yDiff;

    return this;
  }

  setVisible(visible: boolean): HealthBar {
    this.background.setVisible(visible);
    this.fill.setVisible(visible);
    this.icon.setVisible(visible);

    return this;
  }

  destroy(): void {
    this.background.destroy();
    this.fill.destroy();
    this.icon.destroy();
  }
}
