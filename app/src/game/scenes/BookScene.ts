import Phaser from "phaser";
import { GameOverScene } from "../scenes/GameOverScene";
import { GameState } from "../../stores/GameState";
import { LEVELS_DATA } from "../data/levelData";
import { PuzzlePiece } from "../data/puzzlePieces";
import { BOOK_LEVELS_LAYOUT, BOOK_SCENE_CONFIG } from "../constants/book";
import { BookManager } from "../../managers/BookManager";
import { BookStore } from "../../stores/BookStore";

interface LevelScene extends Phaser.Scene {
  player?: { getHealth(): number; getMaxHealth(): number };
  key: string;
}

export class BookScene extends Phaser.Scene {
  private bookManager?: BookManager;
  private puzzlePieces: PuzzlePiece[] = [];
  private currentTab: "Tasks" | "Levels" | "Elements" | "Settings" = "Tasks";
  private tabContentGroup!: Phaser.GameObjects.Group;
  private bookImage!: Phaser.GameObjects.Image;
  private showUnlockAnimation = false;
  private allPiecesCollected = false;
  private nextLvlPlayBtn?: Phaser.GameObjects.Image;

  constructor() {
    super({ key: "BookScene" });
  }

  init(data: {
    puzzlePieces?: PuzzlePiece[];
    initialTab?: "Tasks" | "Levels" | "Elements";
    showUnlockAnimation?: boolean;
  }): void {
    this.puzzlePieces = data.puzzlePieces || [];
    this.currentTab = data.initialTab || "Tasks";
    this.showUnlockAnimation = !!data.showUnlockAnimation;
    this.allPiecesCollected = this.puzzlePieces
      .filter((p) => p.isCorrect)
      .every((p) => p.collected);
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
    this.load.image("level3-title", "/assets/ui/book/level3-title.png");
    this.load.image("star-empty", "/assets/ui/book/star-empty.png");
    this.load.image("tasks", "/assets/ui/book/tasks.png");
    this.load.image("levels", "/assets/ui/book/levels.png");
    this.load.image("elements", "/assets/ui/book/elements.png");
    this.load.image("darken-right", "/assets/ui/book/darkPage-right.png");
    this.load.image("level1-image", "/assets/ui/book/level1-image.png");
    this.load.image("level2-image", "/assets/ui/book/level2-image.png");
    this.load.image("level3-image", "/assets/ui/book/level3-image.png");
    this.load.image("book-tasks", "/assets/ui/book/book-tasks.png");
    this.load.image("book-levels", "/assets/ui/book/book-levels.png");
    this.load.image("book-elements", "/assets/ui/book/book-elements.png");
    this.load.image("book-settings", "/assets/ui/book/book-settings.png");
    this.load.image("checkbox", "/assets/ui/book/checkbox.png");
    this.load.image("checkbox-checked", "/assets/ui/book/checkbox-checked.png");
    this.load.image("playBtn", "/assets/ui/book/play.png");
    this.load.image("close", "/assets/ui/book/button-x.png");
    this.load.image("gear", "/assets/ui/book/gear.png");
    this.load.image("controls", "/assets/ui/book/controls.png");
  }

  create(): void {
    this.bookManager = BookStore.get();

    this.setupOverlay();
    this.createBook();
    this.createTabs();
    this.tabContentGroup = this.add.group();
    this.updateBookImage();
    this.renderTabContent();
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
      {
        name: "Settings",
        image: "gear",
        x: width * 0.086,
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
    } else if (this.currentTab === "Settings") {
      this.displaySettings();
    }
  }

  private displayTasks(): void {
    const { width, height } = this.scale;
    const baseY = height * 0.28;

    const levelData = LEVELS_DATA[GameState.currentLevel];

    const nextObjective = levelData.objectives.find((obj) => !obj.complete);

    if (!nextObjective) {
      this.tabContentGroup.add(
        this.add
          .text(width * 0.6, baseY, "All objectives are complete", {
            ...BOOK_SCENE_CONFIG.TEXT.STYLE,
            color: "#000",
            fontSize: "18px",
          })
          .setOrigin(0, 0.5)
      );
      return;
    }

    const mainObjectiveText = this.add
      .text(width * 0.6, baseY - 50, nextObjective.task, {
        ...BOOK_SCENE_CONFIG.TEXT.STYLE,
        color: "#000",
        fontSize: "18px",
      })
      .setOrigin(0, 0.5);
    this.tabContentGroup.add(mainObjectiveText);

    nextObjective.subtasks?.forEach((subTask, i) => {
      const y = baseY + i * BOOK_SCENE_CONFIG.TEXT.SPACING;

      const checkboxTexture = subTask.complete
        ? "checkbox-checked"
        : "checkbox";
      const checkbox = this.add
        .image(width * 0.55, y, checkboxTexture)
        .setOrigin(0, 0.5);
      this.tabContentGroup.add(checkbox);

      const displayText = nextObjective.hideSubtasks
        ? subTask.complete
          ? subTask.task
          : "?"
        : subTask.task;

      const subTaskText = this.add
        .text(width * 0.6, y, displayText, {
          ...BOOK_SCENE_CONFIG.TEXT.STYLE,
          color: BOOK_SCENE_CONFIG.TEXT.COLORS.VIEWED,
        })
        .setOrigin(0, 0.5);
      this.tabContentGroup.add(subTaskText);
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

    const currentLevel = GameState.currentLevel;
    const nextLevel = currentLevel + 1;

    const currentLevelData = LEVELS_DATA[currentLevel];
    if (currentLevelData) {
      const currentTitle = this.add
        .image(
          leftPageX + titleXOffset,
          pageY + titleYOffset,
          currentLevelData.titleKey
        )
        .setOrigin(0);
      this.tabContentGroup.add(currentTitle);

      const currentImage = this.add
        .image(leftPageX + 50, pageY + 90, currentLevelData.imageKey)
        .setOrigin(0);
      this.tabContentGroup.add(currentImage);

      for (let i = 0; i < 5; i++) {
        const star = this.add
          .image(leftStarsX + i * starSpacing, starsY, "star-empty")
          .setOrigin(0);
        this.tabContentGroup.add(star);
      }
    }

    const nextLevelData = LEVELS_DATA[nextLevel];
    if (nextLevelData) {
      const nextTitle = this.add
        .image(
          rightPageX + titleXOffset,
          pageY + titleYOffset,
          nextLevelData.titleKey
        )
        .setOrigin(0);
      this.tabContentGroup.add(nextTitle);

      const nextImage = this.add
        .image(rightPageX + 60, pageY + 90, nextLevelData.imageKey)
        .setOrigin(0);
      this.tabContentGroup.add(nextImage);

      for (let i = 0; i < 5; i++) {
        const star = this.add
          .image(rightStarsX + i * starSpacing, starsY, "star-empty")
          .setOrigin(0);
        this.tabContentGroup.add(star);
      }
    }

    this.nextLvlPlayBtn = this.add
      .image(rightPageX + 490, pageY + 570, "playBtn")
      .setOrigin();
    this.tabContentGroup.add(this.nextLvlPlayBtn);

    const unlocked = GameState.completedLevels?.includes(currentLevel);

    if (unlocked && !this.showUnlockAnimation) {
      this.nextLvlPlayBtn
        .setInteractive({ cursor: "pointer" })
        .on("pointerdown", () => {
          this.scene.stop(`Level${currentLevel}Scene`);
          this.scene.start(`Level${nextLevel}Scene`);
          this.scene.stop();
        });
    } else {
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

              if (this.nextLvlPlayBtn) {
                this.nextLvlPlayBtn
                  .setInteractive({ cursor: "pointer " })
                  .on("pointerdown", () => {
                    this.scene.stop(`Level${currentLevel}Scene`);
                    this.scene.start(`Level${nextLevel}Scene`);
                    this.scene.stop();
                  });
              }
            },
          });
        });
      }
    }
  }

  private displayElements(): void {
    const { width, height } = this.scale;

    if (GameState.currentLevel === 1) {
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
  }

  private displaySettings(): void {
    const { pageY, leftPageX, titleYOffset, titleXOffset } = BOOK_LEVELS_LAYOUT;

    const controls = this.add
      .image(leftPageX + titleXOffset, pageY + titleYOffset, "controls")
      .setOrigin(0);

    this.tabContentGroup.add(controls);
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
        this.scene.resume("Level1Scene");
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

    const closeBtnX = 1176;
    const closeBtnY = 40;
    const closeBtn = this.add
      .image(closeBtnX, closeBtnY, "close")
      .setScale(0.7)
      .setInteractive({ useHandCursor: true });

    closeBtn.on("pointerdown", () => {
      this.bookManager?.close();
    });

    const qKeyX = bookBounds.right - 104;
    const qKeyY = bookBounds.top + 74;
    this.add.image(qKeyX, qKeyY, "qKey").setOrigin(0.5);
  }

  private updateBookImage(): void {
    let textureKey = "book-tasks";
    if (this.currentTab === "Levels") {
      textureKey = "book-levels";
    } else if (this.currentTab === "Elements") {
      textureKey = "book-elements";
    } else if (this.currentTab === "Settings") {
      textureKey = "book-settings";
    }
    this.bookImage.setTexture(textureKey);
  }

  private getCurrentLevelScene(): LevelScene | undefined {
    const scenes = this.scene.manager.getScenes(true);
    return scenes.find((scene) => /^Level\d+Scene$/.test(scene.scene.key)) as
      | LevelScene
      | undefined;
  }

  private checkGameOver(): void {
    const currentLevel = this.getCurrentLevelScene();
    const playerHealth = currentLevel?.player?.getHealth();

    if (playerHealth !== undefined && playerHealth <= 0) {
      GameOverScene.handleGameOver(this);
    }
  }

  public resetTab() {
    this.currentTab = "Tasks";
  }
}
