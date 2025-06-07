import Phaser from "phaser";

interface PuzzlePiece {
  id: string;
  content: string;
  isNew: boolean;
}

export class BookManager {
  private scene: Phaser.Scene;
  private keyHandler: (event: KeyboardEvent) => void;
  private puzzlePieces: PuzzlePiece[] = [];

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

  public addPuzzlePiece(piece: Omit<PuzzlePiece, 'isNew'>) {
    const newPiece = {
      ...piece,
      isNew: true
    };
    this.puzzlePieces.push(newPiece);
    this.updateBookIcon();
  }

  public markPiecesAsViewed() {
    this.puzzlePieces.forEach(piece => {
      piece.isNew = false;
    });
    this.updateBookIcon();
  }

  public hasUnviewedPieces(): boolean {
    return this.puzzlePieces.some(piece => piece.isNew);
  }

  private updateBookIcon() {
    this.scene.events.emit('bookStateChanged', {
      hasNewPieces: this.hasUnviewedPieces()
    });
  }

  public open() {
    if (this.scene.scene.isActive("BookScene")) return;

    this.scene.scene.pause();
    this.scene.scene.launch("BookScene", { puzzlePieces: this.puzzlePieces });
    this.scene.input.setDefaultCursor("default");
    
    this.markPiecesAsViewed();
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
  private puzzlePieces: PuzzlePiece[] = [];

  constructor() {
    super({ key: "BookScene" });
  }

  init(data: { puzzlePieces: PuzzlePiece[] }) {
    this.puzzlePieces = data.puzzlePieces;
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

    // display collected pieces
    this.puzzlePieces.forEach((piece, index) => {
      const y = height * 0.3 + index * 60;
      this.add.text(width * 0.6, y, piece.content, {
        color: piece.isNew ? "#9b59b6" : "#000000",
        fontSize: "16px"
      }).setOrigin(0, 0.5);
    });

    book.on("pointerdown", () => {
      return false;
    });
  }
}
