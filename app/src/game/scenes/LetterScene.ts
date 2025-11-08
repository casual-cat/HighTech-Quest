import Phaser from "phaser";
import { LetterContent } from "../data/letters";

type LetterSceneData = {
  parentSceneKey: string;
  letter: LetterContent;
};

export default class LetterScene extends Phaser.Scene {
  private parentSceneKey?: string;
  private letter?: LetterContent;
  private canClose = false;

  constructor() {
    super({ key: "LetterScene" });
  }

  init(data: LetterSceneData) {
    this.parentSceneKey = data.parentSceneKey;
    this.letter = data.letter;
  }

  create() {
    this.scene.bringToTop();

    const { width, height } = this.scale;

    this.add
      .rectangle(0, 0, width, height, 0x000000, 0.6)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(0);

    const background = this.add
      .image(width / 2, height / 2, "letter-background")
      .setDepth(1)
      .setScrollFactor(0);

    const displayWidth = background.displayWidth || background.width || 640;
    const displayHeight = background.displayHeight || background.height || 480;

    const bodyBaseline =
      height / 2 + displayHeight * 0.5 - displayHeight * 0.25;
    const headlineBaseline = bodyBaseline - displayHeight * 0.2;

    const contentBounds = {
      width: displayWidth * 0.75,
      headlineBaseline,
      bodyBaseline,
    };

    if (this.letter) {
      this.add
        .text(width / 2, contentBounds.headlineBaseline, this.letter.headline)
        .setOrigin(0.5, 1)
        .setDepth(2)
        .setScrollFactor(0)
        .setStyle({
          fontSize: "20px",
          color: "#998845",
        });

      this.add
        .text(width / 2, contentBounds.bodyBaseline, this.letter.body)
        .setOrigin(0.5, 1)
        .setDepth(2)
        .setScrollFactor(0)
        .setStyle({
          fontSize: "16px",
          color: "#998845",
          wordWrap: { width: contentBounds.width },
          align: "center",
        });
    }

    this.add
      .text(
        width / 2,
        height / 2 + displayHeight * 0.35,
        "Press SPACE or click to close"
      )
      .setOrigin(0.5)
      .setDepth(2)
      .setScrollFactor(0)
      .setStyle({
        fontSize: "14px",
        color: "#998845",
      });

    this.time.delayedCall(150, () => {
      this.enableClose();
    });
  }

  private enableClose() {
    this.canClose = true;

    this.input.once("pointerdown", () => this.close());
    this.input.keyboard?.once("keydown-SPACE", () => this.close());
    this.input.keyboard?.once("keydown-ESC", () => this.close());
  }

  private close() {
    if (!this.canClose) return;

    if (this.parentSceneKey) {
      this.scene.resume(this.parentSceneKey);
    }

    this.scene.stop();
  }
}
