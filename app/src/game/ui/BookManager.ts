import Phaser from "phaser";
import { GameOverScene } from "../scenes/GameOverScene";

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
    SPACING: 60,
  },
} as const;

interface PuzzlePiece {
  id: string;
  content: string;
  isNew: boolean;
}

interface MainScene extends Phaser.Scene {
  player?: { getHealth(): number; getMaxHealth(): number };
}

export class BookManager {
  private scene: Phaser.Scene;
  private keyHandler!: (event: KeyboardEvent) => void;
  private puzzlePieces: PuzzlePiece[] = [];

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

  public addPuzzlePiece(piece: Omit<PuzzlePiece, "isNew">): void {
    const newPiece = {
      ...piece,
      isNew: true,
    };
    this.puzzlePieces.push(newPiece);
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

  constructor() {
    super({ key: "BookScene" });
  }

  init(data: { puzzlePieces: PuzzlePiece[] }): void {
    this.puzzlePieces = data.puzzlePieces;
  }

  create(): void {
    this.setupOverlay();
    this.createBook();
    this.displayPuzzlePieces();
  }

  update(): void {
    this.checkGameOver();
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

    const book = this.add
      .image(width / 2, height / 2, "book-open")
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    book.on("pointerdown", () => false);
  }

  private displayPuzzlePieces(): void {
    const { width, height } = this.scale;

    this.puzzlePieces.forEach((piece, index) => {
      const y = height * 0.3 + index * BOOK_SCENE_CONFIG.TEXT.SPACING;
      this.add
        .text(width * 0.6, y, piece.content, {
          ...BOOK_SCENE_CONFIG.TEXT.STYLE,
          color: piece.isNew
            ? BOOK_SCENE_CONFIG.TEXT.COLORS.NEW
            : BOOK_SCENE_CONFIG.TEXT.COLORS.VIEWED,
        })
        .setOrigin(0, 0.5);
    });
  }

  private checkGameOver(): void {
    const mainScene = this.scene.get("MainScene") as MainScene;
    const playerHealth = mainScene.player?.getHealth();
    if (playerHealth !== undefined && playerHealth <= 0) {
      GameOverScene.handleGameOver(this);
    }
  }
}
