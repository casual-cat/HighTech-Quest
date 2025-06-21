import Phaser from "phaser";
import { UI, THEME } from "../constants/game";

export class HealthBar {
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
        this.x - UI.HEALTH_BAR.DIMENSIONS.ICON_OFFSET,
        this.y + UI.HEALTH_BAR.DIMENSIONS.HEIGHT / 2 - 1,
        "batteryFull"
      )
      .setOrigin(0.5)
      .setScrollFactor(0);
  }

  private createText(): void {
    this.text = this.scene.add
      .text(
        this.x + this.width / 2,
        this.y + UI.HEALTH_BAR.DIMENSIONS.HEIGHT / 2,
        "",
        {
          fontSize: UI.HEALTH_BAR.STYLE.FONT_SIZE,
          color: THEME.COLORS.TEXT.PRIMARY,
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0);
  }

  private drawBar(): void {
    this.bar.clear();
    this.bar.fillStyle(UI.HEALTH_BAR.COLORS.BACKGROUND);
    this.bar.fillRoundedRect(
      this.x,
      this.y,
      this.width,
      UI.HEALTH_BAR.DIMENSIONS.HEIGHT,
      UI.HEALTH_BAR.DIMENSIONS.RADIUS
    );
    this.bar.lineStyle(
      UI.HEALTH_BAR.DIMENSIONS.LINE_WIDTH,
      this.currentHp < this.maxHp * 0.1
        ? UI.HEALTH_BAR.COLORS.NO_HEALTH
        : this.currentHp < this.maxHp * 0.5
        ? UI.HEALTH_BAR.COLORS.LOW_HEALTH
        : UI.HEALTH_BAR.COLORS.FULL_HEALTH
    );
    this.bar.strokeRoundedRect(
      this.x,
      this.y,
      this.width,
      UI.HEALTH_BAR.DIMENSIONS.HEIGHT,
      UI.HEALTH_BAR.DIMENSIONS.RADIUS
    );
  }

  setHealth(hp: number): HealthBar {
    this.currentHp = Phaser.Math.Clamp(hp, 0, this.maxHp);
    this.updateFill();
    this.updateText();
    return this;
  }

  private updateFill(): void {
    this.fill.clear();

    if (this.currentHp === 0) {
      return;
    }

    const fillWidth = Math.max(
      (this.currentHp / this.maxHp) * this.width,
      UI.HEALTH_BAR.DIMENSIONS.HEIGHT
    );

    this.fill.fillStyle(
      this.currentHp < this.maxHp * 0.1
        ? UI.HEALTH_BAR.COLORS.NO_HEALTH
        : this.currentHp < this.maxHp * 0.5
        ? UI.HEALTH_BAR.COLORS.LOW_HEALTH
        : UI.HEALTH_BAR.COLORS.FULL_HEALTH
    );
    this.fill.fillRoundedRect(
      this.x,
      this.y,
      fillWidth,
      UI.HEALTH_BAR.DIMENSIONS.HEIGHT,
      UI.HEALTH_BAR.DIMENSIONS.RADIUS
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
