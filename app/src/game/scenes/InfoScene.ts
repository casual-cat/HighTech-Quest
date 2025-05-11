import Phaser from "phaser";

export default class InfoScene extends Phaser.Scene {
  constructor() {
    super("InfoScene");
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.fadeIn(250);
    this.cameras.main.setBackgroundColor("#965CDB");

    this.add
      .text(
        width / 2,
        height / 2,
        "This is the info screen\nhere we insert information about the game",
        {
          fontSize: "24px",
          color: "#fff",
          align: "center",
          lineSpacing: 6,
        }
      )
      .setOrigin(0.5);

    this.add
      .text(width / 2, height - 50, "Click anywhere to continue", {
        fontSize: "18px",
        color: "#fff",
      })
      .setOrigin(0.5);

    this.input.once("pointerdown", () => {
      this.cameras.main.fadeOut(250);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("CareerMenu");
      });
    });
  }
}
