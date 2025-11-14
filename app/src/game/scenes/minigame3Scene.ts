import Phaser from "phaser";
import { GameState } from "../../stores/GameState";
import { CareerStore, type CareerKey } from "../../stores/CareerStore";
import { ObjectiveManager } from "../../managers/ObjectiveManager";
import { BOOK_SCENE_CONFIG } from "../constants/book";
import { Timer } from "../entities/Timer";
import { MotivationBar } from "../../managers/MotivationBarManager";

type MemoryCard = Phaser.GameObjects.Image & {
  cardId?: number;
  cardValue?: number;
  isFlipped?: boolean;
  isMatched?: boolean;
};

type ParentLevelScene = Phaser.Scene & {
  damagePlayer?: (amount: number) => void;
  getPlayerMotivation?: () => { current: number; max: number };
};

export default class minigame3Scene extends Phaser.Scene {
  private static readonly MISMATCH_DAMAGE = 10;
  private static readonly TIMER_EXPIRE_DAMAGE = 20;
  private static readonly COUNTDOWN_DURATION = 120;
  private currentLevel: number | undefined;
  private career: CareerKey = "fullstack";
  private timer?: Timer;
  private isGameComplete = false;
  private parentSceneKey?: string;
  private memoryCards: MemoryCard[] = [];
  private flippedCards: MemoryCard[] = [];
  private isCheckingMatch = false;
  private matchedPairs = 0;
  private parentScene?: ParentLevelScene;

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

    this.parentScene = this.getParentLevelScene();

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

    const cardValues = [1, 2, 3, 4, 1, 2, 3, 4];
    const shuffledValues = Phaser.Utils.Array.Shuffle(cardValues);

    let cardIndex = 0;

    const row1Width = 3 * cardWidth + 2 * horizontalPadding;
    const row1StartX = centerX - row1Width / 2 + cardWidth / 2;
    const row1Y = centerY - cardHeight - verticalPadding;

    for (let i = 0; i < 3; i++) {
      const x = row1StartX + i * (cardWidth + horizontalPadding);
      const card = this.add
        .image(x, row1Y, "card-wide-back")
        .setDepth(2) as MemoryCard;
      card.setInteractive({ useHandCursor: true });
      card.cardId = cardIndex;
      card.cardValue = shuffledValues[cardIndex];
      card.isFlipped = false;
      card.isMatched = false;
      card.on("pointerup", () => this.handleCardClick(card));
      this.memoryCards.push(card);
      cardIndex += 1;
    }

    const row2Width = 2 * cardWidth + horizontalPadding;
    const row2StartX = centerX - row2Width / 2 + cardWidth / 2;
    const row2Y = centerY;

    for (let i = 0; i < 2; i++) {
      const x = row2StartX + i * (cardWidth + horizontalPadding);
      const card = this.add
        .image(x, row2Y, "card-wide-back")
        .setDepth(2) as MemoryCard;
      card.setInteractive({ useHandCursor: true });
      card.cardId = cardIndex;
      card.cardValue = shuffledValues[cardIndex];
      card.isFlipped = false;
      card.isMatched = false;
      card.on("pointerup", () => this.handleCardClick(card));
      this.memoryCards.push(card);
      cardIndex += 1;
    }

    const row3Width = 3 * cardWidth + 2 * horizontalPadding;
    const row3StartX = centerX - row3Width / 2 + cardWidth / 2;
    const row3Y = centerY + cardHeight + verticalPadding;

    for (let i = 0; i < 3; i++) {
      const x = row3StartX + i * (cardWidth + horizontalPadding);
      const card = this.add
        .image(x, row3Y, "card-wide-back")
        .setDepth(2) as MemoryCard;
      card.setInteractive({ useHandCursor: true });
      card.cardId = cardIndex;
      card.cardValue = shuffledValues[cardIndex];
      card.isFlipped = false;
      card.isMatched = false;
      card.on("pointerup", () => this.handleCardClick(card));
      this.memoryCards.push(card);
      cardIndex += 1;
    }
  }

  private handleCardClick(card: MemoryCard): void {
    if (
      this.isCheckingMatch ||
      card.isFlipped ||
      card.isMatched ||
      this.isGameComplete
    ) {
      return;
    }

    this.flipCard(card);
    this.flippedCards.push(card);

    if (this.flippedCards.length === 2) {
      this.checkMatch();
    }
  }

  private flipCard(card: MemoryCard): void {
    card.isFlipped = true;
    const cardValue = card.cardValue!;
    const textureKey = `${this.career}-card-wide-${cardValue}`;
    card.setTexture(textureKey);
  }

  private checkMatch(): void {
    this.isCheckingMatch = true;
    const [card1, card2] = this.flippedCards;

    if (card1.cardValue === card2.cardValue) {
      card1.isMatched = true;
      card2.isMatched = true;
      this.matchedPairs += 1;
      this.flippedCards = [];
      this.isCheckingMatch = false;

      if (this.matchedPairs === 4) {
        this.winMinigame();
      }
    } else {
      this.time.delayedCall(1000, () => {
        this.unflipCard(card1);
        this.unflipCard(card2);
        this.flippedCards = [];
        this.isCheckingMatch = false;

        const parentScene = GameState.getParentLevelScene(this);
        parentScene?.damagePlayer?.(minigame3Scene.MISMATCH_DAMAGE);
      });
    }
  }

  private unflipCard(card: MemoryCard): void {
    card.isFlipped = false;
    card.setTexture("card-wide-back");
  }

  private winMinigame(): void {
    if (this.isGameComplete) {
      return;
    }

    this.isGameComplete = true;
    this.timer?.stop();

    const level = this.currentLevel ?? GameState.currentLevel ?? 3;
    const minigameId = "minigame3";

    ObjectiveManager.completeTask(level, minigameId);
    GameState.markMinigameCompleted(minigameId);

    this.time.delayedCall(500, () => {
      this.scene.stop();
      const targetSceneKey = `Level${level}Scene`;
      this.scene.resume(targetSceneKey);
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

  private getParentLevelScene(): ParentLevelScene | undefined {
    if (!this.currentLevel) {
      return undefined;
    }

    const parentSceneKey = `Level${this.currentLevel}Scene`;
    const parentScene = this.scene.get(parentSceneKey) as
      | ParentLevelScene
      | undefined;

    return parentScene;
  }

  shutdown() {
    this.timer?.destroy();
  }
}
