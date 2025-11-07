import Phaser from "phaser";
import { GameState } from "../../stores/GameState";
import { BOOK_SCENE_CONFIG } from "../constants/book";

export default class minigame2Scene extends Phaser.Scene {
  private currentLevel: number | undefined;

  constructor() {
    super({ key: "minigame2Scene" });
  }

  init(): void {
    this.currentLevel = GameState.currentLevel;
  }

  preload(): void {
    this.load.image(
      "minigame2-background",
      "/assets/game/level3/minigames/deliverables/minigame2-background.png"
    );
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .rectangle(
        0,
        0,
        width,
        height,
        BOOK_SCENE_CONFIG.OVERLAY.COLOR,
        BOOK_SCENE_CONFIG.OVERLAY.ALPHA
      )
      .setOrigin(0);

    this.add.image(width / 2, height / 2, "minigame2-background");
  }
}
