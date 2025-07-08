import Phaser from "phaser";

export default class LevelUpScene extends Phaser.Scene {
  constructor() {
    super({ key: "LevelUpScene" });
  }

  preload() {
    this.load.image("levelUp", "/assets/ui/levelUp.png");
  }

  create() {
    const { width, height } = this.scale;

    const bg = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.5
    );

    const levelUpImage = this.add
      .image(width / 2, height + 206, "levelUp")
      .setOrigin(0.5);

    const startY = height + levelUpImage.height / 2;
    const centerY = height / 2;
    const overshootY = centerY - 40;
    const undershootY = centerY + 40;
    const endY = -levelUpImage.height / 2;

    levelUpImage.y = startY;

    this.tweens.add({
      targets: levelUpImage,
      y: overshootY,
      duration: 1300,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.tweens.add({
          targets: levelUpImage,
          y: undershootY,
          duration: 400,
          ease: "Sine.easeInOut",
          onComplete: () => {
            this.tweens.add({
              targets: levelUpImage,
              y: endY,
              duration: 1300,
              ease: "Sine.easeInOut",
              onComplete: () => {
                const parentSceneKey = (
                  this.scene.settings.data as { parentScene?: string }
                )?.parentScene;
                if (parentSceneKey) {
                  this.scene.stop();
                  this.scene.resume(parentSceneKey);
                }
              },
            });
          },
        });
      },
    });
  }
}
