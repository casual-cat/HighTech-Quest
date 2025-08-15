import Phaser from "phaser";
import { PuzzlePiece, PUZZLE_DATA } from "../game/data/puzzlePieces";

interface GameScene extends Phaser.Scene {
  player?: { getHealth(): number; getMaxHealth(): number };
}

export class BookManager {
  private currentScene!: Phaser.Scene;
  private keyHandler!: (event: KeyboardEvent) => void;
  private puzzlePieces: PuzzlePiece[] = PUZZLE_DATA;
  public showUnlockAnimation = false;
  private bookOpenedAfterMission = false;
  private level1Completed = false;

  constructor(scene: Phaser.Scene) {
    this.setupKeyHandler();
  }

  private setupKeyHandler(): void {
    this.keyHandler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "q" && this.currentScene) {
        if (this.currentScene.scene.isActive("BookScene")) {
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
    this.currentScene.events.emit("bookStateChanged", {
      hasNewPieces: this.hasUnviewedPieces(),
    });
  }

  public open(initialTab?: "Tasks" | "Levels" | "Elements"): void {
    if (this.currentScene.scene.isActive("BookScene")) return;

    if (this.currentScene.scene.isActive()) {
      this.currentScene.scene.pause();
    }

    this.currentScene.scene.launch("BookScene", {
      puzzlePieces: this.puzzlePieces,
      initialTab: initialTab || "Tasks",
      showUnlockAnimation: this.showUnlockAnimation,
      level1Completed: this.level1Completed,
    });

    this.currentScene.scene.bringToTop("BookScene");
    this.currentScene.input.setDefaultCursor("default");

    this.markPiecesAsViewed();
  }

  public close(): void {
    if (!this.currentScene.scene.isActive("BookScene")) return;

    this.currentScene.scene.stop("BookScene");
    this.currentScene.scene.resume();

    const bookScene = this.currentScene.scene.get("BookScene") as any;
    if (bookScene) {
      bookScene.resetTab && bookScene.resetTab();
    }
  }

  public destroy(): void {
    window.removeEventListener("keydown", this.keyHandler);
    if (this.currentScene.scene.isActive("BookScene")) {
      this.currentScene.scene.stop("BookScene");
    }
  }

  public setLevel1Completed() {
    this.level1Completed = true;
  }

  public setCurrentScene(scene: Phaser.Scene): void {
    this.currentScene = scene;
  }
}
