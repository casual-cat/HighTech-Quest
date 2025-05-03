import Phaser from "phaser";

export default class OpeningScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text;

  constructor() {
    super("OpeningScene");
  }

  preload() {
    const { width, height } = this.scale;
    let percent = 0;

    this.loadingText = this.add
      .text(width / 2, height / 2, "Loading: 0%", {
        fontSize: "32px",
        color: "#fff",
      })
      .setOrigin(0.5);

    this.time.addEvent({
      delay: 20,
      repeat: 99,
      callback: () => {
        percent++;
        this.loadingText.setText(`Loading: ${percent}%`);
        if (percent >= 100) {
          this.time.delayedCall(500, () => {
            this.loadingText.destroy();
            this.showStartScreen();
          });
        }
      },
    });

    this.load.video("opening", "/assets/opening.mp4", true);
  }

  private showStartScreen() {
    const { width, height } = this.scale;

    const video = this.add.video(0, 0, "opening").setOrigin(0).setAlpha(0);

    const startText = this.add
      .text(width / 2, height / 2, "Click anywhere to start", {
        fontSize: "32px",
        color: "#fff",
        backgroundColor: "#00000088",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5);

    const fadeOutAndContinue = () => {
      this.tweens.add({
        targets: video,
        alpha: 0,
        duration: 1000,
        onComplete: () => this.scene.start("CareerMenu"),
      });
    };

    this.input.once("pointerdown", () => {
      startText.destroy();

      this.tweens.add({
        targets: video,
        alpha: 1,
        duration: 1000,
        onStart: () => {
          video.play();
          video.setInteractive();
          video.once("pointerdown", fadeOutAndContinue);

          this.time.delayedCall(video.getDuration() * 1000, fadeOutAndContinue);
        },
      });
    });
  }
}
