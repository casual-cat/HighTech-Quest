import Phaser from "phaser";
import { UI, THEME } from "../game/constants/game";

export class MotivationBar {
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
    this.createMotivationBar();
    this.setHealth(this.maxHp);
  }

  private createMotivationBar(): void {
    this.bar = this.scene.add.graphics();
    this.bar.setScrollFactor(0);

    this.fill = this.scene.add.graphics();
    this.fill.setScrollFactor(0);

    this.icon = this.scene.add
      .sprite(
        this.x - UI.HEALTH_BAR.DIMENSIONS.ICON_OFFSET,
        this.y + UI.HEALTH_BAR.DIMENSIONS.HEIGHT / 2 - 1,
        "batteryFull"
      )
      .setOrigin(0.5)
      .setScrollFactor(0);

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

  setHealth(hp: number): MotivationBar {
    this.currentHp = Phaser.Math.Clamp(hp, 0, this.maxHp);

    const healthPercentage = this.currentHp / this.maxHp;
    let barColor: number;
    let barIcon: string;

    if (healthPercentage > 0.5) {
      barColor = UI.HEALTH_BAR.COLORS.FULL_HEALTH;
      barIcon = "batteryFull";
    } else if (healthPercentage > 0.1) {
      barColor = UI.HEALTH_BAR.COLORS.LOW_HEALTH;
      barIcon = "batteryHalf";
    } else {
      barColor = UI.HEALTH_BAR.COLORS.NO_HEALTH;
      barIcon = "batteryEmpty";
    }

    this.updateMotivationBar(barColor, barIcon);
    return this;
  }

  private updateMotivationBar(barColor: number, barIcon: string): void {
    this.bar.clear();
    this.bar.fillStyle(UI.HEALTH_BAR.COLORS.BACKGROUND);
    this.bar.fillRoundedRect(
      this.x,
      this.y,
      this.width,
      UI.HEALTH_BAR.DIMENSIONS.HEIGHT,
      UI.HEALTH_BAR.DIMENSIONS.RADIUS
    );
    this.bar.lineStyle(UI.HEALTH_BAR.DIMENSIONS.LINE_WIDTH, barColor);
    this.bar.strokeRoundedRect(
      this.x,
      this.y,
      this.width,
      UI.HEALTH_BAR.DIMENSIONS.HEIGHT,
      UI.HEALTH_BAR.DIMENSIONS.RADIUS
    );

    this.fill.clear();
    if (this.currentHp > 0) {
      const fillWidth = Math.max(
        (this.currentHp / this.maxHp) * this.width,
        UI.HEALTH_BAR.DIMENSIONS.HEIGHT
      );
      this.fill.fillStyle(barColor);
      this.fill.fillRoundedRect(
        this.x,
        this.y,
        fillWidth,
        UI.HEALTH_BAR.DIMENSIONS.HEIGHT,
        UI.HEALTH_BAR.DIMENSIONS.RADIUS
      );
    }

    this.icon.setTexture(barIcon);

    this.text.setText(`${Math.floor(this.currentHp)}/${this.maxHp}`);
  }

  decrease(amount: number): MotivationBar {
    this.setHealth(this.currentHp - amount);
    this.animateFill(0.7);
    return this;
  }

  increase(amount: number): MotivationBar {
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

  setPosition(x: number, y: number): MotivationBar {
    const xDiff = x - this.x;
    const yDiff = y - this.y;

    this.x = x;
    this.y = y;

    this.setHealth(this.currentHp);
    this.updatePositions(xDiff, yDiff);

    return this;
  }

  private updatePositions(xDiff: number, yDiff: number): void {
    this.icon.x += xDiff;
    this.icon.y += yDiff;
    this.text.x += xDiff;
    this.text.y += yDiff;
  }

  setVisible(visible: boolean): MotivationBar {
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
