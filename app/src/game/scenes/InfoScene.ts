import Phaser from "phaser";
import { THEME } from "../constants/game";

export default class InfoScene extends Phaser.Scene {
  // private nextScene: string = "OpeningScene";
  constructor() {
    super("InfoScene");
  }

  preload() {
    this.load.image("background", "/assets/backgrounds/purpleBackground.png");
    this.load.image("button", "/assets/buttons/Button_DarkGreen.png");
    this.load.image("buttonPressed", "/assets/buttons/Button_LightGreen.png");
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.fadeIn(250);
    this.add
      .image(0, 0, "background")
      .setOrigin(0)
      .setDisplaySize(width, height);

    this.add
      .text(
        width / 2,
        height / 2,
        "Inspired by the journey of searching for a first job in high-tech,\nthis game puts you in the shoes of a junior trying to land their first role.\n\nYou'll face real-world challenges like CV rewrites,\ntechnical tests, and tough interviews -\nall leading up to a final battle against the CEO.\n\nEach stage is a mission, and every win takes you closer to your goal.\n\nGood luck!",
        {
          fontSize: "20px",
          color: THEME.COLORS.TEXT.PRIMARY,
          align: "center",
          lineSpacing: 6,
        }
      )
      .setOrigin(0.5);

    const handleContinue = () => {
      this.cameras.main.fadeOut(250);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("OpeningScene");
      });
    };

    const btnBg = this.add
      .image(0, 0, "button")
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const btnTxt = this.add
      .text(0, 0, "Continue", {
        fontSize: "28px",
        color: THEME.COLORS.TEXT.PRIMARY,
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5);

    this.add.container(width / 2, height - 100, [btnBg, btnTxt]);

    btnBg.on("pointerdown", () => {
      btnBg.setTexture("buttonPressed");
    });
    btnBg.on("pointerup", () => {
      btnBg.setTexture("button");
      handleContinue();
    });
    btnBg.on("pointerout", () => {
      btnBg.setTexture("button");
    });
  }
}
