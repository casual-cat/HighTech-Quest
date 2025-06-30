import Phaser from "phaser";
import { GameOverScene } from "../scenes/GameOverScene";
import { PuzzlePiece, PUZZLE_DATA } from "../data/puzzlePieces";

const BOOK_SCENE_CONFIG = {
  OVERLAY: {
    COLOR: 0x000000,
    ALPHA: 0.7,
  },
  TEXT: {
    STYLE: {
      fontSize: "16px",
    },
    COLORS: {
      NEW: "#9b59b6",
      VIEWED: "#000000",
    },
    SPACING: 50,
  },
} as const;

interface MainScene extends Phaser.Scene {
  player?: { getHealth(): number; getMaxHealth(): number };
}

export class BookManager {
  private scene: Phaser.Scene;
  private keyHandler!: (event: KeyboardEvent) => void;
  private puzzlePieces: PuzzlePiece[] = PUZZLE_DATA;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupKeyHandler();
  }

  private setupKeyHandler(): void {
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

  public addPuzzlePiece(piece: Omit<PuzzlePiece, "collected" | "isNew">): void {
    const existingPiece = this.puzzlePieces.find((p) => p.id === piece.id);
    if (existingPiece) {
      existingPiece.collected = true;
      existingPiece.isNew = true;
    }
    this.updateBookIcon();
  }

  public markPiecesAsViewed(): void {
    this.puzzlePieces.forEach((piece) => {
      piece.isNew = false;
    });
    this.updateBookIcon();
  }

  public hasUnviewedPieces(): boolean {
    return this.puzzlePieces.some((piece) => piece.isNew);
  }

  private updateBookIcon(): void {
    this.scene.events.emit("bookStateChanged", {
      hasNewPieces: this.hasUnviewedPieces(),
    });
  }

  public open(): void {
    if (this.scene.scene.isActive("BookScene")) return;

    this.scene.scene.pause();
    this.scene.scene.launch("BookScene", { puzzlePieces: this.puzzlePieces });
    this.scene.input.setDefaultCursor("default");

    this.markPiecesAsViewed();
  }

  public close(): void {
    if (!this.scene.scene.isActive("BookScene")) return;

    this.scene.scene.stop("BookScene");
    this.scene.scene.resume();

    const bookScene = this.scene.scene.get("BookScene") as
      | BookScene
      | undefined;
    if (bookScene) {
      bookScene.resetTab && bookScene.resetTab();
    }
  }

  public destroy(): void {
    window.removeEventListener("keydown", this.keyHandler);
    if (this.scene.scene.isActive("BookScene")) {
      this.scene.scene.stop("BookScene");
    }
  }
}

export class BookScene extends Phaser.Scene {
  private puzzlePieces: PuzzlePiece[] = [];
  private currentTab: "Tasks" | "Levels" | "Elements" = "Tasks";
  private tabContentGroup!: Phaser.GameObjects.Group;
  private bookImage!: Phaser.GameObjects.Image;

  constructor() {
    super({ key: "BookScene" });
  }

  init(data: { puzzlePieces: PuzzlePiece[] }): void {
    this.puzzlePieces = data.puzzlePieces;
  }

  preload(): void {
    this.load.image("myCV", "/assets/ui/book/myCV.png");
    this.load.image("cv", "/assets/ui/book/cv.png");
    this.load.image("lock", "/assets/ui/book/lock.png");
  }

  create(): void {
    this.setupOverlay();
    this.createBook();
    this.createTabs();
    this.tabContentGroup = this.add.group();
    this.renderTabContent();
  }

  update(): void {
    this.checkGameOver();
  }

  private createTabs(): void {
    const { width, height } = this.scale;

    const tabData = [
      { name: "Tasks", x: width * 0.189, y: height * 0.0565 },
      { name: "Levels", x: width * 0.269, y: height * 0.0565 },
      { name: "Elements", x: width * 0.346, y: height * 0.0565 },
    ];

    tabData.forEach((tab) => {
      const tabRect = this.add
        .rectangle(tab.x, tab.y, 80, 40, 0xffffff, 0)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
          this.currentTab = tab.name as typeof this.currentTab;
          this.updateBookImage();
          this.renderTabContent();
        });

      this.add
        .text(tab.x, tab.y, tab.name, { fontSize: "12px", color: "#333" })
        .setOrigin(0.5);
    });
  }

  private renderTabContent(): void {
    this.tabContentGroup.clear(true, true);

    if (this.currentTab === "Tasks") {
      this.displayPuzzlePieces();
    } else if (this.currentTab === "Levels") {
      this.displayLevels();
    } else if (this.currentTab === "Elements") {
      this.displayElements();
    }
  }

  private displayPuzzlePieces(): void {
    const { width, height } = this.scale;
    const baseY = height * 0.28;

    const title = this.add
      .text(width * 0.6, baseY - 50, "Find all CV pieces", {
        ...BOOK_SCENE_CONFIG.TEXT.STYLE,
        color: "#000",
        fontSize: "18px",
      })
      .setOrigin(0, 0.5);
    this.tabContentGroup.add(title);

    const cvPieces = this.puzzlePieces.filter((piece) => piece.isCorrect);

    cvPieces.forEach((piece, idx) => {
      const y = baseY + idx * BOOK_SCENE_CONFIG.TEXT.SPACING;
      const displayText = piece.collected ? piece.label : "?";

      const checkboxTexture = piece.collected ? "checkbox-checked" : "checkbox";
      const checkbox = this.add
        .image(width * 0.55, y, checkboxTexture)
        .setOrigin(0, 0.5);
      this.tabContentGroup.add(checkbox);

      const text = this.add
        .text(width * 0.6, y, displayText, {
          ...BOOK_SCENE_CONFIG.TEXT.STYLE,
          color: BOOK_SCENE_CONFIG.TEXT.COLORS.VIEWED,
        })
        .setOrigin(0, 0.5);
      this.tabContentGroup.add(text);
    });
  }

  private displayLevels(): void {
    const { width, height } = this.scale;
    const text = this.add
      .text(width * 0.6, height * 0.4, "Levels content here", {
        fontSize: "16px",
        color: "#000",
      })
      .setOrigin(0, 0.5);
    this.tabContentGroup.add(text);
  }

  private displayElements(): void {
    const { width, height } = this.scale;

    const title = this.add.image(width * 0.27, height * 0.13, "myCV");
    const cv = this.add.image(width * 0.27, height * 0.52, "cv");

    this.tabContentGroup.add(title);
    this.tabContentGroup.add(cv);
  }

  private setupOverlay(): void {
    const { width, height } = this.scale;

    this.add
      .rectangle(
        0,
        0,
        width,
        height,
        BOOK_SCENE_CONFIG.OVERLAY.COLOR,
        BOOK_SCENE_CONFIG.OVERLAY.ALPHA
      )
      .setOrigin(0)
      .setInteractive({ useHandCursor: false })
      .on("pointerdown", () => {
        this.scene.stop();
        this.scene.resume("MainScene");
      });
  }

  private createBook(): void {
    const { width, height } = this.scale;

    this.bookImage = this.add
      .image(width / 2, height / 2, "book-tasks")
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.bookImage.on("pointerdown", () => false);

    const bookBounds = this.bookImage.getBounds();
    const qKeyX = bookBounds.right - 260;
    const qKeyY = bookBounds.bottom - 75;

    this.add.image(qKeyX, qKeyY, "qKey").setOrigin(0.5).setScale(0.7);

    this.add
      .text(qKeyX + 25, qKeyY, "Close Notebook", {
        fontSize: "16px",
        color: "#333333",
      })
      .setOrigin(0, 0.5);
  }

  private updateBookImage(): void {
    let textureKey = "book-tasks";
    if (this.currentTab === "Levels") {
      textureKey = "book-levels";
    } else if (this.currentTab === "Elements") {
      textureKey = "book-elements";
    }
    this.bookImage.setTexture(textureKey);
  }

  private checkGameOver(): void {
    const mainScene = this.scene.get("MainScene") as MainScene;
    const playerHealth = mainScene.player?.getHealth();
    if (playerHealth !== undefined && playerHealth <= 0) {
      GameOverScene.handleGameOver(this);
    }
  }

  public resetTab() {
    this.currentTab = "Tasks";
  }
}
