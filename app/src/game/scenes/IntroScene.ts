import Phaser from "phaser";

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super("IntroScene");
  }

  preload() {
    this.load.video("intro", "assets/intro/video.mp4");
  }

  create() {
    const careerPath = this.registry.get("selectedCareer");
    const { width, height } = this.scale;

    const video = this.add.video(width / 2, height / 2, "intro").setOrigin(0.5);

    this.cameras.main.fadeIn(250);

    video.play();

    const goToMainScene = () => {
      if (!this.scene.isActive("IntroScene")) return;

      this.cameras.main.fadeOut(1000);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("MainMenu", careerPath);
      });
    };

    video.on("complete", goToMainScene);
    this.input.once("pointerdown", goToMainScene);
  }
}
