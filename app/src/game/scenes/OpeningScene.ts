import Phaser from "phaser";

export default class OpeningScene extends Phaser.Scene {
  constructor() {
    super("OpeningScene");
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.add
      .text(centerX, centerY, "Opening Scene Screen", {
        fontSize: "28px",
        color: "#fff",
      })
      .setOrigin(0.5);

    const text = this.add
      .text(centerX, centerY + 280, "Start Game", {
        fontSize: "24px",
        color: "#ffffff",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive({
        useHandCursor: true,
      });

    text.on("pointerover", () => text.setStyle({ backgroundColor: "#965CDB" }));
    text.on("pointerout", () => text.setStyle({ backgroundColor: "none" }));

    text.on("pointerdown", () => {
      this.scene.start("CarrerMenu");
    });
  }
}
