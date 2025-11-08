import Phaser from "phaser";
import { Player } from "../entities/Player";
import { CareerKey, CareerStore } from "../../stores/CareerStore";
import { MotivationBar } from "../../managers/MotivationBarManager";
import { BookManager } from "../../managers/BookManager";
import { SpeechManager } from "../../managers/SpeechManager";
import { EKeyIndicator } from "../../managers/EKeyIndicatorManager";
import { CHARACTER, WORLD } from "../constants/game";
import { BookStore } from "../../stores/BookStore";
import { Ben } from "../entities/Ben";
import { GameState } from "../../stores/GameState";
import { ObjectiveManager } from "../../managers/ObjectiveManager";
import { buildPathfindingGrid } from "../utils/pathfinding";
import { getLetterContent } from "../data/letters";

export default class Level3Scene extends Phaser.Scene {
  private map: Phaser.Tilemaps.Tilemap | null = null;
  private player?: Player;
  private playerData: { motivation: number } = { motivation: 100 };
  private career?: CareerKey;
  private motivationBar?: MotivationBar;
  private bookManager?: BookManager;
  private speechManager?: SpeechManager;
  private isGameOver: boolean = false;
  private pathfindingGrid?: number[][];
  private bookIcon?: Phaser.GameObjects.Image;
  private eKey?: Phaser.Input.Keyboard.Key;
  private eKeyIndicator!: EKeyIndicator;
  private collidables?: Phaser.Tilemaps.TilemapLayer;
  private walls?: Phaser.Tilemaps.TilemapLayer;
  private ben?: Ben;
  private position?: string;
  private interactableObjects?: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super({ key: "Level3Scene" });
  }

  init() {
    this.isGameOver = false;
    GameState.currentLevel = 3;
  }

  preload() {
    const career = CareerStore.getCareer();
    this.playerData = this.registry.get("playerData");
    // const career = CareerStore.getCareer() || "uxui"; // For development
    // CareerStore.setCareer(career); // For development
    // this.playerData = this.registry.get("playerData") || { motivation: 90 }; // For development

    if (!career) {
      console.warn("No career selected");
      return;
    }

    this.career = career;
    if (this.career === "devops") {
      this.position = "DevOps Engineer";
    } else if (this.career === "fullstack") {
      this.position = "FullStack Developer";
    } else if (this.career === "projectmanager") {
      this.position = "Project Manager";
    } else {
      this.position = "UX UI Designer";
    }

    // this.load.image("batteryFull", "/assets/ui/motivationBar/battery-full.png"); // For development
    // this.load.image("batteryHalf", "/assets/ui/motivationBar/battery-half.png"); // For development
    // this.load.image(
    //   "batteryEmpty",
    //   "/assets/ui/motivationBar/battery-empty.png"
    // ); // For development
    // this.load.image("avatarBackground", "/assets/game/avatarBackground.png"); // For development
    // this.load.image("book", "/assets/game/book.png"); // For development
    // this.load.image("book-badge", "/assets/game/book-badge.png"); // For development
    // this.load.image("book-star", "/assets/game/book-star.png"); // For development
    // this.load.image("qKey", "/assets/ui/keys/qKey.png"); // For development
    // this.load.image("eKey", "/assets/ui/keys/eKey.png"); // For development
    // this.load.image(`${career}-avatar`, `/assets/game/${career}-avatar.png`); // For development
    // this.load.image("speechBubble", "/assets/characters/speechBubble.png"); // For development
    // this.load.spritesheet("character-uxui", "/assets/characters/uxui.png", {
    //   frameWidth: 32,
    //   frameHeight: 48,
    // }); // For development
    // this.load.image("button", "/assets/buttons/Button_DarkGreen.png"); // For development
    // this.load.image("buttonPressed", "/assets/buttons/Button_LightGreen.png"); // For development

    this.load.image("level3-tileset", "/assets/maps/level3/level3-tileset.png");
    this.load.tilemapTiledJSON("level3-map", "/assets/maps/level3/level3.tmj");
    this.load.spritesheet("ben", "/assets/characters/benPC.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.image("letter", "/assets/collectibles/letter.png");
    this.load.image(
      "timer-icon",
      "/assets/game/level3/minigames/timer-icon.png"
    );
    this.load.image("info", "/assets/ui/icons/info.png");
    this.load.image(
      "letter-background",
      "/assets/game/level3/letter-background.png"
    );
  }

  create() {
    if (!this.career) {
      console.warn("No career selected");
      return;
    }

    this.createWorld();
    this.createPlayer();
    this.createInteractableGroup();
    this.createObjects();
    this.createHUD();

    this.speechManager = new SpeechManager(this);

    this.eKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    if (this.player && this.interactableObjects) {
      this.eKeyIndicator = new EKeyIndicator(
        this,
        this.player,
        this.interactableObjects
      );
    } else {
      console.warn(
        "Could not initialize EKeyIndicator - player or interactables missing"
      );
    }
  }

  update() {
    if (this.isGameOver) return;

    if (this.player) {
      this.player.update();
      this.speechManager?.update();
      this.eKeyIndicator?.update();
      this.checkForInteraction();
      this.updateDepthSorting();
    }
  }

  private updateDepthSorting() {
    if (!this.player || !this.ben) return;

    if (this.player.y < this.ben.y) {
      this.player.setDepth(0);
      this.ben.setDepth(1);
    } else {
      this.player.setDepth(2);
      this.ben.setDepth(1);
    }
  }

  private checkForInteraction() {
    if (!this.player || !this.eKey || !this.eKeyIndicator) return;

    if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
      const target = this.eKeyIndicator.getTarget();
      if (target) {
        const objectId = String(target.getData("id") || "");
        if (objectId === "ben") {
          this.handleBenInteraction();
        } else if (objectId.startsWith("letter")) {
          this.handleLetterInteraction(target);
        } else if (objectId.includes("minigame")) {
          this.handleMinigameInteraction(target);
        }
      }
    }
  }

  private handleLetterInteraction(target: Phaser.GameObjects.Sprite) {
    const letterId = String(target.getData("id") || "");
    const letterContent = getLetterContent(letterId);

    if (!letterContent) {
      console.warn(`No content configured for letter id: ${letterId}`);
      return;
    }

    if (this.scene.isActive("LetterScene")) {
      return;
    }

    this.scene.pause(this.scene.key);
    this.scene.launch("LetterScene", {
      parentSceneKey: this.scene.key,
      letter: letterContent,
    });
  }

  private handleMinigameInteraction(target: Phaser.GameObjects.Sprite) {
    const minigameId = String(target.getData("id") || "");

    if (GameState.isCompleted({ minigame: minigameId })) {
      this.player?.say(this.speechManager!, [
        "I have already crushed this practice :)",
      ]);
    } else {
      this.scene.pause();
      this.scene.launch("PromptScene", { objectId: minigameId });
    }
  }

  private createWorld() {
    this.physics.world.setBounds(0, 0, WORLD.WIDTH, WORLD.HEIGHT);

    this.map = this.add.tilemap("level3-map");
    const tiles = this.map.addTilesetImage("level3-tileset", "level3-tileset");

    if (!tiles) {
      console.error("Failed to load tiles");
      return;
    }

    const floor = this.map.createLayer("floor", tiles);
    const background = this.map.createLayer("background", tiles);
    const foreground = this.map.createLayer("foreground", tiles);
    this.walls = this.map.createLayer("wall", tiles) || undefined;
    this.collidables = this.map.createLayer("collidables", tiles) || undefined;

    if (foreground) {
      foreground.setDepth(10);
    }

    if (this.walls) {
      this.walls.setCollisionByProperty({ collides: true });
      this.walls.setCollisionBetween(1, 1000);
    }
    if (this.collidables) {
      this.collidables.setCollisionByProperty({ collides: true });
      this.collidables.setCollisionBetween(1, 1000);
    }

    if (this.map) {
      this.pathfindingGrid = buildPathfindingGrid(
        this.map,
        this.walls,
        this.collidables
      );
    }
  }

  private createPlayer() {
    this.player = new Player(
      this,
      5.5 * WORLD.TILE.WIDTH,
      4.5 * WORLD.TILE.HEIGHT,
      CHARACTER.HEALTH.MAX,
      `character-${this.career}`
    );

    if (this.player) {
      if (this.walls) {
        this.physics.add.collider(this.player, this.walls);
      }
      if (this.collidables) {
        this.physics.add.collider(this.player, this.collidables);
      }
    }
  }

  private createHUD() {
    if (!this.player) return;

    this.motivationBar = new MotivationBar(
      this,
      1100,
      16,
      this.player.getMaxHealth(),
      160
    );
    this.motivationBar.setHealth(this.playerData.motivation);
    this.motivationBar.setDepth(2);

    this.add
      .image(16, 16, "avatarBackground")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(2);

    this.add
      .image(16, 16, `${this.career}-avatar`)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(2);

    this.bookIcon = this.add
      .image(16 * 6, 16, "book")
      .setOrigin(0)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .setDepth(2);

    this.add
      .image(16 * 7, 16 * 5, "qKey")
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(2);

    this.bookManager = BookStore.get();
    // this.bookManager = new BookManager(this); // For development
    // BookStore.set(this.bookManager); // For development

    if (this.bookManager) {
      this.bookManager.showUnlockAnimation = false;
    } else {
      console.warn("BookManager is not available");
    }

    this.bookIcon.on("pointerdown", () => {
      this.bookManager?.open();
    });

    this.bookManager?.setCurrentScene(this);
  }

  private createInteractableGroup() {
    this.interactableObjects = this.physics.add.staticGroup();
  }

  private createObjects() {
    const objectLayer = this.map?.getObjectLayer("Object");
    if (!objectLayer || !this.player) return;

    objectLayer.objects.forEach((obj) => {
      const props =
        obj.properties?.reduce((acc: Record<string, any>, p: any) => {
          acc[p.name] = p.value;
          return acc;
        }, {} as Record<string, any>) || {};

      const spriteKey = String(props.id || "");
      if (!this.interactableObjects) return;

      if (spriteKey === "ben") {
        const centerX = obj.x! + obj.width! / 2;
        const centerY = obj.y! + obj.height! / 2;

        this.ben = new Ben(this, centerX, centerY);
        this.ben.setData("id", spriteKey);
        this.ben.setData("properties", props);

        if (this.pathfindingGrid && this.ben) {
          this.ben.setPathfindingGrid(this.pathfindingGrid, [0]);
        }

        if (this.ben && this.player) {
          this.player.disableMovement();
          this.ben.moveToPlayer(this.player, () => {
            if (this.ben && this.speechManager) {
              this.ben.say(
                this.speechManager,
                [
                  "Hi! I'm Ben",
                  "I hear you're searching for your first position",
                  `Becoming a ${this.position} isn't an easy path`,
                  "But that's exactly what this place is for.",
                  "Here, you'll sharpen your skills and grow stronger",
                  "That way, you'll have the best chance of reaching your goal:",
                  `Becoming a ${this.position}!`,
                  "Take a look around, give it your all…\nand good luck!",
                ],
                {
                  duration: 3000,
                  onStart: () => {
                    this.player?.setLastDirection("right");
                    this.player?.anims.play("idle-right", true);
                  },
                  onComplete: () => {
                    this.player!.enableMovement();
                    if (this.interactableObjects && this.ben)
                      this.interactableObjects.add(this.ben);
                  },
                }
              );
            }
          });
        }

        this.physics.add.collider(this.player!, this.ben);
      } else if (spriteKey === "letter" || spriteKey.startsWith("letter-")) {
        const centerX = obj.x! + obj.width! / 2;
        const centerY = obj.y! + obj.height! / 2;

        const letter = this.interactableObjects.create(
          centerX,
          centerY,
          "letter"
        ) as Phaser.Physics.Arcade.Sprite;
        letter.setData("id", spriteKey || "letter");
        letter.setData("properties", props);
        letter.setOrigin(0.5);
        letter.setScale(0.5);
      } else if (spriteKey.includes("minigame")) {
        const centerX = obj.x! + obj.width! / 2;
        const centerY = obj.y! + obj.height! / 2;

        const spot = this.interactableObjects.create(
          centerX,
          centerY,
          "letter"
        ) as Phaser.Physics.Arcade.Sprite;
        spot.setData("id", spriteKey);
        spot.setData("properties", props);
        spot.setOrigin(0.5);
        spot.setVisible(false);
        spot.setAlpha(0);
        spot.setDisplaySize(WORLD.TILE.WIDTH, WORLD.TILE.HEIGHT);
      }
    });
  }

  private handleBenInteraction() {
    if (this.ben) {
      this.ben.interact();
    }
  }

  private handleGameOver() {
    this.isGameOver = true;

    this.cameras.main.fadeOut(1000, 0, 0, 0);

    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.stop();
      this.scene.start("GameOverScene", {
        returnScene: this.scene.key,
        player: this.player,
      });
    });
  }

  public getPlayerMotivation() {
    const current = this.player?.getHealth() ?? this.playerData.motivation;
    const max = this.player?.getMaxHealth() ?? this.playerData.motivation;

    return { current, max };
  }

  public damagePlayer(amount: number) {
    if (this.isGameOver || amount <= 0) {
      return;
    }

    if (!this.player) {
      return;
    }

    const newHealth = this.player.damage(amount);
    this.playerData.motivation = newHealth;
    this.registry.set("playerData", this.playerData);

    if (this.motivationBar) {
      this.motivationBar.decrease(amount);
    }

    this.events.emit("playerDamaged");

    if (newHealth <= 0) {
      this.handleGameOver();
    }
  }

  shutdown() {
    this.player?.destroy();
    this.motivationBar?.destroy();
    this.bookManager?.destroy?.();
    this.speechManager?.destroy();
    this.ben?.destroy();
    this.eKeyIndicator?.destroy();
    if (this.bookIcon) {
      this.bookIcon.destroy();
      this.bookIcon = undefined;
    }
  }
}
