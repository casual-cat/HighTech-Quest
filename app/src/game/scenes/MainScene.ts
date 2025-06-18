import Phaser from "phaser";
import { WORLD, PLAYER } from "../constants/game";
import { Player } from "../entities/Player";
import { HealthBar } from "../ui/HealthBar";
import { BookManager } from "../ui/BookManager";
import { CareerKey, CareerStore } from "../../stores/CareerStore";

export default class MainScene extends Phaser.Scene {
  private player?: Player;
  private healthBar?: HealthBar;
  private career?: CareerKey;
  private bookManager?: BookManager;
  private isGameOver = false;
  private wallLayer?: Phaser.Tilemaps.TilemapLayer;
  private collidablesLayer?: Phaser.Tilemaps.TilemapLayer;
  private interactablesLayer?: Phaser.Tilemaps.TilemapLayer;

  constructor() {
    super({ key: "MainScene" });
  }

  init() {
    this.isGameOver = false;
  }

  preload() {
    const career = CareerStore.getCareer();

    if (!career) {
      console.warn("No career selected");
      return;
    }

    this.career = career;

    this.load.image("tiles", "/assets/maps/level1/v1/level1-tileset.png");
    this.load.tilemapTiledJSON("map", "/assets/maps/level1/v1/level1.tmj");
    this.load.spritesheet("heart", "/assets/ui/lifebar/heart.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.image("avatarBackground", "/assets/game/avatarBackground.png");
    this.load.image("book", "/assets/game/book.png");
    this.load.image("book-badge", "/assets/game/book-badge.png");
    this.load.image("book-open", "/assets/game/book-open.png");

    const careers: CareerKey[] = [
      "fullstack",
      "devops",
      "uxui",
      "projectmanager",
    ];
    careers.forEach((career) => {
      this.load.image(`${career}-avatar`, `/assets/game/${career}-avatar.png`);

      this.load.spritesheet(
        `character-${career}`,
        `/assets/characters/${career}.png`,
        {
          frameWidth: 32,
          frameHeight: 48,
        }
      );
    });
  }

  create() {
    if (!this.career) {
      console.warn("No career selected");
      return;
    }

    this.createWorld();

    this.player = new Player(
      this,
      19 * WORLD.TILE.WIDTH,
      10 * WORLD.TILE.HEIGHT,
      PLAYER.HEALTH.MAX,
      `character-${this.career}`
    );

    if (this.player) {
      if (this.wallLayer) {
        this.physics.add.collider(this.player, this.wallLayer);
      }
      if (this.collidablesLayer) {
        this.physics.add.collider(this.player, this.collidablesLayer);
      }
      if (this.interactablesLayer) {
        this.physics.add.collider(this.player, this.interactablesLayer);
      }
    }

    this.createHUD();

    this.cameras.main.setBounds(0, 0, WORLD.WIDTH, WORLD.HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(100, 100);
  }

  update() {
    if (this.isGameOver) return;
    this.player?.update();

    this.checkForInteractions();
  }

  private createHUD() {
    if (!this.player) return;

    this.healthBar = new HealthBar(
      this,
      1100,
      16,
      this.player.getMaxHealth(),
      160
    );
    this.healthBar.setHealth(this.player.getHealth());

    this.add
      .image(16, 16, "avatarBackground")
      .setOrigin(0, 0)
      .setScrollFactor(0);

    this.add
      .image(16, 16, `${this.career}-avatar`)
      .setOrigin(0)
      .setScrollFactor(0);

    const bookIcon = this.add
      .image(16 * 6, 16, "book")
      .setOrigin(0)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    this.bookManager = new BookManager(this);

    this.events.on("bookStateChanged", (data: { hasNewPieces: boolean }) => {
      bookIcon.setTexture(data.hasNewPieces ? "book-badge" : "book");
    });

    bookIcon.on("pointerdown", () => {
      this.bookManager?.open();
    });
  }

  private createWorld() {
    this.physics.world.setBounds(0, 0, WORLD.WIDTH, WORLD.HEIGHT);

    const map = this.add.tilemap("map");
    const tiles = map.addTilesetImage("level1-tileset", "tiles");

    if (!tiles) {
      console.error("Failed to load tiles");
      return;
    }

    this.wallLayer = map.createLayer("walls", tiles) || undefined;
    const floorLayer = map.createLayer("floor", tiles);
    const carpetLayer = map.createLayer("carpet", tiles);
    this.collidablesLayer = map.createLayer("collidables", tiles) || undefined;
    this.interactablesLayer =
      map.createLayer("interactables", tiles) || undefined;
    const foregroundLayer = map.createLayer("nonCollidableForegrounds", tiles);

    if (this.wallLayer) {
      this.wallLayer.setCollisionByProperty({ collides: true });
      this.wallLayer.setCollisionBetween(1, 1000);
    }

    if (this.collidablesLayer) {
      this.collidablesLayer.setCollisionByProperty({ collides: true });
      this.collidablesLayer.setCollisionBetween(1, 1000);
    }

    if (this.interactablesLayer) {
      this.interactablesLayer.setCollisionByProperty({ collides: true });
      this.interactablesLayer.setCollisionBetween(1, 1000);
    }

    if (foregroundLayer) foregroundLayer.setDepth(1);
  }

  private checkForInteractions() {
    if (!this.player || !this.interactablesLayer) return;

    const playerTileX = Math.floor(this.player.x / WORLD.TILE.WIDTH);
    const playerTileY = Math.floor(this.player.y / WORLD.TILE.HEIGHT);

    for (let x = playerTileX - 1; x <= playerTileX + 1; x++) {
      for (let y = playerTileY - 1; y <= playerTileY + 1; y++) {
        if (x >= 0 && x < 40 && y >= 0 && y < 23) {
          const tile = this.interactablesLayer.getTileAt(x, y);
          if (tile && tile.index > 0) {
            const properties = tile.properties;
            if (properties && properties.interactable) {
              this.handleNearbyInteractiveObject(tile, x, y);
              return;
            }
          }
        }
      }
    }
  }

  private handleNearbyInteractiveObject(
    tile: Phaser.Tilemaps.Tile,
    tileX: number,
    tileY: number
  ) {
    const cursors = this.input.keyboard?.createCursorKeys();
    const eKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    const spaceKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    if ((eKey && eKey.isDown) || (spaceKey && spaceKey.isDown)) {
      this.interactWithObject(tile.index, tileX, tileY);
    }
  }

  private interactWithObject(tileIndex: number, tileX: number, tileY: number) {
    console.log(
      `Interacting with object at tile (${tileX}, ${tileY}) with index ${tileIndex}`
    );

    switch (tileIndex) {
      case 13:
        console.log("Opening door...");
        break;
      case 14:
        console.log("Interacting with object...");
        break;
      default:
        console.log(`Unknown interactive object with index ${tileIndex}`);
        break;
    }
  }

  damagePlayer(amount: number) {
    if (!this.player || !this.healthBar) return;
    const newHealth = this.player.damage(amount);
    this.healthBar.decrease(amount);

    if (newHealth <= 0) {
      this.handleGameOver();
    }
  }

  private handleGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.cameras.main.fadeOut(1000, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.shutdown();
      this.scene.start("GameOverScene");
    });
  }

  healPlayer(amount: number) {
    this.player?.heal(amount);
    this.healthBar?.increase(amount);
  }

  shutdown() {
    this.player?.destroy();
    this.healthBar?.destroy();
    this.bookManager?.destroy?.();
  }
}
