import Phaser from "phaser";

export default class ThreeDaysLaterScene extends Phaser.Scene {
  constructor() {
    super({ key: "ThreeDaysLaterScene" });
  }

  preload() {
    this.load.image("3DaysLater", "/assets/backgrounds/3DaysLater.png");
  }

  create() {
    const { width, height } = this.scale;

    const image = this.add
      .image(width / 2, height / 2, "3DaysLater")
      .setOrigin(0.5);
    image.setDepth(10);

    this.time.delayedCall(3000, () => {
      const parentSceneKey = (
        this.scene.settings.data as { parentScene?: string }
      )?.parentScene;
      if (parentSceneKey) {
        this.scene.stop();
        this.scene.resume(parentSceneKey);
      }
    });
  }
}
