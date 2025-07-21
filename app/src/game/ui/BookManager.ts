import Phaser from "phaser";
import { GameOverScene } from "../scenes/GameOverScene";
import { PuzzlePiece, PUZZLE_DATA } from "../data/puzzlePieces";
import { BOOK_LEVELS_LAYOUT, BOOK_SCENE_CONFIG } from "../constants/book";

interface MainScene extends Phaser.Scene {
  player?: { getHealth(): number; getMaxHealth(): number };
}

export class BookManager {
  private scene: Phaser.Scene;
  private mainScene: MainScene;
  private keyHandler!: (event: KeyboardEvent) => void;
  private puzzlePieces: PuzzlePiece[] = PUZZLE_DATA;
  public showUnlockAnimation = false;
  private allPiecesCollected = false;
  private bookOpenedAfterMission = false;
  private level1Completed = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.mainScene = scene as MainScene;
    this.setupKeyHandler();
    this.scene.events.on("allPiecesCollected", () => {
      this.allPiecesCollected = true;
    });
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
          this.openWithMissionCheck();
        }
      }
    };

    window.addEventListener("keydown", this.keyHandler);
  }

  public openWithMissionCheck(): void {
    if (this.allPiecesCollected && !this.bookOpenedAfterMission) {
      this.open();
      this.bookOpenedAfterMission = true;
    } else {
      this.open();
    }
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
  private showUnlockAnimation = false;
  private allPiecesCollected = false;
  private level1Completed = false;

  constructor() {
    super({ key: "BookScene" });
  }

  init(data: {
    puzzlePieces: PuzzlePiece[];
    initialTab?: "Tasks" | "Levels" | "Elements";
    showUnlockAnimation?: boolean;
    level1Completed?: boolean;
  }): void {
    this.puzzlePieces = data.puzzlePieces;
    this.currentTab = data.initialTab || "Tasks";
    this.showUnlockAnimation = !!data.showUnlockAnimation;
    this.level1Completed = !!data.level1Completed;
  }

  preload(): void {
    this.load.image("myCV", "/assets/ui/book/myCV.png");
    this.load.image("cv", "/assets/ui/book/cv.png");
    this.load.image("cv-locked", "/assets/ui/book/cv-locked.png");
    this.load.image("lock", "/assets/ui/book/lock.png");
    this.load.spritesheet("lock-sprite", "/assets/ui/book/lock-sprite.png", {
      frameWidth: 192,
      frameHeight: 192,
      endFrame: 5,
    });
    this.load.image("level1-title", "/assets/ui/book/level1-title.png");
    this.load.image("level2-title", "/assets/ui/book/level2-title.png");
    this.load.image("star-empty", "/assets/ui/book/star-empty.png");
    this.load.image("tasks", "/assets/ui/book/tasks.png");
    this.load.image("levels", "/assets/ui/book/levels.png");
    this.load.image("elements", "/assets/ui/book/elements.png");
    this.load.image("darken-right", "/assets/ui/book/darkPage-right.png");
    this.load.image("level1-image", "/assets/ui/book/level1-image.png");
    this.load.image("level2-image", "/assets/ui/book/level2-image.png");
  }

  create(): void {
    this.setupOverlay();
    this.createBook();
    this.createTabs();
    this.tabContentGroup = this.add.group();
    this.updateBookImage();
    this.renderTabContent();
    this.scene.get("MainScene")?.events.on("allPiecesCollected", () => {
      this.allPiecesCollected = true;
    });
  }

  update(): void {
    this.checkGameOver();
  }

  private createTabs(): void {
    const { width, height } = this.scale;

    const tabData = [
      { name: "Tasks", image: "tasks", x: width * 0.189, y: height * 0.0565 },
      { name: "Levels", image: "levels", x: width * 0.266, y: height * 0.0565 },
      {
        name: "Elements",
        image: "elements",
        x: width * 0.347,
        y: height * 0.0565,
      },
    ];

    tabData.forEach((tab) => {
      const tabImage = this.add
        .image(tab.x, tab.y, tab.image)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
          this.currentTab = tab.name as typeof this.currentTab;
          this.updateBookImage();
          this.renderTabContent();
        });
    });
  }

  private renderTabContent(): void {
    this.tabContentGroup.clear(true, true);

    if (this.currentTab === "Tasks") {
      this.displayTasks();
    } else if (this.currentTab === "Levels") {
      this.displayLevels();
    } else if (this.currentTab === "Elements") {
      this.displayElements();
    }
  }

  private displayTasks(): void {
    const { width, height } = this.scale;
    const baseY = height * 0.28;

    const cvPieces = this.puzzlePieces.filter((piece) => piece.isCorrect);
    const allPiecesCollected = cvPieces.every((piece) => piece.collected);

    const titleText = allPiecesCollected
      ? "Submit your CV using the computer"
      : "Find all CV pieces in the room";

    const title = this.add
      .text(width * 0.6, baseY - 50, titleText, {
        ...BOOK_SCENE_CONFIG.TEXT.STYLE,
        color: "#000",
        fontSize: "18px",
      })
      .setOrigin(0, 0.5);
    this.tabContentGroup.add(title);

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
    const {
      pageY,
      leftPageX,
      rightPageX,
      titleYOffset,
      titleXOffset,
      starSpacing,
      leftStarsX,
      rightStarsX,
      starsY,
      lockXOffset,
      lockYOffset,
    } = BOOK_LEVELS_LAYOUT;

    const level1Title = this.add
      .image(leftPageX + titleXOffset, pageY + titleYOffset, "level1-title")
      .setOrigin(0);
    this.tabContentGroup.add(level1Title);

    const level1Image = this.add
      .image(leftPageX + 50, pageY + 90, "level1-image")
      .setOrigin(0);
    this.tabContentGroup.add(level1Image);

    for (let i = 0; i < 5; i++) {
      const star = this.add
        .image(leftStarsX + i * starSpacing, starsY, "star-empty")
        .setOrigin(0);
      this.tabContentGroup.add(star);
    }

    const level2Title = this.add
      .image(rightPageX + titleXOffset, pageY + titleYOffset, "level2-title")
      .setOrigin(0);
    this.tabContentGroup.add(level2Title);

    const level2Image = this.add
      .image(rightPageX + 60, pageY + 90, "level2-image")
      .setOrigin(0);
    this.tabContentGroup.add(level2Image);

    for (let i = 0; i < 5; i++) {
      const star = this.add
        .image(rightStarsX + i * starSpacing, starsY, "star-empty")
        .setOrigin(0);
      this.tabContentGroup.add(star);
    }

    if (!this.level1Completed || this.showUnlockAnimation) {
      const darkenOverlay = this.add.image(rightPageX, pageY, "darken-right");
      darkenOverlay.setOrigin(0);
      darkenOverlay.setAlpha(0.5);

      const lock = this.add
        .sprite(rightPageX + lockXOffset, pageY + lockYOffset, "lock-sprite", 0)
        .setOrigin(0.5);
      lock.anims.create({
        key: "lock-unlock",
        frames: this.anims.generateFrameNumbers("lock-sprite", {
          start: 0,
          end: 5,
        }),
        frameRate: 8,
      });

      this.tabContentGroup.add(darkenOverlay);
      this.tabContentGroup.add(lock);

      if (this.showUnlockAnimation) {
        const bookManager = (this.scene.get("MainScene") as any)?.bookManager;
        lock.anims.play("lock-unlock");
        lock.on("animationcomplete", () => {
          lock.destroy();
          this.tweens.add({
            targets: darkenOverlay,
            alpha: 0,
            duration: 800,
            ease: "Linear",
            onComplete: () => {
              darkenOverlay.destroy();
              this.showUnlockAnimation = false;
              if (bookManager) {
                bookManager.showUnlockAnimation = false;
              }
            },
          });
        });
      }
    }
  }

  private displayElements(): void {
    const { width, height } = this.scale;

    const title = this.add.image(width * 0.27, height * 0.13, "myCV");
    const cvImageKey = this.allPiecesCollected ? "cv" : "cv-locked";
    const cv = this.add.image(width * 0.27, height * 0.52, cvImageKey);
    this.tabContentGroup.add(title);
    this.tabContentGroup.add(cv);

    const correctPieces = this.puzzlePieces.filter((p) => p.isCorrect);
    const cols = 2;
    const spacingX = 200;
    const spacingY = 140;
    const gridStartX = width * 0.72 - spacingX / 2;
    const gridStartY = height * 0.18;

    correctPieces.forEach((piece, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = gridStartX + col * spacingX;
      const y = gridStartY + row * spacingY;
      const imageKey = piece.collected ? piece.image : "lock";
      const img = this.add.image(x, y, imageKey).setOrigin(0.5).setScale(0.7);
      this.tabContentGroup.add(img);
      if (piece.collected) {
        const label = this.add
          .text(x, y + 35, piece.label, {
            fontSize: "14px",
            color: "#333",
            fontStyle: "bold",
          })
          .setOrigin(0.5, 0);
        const description = this.add
          .text(x, y + 50, piece.description!, {
            fontSize: "13px",
            color: "#333",
            wordWrap: { width: 170 },
            align: "center",
          })
          .setOrigin(0.5, 0);
        this.tabContentGroup.add(label);
        this.tabContentGroup.add(description);
      }
    });
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
    const qKeyX = bookBounds.centerX - 340;
    const qKeyY = bookBounds.bottom - 70;

    this.add.image(qKeyX - 45, qKeyY, "qKey").setOrigin(0.5);

    this.add
      .text(qKeyX + 45, qKeyY, "Close Notebook", {
        fontSize: "16px",
        color: "#333333",
      })
      .setOrigin(0.5);
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
