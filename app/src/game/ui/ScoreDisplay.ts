import Phaser from "phaser";

export class ScoreDisplay {
  private scene: Phaser.Scene;
  private scoreText: Phaser.GameObjects.Text;
  private score: number = 0;
  private x: number;
  private y: number;
  private fontSize: string;
  private fontColor: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    fontSize: string = "32px",
    fontColor: string = "#000"
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.fontSize = fontSize;
    this.fontColor = fontColor;

    this.scoreText = this.scene.add.text(this.x, this.y, `${this.score}`, {
      fontSize: this.fontSize,
      color: this.fontColor,
    });

    this.scoreText.setScrollFactor(0);
  }

  addScore(value: number): void {
    this.score += value;
    this.updateDisplay();
  }

  setScore(value: number): void {
    this.score = value;
    this.updateDisplay();
  }

  getScore(): number {
    return this.score;
  }

  private updateDisplay(): void {
    this.scoreText.setText(`${this.score}`);
  }

  hide(): void {
    this.scoreText.setVisible(false);
  }

  show(): void {
    this.scoreText.setVisible(true);
  }
}
