import Phaser from "phaser";
import { GameState } from "../../stores/GameState";
import { ObjectiveManager } from "../../managers/ObjectiveManager";
import { BOOK_SCENE_CONFIG } from "../constants/book";
import { Timer } from "../entities/Timer";

export default class minigame3Scene extends Phaser.Scene {
  private static readonly MISMATCH_DAMAGE = 10;
  private static readonly TIMER_EXPIRE_DAMAGE = 20;
  private static readonly COUNTDOWN_DURATION = 120;
  private currentLevel: number | undefined;
  private timer?: Timer;
  private isGameComplete = false;
  private parentSceneKey?: string;

  constructor() {
    super({ key: "minigame3Scene" });
  }

  init(): void {
    this.currentLevel = GameState.currentLevel;
    this.isGameComplete = false;
    this.parentSceneKey = undefined;
    this.timer = undefined;
  }

  preload(): void {}

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
      .setOrigin(0)
      .setDepth(0)
      .setScrollFactor(0);

    const background = this.add.image(
      width / 2,
      height / 2,
      "minigame-basic-background"
    );
    const backgroundBounds = background.getBounds();

    const columnBaselineY = height / 2;
    const timerY = Phaser.Math.Linear(
      backgroundBounds.top,
      columnBaselineY - 100,
      0.5
    );
    const timerContainerCenterX = backgroundBounds.centerX + 16;

    this.timer = new Timer(this, {
      duration: minigame3Scene.COUNTDOWN_DURATION,
      expireDamage: minigame3Scene.TIMER_EXPIRE_DAMAGE,
      x: timerContainerCenterX,
      y: timerY,
    });

    this.timer.on("complete", () => this.failMinigame());

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.timer?.destroy();
    });
  }

  private failMinigame(): void {
    if (this.isGameComplete) {
      return;
    }

    this.isGameComplete = true;

    const parentScene = GameState.getParentLevelScene(this);
    parentScene?.damagePlayer?.(minigame3Scene.TIMER_EXPIRE_DAMAGE);

    const level = this.currentLevel ?? GameState.currentLevel ?? 3;
    const targetSceneKey = `Level${level}Scene`;

    this.time.delayedCall(50, () => {
      this.scene.stop();
      if (targetSceneKey) {
        this.scene.resume(targetSceneKey);
      }
    });
  }

  shutdown() {
    this.timer?.destroy();
  }
}
