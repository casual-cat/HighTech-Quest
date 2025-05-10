import Phaser from "phaser";

export default class CareerMenu extends Phaser.Scene {
  private careers = [
    { key: "fullstack", title: "Full Stack Developer" },
    { key: "devops", title: "DevOps Engineer" },
    { key: "uxui", title: "UX/UI Designer" },
    { key: "projectmanager", title: "Project Manager" },
  ];

  private currentIndex = 0;
  private characterSprites: Phaser.GameObjects.Sprite[] = [];
  private characterBackgrounds: Phaser.GameObjects.Image[] = [];
  private titleText!: Phaser.GameObjects.Text;

  constructor() {
    super("CareerMenu");
  }

  preload() {
    this.load.image("background", "/assets/careerMenu/background.png");
    this.load.image(
      "characterBackground",
      "/assets/careerMenu/characterBackground.png"
    ); // ask tal to size down the asset
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

    this.add
      .image(0, 0, "background")
      .setOrigin(0)
      .setDisplaySize(width, height);

    this.titleText = this.add
      .text(width / 2, height / 8, "", {
        fontSize: "32px",
        color: "#fff",
      })
      .setOrigin(0.5);

    this.renderCharacters();

    this.input.keyboard!.on("keydown-LEFT", () => this.scroll(-1));
    this.input.keyboard!.on("keydown-A", () => this.scroll(-1));
    this.input.keyboard!.on("keydown-RIGHT", () => this.scroll(1));
    this.input.keyboard!.on("keydown-D", () => this.scroll(1));

    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      const swipe = pointer.upX - pointer.downX;
      if (swipe > 50) this.scroll(-1);
      else if (swipe < -50) this.scroll(1);
    });

    const handleContinue = () => {
      this.cameras.main.fadeOut(250);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("IntroScene", {
          selectedCareer: this.careers[this.currentIndex].key,
        });
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

  private renderCharacters() {
    const { width, height } = this.scale;

    this.characterSprites.forEach((sprite) => sprite.destroy());
    this.characterBackgrounds.forEach((bg) => bg.destroy());
    this.characterSprites = [];
    this.characterBackgrounds = [];

    this.titleText.setText(this.careers[this.currentIndex].title);
    const spacing = 200;

    for (let offset = -2; offset <= 2; offset++) {
      const index = this.currentIndex + offset;
      if (index < 0 || index >= this.careers.length) continue;

      const career = this.careers[index];
      const key = career.key;
      const animKey = `${key}Anim`;

      if (!this.anims.exists(animKey)) {
        this.anims.create({
          key: animKey,
          frames: this.anims.generateFrameNumbers(key, { start: 0, end: 2 }),
          frameRate: 5,
          repeat: -1,
        });
      }

      const xPosition = width / 2 + offset * spacing;
      let scale = 1;
      let alpha = 1;

      switch (Math.abs(offset)) {
        case 1:
          scale = 0.6;
          alpha = 0.7;
          break;
        case 2:
          scale = 0.5;
          alpha = 0.4;
          break;
      }

      const bg = this.add
        .image(xPosition, height / 2, "characterBackground")
        .setScale(scale * 0.6)
        .setAlpha(alpha)
        .setDepth(10 - Math.abs(offset) - 1);

      const sprite = this.add
        .sprite(xPosition, height / 2, key)
        .setScale(scale)
        .setAlpha(alpha)
        .setDepth(10 - Math.abs(offset));

      if (offset === 0) {
        sprite.play(animKey);
      } else {
        sprite.setFrame(0);
      }

      this.characterSprites.push(sprite);
      this.characterBackgrounds.push(bg);
    }
  }

  private scroll(direction: number) {
    this.characterSprites.forEach((sprite) => {
      const newX = sprite.x - direction * 200;
      const newScale = sprite.scale * 0.8;
      const newAlpha = 0.3;

      this.tweens.add({
        targets: sprite,
        x: newX,
        scale: newScale,
        alpha: newAlpha,
        duration: 250,
        ease: "Sine.easeInOut",
        onComplete: () => sprite.destroy(),
      });
    });

    this.characterBackgrounds.forEach((bg) => {
      const newX = bg.x - direction * 200;
      const newScale = bg.scale * 0.8;
      const newAlpha = 0.3;

      this.tweens.add({
        targets: bg,
        x: newX,
        scale: newScale,
        alpha: newAlpha,
        duration: 250,
        ease: "Sine.easeInOut",
        onComplete: () => bg.destroy(),
      });
    });

    this.time.delayedCall(250, () => {
      this.currentIndex = Phaser.Math.Clamp(
        this.currentIndex + direction,
        0,
        this.careers.length - 1
      );
      this.renderCharacters();
    });
  }
}
