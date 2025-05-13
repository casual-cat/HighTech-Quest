import Phaser from "phaser";

export default class OpeningScene extends Phaser.Scene {
  private nextScene: string = "CareerMenu";
  constructor() {
    super("OpeningScene");
  }

  preload() {
    this.load.video("opening", "assets/opening/startupVideo.mp4");
  }

  create() {
    const { width, height } = this.cameras.main;

    this.cameras.main.fadeIn(250);

    const video = this.add
      .video(width / 2, height / 2, "opening")
      .setOrigin(0.5);
    video.play();

    video.on("complete", () => {
      this.cameras.main.fadeOut(250);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start(this.nextScene);
      });
    });
  }
}
