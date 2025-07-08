import Phaser from "phaser";

export class SpeechManager {
  private scene: Phaser.Scene;
  private bubble: Phaser.GameObjects.Image | null = null;
  private text: Phaser.GameObjects.Text | null = null;
  private lines: string[] = [];
  private currentLine: number = 0;
  private onComplete?: () => void;
  private target?: Phaser.GameObjects.GameObject | { x: number; y: number };
  private inputHandler?: () => void;
  private autoHideTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  showSpeech(
    lines: string[],
    options?: {
      onComplete?: () => void;
      target?: Phaser.GameObjects.GameObject | { x: number; y: number };
    }
  ): void {
    this.hideSpeech();
    this.lines = lines;
    this.currentLine = 0;
    this.onComplete = options?.onComplete;
    this.target = options?.target;

    let x = this.scene.scale.width;
    let y = this.scene.scale.height * 0.2;
    if (this.target) {
      if ("x" in this.target && "y" in this.target) {
        x = this.target.x;
        y = this.target.y;
        if (
          this.target instanceof Phaser.GameObjects.GameObject &&
          "height" in this.target
        ) {
          const height = (this.target as any).height || 0;
        }
      }
    }

    this.bubble = this.scene.add.image(x, y, "speechBubble");
    this.bubble.setOrigin(0);
    this.bubble.setDepth(1000);

    if (this.target && "x" in this.target && "y" in this.target) {
      x = this.target.x;
      y = this.target.y;
      if (
        this.target instanceof Phaser.GameObjects.GameObject &&
        "height" in this.target
      ) {
        const height = (this.target as any).height || 0;
        y = y - height / 2 - this.bubble.height;
      }
      this.bubble.setPosition(x, y);
    }

    this.text = this.scene.add
      .text(x, y, "", {
        fontSize: "16px",
        color: "#222",
        wordWrap: { width: 190 },
        align: "center",
        backgroundColor: "rgba(255,255,255,0)",
      })
      .setOrigin(0.5)
      .setDepth(1001);

    if (this.bubble && this.text) {
      this.text.setPosition(
        this.bubble.x + this.bubble.width / 2 + 10,
        this.bubble.y + this.bubble.height / 2 - 4
      );
    }

    this.showCurrentLine();

    this.inputHandler = () => {
      if (this.currentLine < this.lines.length - 1) {
        this.currentLine++;
        this.showCurrentLine();
        if (this.autoHideTimer) {
          this.autoHideTimer.destroy();
        }
        this.autoHideTimer = this.scene.time.delayedCall(5000, () => {
          this.hideSpeech();
        });
      } else {
        this.hideSpeech();
      }
    };
    this.scene.input.on("pointerdown", this.inputHandler);
    this.scene.input.keyboard?.on("keydown-SPACE", this.inputHandler);
    this.scene.input.keyboard?.on("keydown-ENTER", this.inputHandler);

    this.autoHideTimer = this.scene.time.delayedCall(5000, () => {
      if (this.currentLine < this.lines.length - 1) {
        this.currentLine++;
        this.showCurrentLine();
        this.autoHideTimer = this.scene.time.delayedCall(5000, () => {
          this.hideSpeech();
        });
      } else {
        this.hideSpeech();
      }
    });
  }

  private showCurrentLine() {
    if (this.text) {
      this.text.setText(this.lines[this.currentLine]);
    }
  }

  update(): void {
    if (
      this.bubble &&
      this.target &&
      "x" in this.target &&
      "y" in this.target
    ) {
      let x = this.target.x;
      let y = this.target.y;

      if (
        this.target instanceof Phaser.GameObjects.GameObject &&
        "height" in this.target
      ) {
        const height = (this.target as any).height || 0;
        y = y - height / 2 - this.bubble.height;
      }

      this.bubble.setPosition(x, y);
      if (this.text) {
        this.text.setPosition(
          this.bubble.x + this.bubble.width / 2 + 10,
          this.bubble.y + this.bubble.height / 2 - 4
        );
      }
    }
  }

  hideSpeech(): void {
    const callback = this.onComplete;

    if (this.bubble) {
      this.bubble.destroy();
      this.bubble = null;
    }
    if (this.text) {
      this.text.destroy();
      this.text = null;
    }
    if (this.inputHandler) {
      this.scene.input.off("pointerdown", this.inputHandler);
      this.scene.input.keyboard?.off("keydown-SPACE", this.inputHandler);
      this.scene.input.keyboard?.off("keydown-ENTER", this.inputHandler);
      this.inputHandler = undefined;
    }
    if (this.autoHideTimer) {
      this.autoHideTimer.destroy();
      this.autoHideTimer = undefined;
    }
    this.lines = [];
    this.currentLine = 0;
    this.onComplete = undefined;
    this.target = undefined;

    if (callback) {
      callback();
    }
  }

  destroy(): void {
    this.hideSpeech();
  }
}
