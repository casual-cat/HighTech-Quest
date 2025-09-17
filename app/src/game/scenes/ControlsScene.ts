import Phaser from "phaser";

export class ControlsScene extends Phaser.Scene {
  constructor() {
    super({ key: "ControlsScene" });
  }

  preload(): void {
    this.load.image("controls-screen", "/assets/backgrounds/controls.png");
  }

  create(): void {
    const { width, height } = this.scale;

    this.cameras.main.fadeIn(250);
    this.add.image(width / 2, height / 2, "controls-screen");

    this.input.once("pointerdown", () => {
      this.cameras.main.fadeOut(250);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("Level1Scene");
      });
    });
  }
}
