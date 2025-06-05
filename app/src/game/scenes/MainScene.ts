import Phaser from "phaser";
import { Player } from "../entities/Player";
import { HealthBar } from "../ui/HealthBar";
import { BookManager } from "../ui/BookManager";
import { Envelope } from "../entities/Envelope";
import { Chest } from "../entities/Chest";
import {
  TILE_HEIGHT,
  TILE_WIDTH,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "../utils/Constants";
import { CareerKey, CareerStore } from "../../stores/CareerStore";

export default class MainScene extends Phaser.Scene {
  private walls?: Phaser.Physics.Arcade.StaticGroup;
  private player?: Player;
  private healthBar?: HealthBar;
  private career?: CareerKey;
  private bookManager?: BookManager;
  private envelopes: Envelope[] = [];
  private chests: Chest[] = [];

  constructor() {
    super({ key: "MainScene" });
  }

  preload() {
    const career = CareerStore.getCareer();

    if (!career) {
      console.warn("No career selected");
      return;
    }

    this.career = career;

    this.load.image("floor", "/assets/floor.png");
    this.load.image("wall", "/assets/wall.png");
    this.load.image("heart", "/assets/heart.png");
    this.load.image("avatarBackground", "/assets/game/avatarBackground.png");
    this.load.image("book", "/assets/game/book.png");
    this.load.image("book-open", "/assets/game/book-open.png");

    this.load.spritesheet("icons", "/assets/icons.png", {
      frameWidth: 32,
      frameHeight: 32,
    }); // icons for tests

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
      21 * TILE_WIDTH,
      12 * TILE_HEIGHT,
      100,
      `character-${this.career}`
    );

    this.createHUD();

    if (!this.walls) return;
    this.physics.add.collider(this.player, this.walls);

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(100, 100);
  }

  update() {
    this.player?.update();
    this.envelopes.forEach((envelope) => envelope.update(this.player!));
    this.chests.forEach((chest) => chest.update(this.player!));
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

    bookIcon.on("pointerdown", () => {
      this.bookManager?.open();
    });
  }

  private createWorld() {
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    for (let x = 0; x < WORLD_WIDTH; x += TILE_WIDTH) {
      for (let y = 0; y < WORLD_HEIGHT; y += TILE_HEIGHT) {
        this.add.image(x, y, "floor");
      }
    }

    this.walls = this.physics.add.staticGroup();

    for (let x = 0; x < WORLD_WIDTH; x += TILE_WIDTH) {
      this.walls.create(x, 0, "wall");
      this.walls.create(x, WORLD_HEIGHT, "wall");
    }

    for (let y = 0; y < WORLD_HEIGHT; y += TILE_HEIGHT) {
      this.walls.create(0, y, "wall");
      this.walls.create(WORLD_WIDTH, y, "wall");
    }

    // Create the icon item
    const envelope = new Envelope(this, 32 * 20 + 16, 32 * 7 + 16, 13).setOrigin(0);
    this.envelopes.push(envelope);

    const chest = new Chest(this, 32 * 16 + 16, 32 * 7 + 16, 15).setOrigin(0);
    this.chests.push(chest);

    this.createObstacles();
  }

  private createObstacles() {
    const obstaclePositions = [
      { x: 10 * TILE_WIDTH, y: 10 * TILE_HEIGHT },
      { x: 17 * TILE_WIDTH, y: 20 * TILE_HEIGHT },
      { x: 25 * TILE_WIDTH, y: 15 * TILE_HEIGHT },
      { x: 28 * TILE_WIDTH, y: 4 * TILE_HEIGHT },
      { x: 34 * TILE_WIDTH, y: 16 * TILE_HEIGHT },
      { x: 10 * TILE_WIDTH, y: 30 * TILE_HEIGHT },
      { x: 42 * TILE_WIDTH, y: 12 * TILE_HEIGHT },
      { x: 43 * TILE_WIDTH, y: 35 * TILE_HEIGHT },
    ];

    obstaclePositions.forEach((pos) => {
      const wallLength = Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < wallLength; i++) {
        for (let j = 0; j < wallLength; j++) {
          this.walls!.create(
            pos.x + i * TILE_WIDTH,
            pos.y + j * TILE_HEIGHT,
            "wall"
          );
        }
      }
    });
  }

  damagePlayer(amount: number) {
    if (!this.player || !this.healthBar) return;
    const newHealth = this.player.damage(amount);
    this.healthBar.decrease(amount);

    if (newHealth <= 0) {
      // TODO: this.gameOver();
    }
  }

  healPlayer(amount: number) {
    this.player?.heal(amount);
    this.healthBar?.increase(amount);
  }
}
