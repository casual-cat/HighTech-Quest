import Phaser from "phaser";
import { GameState } from "../../stores/GameState";
import { CareerStore, type CareerKey } from "../../stores/CareerStore";
import { MotivationBar } from "../../managers/MotivationBarManager";
import { DELIVERABLES_CARDS } from "../data/deliverablesCards";
import { BOOK_SCENE_CONFIG } from "../constants/book";

type ParentLevelScene = Phaser.Scene & {
  damagePlayer?: (amount: number) => void;
  getPlayerMotivation?: () => { current: number; max: number };
};

export default class minigame2Scene extends Phaser.Scene {
  private static readonly MISMATCH_DAMAGE = 10;
  private currentLevel: number | undefined;
  private career: CareerKey = "fullstack";
  private flippedCards: Phaser.GameObjects.Image[] = [];
  private isCheckingMatch = false;
  private motivationBar?: MotivationBar;
  private parentScene?: ParentLevelScene;
  private readonly onParentPlayerDamaged = () => {
    this.refreshMotivationBar();
  };

  constructor() {
    super({ key: "minigame2Scene" });
  }

  init(): void {
    this.currentLevel = GameState.currentLevel;
    this.career = CareerStore.getCareer() ?? this.career;
  }

  preload(): void {
    this.load.image(
      "minigame2-background",
      "/assets/game/level3/minigames/deliverables/minigame2-background.png"
    );
    this.load.image("card-back", "/assets/game/level3/minigames/deliverables/card-back.png");

    Object.values(DELIVERABLES_CARDS).forEach((card) => {
      const textureKey = this.getCardTextureKey(card.id);
      const texturePath = `/assets/game/level3/minigames/deliverables/${textureKey}.png`;
      this.load.image(textureKey, texturePath);
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

    this.add.image(width / 2, height / 2, "minigame2-background").setDepth(1);

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
  }

  private getCardTextureKey(id: number): string {
    return `${this.career}-card-${id}`;
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

    const frontTextureKey = this.getCardTextureKey(cardData.id);
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

    const isMatch = firstData && secondData && firstData.pairId === secondData.id;

    if (isMatch) {
      this.handleMatch(firstCard, secondCard);
    } else {
      this.handleMismatch(firstCard, secondCard);
    }
  }

  private handleMatch(firstCard: Phaser.GameObjects.Image, secondCard: Phaser.GameObjects.Image): void {
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
        },
      });
    });

    this.resetFlippedCards();
  }

  private handleMismatch(firstCard: Phaser.GameObjects.Image, secondCard: Phaser.GameObjects.Image): void {
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
    const parentScene = this.scene.get(parentSceneKey) as ParentLevelScene | undefined;
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
    const { current, max } = this.parentScene?.getPlayerMotivation?.() ?? this.getMotivationFromRegistry();

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

    const { current } = this.parentScene?.getPlayerMotivation?.() ?? this.getMotivationFromRegistry();
    this.motivationBar.setHealth(current);
  }

  private getMotivationFromRegistry(): { current: number; max: number } {
    const defaultMotivation = 100;
    const playerData = this.registry.get("playerData") as
      | { motivation?: number; maxMotivation?: number }
      | undefined;

    const current = playerData?.motivation ?? defaultMotivation;
    const max = playerData?.maxMotivation ?? Math.max(current, defaultMotivation);

    return { current, max };
  }
}
