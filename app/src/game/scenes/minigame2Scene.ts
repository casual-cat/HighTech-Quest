import Phaser from "phaser";
import { GameState } from "../../stores/GameState";
import { ObjectiveManager } from "../../managers/ObjectiveManager";
import { CareerStore, type CareerKey } from "../../stores/CareerStore";
import { MotivationBar } from "../../managers/MotivationBarManager";
import { DELIVERABLES_CARDS } from "../data/deliverablesCards";
import { BOOK_SCENE_CONFIG } from "../constants/book";
import { Timer } from "../entities/Timer";

type ParentLevelScene = Phaser.Scene & {
  damagePlayer?: (amount: number) => void;
  getPlayerMotivation?: () => { current: number; max: number };
};

export default class minigame2Scene extends Phaser.Scene {
  private static readonly MISMATCH_DAMAGE = 10;
  private static readonly TIMER_EXPIRE_DAMAGE = 20;
  private static readonly COUNTDOWN_DURATION = 120;
  private currentLevel: number | undefined;
  private career: CareerKey = "fullstack";
  private flippedCards: Phaser.GameObjects.Image[] = [];
  private isCheckingMatch = false;
  private motivationBar?: MotivationBar;
  private parentScene?: ParentLevelScene;
  private pairSlots: Phaser.GameObjects.Image[] = [];
  private isGameComplete = false;
  private timer?: Timer;
  private readonly onParentPlayerDamaged = () => {
    this.refreshMotivationBar();
  };

  constructor() {
    super({ key: "minigame2Scene" });
  }

  init(): void {
    this.currentLevel = GameState.currentLevel;
    this.career = CareerStore.getCareer() ?? this.career;
    this.isGameComplete = false;
  }

  preload(): void {
    this.load.image(
      "minigame2-background",
      "/assets/game/level3/minigames/deliverables/minigame2-background.png"
    );
    this.load.image(
      "card-back",
      "/assets/game/level3/minigames/deliverables/card-back.png"
    );
    this.load.image(
      "cards-pair-back",
      "/assets/game/level3/minigames/deliverables/cards-pair-back.png"
    );

    const pairImages = new Set<string>();

    Object.values(DELIVERABLES_CARDS).forEach((card) => {
      const textureKey = this.getTextureKey(card.image);
      const texturePath = `/assets/game/level3/minigames/deliverables/${textureKey}.png`;
      this.load.image(textureKey, texturePath);
      pairImages.add(card.pairImage);
    });

    pairImages.forEach((pairImage) => {
      const textureKey = this.getTextureKey(pairImage);
      const texturePath = `/assets/game/level3/minigames/deliverables/${textureKey}.png`;
      if (!this.textures.exists(textureKey)) {
        this.load.image(textureKey, texturePath);
      }
    });
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

    const background = this.add
      .image(width / 2, height / 2, "minigame2-background")
      .setDepth(1);

    const backgroundBounds = background.getBounds();

    this.createHUD();

    const columns = 4;
    const rows = 2;
    const cardTexture = this.textures.get("card-back");
    const source = cardTexture.getSourceImage();
    const cardWidth = source.width;
    const cardHeight = source.height;
    const paddingX = cardWidth * 0.2;
    const paddingY = cardHeight * 0.2;
    const totalWidth = columns * cardWidth + (columns - 1) * paddingX;
    const totalHeight = rows * cardHeight + (rows - 1) * paddingY;
    const startX = width / 2 - totalWidth / 2 + cardWidth / 2;
    const startY = height / 2 - totalHeight / 2 + cardHeight / 2;

    const firstRowTop = startY - cardHeight / 2;
    const timerY = Phaser.Math.Linear(backgroundBounds.top, firstRowTop, 0.5);

    const timerContainerCenterX = backgroundBounds.centerX + 16;

    this.timer = new Timer(this, {
      duration: minigame2Scene.COUNTDOWN_DURATION,
      expireDamage: minigame2Scene.TIMER_EXPIRE_DAMAGE,
      x: timerContainerCenterX,
      y: timerY,
    });

    this.timer.on("complete", () => this.failMinigame());

    const cardIds = Phaser.Utils.Array.Shuffle(
      Array.from({ length: columns * rows }, (_, index) => index + 1)
    );

    let cardIndex = 0;
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        const x = startX + col * (cardWidth + paddingX);
        const y = startY + row * (cardHeight + paddingY);
        const card = this.add.image(x, y, "card-back").setDepth(2);
        card.setInteractive({ useHandCursor: true });
        card.setData("cardId", cardIds[cardIndex]);
        card.setData("faceUp", false);
        card.setData("matched", false);
        card.on("pointerup", () => this.handleCardSelection(card));
        cardIndex += 1;
      }
    }

    const pairPaddingX = paddingX * 0.1;
    const totalPairWidth = columns * cardWidth + (columns - 1) * pairPaddingX;
    const startPairX = width / 2 - totalPairWidth / 2 + cardWidth / 2;
    const pairRowY = startY + rows * (cardHeight + paddingY) + cardHeight * 0.1;
    this.pairSlots = [];
    for (let col = 0; col < columns; col += 1) {
      const x = startPairX + col * (cardWidth + pairPaddingX);
      const slot = this.add.image(x, pairRowY, "cards-pair-back").setDepth(2);
      slot.setData("filled", false);
      this.pairSlots.push(slot);
    }
  }

  private failMinigame(): void {
    if (this.isGameComplete) {
      return;
    }

    this.isGameComplete = true;

    if (!this.parentScene) {
      this.parentScene = this.getParentLevelScene();
    }

    this.parentScene?.damagePlayer?.(minigame2Scene.TIMER_EXPIRE_DAMAGE);

    const level = this.currentLevel ?? GameState.currentLevel ?? 3;
    const targetSceneKey = `Level${level}Scene`;

    this.time.delayedCall(50, () => {
      this.scene.stop();
      if (targetSceneKey) {
        this.scene.resume(targetSceneKey);
      }
    });
  }

  private getTextureKey(image: string): string {
    return `${this.career}-${image}`;
  }

  private handleCardSelection(card: Phaser.GameObjects.Image): void {
    if (this.isCheckingMatch) {
      return;
    }

    const faceUp = card.getData("faceUp") as boolean;
    const matched = card.getData("matched") as boolean;
    if (faceUp || matched) {
      return;
    }

    const cardId = card.getData("cardId") as number | undefined;
    if (cardId === undefined) {
      return;
    }

    const cardData = DELIVERABLES_CARDS[cardId];
    if (!cardData) {
      return;
    }

    const frontTextureKey = this.getTextureKey(cardData.image);
    if (!this.textures.exists(frontTextureKey)) {
      return;
    }

    card.setTexture(frontTextureKey);
    card.setData("faceUp", true);
    this.flippedCards.push(card);

    if (this.flippedCards.length === 2) {
      this.isCheckingMatch = true;
      this.time.delayedCall(500, () => this.checkForMatch());
    }
  }

  private checkForMatch(): void {
    const [firstCard, secondCard] = this.flippedCards;
    if (!firstCard || !secondCard) {
      this.resetFlippedCards();
      return;
    }

    const firstId = firstCard.getData("cardId") as number | undefined;
    const secondId = secondCard.getData("cardId") as number | undefined;

    if (firstId === undefined || secondId === undefined) {
      this.resetFlippedCards();
      return;
    }

    const firstData = DELIVERABLES_CARDS[firstId];
    const secondData = DELIVERABLES_CARDS[secondId];

    const isMatch =
      firstData && secondData && firstData.pairId === secondData.id;

    if (isMatch) {
      this.handleMatch(
        firstCard,
        secondCard,
        firstData?.pairImage ?? secondData?.pairImage
      );
    } else {
      this.handleMismatch(firstCard, secondCard);
    }
  }

  private handleMatch(
    firstCard: Phaser.GameObjects.Image,
    secondCard: Phaser.GameObjects.Image,
    pairImage?: string
  ): void {
    firstCard.setData("matched", true);
    secondCard.setData("matched", true);
    firstCard.disableInteractive();
    secondCard.disableInteractive();

    this.time.delayedCall(200, () => {
      this.tweens.add({
        targets: [firstCard, secondCard],
        alpha: 0,
        scale: 0.9,
        duration: 200,
        onComplete: () => {
          firstCard.destroy();
          secondCard.destroy();
          if (pairImage) {
            this.revealPairImage(pairImage);
          }
        },
      });
    });

    this.resetFlippedCards();
  }

  private revealPairImage(pairImage: string): void {
    const slot = this.pairSlots.find((pairSlot) => !pairSlot.getData("filled"));
    if (!slot) {
      return;
    }

    const textureKey = this.getTextureKey(pairImage);
    if (!this.textures.exists(textureKey)) {
      return;
    }

    slot.setTexture(textureKey);
    slot.setData("filled", true);

    if (this.pairSlots.every((pairSlot) => pairSlot.getData("filled"))) {
      this.finishMinigame();
    }
  }

  private finishMinigame(): void {
    if (this.isGameComplete) {
      return;
    }

    this.isGameComplete = true;

    this.timer?.stop();

    const level = this.currentLevel ?? GameState.currentLevel ?? 3;
    const minigameId = "minigame2";

    ObjectiveManager.completeTask(level, minigameId);
    GameState.markMinigameCompleted(minigameId);

    const targetSceneKey = `Level${level}Scene`;

    this.time.delayedCall(50, () => {
      this.scene.stop();
      if (targetSceneKey) {
        this.scene.resume(targetSceneKey);
      }
    });
  }

  private handleMismatch(
    firstCard: Phaser.GameObjects.Image,
    secondCard: Phaser.GameObjects.Image
  ): void {
    this.applyMismatchPenalty();

    this.time.delayedCall(700, () => {
      [firstCard, secondCard].forEach((card) => {
        card.setTexture("card-back");
        card.setData("faceUp", false);
      });
      this.resetFlippedCards();
    });
  }

  private resetFlippedCards(): void {
    this.flippedCards = [];
    this.isCheckingMatch = false;
  }

  private applyMismatchPenalty(): void {
    if (!this.currentLevel) {
      return;
    }

    if (!this.parentScene) {
      this.parentScene = this.getParentLevelScene();
    }

    this.parentScene?.damagePlayer?.(minigame2Scene.MISMATCH_DAMAGE);
  }

  private getParentLevelScene(): ParentLevelScene | undefined {
    if (!this.currentLevel) {
      return undefined;
    }

    const parentSceneKey = `Level${this.currentLevel}Scene`;
    const parentScene = this.scene.get(parentSceneKey) as
      | ParentLevelScene
      | undefined;
    if (parentScene) {
      parentScene.events.on("playerDamaged", this.onParentPlayerDamaged);
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        parentScene.events.off("playerDamaged", this.onParentPlayerDamaged);
      });
    }

    return parentScene;
  }

  private createHUD(): void {
    const hudDepth = 10;
    const { current, max } =
      this.parentScene?.getPlayerMotivation?.() ??
      this.getMotivationFromRegistry();

    this.add
      .image(16, 16, "avatarBackground")
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(hudDepth);

    this.add
      .image(16, 16, `${this.career}-avatar`)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(hudDepth);

    this.motivationBar = new MotivationBar(this, 1100, 16, max, 160);
    this.motivationBar.setDepth(hudDepth);
    this.motivationBar.setHealth(current);
  }

  private refreshMotivationBar(): void {
    if (!this.motivationBar) {
      return;
    }

    const { current } =
      this.parentScene?.getPlayerMotivation?.() ??
      this.getMotivationFromRegistry();
    this.motivationBar.setHealth(current);
  }

  private getMotivationFromRegistry(): { current: number; max: number } {
    const defaultMotivation = 100;
    const playerData = this.registry.get("playerData") as
      | { motivation?: number; maxMotivation?: number }
      | undefined;

    const current = playerData?.motivation ?? defaultMotivation;
    const max =
      playerData?.maxMotivation ?? Math.max(current, defaultMotivation);

    return { current, max };
  }
}
