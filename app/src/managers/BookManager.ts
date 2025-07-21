import Phaser from "phaser";
import { PuzzlePiece, PUZZLE_DATA } from "../game/data/puzzlePieces";

interface MainScene extends Phaser.Scene {
  player?: { getHealth(): number; getMaxHealth(): number };
}

export class BookManager {
  private scene: Phaser.Scene;
  private mainScene: MainScene;
  private keyHandler!: (event: KeyboardEvent) => void;
  private puzzlePieces: PuzzlePiece[] = PUZZLE_DATA;
  public showUnlockAnimation = false;
  private bookOpenedAfterMission = false;
  private level1Completed = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.mainScene = scene as MainScene;
    this.setupKeyHandler();
    this.scene.events.on("level1Completed", () => {
      this.level1Completed = true;
    });
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

  public open(initialTab?: "Tasks" | "Levels" | "Elements"): void {
    if (this.scene.scene.isActive("BookScene")) return;

    this.scene.scene.pause();
    this.scene.scene.launch("BookScene", {
      puzzlePieces: this.puzzlePieces,
      initialTab: initialTab || "Tasks",
      showUnlockAnimation: this.showUnlockAnimation,
      level1Completed: this.level1Completed,
    });
    this.scene.input.setDefaultCursor("default");

    this.markPiecesAsViewed();
  }

  public close(): void {
    if (!this.scene.scene.isActive("BookScene")) return;

    this.scene.scene.stop("BookScene");
    this.scene.scene.resume();

    const bookScene = this.scene.scene.get("BookScene") as any;
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
