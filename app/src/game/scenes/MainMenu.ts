import Phaser from "phaser";

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super("MainMenu");
  }

  preload() {
    this.load.image("bg", "assets/mainMenu/background.png");
    this.load.image("button", "assets/buttons/Button_LightGreen.png");
    this.load.image("button2", "assets/buttons/Button_DarkGreen.png");
    this.load.spritesheet(
      "selectedCharacter",
      "assets/careerMenu/fullstackDeveloper.png",
      {
        frameWidth: 192,
        frameHeight: 288,
        endFrame: 2,
      }
    );
  }

  create() {
    const careerPath = this.registry.get("selectedCareer");
    this.cameras.main.fadeIn(250);

    const { width, height } = this.scale;

    this.add.image(0, 0, "bg").setOrigin(0);

    this.anims.create({
      key: "characterAnim",
      frames: this.anims.generateFrameNumbers("selectedCharacter", {
        start: 0,
        end: 2,
      }),
      frameRate: 5,
      repeat: -1,
    });

    const character = this.add
      .sprite(width / 2, height - 160, "selectedCharacter")
      .setOrigin(0.5);

    character.play("characterAnim");

    const playBtnBg = this.add
      .image(0, 0, "button")
      .setInteractive({ useHandCursor: true });

    const playBtnTxt = this.add
      .text(0, 0, "Play", {
        fontSize: "32px",
        color: "#fff",
      })
      .setOrigin(0.5);

    this.add
      .container(width / 8.6, height - 160, [playBtnBg, playBtnTxt]);

    playBtnBg.on("pointerdown", () => {
      playBtnBg.setTexture("button2");
    });

    playBtnBg.on("pointerup", () => {
      playBtnBg.setTexture("button");
      this.cameras.main.fadeOut(250);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("MainScene", careerPath);
      });
    });

    playBtnBg.on("pointerout", () => {
      playBtnBg.setTexture("button");
    });

    const returnBtnBg = this.add
      .image(0, 0, "button2")
      .setInteractive({ useHandCursor: true });

    const returnBtnTxt = this.add
      .text(0, 0, "Return", {
        fontSize: "32px",
        color: "#fff",
      })
      .setOrigin(0.5);

    this.add
      .container(width / 8.6, height - 80, [returnBtnBg, returnBtnTxt]);

    returnBtnBg.on("pointerdown", () => {
      returnBtnBg.setTexture("button");
    });

    returnBtnBg.on("pointerup", () => {
      returnBtnBg.setTexture("button2");
      this.cameras.main.fadeOut(250);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("CareerMenu");
      });
    });

    returnBtnBg.on("pointerout", () => {
      returnBtnBg.setTexture("button2");
    });
  }
}
