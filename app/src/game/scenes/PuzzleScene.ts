import Phaser from "phaser";
import { BookManager } from "../../managers/BookManager";
import { PuzzlePiece, PUZZLE_DATA } from "../data/puzzlePieces";
import { ANIMATION_CONFIG } from "../constants/puzzle";
import { MotivationBar } from "../../managers/MotivationBarManager";
import { THEME } from "../constants/game";
import { BookStore } from "../../stores/BookStore";
import { ObjectiveManager } from "../../managers/ObjectiveManager";

interface Level1Scene extends Phaser.Scene {
  bookManager?: BookManager;
  damagePlayer(amount: number): void;
  player?: { getHealth(): number; getMaxHealth(): number };
  interactableObjects?: Phaser.Physics.Arcade.StaticGroup;
}

export class PuzzleScene extends Phaser.Scene {
  private hoverTweens: Phaser.Tweens.Tween[] = [];
  private readonly puzzleData = PUZZLE_DATA;
  private motivationBar?: MotivationBar;
  private pieceIds: number[] = [];

  constructor() {
    super({ key: "PuzzleScene" });
  }

  init(data: {
    pieceIds?: number[];
    sourceObject?: Phaser.GameObjects.Sprite;
  }) {
    this.pieceIds = data.pieceIds || [];
    (this as any).sourceObject = data.sourceObject;
  }

  preload() {
    this.load.image(
      "puzzleBackground",
      "/assets/game/level1/puzzlePiecesBackground.png"
    );
    this.puzzleData.forEach((piece) => {
      this.load.image(piece.image, `/assets/game/level1/${piece.image}.png`);
    });
  }

  create() {
    this.createBackground();
    this.createPuzzleBackground();
    this.createMotivationBar();

    const level1Scene = this.scene.get("Level1Scene") as Level1Scene;
    level1Scene.events.on("playerDamaged", this.updateMotivationBar, this);
    level1Scene.events.on("gameOver", this.closeScene, this);

    this.events.on("shutdown", () => {
      level1Scene.events.off("playerDamaged", this.updateMotivationBar, this);
      level1Scene.events.off("gameOver", this.closeScene, this);
    });
  }

  private createBackground() {
    const { width, height } = this.scale;
    this.add
      .rectangle(0, 0, width, height, 0x000000, 0.7)
      .setOrigin(0)
      .setInteractive({ useHandCursor: false })
      .on("pointerdown", () => this.closeScene());
  }

  private createPuzzleBackground() {
    const { width, height } = this.scale;
    const puzzleBackground = this.add
      .image(width / 2, height / 2, "puzzleBackground")
      .setOrigin(0.5)
      .setScale(ANIMATION_CONFIG.BACKGROUND.SCALE.from);

    this.tweens.add({
      targets: puzzleBackground,
      scale: ANIMATION_CONFIG.BACKGROUND.SCALE.to,
      duration: ANIMATION_CONFIG.BACKGROUND.DURATION,
      ease: ANIMATION_CONFIG.BACKGROUND.EASE,
      onComplete: () => this.createPuzzlePieces(),
    });
  }

  private createPuzzlePieces() {
    const { width, height } = this.scale;
    const piecePositions = [
      { x: width * 0.3, y: height * 0.5 },
      { x: width * 0.5, y: height * 0.5 },
      { x: width * 0.7, y: height * 0.5 },
    ];

    const piecesToDisplay = this.getPiecesToShow();

    piecesToDisplay.forEach((pieceData, index) => {
      this.createPuzzlePiece(pieceData, piecePositions[index], index);
    });
  }

  private createPuzzlePiece(
    pieceData: PuzzlePiece,
    position: { x: number; y: number },
    index: number
  ) {
    const piece = this.add
      .image(position.x, position.y, pieceData.image)
      .setOrigin(0.5)
      .setScale(0)
      .setInteractive({ useHandCursor: true });

    const label = this.add
      .text(position.x, position.y + 60, pieceData.label, {
        color: THEME.COLORS.TEXT.PRIMARY,
        fontSize: "16px",
        fontFamily: "Arial",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.setupPieceInteractions(piece, index);
    this.animatePieceEntry(piece, label, index);
    (piece as any).pieceData = pieceData;
    piece.on("pointerdown", () => this.selectPiece(piece));
  }

  private setupPieceInteractions(
    piece: Phaser.GameObjects.Image,
    index: number
  ) {
    piece.on("pointerover", () => this.handlePieceHover(piece, index));
    piece.on("pointerout", () => this.handlePieceUnhover(piece, index));
  }

  private handlePieceHover(piece: Phaser.GameObjects.Image, index: number) {
    this.hoverTweens[index]?.stop();
    this.hoverTweens[index] = this.tweens.add({
      targets: piece,
      scale: ANIMATION_CONFIG.PIECE.HOVER.SCALE,
      duration: ANIMATION_CONFIG.PIECE.HOVER.DURATION,
      ease: ANIMATION_CONFIG.PIECE.HOVER.EASE,
    });
  }

  private handlePieceUnhover(piece: Phaser.GameObjects.Image, index: number) {
    this.hoverTweens[index]?.stop();
    this.hoverTweens[index] = this.tweens.add({
      targets: piece,
      scale: 1,
      duration: ANIMATION_CONFIG.PIECE.HOVER.DURATION,
      ease: ANIMATION_CONFIG.PIECE.HOVER.EASE,
    });
  }

  private animatePieceEntry(
    piece: Phaser.GameObjects.Image,
    label: Phaser.GameObjects.Text,
    index: number
  ) {
    this.tweens.add({
      targets: [piece, label],
      scale: 1,
      alpha: 1,
      duration: ANIMATION_CONFIG.PIECE.FADE.DURATION,
      delay: index * ANIMATION_CONFIG.PIECE.FADE.DELAY,
      ease: ANIMATION_CONFIG.PIECE.FADE.EASE,
    });
  }

  private selectPiece(piece: Phaser.GameObjects.Image) {
    const pieceData = (piece as any).pieceData;
    if (!pieceData) return;

    if (pieceData.isCorrect) {
      piece.disableInteractive();
      pieceData.collected = true;
      if (pieceData.id) {
        ObjectiveManager.completeTask(1, pieceData.id.toString());
      }
      this.handleCorrectPiece(piece, pieceData);
    } else {
      this.handleIncorrectPiece(piece);
    }
  }

  private handleCorrectPiece(
    piece: Phaser.GameObjects.Image,
    pieceData: PuzzlePiece
  ) {
    this.tweens.add({
      targets: piece,
      scale: ANIMATION_CONFIG.PIECE.SELECT.SCALE,
      duration: ANIMATION_CONFIG.PIECE.SELECT.DURATION,
      ease: ANIMATION_CONFIG.PIECE.SELECT.EASE,
      onComplete: () => this.movePieceToBook(piece, pieceData),
    });
  }

  private movePieceToBook(
    piece: Phaser.GameObjects.Image,
    pieceData: PuzzlePiece
  ) {
    this.tweens.add({
      targets: piece,
      x: ANIMATION_CONFIG.BOOK.POSITION.x,
      y: ANIMATION_CONFIG.BOOK.POSITION.y,
      scale: 0,
      duration: ANIMATION_CONFIG.BOOK.MOVE_DURATION,
      ease: ANIMATION_CONFIG.BOOK.EASE,
      onComplete: () => this.handlePieceCollection(pieceData),
    });
  }

  private handlePieceCollection(pieceData: PuzzlePiece) {
    const level1Scene = this.scene.get("Level1Scene") as Level1Scene;

    if ((this as any).sourceObject && level1Scene.interactableObjects) {
      level1Scene.interactableObjects.remove(
        (this as any).sourceObject,
        true,
        true
      );
    }

    const bookManager = BookStore.get();
    if (bookManager) {
      bookManager.addPuzzlePiece({
        id: pieceData.id,
        label: pieceData.label,
        isCorrect: pieceData.isCorrect,
        image: pieceData.image,
      });
    }

    const remainingCorrectPieces = this.puzzleData.filter(
      (piece) => piece.isCorrect && !piece.collected
    );

    if (remainingCorrectPieces.length === 0) {
      level1Scene.scene.get("Level1Scene") as Level1Scene;
      level1Scene.events.emit("allPiecesCollected");
    }

    this.closeScene();
  }

  private handleIncorrectPiece(piece: Phaser.GameObjects.Image) {
    const level1Scene = this.scene.get("Level1Scene") as Level1Scene;
    level1Scene.damagePlayer(33);
    this.shakePiece(piece);
  }

  private shakePiece(piece: Phaser.GameObjects.Image) {
    const originalX = piece.x;
    this.tweens.add({
      targets: piece,
      x: originalX + 10,
      duration: 50,
      ease: "Power2",
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        piece.x = originalX;
      },
    });
  }

  private getPiecesToShow(): PuzzlePiece[] {
    if (this.pieceIds.length > 0) {
      const piecesForInteraction = this.puzzleData.filter((p) =>
        this.pieceIds.includes(p.id)
      );
      if (piecesForInteraction.length > 0) {
        return piecesForInteraction.sort(() => 0.5 - Math.random());
      }
    }
    return [];
  }

  private createMotivationBar() {
    const level1Scene = this.scene.get("Level1Scene") as Level1Scene;
    if (!level1Scene.player) return;

    this.motivationBar = new MotivationBar(
      this,
      1100,
      16,
      level1Scene.player.getMaxHealth(),
      160
    );
    this.motivationBar.setHealth(level1Scene.player.getHealth());
  }

  private updateMotivationBar() {
    const level1Scene = this.scene.get("Level1Scene") as Level1Scene;
    if (this.motivationBar && level1Scene.player) {
      this.motivationBar.setHealth(level1Scene.player.getHealth());
    }
  }

  private closeScene() {
    this.scene.stop();
    this.scene.resume("Level1Scene");
  }

  shutdown() {
    this.tweens.killAll();

    this.hoverTweens.forEach((tween) => tween?.stop());
    this.hoverTweens = [];
  }
}
