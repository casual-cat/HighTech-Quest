import Phaser from "phaser";
import { GameState } from "../../stores/GameState";
import { CareerStore, type CareerKey } from "../../stores/CareerStore";
import { ObjectiveManager } from "../../managers/ObjectiveManager";
import { BOOK_SCENE_CONFIG } from "../constants/book";
import { Timer } from "../entities/Timer";

export default class minigame3Scene extends Phaser.Scene {
  private static readonly MISMATCH_DAMAGE = 10;
  private static readonly TIMER_EXPIRE_DAMAGE = 20;
  private static readonly COUNTDOWN_DURATION = 120;
  private currentLevel: number | undefined;
  private career: CareerKey = "fullstack";
  private timer?: Timer;
  private isGameComplete = false;
  private parentSceneKey?: string;

  constructor() {
    super({ key: "minigame3Scene" });
  }

  init(): void {
    this.currentLevel = GameState.currentLevel;
    this.career = CareerStore.getCareer() ?? this.career;
    this.isGameComplete = false;
    this.parentSceneKey = undefined;
    this.timer = undefined;
  }

  preload(): void {
    this.load.image(
      "card-wide-back",
      "/assets/game/level3/minigames/memory/card-wide-back.png"
    );

    for (let i = 1; i <= 4; i++) {
      const textureKey = `${this.career}-card-wide-${i}`;
      const texturePath = `/assets/game/level3/minigames/memory/${textureKey}.png`;
      this.load.image(textureKey, texturePath);
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
      .setOrigin(0)
      .setDepth(0)
      .setScrollFactor(0);

    const background = this.add.image(
      width / 2,
      height / 2,
      "minigame-basic-background"
    );
    background.setDepth(1);
    const backgroundBounds = background.getBounds();

    const cardTexture = this.textures.get("card-wide-back");
    const source = cardTexture.getSourceImage();
    const cardHeight = source.height;
    const verticalPadding = cardHeight * 0.15;
    const centerY = backgroundBounds.centerY;
    const row1Y = centerY - cardHeight - verticalPadding;
    const row1TopY = row1Y - cardHeight / 2;

    const timerY = Phaser.Math.Linear(backgroundBounds.top, row1TopY, 0.5);
    const timerContainerCenterX = backgroundBounds.centerX + 16;

    this.timer = new Timer(this, {
      duration: minigame3Scene.COUNTDOWN_DURATION,
      expireDamage: minigame3Scene.TIMER_EXPIRE_DAMAGE,
      x: timerContainerCenterX,
      y: timerY,
    });

    this.timer.on("complete", () => this.failMinigame());

    this.displayMemoryCards(backgroundBounds);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.timer?.destroy();
    });
  }

  private displayMemoryCards(backgroundBounds: Phaser.Geom.Rectangle): void {
    const cardTexture = this.textures.get("card-wide-back");
    const source = cardTexture.getSourceImage();
    const cardWidth = source.width;
    const cardHeight = source.height;

    const horizontalPadding = cardWidth * 0.1;
    const verticalPadding = cardHeight * 0.15;

    const centerX = backgroundBounds.centerX;
    const centerY = backgroundBounds.centerY;

    const row1Width = 3 * cardWidth + 2 * horizontalPadding;
    const row1StartX = centerX - row1Width / 2 + cardWidth / 2;
    const row1Y = centerY - cardHeight - verticalPadding;

    for (let i = 0; i < 3; i++) {
      const x = row1StartX + i * (cardWidth + horizontalPadding);
      this.add.image(x, row1Y, "card-wide-back").setDepth(2);
    }

    const row2Width = 2 * cardWidth + horizontalPadding;
    const row2StartX = centerX - row2Width / 2 + cardWidth / 2;
    const row2Y = centerY;

    for (let i = 0; i < 2; i++) {
      const x = row2StartX + i * (cardWidth + horizontalPadding);
      this.add.image(x, row2Y, "card-wide-back").setDepth(2);
    }

    const row3Width = 3 * cardWidth + 2 * horizontalPadding;
    const row3StartX = centerX - row3Width / 2 + cardWidth / 2;
    const row3Y = centerY + cardHeight + verticalPadding;

    for (let i = 0; i < 3; i++) {
      const x = row3StartX + i * (cardWidth + horizontalPadding);
      this.add.image(x, row3Y, "card-wide-back").setDepth(2);
    }
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
