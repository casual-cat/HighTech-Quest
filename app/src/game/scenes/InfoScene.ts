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
        "Born out of a personal experience of searching for a first job in high-tech,\nthe idea to develop a game was created -\na game that reflects this journey: one filled with continuous learning,\nreal challenges, and quite a few rejections along the way.\n\nIn the game, you play as a junior trying to break into the high-tech world,\nembarking on a challenging and relatable journey toward landing your first job.\nYou'll go through various stages - from rewriting your résumé,\nto technical tests and stressful interviews,\nall the way to the final battle against the CEO.\n\nEach stage presents a unique mission,\nand every success brings you one step closer to your ultimate goal.\n\nGood luck!",
        {
          fontSize: "20px",
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
