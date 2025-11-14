import Phaser from "phaser";

export interface TimerConfig {
  duration: number;
  expireDamage: number;
  x: number;
  y: number;
}

export class Timer extends Phaser.Events.EventEmitter {
  private scene: Phaser.Scene;
  private duration: number;
  private expireDamage: number;
  private remainingTime: number;
  private countdownEvent?: Phaser.Time.TimerEvent;

  private timerText?: Phaser.GameObjects.Text;
  private timerFillGraphics?: Phaser.GameObjects.Graphics;
  private timerBorderGraphics?: Phaser.GameObjects.Graphics;
  private timerIcon?: Phaser.GameObjects.Image;

  private readonly timerBarWidth = 202;
  private readonly timerBarHeight = 28;

  private x: number;
  private y: number;

  constructor(scene: Phaser.Scene, config: TimerConfig) {
    super();
    this.scene = scene;
    this.duration = config.duration;
    this.expireDamage = config.expireDamage;
    this.remainingTime = config.duration;
    this.x = config.x;
    this.y = config.y;

    this.createUI();
    this.start();
  }

  private createUI(): void {
    const timerBarLeft = this.x - this.timerBarWidth / 2;

    this.timerIcon = this.scene.add
      .image(timerBarLeft - 18, this.y, "timer-icon")
      .setOrigin(0.5)
      .setDepth(5);
    this.timerIcon.setDisplaySize(21, 21);

    this.timerFillGraphics = this.scene.add.graphics({
      x: timerBarLeft,
      y: this.y - this.timerBarHeight / 2,
    });
    this.timerFillGraphics.setDepth(4);

    this.timerBorderGraphics = this.scene.add.graphics({
      x: timerBarLeft,
      y: this.y - this.timerBarHeight / 2,
    });
    this.timerBorderGraphics.setDepth(4.1);
    this.timerBorderGraphics.lineStyle(1, 0xffffff, 1);
    this.timerBorderGraphics.strokeRoundedRect(
      0,
      0,
      this.timerBarWidth,
      this.timerBarHeight,
      15
    );

    this.timerText = this.scene.add
      .text(this.x, this.y, this.formatTime(this.remainingTime), {
        fontSize: "14px",
        color: "#867122",
      })
      .setOrigin(0.5)
      .setDepth(5);

    this.updateDisplay();
  }

  private start(): void {
    this.updateDisplay();

    if (this.countdownEvent) {
      this.countdownEvent.remove(false);
    }

    this.countdownEvent = this.scene.time.addEvent({
      delay: 1000,
      callback: this.handleTick,
      callbackScope: this,
      loop: true,
    });

    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.destroy();
    });
  }

  private handleTick(): void {
    if (this.remainingTime <= 0) {
      this.countdownEvent?.remove(false);
      return;
    }

    this.remainingTime -= 1;
    this.updateDisplay();
    this.emit("tick", this.remainingTime);

    if (this.remainingTime <= 0) {
      this.countdownEvent?.remove(false);
      this.emit("complete", this.expireDamage);
    }
  }

  private updateDisplay(): void {
    this.updateTimerText();
    this.updateTimerBarFill();
  }

  private updateTimerText(): void {
    if (!this.timerText) return;
    this.timerText.setText(this.formatTime(this.remainingTime));
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const paddedSeconds = secs.toString().padStart(2, "0");
    return `${minutes}:${paddedSeconds}`;
  }

  private updateTimerBarFill(): void {
    if (!this.timerFillGraphics) {
      return;
    }

    const ratio = Phaser.Math.Clamp(this.remainingTime / this.duration, 0, 1);

    this.timerFillGraphics.clear();

    if (ratio > 0) {
      this.timerFillGraphics.fillStyle(0xffffff, 0.8);
      const fillWidth = this.timerBarWidth * ratio;
      const maxCornerRadius = Math.min(
        15,
        fillWidth / 2,
        this.timerBarHeight / 2
      );
      this.timerFillGraphics.fillRoundedRect(
        0,
        0,
        fillWidth,
        this.timerBarHeight,
        maxCornerRadius
      );
    }
  }

  public getRemainingTime(): number {
    return this.remainingTime;
  }

  public stop(): void {
    this.countdownEvent?.remove(false);
    this.countdownEvent = undefined;
  }

  public destroy(): void {
    this.stop();

    this.timerText?.destroy();
    this.timerText = undefined;

    this.timerFillGraphics?.destroy();
    this.timerFillGraphics = undefined;

    this.timerBorderGraphics?.destroy();
    this.timerBorderGraphics = undefined;

    this.timerIcon?.destroy();
    this.timerIcon = undefined;

    this.removeAllListeners();
  }
}
