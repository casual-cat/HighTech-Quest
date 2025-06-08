import Phaser from "phaser";
import { UI_COLORS } from "../constants/game";

export class HealthBar {
  private static readonly HEIGHT = 24;
  private static readonly RADIUS = 12;
  private static readonly LINE_WIDTH = 1;
  private static readonly LINE_COLOR = 0xff0000;
  private static readonly BG_COLOR = 0xcccccc;
  private static readonly FONT_SIZE = "14px";
  private static readonly TEXT_COLOR = "#ffffff";
  private static readonly ICON_OFFSET = 24;

  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private width: number;
  private maxHp: number;
  private currentHp: number;

  private bar!: Phaser.GameObjects.Graphics;
  private fill!: Phaser.GameObjects.Graphics;
  private icon!: Phaser.GameObjects.Sprite;
  private text!: Phaser.GameObjects.Text;

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

    this.initialize();
  }

  private initialize(): void {
    this.createGameObjects();
    this.setupHeartAnimation();
    this.setHealth(this.maxHp);
  }

  private createGameObjects(): void {
    this.createBar();
    this.createFill();
    this.createIcon();
    this.createText();
  }

  private createBar(): void {
    this.bar = this.scene.add.graphics();
    this.bar.setScrollFactor(0);
    this.drawBar();
  }

  private createFill(): void {
    this.fill = this.scene.add.graphics();
    this.fill.setScrollFactor(0);
  }

  private createIcon(): void {
    this.icon = this.scene.add
      .sprite(
        this.x - HealthBar.ICON_OFFSET,
        this.y + HealthBar.HEIGHT / 2,
        "heart"
      )
      .setOrigin(0.5)
      .setScrollFactor(0);
  }

  private createText(): void {
    this.text = this.scene.add
      .text(this.x + this.width / 2, this.y + HealthBar.HEIGHT / 2, "", {
        fontSize: HealthBar.FONT_SIZE,
        color: HealthBar.TEXT_COLOR,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
  }

  private setupHeartAnimation(): void {
    if (!this.scene.anims.exists("heartBeat")) {
      this.scene.anims.create({
        key: "heartBeat",
        frames: this.scene.anims.generateFrameNumbers("heart", {
          start: 0,
          end: 1,
        }),
        frameRate: 2,
        repeat: -1,
      });
    }
    this.icon.play("heartBeat");
  }

  private drawBar(): void {
    this.bar.clear();
    this.bar.fillStyle(HealthBar.BG_COLOR);
    this.bar.fillRoundedRect(
      this.x,
      this.y,
      this.width,
      HealthBar.HEIGHT,
      HealthBar.RADIUS
    );
    this.bar.lineStyle(HealthBar.LINE_WIDTH, HealthBar.LINE_COLOR);
    this.bar.strokeRoundedRect(
      this.x,
      this.y,
      this.width,
      HealthBar.HEIGHT,
      HealthBar.RADIUS
    );
  }

  setHealth(hp: number): HealthBar {
    this.currentHp = Phaser.Math.Clamp(hp, 0, this.maxHp);
    this.updateFill();
    this.updateText();
    return this;
  }

  private updateFill(): void {
    const fillWidth = Math.max(
      (this.currentHp / this.maxHp) * this.width,
      HealthBar.HEIGHT
    );

    this.fill.clear();
    this.fill.fillStyle(
      this.currentHp < this.maxHp * 0.25
        ? UI_COLORS.HEALTH_BAR_LOW
        : UI_COLORS.HEALTH_BAR_FILL
    );
    this.fill.fillRoundedRect(
      this.x,
      this.y,
      fillWidth,
      HealthBar.HEIGHT,
      HealthBar.RADIUS
    );
  }

  private updateText(): void {
    this.text.setText(`${Math.floor(this.currentHp)}/${this.maxHp}`);
  }

  decrease(amount: number): HealthBar {
    this.setHealth(this.currentHp - amount);
    this.animateFill(0.7);
    return this;
  }

  increase(amount: number): HealthBar {
    this.setHealth(this.currentHp + amount);
    this.animateFill(1.2);
    return this;
  }

  private animateFill(targetAlpha: number): void {
    this.scene.tweens.add({
      targets: this.fill,
      alpha: targetAlpha,
      duration: 100,
      yoyo: true,
    });
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

    this.drawBar();
    this.updatePositions(xDiff, yDiff);
    this.setHealth(this.currentHp);

    return this;
  }

  private updatePositions(xDiff: number, yDiff: number): void {
    this.icon.x += xDiff;
    this.icon.y += yDiff;
    this.text.x += xDiff;
    this.text.y += yDiff;
  }

  setVisible(visible: boolean): HealthBar {
    this.bar.setVisible(visible);
    this.fill.setVisible(visible);
    this.icon.setVisible(visible);
    this.text.setVisible(visible);
    return this;
  }

  destroy(): void {
    this.bar.destroy();
    this.fill.destroy();
    this.icon.destroy();
    this.text.destroy();
  }
}
