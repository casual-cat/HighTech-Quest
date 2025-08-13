import Phaser from "phaser";
import { Player } from "../game/entities/Player";
import { RecruiterQA, UserAnswer } from "../game/data/recruiterData";

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
  private isActive: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  showSpeech(
    lines: string[],
    options?: {
      onComplete?: () => void;
      target?: Phaser.GameObjects.GameObject | { x: number; y: number };
      duration?: number;
    }
  ): void {
    if (this.isActive) return;
    this.isActive = true;
    this.lines = lines;
    this.currentLine = 0;
    this.onComplete = options?.onComplete;
    this.target = options?.target;

    const duration = options?.duration ?? 5000;

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
    this.bubble.setOrigin(0, 1);
    this.bubble.setDepth(1000);

    if (this.target && "x" in this.target && "y" in this.target) {
      const targetWidth = (this.target as any).width || 0;
      const targetHeight = (this.target as any).height || 0;

      const x = this.target.x + targetWidth / 2;
      const y = this.target.y - targetHeight / 2;

      this.bubble.setPosition(x, y);
    }

    if (this.bubble) {
      if (this.bubble.x + this.bubble.width > this.scene.scale.width) {
        this.bubble.x = this.scene.scale.width - this.bubble.width;
      }
      if (this.bubble.y < 0) {
        this.bubble.y = 0;
      }
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
        this.bubble.y - this.bubble.height / 2 - 4
      );
    }

    this.showCurrentLine();

    const scheduleNext = () => {
      if (this.currentLine < this.lines.length - 1) {
        this.currentLine++;
        this.showCurrentLine();
        if (duration > 0) {
          if (this.autoHideTimer) {
            this.autoHideTimer.remove(false);
          }
          this.autoHideTimer = this.scene.time.delayedCall(
            duration,
            scheduleNext
          );
        }
      } else {
        this.hideSpeech();
      }
    };

    if (duration > 0) {
      this.autoHideTimer = this.scene.time.delayedCall(duration, scheduleNext);
    }

    this.inputHandler = () => {
      if (this.currentLine < this.lines.length - 1) {
        this.currentLine++;
        this.showCurrentLine();
        if (duration > 0) {
          if (this.autoHideTimer) {
            this.autoHideTimer.remove(false);
          }
          this.autoHideTimer = this.scene.time.delayedCall(
            duration,
            scheduleNext
          );
        }
      } else {
        this.hideSpeech();
      }
    };

    this.scene.input.on("pointerdown", this.inputHandler);
    this.scene.input.keyboard?.on("keydown-SPACE", this.inputHandler);
    this.scene.input.keyboard?.on("keydown-ENTER", this.inputHandler);
  }

  startInterview(
    qa: RecruiterQA,
    options: {
      target: Phaser.GameObjects.GameObject | { x: number; y: number };
      onAnswerSelected: (answer: UserAnswer) => void;
      player: Player;
    }
  ): void {
    this.hideSpeech();

    this.showSpeech([qa.question], {
      target: options.target,
      duration: 0,
      onComplete: undefined,
    });

    const bubbleX = this.bubble?.x ?? this.scene.scale.width / 2;
    const bubbleY = this.bubble?.y ?? this.scene.scale.height / 2;
    const bubbleWidth = this.bubble?.width ?? 200;
    const bubbleHeight = this.bubble?.height ?? 100;

    const startX = bubbleX + bubbleWidth / 2;
    const startY = bubbleY + 30;

    const answerGroup = this.scene.add.group();
    const spacing = 60;

    qa.answers.forEach((answer, index) => {
      const optionY = startY + index * spacing;

      const bubble = this.scene.add
        .image(startX, optionY, "optionBubble")
        .setOrigin(0.5)
        .setScale(1, 2)
        .setDepth(1000)
        .setInteractive({ useHandCursor: true });

      const answerText = this.scene.add
        .text(startX, optionY, answer.text, {
          fontSize: "14px",
          color: "#222",
          align: "center",
          wordWrap: { width: bubble.width - 20 },
        })
        .setOrigin(0.5)
        .setDepth(1001)
        .setInteractive({ useHandCursor: true });

      const select = () => {
        this.hideSpeech();
        bubble.destroy();
        answerText.destroy();
        answerGroup.clear(true, true);
        options.onAnswerSelected(answer);
      };

      bubble.on("pointerdown", select);
      answerText.on("pointerdown", select);

      answerGroup.addMultiple([bubble, answerText]);
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
      const targetWidth = (this.target as any).width || 0;
      const targetHeight = (this.target as any).height || 0;

      const x = this.target.x + targetWidth / 2;
      let y = this.target.y - targetHeight / 2;

      this.bubble.setPosition(x, y);

      if (this.bubble) {
        if (this.bubble.x + this.bubble.width > this.scene.scale.width) {
          this.bubble.x = this.scene.scale.width - this.bubble.width;
        }
        if (this.bubble.y - this.bubble.height < 0) {
          this.bubble.y = this.bubble.height;
        }
      }

      if (this.text) {
        this.text.setPosition(
          this.bubble.x + this.bubble.width / 2 + 10,
          this.bubble.y - this.bubble.height / 2 - 4
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

    this.isActive = false;

    if (callback) {
      callback();
    }
  }

  destroy(): void {
    this.hideSpeech();
  }
}
