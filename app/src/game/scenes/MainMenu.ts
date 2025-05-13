import Phaser from "phaser";
import { CareerStore } from "../../stores/CareerStore";

export default class MainMenu extends Phaser.Scene {
  private selectedCareer: string = "";

  constructor() {
    super("MainMenu");
  }

  preload() {
    const career = CareerStore.getCareer();
    if (!career) {
      console.warn("No career selected");
      return;
    }

    this.selectedCareer = career;

    this.load.image("bg", "assets/mainMenu/background.png");
    this.load.image("button", "assets/buttons/Button_LightGreen.png");
    this.load.image("button2", "assets/buttons/Button_DarkGreen.png");
    this.load.spritesheet(
      `${this.selectedCareer}-texture`,
      `assets/careerMenu/${this.selectedCareer}.png`,
      {
        frameWidth: 192,
        frameHeight: 288,
        endFrame: 2,
      }
    );
  }

  create() {
    this.cameras.main.fadeIn(250);

    const { width, height } = this.scale;

    this.add.image(0, 0, "bg").setOrigin(0);

    this.anims.create({
      key: `${this.selectedCareer}Anim`,
      frames: this.anims.generateFrameNumbers(
        `${this.selectedCareer}-texture`,
        {
          start: 0,
          end: 2,
        }
      ),
      frameRate: 5,
      repeat: -1,
    });

    const character = this.add
      .sprite(width / 2, height - 160, `${this.selectedCareer}-texture`)
      .setOrigin(0.5);

    character.play(`${this.selectedCareer}Anim`);

    const playBtnBg = this.add
      .image(0, 0, "button")
      .setInteractive({ useHandCursor: true });

    const playBtnTxt = this.add
      .text(0, 0, "Play", {
        fontSize: "32px",
        color: "#fff",
      })
      .setOrigin(0.5);

    this.add.container(width / 8.6, height - 160, [playBtnBg, playBtnTxt]);

    playBtnBg.on("pointerdown", () => {
      playBtnBg.setTexture("button2");
    });

    playBtnBg.on("pointerup", () => {
      playBtnBg.setTexture("button");
      this.cameras.main.fadeOut(250);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("MainScene");
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

    this.add.container(width / 8.6, height - 80, [returnBtnBg, returnBtnTxt]);

    returnBtnBg.on("pointerdown", () => {
      returnBtnBg.setTexture("button");
    });

    returnBtnBg.on("pointerup", () => {
      returnBtnBg.setTexture("button2");
      this.cameras.main.fadeOut(250);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        CareerStore.reset();
        this.scene.start("CareerMenu");
      });
    });

    returnBtnBg.on("pointerout", () => {
      returnBtnBg.setTexture("button2");
    });
  }
}
