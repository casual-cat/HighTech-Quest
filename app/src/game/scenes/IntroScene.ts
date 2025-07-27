import Phaser from "phaser";

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super("IntroScene");
  }

  preload() {
    this.load.video("intro", "assets/intro/certificate.mp4");
  }

  create() {
    const { width, height } = this.scale;

    const video = this.add.video(width / 2, height / 2, "intro").setOrigin(0.5);

    this.cameras.main.fadeIn(250);

    video.play();

    const goToLevel1Scene = () => {
      if (!this.scene.isActive("IntroScene")) return;

      this.cameras.main.fadeOut(1000);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("Level1Scene");
      });
    };

    video.on("complete", goToLevel1Scene);
    this.input.once("pointerdown", goToLevel1Scene);
  }
}
