import Phaser from "phaser";
import { BookManager } from "../ui/BookManager";
import { Chest } from "../entities/Chest";
import { PuzzlePiece, PUZZLE_DATA } from "../data/puzzlePieces";
import { ANIMATION_CONFIG } from "../constants/puzzle";
import { HealthBar } from "../ui/HealthBar";

interface MainScene extends Phaser.Scene {
  bookManager?: BookManager;
  damagePlayer(amount: number): void;
  player?: { getHealth(): number; getMaxHealth(): number };
}

export class PuzzleScene extends Phaser.Scene {
  private puzzlePieces: Phaser.GameObjects.Image[] = [];
  private selectedPiece: number | null = null;
  private hoverTweens: Phaser.Tweens.Tween[] = [];
  private readonly puzzleData = PUZZLE_DATA;
  private healthBar?: HealthBar;

  constructor() {
    super({ key: "PuzzleScene" });
  }

  preload() {
    this.load.image(
      "puzzleBackground",
      "/assets/game/level1/puzzlePiecesBackground.png"
    );
    this.load.image("puzzlePiece1", "/assets/game/level1/puzzlePiece1.png");
    this.load.image("puzzlePiece2", "/assets/game/level1/puzzlePiece2.png");
    this.load.image("puzzlePiece3", "/assets/game/level1/puzzlePiece3.png");
    this.load.spritesheet("heart", "/assets/game/heart.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  create() {
    this.createBackground();
    this.createPuzzleBackground();
    this.createHealthBar();
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

    const piecesToDisplay = this.getRandomPieces();
    piecesToDisplay.forEach((pieceData, index) => {
      this.createPuzzlePiece(pieceData, piecePositions[index], index);
    });
  }

  private createPuzzlePiece(
    pieceData: PuzzlePiece,
    position: { x: number; y: number },
    index: number
  ) {
    const imageKey = `puzzlePiece${index + 1}`;
    const piece = this.add
      .image(position.x, position.y, imageKey)
      .setOrigin(0.5)
      .setScale(0)
      .setInteractive({ useHandCursor: true });

    const label = this.add
      .text(position.x, position.y + 60, pieceData.label, {
        color: "#ffffff",
        fontSize: "16px",
        fontFamily: "Arial",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.setupPieceInteractions(piece, index);
    this.animatePieceEntry(piece, label, index);
    (piece as any).pieceData = pieceData;
    piece.on("pointerdown", () => this.selectPiece(piece));

    this.puzzlePieces.push(piece);
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
    if (this.selectedPiece !== null) return;

    const pieceData = (piece as any).pieceData;
    if (!pieceData) return;

    pieceData.wasPicked = true;

    if (pieceData.isCorrect) {
      this.handleCorrectPiece(piece, pieceData);
    } else {
      this.handleIncorrectPiece(piece);
    }
  }

  private handleCorrectPiece(
    piece: Phaser.GameObjects.Image,
    pieceData: PuzzlePiece
  ) {
    this.selectedPiece = this.puzzlePieces.indexOf(piece);

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
    const mainScene = this.scene.get("MainScene") as MainScene;

    mainScene.bookManager?.addPuzzlePiece({
      id: `piece${pieceData.id}`,
      content: pieceData.label,
    });

    const chest = mainScene.children.list.find(
      (child) => child instanceof Chest
    ) as Chest;
    if (chest) {
      chest.markAsCollected();
    }

    const remainingCorrectPieces = this.puzzleData.filter(
      (piece) => piece.isCorrect && !piece.wasPicked
    );

    if (remainingCorrectPieces.length === 0) {
      console.log("All correct pieces collected!");
    }

    this.closeScene();
  }

  private handleIncorrectPiece(piece: Phaser.GameObjects.Image) {
    const originalX = piece.x;
    const mainScene = this.scene.get("MainScene") as MainScene;
    mainScene.damagePlayer(10);
    
    if (this.healthBar && mainScene.player) {
      this.healthBar.setHealth(mainScene.player.getHealth());
    }

    this.tweens.add({
      targets: piece,
      x: piece.x - ANIMATION_CONFIG.PIECE.SHAKE.OFFSET,
      duration: ANIMATION_CONFIG.PIECE.SHAKE.DURATION,
      yoyo: true,
      repeat: ANIMATION_CONFIG.PIECE.SHAKE.REPEAT,
      ease: ANIMATION_CONFIG.PIECE.SHAKE.EASE,
      onComplete: () => {
        piece.x = originalX;
      },
    });
  }

  private getAvailablePieces(): PuzzlePiece[] {
    return this.puzzleData.filter((piece) => !piece.wasPicked);
  }

  private getRandomPieces(): PuzzlePiece[] {
    const availablePieces = this.getAvailablePieces();
    const correctPieces = availablePieces.filter((piece) => piece.isCorrect);
    const incorrectPieces = availablePieces.filter((piece) => !piece.isCorrect);

    const randomCorrectPiece =
      correctPieces[Math.floor(Math.random() * correctPieces.length)];
    const shuffledIncorrect = incorrectPieces.sort(() => 0.5 - Math.random());
    const randomIncorrectPieces = shuffledIncorrect.slice(0, 2);

    const selectedPieces = [randomCorrectPiece, ...randomIncorrectPieces];
    return selectedPieces.sort(() => 0.5 - Math.random());
  }

  private createHealthBar() {
    const mainScene = this.scene.get("MainScene") as MainScene;
    if (!mainScene.player) return;

    this.healthBar = new HealthBar(
      this,
      1100,
      16,
      mainScene.player.getMaxHealth(),
      160
    );
    this.healthBar.setHealth(mainScene.player.getHealth());
  }

  private closeScene() {
    this.scene.stop();
    this.scene.resume("MainScene");
  }
}
