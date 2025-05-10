import Phaser from "phaser";

export default class OpeningScene extends Phaser.Scene {
  constructor() {
    super("OpeningScene");
  }

  preload() {
    this.load.image("1", "/assets/opening/01.png");
    this.load.image("2", "/assets/opening/02.png");
    this.load.image("3", "/assets/opening/03.png");
    this.load.image("4", "/assets/opening/04.png");
    this.load.image("5", "/assets/opening/05.png");
    this.load.image("6", "/assets/opening/06.png");
    this.load.image("7", "/assets/opening/07.png");
    this.load.image("8", "/assets/opening/08.png");
    this.load.image("9", "/assets/opening/09.png");
    this.load.image("10", "/assets/opening/10.png");
    this.load.image("11", "/assets/opening/11.png");
    this.load.image("12", "/assets/opening/12.png");
    this.load.image("13", "/assets/opening/13.png");
    this.load.image("14", "/assets/opening/14.png");
    this.load.image("15", "/assets/opening/15.png");
    this.load.image("16", "/assets/opening/16.png");
    this.load.image("17", "/assets/opening/17.png");
    this.load.image("18", "/assets/opening/18.png");
    this.load.image("19", "/assets/opening/19.png");
    this.load.image("20", "/assets/opening/20.png");
    this.load.image("21", "/assets/opening/21.png");
    this.load.image("22", "/assets/opening/22.png");
    this.load.image("23", "/assets/opening/23.png");
    this.load.image("24", "/assets/opening/24.png");
    this.load.image("25", "/assets/opening/25.png");
    this.load.image("26", "/assets/opening/26.png");
    this.load.image("27", "/assets/opening/27.png");
    this.load.image("28", "/assets/opening/28.png");
    this.load.image("29", "/assets/opening/29.png");
    this.load.image("30", "/assets/opening/30.png");
    this.load.image("31", "/assets/opening/31.png");
    this.load.image("32", "/assets/opening/32.png");
    this.load.image("33", "/assets/opening/33.png");
    this.load.image("34", "/assets/opening/34.png");
    this.load.image("35", "/assets/opening/35.png");
    this.load.image("36", "/assets/opening/36.png");
    this.load.image("37", "/assets/opening/37.png");
  }

  create() {
    this.playSplashScreen();
  }

  private playSplashScreen() {
    const frameCount = 37;
    const frameDuration = 70;
    let currentFrame = 1;

    const image = this.add
      .image(this.cameras.main.centerX, this.cameras.main.centerY, "1")
      .setOrigin(0.5, 0.5)
      .setScale(1);

    this.time.addEvent({
      delay: frameDuration,
      repeat: frameCount - 2,
      callback: () => {
        currentFrame++;
        image.setTexture(currentFrame.toString());

        if (currentFrame === frameCount) {
          this.time.delayedCall(1000, () => {
            const continueText = this.add
              .text(
                this.cameras.main.centerX,
                this.cameras.main.height - 36,
                "Click to continue",
                {
                  fontSize: "32px",
                  color: "#965CDB",
                }
              )
              .setOrigin(0.5)
              .setAlpha(0);

            this.tweens.add({
              targets: continueText,
              alpha: 1,
              duration: 1000,
              yoyo: true,
              repeat: -1,
              ease: "Sine.inOut",
            });

            this.input.once("pointerdown", () => {
              this.cameras.main.once("camerafadeoutcomplete", () => {
                this.scene.start("CareerMenu");
              });
              this.cameras.main.fadeOut(250);
            });
          });
        }
      },
    });
  }
}
