import Phaser from "phaser";

export class ControlsScene extends Phaser.Scene {
  private qKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: "ControlsScene" });
  }

  preload(): void {
    // this.load.image("qKey", "/assets/ui/keys/qKey.png"); // For development
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0xff0000).setOrigin(0);

    const text = this.add.text(width / 2, height / 2, "Controls Screen", {
      fontSize: "32px",
      color: "#000000",
    });
    text.setOrigin(0.5);

    const qKeyX = width / 2;
    const qKeyY = height - 60;
    this.add.image(qKeyX - 26, qKeyY, "qKey").setOrigin(0.5);

    this.add
      .text(qKeyX + 26, qKeyY, "Got it", {
        fontSize: "16px",
        color: "#333333",
      })
      .setOrigin(0.5);

    this.qKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
  }

  update(): void {
    if (Phaser.Input.Keyboard.JustDown(this.qKey)) {
      this.scene.stop();
      this.scene.resume("BookScene");
    }
  }
}
