import Phaser from "phaser";
import { Player } from "../entities/Player";
import { CareerKey, CareerStore } from "../../stores/CareerStore";
import { MotivationBar } from "../../managers/MotivationBarManager";
import { BookManager } from "../../managers/BookManager";
import { SpeechManager } from "../../managers/SpeechManager";
import { EKeyIndicator } from "../../managers/EKeyIndicatorManager";
import { CHARACTER, WORLD } from "../constants/game";
import { BookStore } from "../../stores/BookStore";

export default class Level2Scene extends Phaser.Scene {
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

  constructor() {
    super({ key: "Level2Scene" });
  }

  init() {}

  preload() {
    const career = CareerStore.getCareer();
    this.playerData = this.registry.get("playerData");

    if (!career) {
      console.warn("No career selected");
      return;
    }

    this.career = career;

    this.load.image("level2-tileset", "/assets/maps/level2/level2-tileset.png");
    this.load.tilemapTiledJSON("level2-map", "/assets/maps/level2/level2.tmj");
    this.load.spritesheet(
      "character-fullstack",
      "/assets/characters/fullstack.png",
      { frameWidth: 32, frameHeight: 48 }
    );
  }

  create() {
    if (!this.career) {
      console.warn("No career selected");
      return;
    }

    this.createWorld();

    this.player = new Player(
      this,
      4 * WORLD.TILE.WIDTH,
      4 * WORLD.TILE.HEIGHT,
      CHARACTER.HEALTH.MAX,
      `character-${this.career}`
    );

    if (this.player) {
      if (this.collidables) {
        this.physics.add.collider(this.player, this.collidables);
      }
    }

    this.createHUD();
  }

  update() {
    if (this.isGameOver) return;
    this.player?.update();
  }

  private createWorld() {
    this.physics.world.setBounds(0, 0, WORLD.WIDTH, WORLD.HEIGHT);

    const map = this.add.tilemap("level2-map");
    const tiles = map.addTilesetImage("level2-tileset", "level2-tileset");

    if (!tiles) {
      console.error("Failed to load tiles");
      return;
    }

    const floor = map.createLayer("floor", tiles);
    this.collidables = map.createLayer("collidables", tiles) || undefined;

    if (this.collidables) {
      this.collidables.setCollisionByProperty({ collides: true });
      this.collidables.setCollisionBetween(1, 1000);
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

    this.add
      .image(16, 16, "avatarBackground")
      .setOrigin(0, 0)
      .setScrollFactor(0);

    this.add
      .image(16, 16, `${this.career}-avatar`)
      .setOrigin(0)
      .setScrollFactor(0);

    this.bookIcon = this.add
      .image(16 * 6, 16, "book")
      .setOrigin(0)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    this.add
      .image(16 * 7, 16 * 5, "qKey")
      .setOrigin(0)
      .setScrollFactor(0);

    this.bookManager = BookStore.get();

    if (!this.bookManager) {
      console.warn("BookManager is not available");
    }
  }

  shutdown() {
    this.player?.destroy();
    this.motivationBar?.destroy();
    this.bookManager?.destroy?.();
    this.speechManager?.destroy();
    if (this.bookIcon) {
      this.bookIcon.destroy();
      this.bookIcon = undefined;
    }
  }
}
