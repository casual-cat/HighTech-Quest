import Phaser from "phaser";

export default class CareerMenu extends Phaser.Scene {
  private careers = [
    { key: "fullstack", title: "Full Stack Developer" },
    { key: "devops", title: "DevOps Engineer" },
    { key: "uxui", title: "UX/UI Designer" },
    { key: "projectmanager", title: "Project Manager" },
  ];

  private currentIndex = 0;
  private characterSprite!: Phaser.GameObjects.Sprite;
  private titleText!: Phaser.GameObjects.Text;

  constructor() {
    super("CareerMenu");
  }

  preload() {
    this.load.image("background", "/assets/careerMenu/background.png");
    this.load.image(
      "characterBackground",
      "/assets/careerMenu/characterBackground.png"
    );
    this.load.image("button", "/assets/buttons/button.png"); // need to get the separated green button from Tal

    this.load.spritesheet(
      "fullstack",
      "/assets/careerMenu/fullstackDeveloper.png",
      {
        frameWidth: 192,
        frameHeight: 288,
        endFrame: 2,
      }
    ); // animation is not smooth, need to fix asset

    this.load.spritesheet("devops", "/assets/careerMenu/devopsEngineer.png", {
      frameWidth: 192,
      frameHeight: 288,
      endFrame: 2,
    }); // animation is not smooth, need to fix asset

    this.load.spritesheet("uxui", "/assets/careerMenu/uxuiDesigner.png", {
      frameWidth: 192,
      frameHeight: 288,
      endFrame: 2,
    }); // animation is not smooth, need to fix asset

    this.load.spritesheet(
      "projectmanager",
      "/assets/careerMenu/projectManager.png",
      {
        frameWidth: 192,
        frameHeight: 288,
        endFrame: 2,
      }
    ); // animation is not smooth, need to fix asset
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.fadeIn(250);

    const background = this.add.image(0, 0, "background").setOrigin(0);
    background.setDisplaySize(width, height);

    this.titleText = this.add
      .text(width / 2, height / 8, "", {
        fontSize: "32px",
        color: "#fff",
      })
      .setOrigin(0.5);

    this.add
      .image(width / 2, height / 2, "characterBackground")
      .setOrigin(0.5)
      .setScale(0.6); // ask tal to size down the asset

    this.characterSprite = this.add.sprite(width / 2, height / 2, "fullstack");

    this.anims.create({
      key: "characterAnim",
      frames: this.anims.generateFrameNumbers("fullstack", {
        start: 0,
        end: 2,
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.characterSprite.play("fullstackAnim");

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

    const selectedCareer = () => this.careers[this.currentIndex].key;

    const handleContinue = () => {
      this.cameras.main.fadeOut(250);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("MainScene", { selectedCareer: selectedCareer() });
      });
    };

    this.add
      .image(width / 2, height - 100, "button")
      .setOrigin(0.5)
      .setScale(0.6)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", handleContinue);

    this.add
      .text(width / 2, height - 100, "Continue", {
        fontSize: "28px",
        color: "#fff",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", handleContinue);
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

    this.characterSprite.anims.stop();
    this.characterSprite.setTexture(key);

    const animKey = `${key}Anim`;

    if (!this.anims.exists(animKey)) {
      this.anims.create({
        key: animKey,
        frames: this.anims.generateFrameNumbers(key, { start: 0, end: 2 }),
        frameRate: 5,
        repeat: -1,
      });
    }

    this.characterSprite.play(animKey);
  }
}
