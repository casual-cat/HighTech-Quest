import Phaser from "phaser";

export default class CarrerMenu extends Phaser.Scene {
  constructor() {
    super("CarrerMenu");
  }

  create() {
    const options = [
      "Full Stack Developer",
      "DevOps Engineer",
      "UX/UI Designer",
      "Project Manager",
    ];

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.add
      .text(centerX, centerY - 200, "Choose Your Carrer Path:", {
        fontSize: "28px",
        color: "#fff",
      })
      .setOrigin(0.5);

    options.forEach((option, index) => {
      const text = this.add
        .text(centerX, centerY + index * 50, option, {
          fontSize: "24px",
          color: "#0077cc",
          padding: { x: 10, y: 5 },
        })
        .setOrigin(0.5)
        .setInteractive({
          useHandCursor: true,
        });

      text.on("pointerover", () =>
        text.setStyle({ backgroundColor: "#cceeff" })
      );
      text.on("pointerout", () => text.setStyle({ backgroundColor: "none" }));

      text.on("pointerdown", () => {
        this.registry.set("careerPath", option);
        this.scene.start("MainScene");
      });
    });
  }
}
