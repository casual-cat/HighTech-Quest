import Phaser from "phaser";
import { CareerStore, type CareerKey } from "../../stores/CareerStore";
import { BOOK_SCENE_CONFIG } from "../constants/book";

export default class minigame4Scene extends Phaser.Scene {
  private career: CareerKey = "fullstack";

  constructor() {
    super({ key: "minigame4Scene" });
  }

  init(): void {
    this.career = CareerStore.getCareer() ?? this.career;
  }

  preload(): void {
    const backgroundKey = `bug-game-${this.career}`;
    const backgroundPath = `/assets/game/level3/minigames/bugs/${backgroundKey}.png`;
    this.load.image(backgroundKey, backgroundPath);
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

    const backgroundKey = `bug-game-${this.career}`;
    const background = this.add
      .image(width / 2, height / 2, backgroundKey)
      .setDisplaySize(width, height)
      .setDepth(0);
  }
}
