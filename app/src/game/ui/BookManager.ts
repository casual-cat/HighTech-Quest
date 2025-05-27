import Phaser from "phaser";

export class BookManager {
  private scene: Phaser.Scene;
  private keyHandler: (event: KeyboardEvent) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.keyHandler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "q") {
        if (this.scene.scene.isActive("BookScene")) {
          this.close();
        } else {
          this.open();
        }
      }
    };

    window.addEventListener("keydown", this.keyHandler);
  }

  public open() {
    if (this.scene.scene.isActive("BookScene")) return;

    this.scene.scene.pause();
    this.scene.scene.launch("BookScene");
    this.scene.input.setDefaultCursor("default");
  }

  public close() {
    if (!this.scene.scene.isActive("BookScene")) return;

    this.scene.scene.stop("BookScene");
    this.scene.scene.resume();
  }

  public destroy() {
    window.removeEventListener("keydown", this.keyHandler);
    if (this.scene.scene.isActive("BookScene")) {
      this.scene.scene.stop("BookScene");
    }
  }
}

export class BookScene extends Phaser.Scene {
  constructor() {
    super({ key: "BookScene" });
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .rectangle(0, 0, width, height, 0x000000, 0.7)
      .setOrigin(0)
      .setInteractive({ useHandCursor: false })
      .on("pointerdown", () => {
        this.scene.stop();
        this.scene.resume("MainScene");
      });

    const book = this.add
      .image(width / 2, height / 2, "book-open")
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    book.on("pointerdown", () => {
      return false;
    });
  }
}
