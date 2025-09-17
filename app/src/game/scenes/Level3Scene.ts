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
    // const career = CareerStore.getCareer() || "fullstack"; // For development
    // this.playerData = this.registry.get("playerData") || { motivation: 90 }; // For development

    if (!career) {
      console.warn("No career selected");
      return;
    }

    this.career = career;

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
    // this.load.spritesheet(
    //   "character-fullstack",
    //   "/assets/characters/fullstack.png",
    //   { frameWidth: 32, frameHeight: 48 }
    // ); // For development

    this.load.image("level3-tileset", "/assets/maps/level3/level3-tileset.png");
    this.load.tilemapTiledJSON("level3-map", "/assets/maps/level3/level3.tmj");
    this.load.spritesheet("ben", "/assets/characters/benPC.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    if (!this.career) {
      console.warn("No career selected");
      return;
    }

    this.createWorld();
    this.createPlayer();
    this.createObjects();
    this.createHUD();

    this.speechManager = new SpeechManager(this);

    this.eKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  update() {
    if (this.isGameOver) return;

    if (this.player) {
      this.player.update();
      this.speechManager?.update();
      this.eKeyIndicator?.update();
      this.checkForBenInteraction();
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

  private checkForBenInteraction() {
    if (!this.player || !this.ben || !this.eKey) return;

    if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.ben.x,
        this.ben.y
      );

      if (distance <= CHARACTER.INTERACTION_DISTANCE) {
        this.handleBenInteraction();
      }
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
    this.walls = this.map.createLayer("wall", tiles) || undefined;
    this.collidables = this.map.createLayer("collidables", tiles) || undefined;

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
      4.5 * WORLD.TILE.WIDTH,
      4.5 * WORLD.TILE.HEIGHT,
      CHARACTER.HEALTH.MAX,
      `character-${this.career}`
    );

    if (this.collidables && this.player) {
      this.physics.add.collider(this.player, this.collidables);
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

  private createObjects() {
    const objectLayer = this.map?.getObjectLayer("Object");
    if (!objectLayer || !this.player) return;

    objectLayer.objects.forEach((obj) => {
      const props =
        obj.properties?.reduce((acc: Record<string, any>, p: any) => {
          acc[p.name] = p.value;
          return acc;
        }, {} as Record<string, any>) || {};

      const spriteKey = props.id;

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
              this.ben.say(this.speechManager, ["Hi! I'm Ben"], {
                duration: 2000,
                onStart: () => {
                  this.player?.setLastDirection("right");
                  this.player?.anims.play("idle-right", true);
                },
                onComplete: () => {
                  this.player!.enableMovement();
                },
              });
            }
          });
        }

        this.physics.add.collider(this.player!, this.ben);
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

  shutdown() {
    this.player?.destroy();
    this.motivationBar?.destroy();
    this.bookManager?.destroy?.();
    this.speechManager?.destroy();
    this.ben?.destroy();
    if (this.bookIcon) {
      this.bookIcon.destroy();
      this.bookIcon = undefined;
    }
  }
}
