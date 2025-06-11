import Phaser from "phaser";
import { THEME } from "../constants/game";

export default class InfoScene extends Phaser.Scene {
  private nextScene: string = "OpeningScene";
  constructor() {
    super("InfoScene");
  }

  preload() {
    this.load.image("background", "/assets/backgrounds/purpleBackground.png");
    this.load.image("button", "/assets/buttons/Button_LightGreen.png");
    this.load.image("buttonPressed", "/assets/buttons/Button_DarkGreen.png");
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
        "Born out of a personal experience of searching for a first job in high-tech,\nthe idea to develop a game was created -\na game that reflects this journey: one filled with continuous learning,\nreal challenges, and quite a few rejections along the way.\n\nIn the game, you play as a junior trying to break into the high-tech world,\nembarking on a challenging and relatable journey toward landing your first job.\nYou'll go through various stages - from rewriting your résumé,\nto technical tests and stressful interviews,\nall the way to the final battle against the CEO.\n\nEach stage presents a unique mission,\nand every success brings you one step closer to your ultimate goal.\n\nGood luck!",
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
        this.scene.start(this.nextScene);
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
