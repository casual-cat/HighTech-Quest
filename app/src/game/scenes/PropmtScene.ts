import Phaser from "phaser";
import { BOOK_SCENE_CONFIG } from "../constants/book";
import { PROMPT_SCENE_CONFIG } from "../constants/prompt";
import { GameState } from "../../stores/GameState";

type AnimationState = "idle" | "expanding" | "shrinking";

export default class PromptScene extends Phaser.Scene {
  private currentLevel: number | undefined;
  private objectId: string | undefined;
  private expandingBackground: Phaser.GameObjects.Graphics | undefined;
  private promptMask: Phaser.GameObjects.Graphics | undefined;
  private squareSize: number = 0;
  private cornerRadius: number = 141;
  private currentSquarePosition: { x: number; y: number } = { x: 0, y: 0 };
  private squareStartPosition: { x: number; y: number } = { x: 0, y: 0 };
  private animationState: AnimationState = "idle";
  private animationTween: Phaser.Tweens.Tween | undefined;

  constructor() {
    super({ key: "PromptScene" });
  }

  init(data: { objectId: string }) {
    this.currentLevel = GameState.currentLevel;
    this.objectId = data.objectId;
  }

  preload(): void {
    if (!this.textures.exists("close")) {
      this.load.image("close", "/assets/ui/icons/button-x.png");
    }

    if (!this.textures.exists("info")) {
      this.load.image("info", "/assets/ui/icons/info.png");
    }

    if (this.objectId) {
      const imageKey = `${this.objectId}-prompt`;
      const imagePath = `/assets/game/level3/minigames/prompt/${this.objectId}-prompt.png`;
      this.loadTextureIfNotExists(imageKey, imagePath);
    }
  }

  private loadTextureIfNotExists(key: string, path: string): void {
    if (!this.textures.exists(key)) {
      this.load.image(key, path);
    }
  }

  create(): void {
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
      .setOrigin(0);

    if (this.objectId) {
      const imageKey = `${this.objectId}-prompt`;
      const prompt = this.add
        .image(width / 2, height / 2, imageKey)
        .setInteractive({ useHandCursor: false });

      this.add
        .image(
          prompt.x +
            prompt.displayWidth / 2 +
            PROMPT_SCENE_CONFIG.UI_POSITIONS.CLOSE_BUTTON.offsetX,
          prompt.y -
            prompt.displayHeight / 2 +
            PROMPT_SCENE_CONFIG.UI_POSITIONS.CLOSE_BUTTON.offsetY,
          "close"
        )
        .setInteractive({ useHandCursor: true })
        .setDepth(PROMPT_SCENE_CONFIG.ANIMATION.BUTTON_DEPTH)
        .on("pointerdown", () => this.returnToLevel());

      const infoIcon = this.add
        .image(
          prompt.x - prompt.displayWidth / 2 + PROMPT_SCENE_CONFIG.UI_POSITIONS.INFO_ICON.offsetX,
          prompt.y - prompt.displayHeight / 2 + PROMPT_SCENE_CONFIG.UI_POSITIONS.INFO_ICON.offsetY,
          "info"
        )
        .setInteractive({ useHandCursor: true })
        .setDepth(PROMPT_SCENE_CONFIG.ANIMATION.BUTTON_DEPTH)
        .on("pointerover", () => {
          this.createExpandingBackgroundAnimation(prompt);
        })
        .on("pointerout", () => {
          this.shrinkBackgroundAnimation();
        });
      infoIcon.setScale(0.9);

      const buttonY =
        prompt.y +
        prompt.displayHeight / 2 +
        PROMPT_SCENE_CONFIG.UI_POSITIONS.START_BUTTON_OFFSET_Y;
      const button = this.add
        .image(width / 2, buttonY, "button")
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
          button.setTexture("buttonPressed");
        })
        .on("pointerup", () => {
          button.setTexture("button");
          this.launchMinigame();
        });

      this.add
        .text(width / 2, buttonY, "Start", {
          fontSize: "24px",
          color: "#ffffff",
        })
        .setOrigin(0.5);
    }
  }

  private returnToLevel(): void {
    if (this.currentLevel) {
      this.scene.stop();
      this.scene.resume(`Level${this.currentLevel}Scene`);
    }
  }

  private launchMinigame(): void {
    if (this.objectId) {
      this.scene.stop();
      this.scene.launch(`${this.objectId}Scene`);
    }
  }

  private cleanupTweens(): void {
    if (this.animationTween) {
      this.animationTween.stop();
      this.animationTween = undefined;
    }
    if (this.expandingBackground) {
      this.tweens.killTweensOf(this.expandingBackground);
    }
  }

  private createExpandingBackgroundAnimation(
    prompt: Phaser.GameObjects.Image
  ): void {
    if (this.animationState === "expanding") {
      return;
    }

    const wasShrinking = this.animationState === "shrinking";

    this.cleanupTweens();

    this.animationState = "expanding";

    if (!this.expandingBackground) {
      this.expandingBackground = this.add.graphics();
      this.expandingBackground.setDepth(PROMPT_SCENE_CONFIG.ANIMATION.BACKGROUND_DEPTH);
    }

    if (!this.promptMask) {
      this.promptMask = this.add.graphics();
      this.promptMask.fillStyle(0xffffff);
      this.promptMask.fillRect(
        prompt.x - prompt.displayWidth / 2,
        prompt.y - prompt.displayHeight / 2,
        prompt.displayWidth,
        prompt.displayHeight
      );
      this.promptMask.setVisible(false);
    }

    const bitmapMask = new Phaser.Display.Masks.BitmapMask(
      this,
      this.promptMask
    );
    this.expandingBackground.setMask(bitmapMask);

    const maskLeft = prompt.x - prompt.displayWidth / 2;
    const maskTop = prompt.y - prompt.displayHeight / 2;

    const squareSize =
      Math.sqrt(
        (prompt.displayWidth / 2) ** 2 + (prompt.displayHeight / 2) ** 2
      ) *
        3.5 +
      this.cornerRadius * 1.5;
    this.squareSize = squareSize;

    let startX: number;
    let startY: number;

    if (wasShrinking) {
      startX = this.currentSquarePosition.x;
      startY = this.currentSquarePosition.y;
    } else {
      startX = maskLeft - squareSize;
      startY = maskTop - squareSize;
      this.squareStartPosition = { x: startX, y: startY };
    }

    const endX =
      maskLeft +
      prompt.displayWidth -
      squareSize +
      PROMPT_SCENE_CONFIG.ANIMATION.EXPAND_OFFSET;
    const endY =
      maskTop +
      prompt.displayHeight -
      squareSize +
      PROMPT_SCENE_CONFIG.ANIMATION.EXPAND_OFFSET;

    const positionObj = { x: startX, y: startY };

    this.drawInfoBackground(
      this.expandingBackground,
      startX,
      startY,
      squareSize,
      this.cornerRadius
    );

    this.animationTween = this.tweens.add({
      targets: positionObj,
      x: endX,
      y: endY,
      duration: PROMPT_SCENE_CONFIG.ANIMATION.EXPAND_DURATION,
      ease: PROMPT_SCENE_CONFIG.ANIMATION.EXPAND_EASING,
      onUpdate: () => {
        if (this.expandingBackground) {
          this.currentSquarePosition.x = positionObj.x;
          this.currentSquarePosition.y = positionObj.y;
          this.drawInfoBackground(
            this.expandingBackground,
            positionObj.x,
            positionObj.y,
            squareSize,
            this.cornerRadius
          );
        }
      },
      onComplete: () => {
        this.animationState = "idle";
      },
    });
  }

  private shrinkBackgroundAnimation(): void {
    if (!this.expandingBackground || this.animationState === "shrinking") {
      return;
    }

    this.cleanupTweens();

    const graphics = this.expandingBackground;

    const startX = this.currentSquarePosition.x;
    const startY = this.currentSquarePosition.y;

    const positionObj = { x: startX, y: startY };

    this.animationState = "shrinking";

    this.animationTween = this.tweens.add({
      targets: positionObj,
      x: this.squareStartPosition.x,
      y: this.squareStartPosition.y,
      duration: PROMPT_SCENE_CONFIG.ANIMATION.SHRINK_DURATION,
      ease: PROMPT_SCENE_CONFIG.ANIMATION.SHRINK_EASING,
      onUpdate: () => {
        if (graphics) {
          this.currentSquarePosition.x = positionObj.x;
          this.currentSquarePosition.y = positionObj.y;
          this.drawInfoBackground(
            graphics,
            positionObj.x,
            positionObj.y,
            this.squareSize,
            this.cornerRadius
          );
        }
      },
      onComplete: () => {
        if (graphics) {
          graphics.destroy();
          this.expandingBackground = undefined;
        }
        if (this.promptMask) {
          this.promptMask.destroy();
          this.promptMask = undefined;
        }
        this.animationState = "idle";
      },
    });
  }

  private drawInfoBackground(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    size: number,
    radius: number
  ): void {
    graphics.clear();
    graphics.fillStyle(
      PROMPT_SCENE_CONFIG.ANIMATION.BACKGROUND_COLOR,
      PROMPT_SCENE_CONFIG.ANIMATION.BACKGROUND_ALPHA
    );

    graphics.beginPath();
    graphics.moveTo(x, y);
    graphics.lineTo(x + size, y);
    graphics.lineTo(x + size, y + size - radius);
    graphics.arc(x + size - radius, y + size - radius, radius, 0, Math.PI / 2);
    graphics.lineTo(x, y + size);
    graphics.closePath();
    graphics.fillPath();
  }
}
