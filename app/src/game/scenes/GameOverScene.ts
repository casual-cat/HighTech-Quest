import Phaser from "phaser";
import { GAME_OVER_CONFIG } from "../constants/gameOver";

export class GameOverScene extends Phaser.Scene {
  private returnSceneKey?: string;

  constructor() {
    super({ key: "GameOverScene" });
  }

  init(data: { returnScene?: string }) {
    this.returnSceneKey = data.returnScene;
  }

  static handleGameOver(scene: Phaser.Scene): void {
    scene.cameras.main.fadeOut(
      GAME_OVER_CONFIG.FADE_DURATION,
      GAME_OVER_CONFIG.COLORS.FADE,
      GAME_OVER_CONFIG.COLORS.FADE,
      GAME_OVER_CONFIG.COLORS.FADE
    );

    scene.cameras.main.once("camerafadeoutcomplete", () => {
      scene.scene.stop("Level1Scene");
      scene.scene.start("GameOverScene");
    });
  }

  create(): void {
    this.setupBackground();
    this.createGameOverText();
    this.setupInput();

    this.cameras.main.fadeIn(GAME_OVER_CONFIG.FADE_DURATION);
  }

  private setupBackground(): void {
    this.cameras.main.setBackgroundColor(GAME_OVER_CONFIG.COLORS.BACKGROUND);
  }

  private createGameOverText(): void {
    const { width, height } = this.cameras.main;

    this.add
      .text(
        width / 2,
        height / 2,
        GAME_OVER_CONFIG.TEXT.CONTENT,
        GAME_OVER_CONFIG.TEXT.STYLE
      )
      .setOrigin(0.5);
  }

  private setupInput(): void {
    this.input.once("pointerdown", () => {
      this.cameras.main.fadeOut(
        GAME_OVER_CONFIG.FADE_DURATION,
        GAME_OVER_CONFIG.COLORS.FADE,
        GAME_OVER_CONFIG.COLORS.FADE,
        GAME_OVER_CONFIG.COLORS.FADE
      );

      this.cameras.main.once("camerafadeoutcomplete", () => {
        if (this.returnSceneKey) {
          this.scene.start(this.returnSceneKey);
        }
      });
    });
  }
}
