import Phaser from "phaser";

export class PuzzleScene extends Phaser.Scene {
  private puzzlePieces: Phaser.GameObjects.Image[] = [];
  private selectedPiece: number | null = null;

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

    const puzzleBackground = this.add
      .image(width / 2, height / 2, "puzzleBackground")
      .setOrigin(0.5)
      .setScale(0);
    this.tweens.add({
      targets: puzzleBackground,
      scale: 1,
      duration: 500,
      ease: "Back.easeOut",
      onComplete: () => {
        const piecePositions = [
          { x: width * 0.3, y: height * 0.5 },
          { x: width * 0.5, y: height * 0.5 },
          { x: width * 0.7, y: height * 0.5 },
        ];

        piecePositions.forEach((pos, index) => {
          const piece = this.add
            .image(pos.x, pos.y, `puzzlePiece${index + 1}`)
            .setOrigin(0.5)
            .setScale(0)
            .setInteractive({ useHandCursor: true });

          this.tweens.add({
            targets: piece,
            scale: 1,
            duration: 300,
            delay: index * 200,
            ease: "Back.easeOut",
          });

          piece.on("pointerdown", () => {
            this.selectPiece(index);
          });

          this.puzzlePieces.push(piece);
        });
      },
    });
  }

  private selectPiece(index: number) {
    if (this.selectedPiece !== null) return;

    this.selectedPiece = index;

    this.tweens.add({
      targets: this.puzzlePieces[index],
      scale: 1.2,
      duration: 200,
      yoyo: true,
      onComplete: () => {
        this.scene.stop();
        this.scene.resume("MainScene");
      },
    });
  }
}
