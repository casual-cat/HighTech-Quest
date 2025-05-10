import Phaser from "phaser";

export default class CareerMenu extends Phaser.Scene {
  private careers = [
    { key: "fullstack", title: "Full Stack Developer" },
    { key: "devops", title: "DevOps Engineer" },
    { key: "uxui", title: "UX/UI Designer" },
    { key: "projectmanager", title: "Project Manager" },
  ];

  private currentIndex = 0;
  private characterImage!: Phaser.GameObjects.Image;
  private titleText!: Phaser.GameObjects.Text;

  constructor() {
    super("CareerMenu");
  }

  preload() {
    this.load.image("background", "/assets/characterSelection/background.png");
    this.load.image("fullstack", "/assets/fullstack.png");
    this.load.image("devops", "/assets/devops.png");
    this.load.image("uxui", "/assets/uxui.png");
    this.load.image("projectmanager", "/assets/projectmanager.png");
  }

  create() {
    const { width, height } = this.scale;
    const background = this.add.image(0, 0, "background").setOrigin(0);
    background.setDisplaySize(width, height);

    this.titleText = this.add
      .text(width / 2, height / 8, "", {
        fontSize: "32px",
        color: "#fff",
      })
      .setOrigin(0.5);

    this.characterImage = this.add
      .image(width / 2, height / 2, this.careers[0].key)
      .setOrigin(0.5);

    this.updateDisplay();

    this.input.keyboard!.on("keydown-LEFT", () => this.scroll(-1));
    this.input.keyboard!.on("keydown-A", () => this.scroll(-1));

    this.input.keyboard!.on("keydown-RIGHT", () => this.scroll(1));
    this.input.keyboard!.on("keydown-D", () => this.scroll(1));

    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      const swipe = pointer.upX - pointer.downX;
      if (swipe > 50) this.scroll(-1);
      else if (swipe < -50) this.scroll(1);
    });

    const continueButton = this.add
      .text(width / 2, height - 100, "Continue", {
        fontSize: "28px",
        backgroundColor: "#6AE491",
        color: "#000",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    continueButton.on("pointerover", () => {
      continueButton.setStyle({ backgroundColor: "#57C87B" });
    });

    continueButton.on("pointerout", () => {
      continueButton.setStyle({ backgroundColor: "#6AE491" });
    });

    continueButton.on("pointerdown", () => {
      const selectedCareer = this.careers[this.currentIndex].key;
      this.scene.start("MainScene", { selectedCareer });
    });
  }

  private scroll(direction: number) {
    const newIndex = Phaser.Math.Clamp(
      this.currentIndex + direction,
      0,
      this.careers.length - 1
    );
    if (newIndex !== this.currentIndex) {
      this.currentIndex = newIndex;
      this.updateDisplay();
    }
  }

  private updateDisplay() {
    const { key, title } = this.careers[this.currentIndex];
    this.titleText.setText(title);
    this.characterImage.setTexture(key);
  }
}
