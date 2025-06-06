import Phaser from "phaser";

interface PuzzlePiece {
  id: number;
  imageKey: string;
  isCorrect: boolean;
  label: string;
}

export class PuzzleScene extends Phaser.Scene {
  private puzzlePieces: Phaser.GameObjects.Image[] = [];
  private selectedPiece: number | null = null;
  private hoverTweens: Phaser.Tweens.Tween[] = [];
  private pieceLabels: Phaser.GameObjects.Text[] = [];

  private readonly puzzleData: PuzzlePiece[] = [
    {
      id: 1,
      imageKey: "puzzlePiece1",
      isCorrect: false,
      label: "Option 1",
    },
    {
      id: 2,
      imageKey: "puzzlePiece2",
      isCorrect: true,
      label: "Option 2",
    },
    {
      id: 3,
      imageKey: "puzzlePiece3",
      isCorrect: false,
      label: "Option 3",
    },
  ];

  constructor() {
    super({ key: "PuzzleScene" });
  }

  preload() {
    this.load.image(
      "puzzleBackground",
      "/assets/game/level1/puzzlePiecesBackground.png"
    );
    this.puzzleData.forEach((piece) => {
      this.load.image(
        piece.imageKey,
        `/assets/game/level1/${piece.imageKey}.png`
      );
    });
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

        this.puzzleData.forEach((pieceData, index) => {
          const pos = piecePositions[index];
          const piece = this.add
            .image(pos.x, pos.y, pieceData.imageKey)
            .setOrigin(0.5)
            .setScale(0)
            .setInteractive({ useHandCursor: true });

          const label = this.add
            .text(pos.x, pos.y + 60, pieceData.label, {
              color: "#ffffff",
              fontSize: "16px",
              fontFamily: "Arial",
            })
            .setOrigin(0.5)
            .setAlpha(0);

          this.pieceLabels.push(label);

          piece.on("pointerover", () => {
            this.hoverTweens[index]?.stop();

            this.hoverTweens[index] = this.tweens.add({
              targets: piece,
              scale: 1.2,
              duration: 200,
              ease: "Power2",
            });
          });

          piece.on("pointerout", () => {
            this.hoverTweens[index]?.stop();

            this.hoverTweens[index] = this.tweens.add({
              targets: piece,
              scale: 1,
              duration: 200,
              ease: "Power2",
            });
          });

          this.tweens.add({
            targets: [piece, label],
            scale: 1,
            alpha: 1,
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

    const selectedPieceData = this.puzzleData[index];
    const piece = this.puzzlePieces[index];

    if (selectedPieceData.isCorrect) {
      this.selectedPiece = index;
      
      this.tweens.add({
        targets: piece,
        scale: 1.5,
        duration: 600,
        ease: "Power2",
        onComplete: () => {
          const bookIconX = 16 * 8;
          const bookIconY = 16 * 3;
          
          this.tweens.add({
            targets: piece,
            x: bookIconX,
            y: bookIconY,
            scale: 0,
            duration: 1000,
            ease: "Power2.out",
            onComplete: () => {
              this.scene.stop();
              this.scene.resume("MainScene");
            }
          });
        }
      });
    } else {
      this.tweens.add({
        targets: piece,
        x: piece.x - 10,
        duration: 50,
        yoyo: true,
        repeat: 2,
        ease: "Sine.easeInOut",
        onComplete: () => {
          piece.x = this.scale.width * (0.3 + index * 0.2);
        },
      });
    }
  }
}
