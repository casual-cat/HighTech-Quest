import Phaser from "phaser";
import { WORLD, PLAYER } from "../constants/game";
import { Player } from "../entities/Player";
import { HealthBar } from "../ui/HealthBar";
import { BookManager } from "../ui/BookManager";
import { Envelope } from "../entities/Envelope";
import { Chest } from "../entities/Chest";
import { CareerKey, CareerStore } from "../../stores/CareerStore";

export default class MainScene extends Phaser.Scene {
  private walls?: Phaser.Physics.Arcade.StaticGroup;
  private player?: Player;
  private healthBar?: HealthBar;
  private career?: CareerKey;
  private bookManager?: BookManager;
  private interactiveObjects: (Envelope | Chest)[] = [];
  private isGameOver = false;

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

    this.load.image("floor", "/assets/floor.png");
    this.load.image("wall", "/assets/wall.png");
    this.load.spritesheet("heart", "/assets/ui/lifebar/heart.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.image("avatarBackground", "/assets/game/avatarBackground.png");
    this.load.image("book", "/assets/game/book.png");
    this.load.image("book-badge", "/assets/game/book-badge.png");
    this.load.image("book-open", "/assets/game/book-open.png");

    this.load.spritesheet("icons", "/assets/icons.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

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
      21 * WORLD.TILE.WIDTH,
      12 * WORLD.TILE.HEIGHT,
      PLAYER.HEALTH.MAX,
      `character-${this.career}`
    );

    this.createHUD();

    if (!this.walls) return;
    this.physics.add.collider(this.player, this.walls);

    this.cameras.main.setBounds(0, 0, WORLD.WIDTH, WORLD.HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(100, 100);
  }

  update() {
    if (this.isGameOver) return;
    this.player?.update();
    this.interactiveObjects.forEach((obj) => obj.update(this.player!));
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

    for (let x = 0; x < WORLD.WIDTH; x += WORLD.TILE.WIDTH) {
      for (let y = 0; y < WORLD.HEIGHT; y += WORLD.TILE.HEIGHT) {
        this.add.image(x, y, "floor");
      }
    }

    this.walls = this.physics.add.staticGroup();

    for (let x = 0; x < WORLD.WIDTH; x += WORLD.TILE.WIDTH) {
      this.walls.create(x, 0, "wall");
      this.walls.create(x, WORLD.HEIGHT, "wall");
    }

    for (let y = 0; y < WORLD.HEIGHT; y += WORLD.TILE.HEIGHT) {
      this.walls.create(0, y, "wall");
      this.walls.create(WORLD.WIDTH, y, "wall");
    }

    const envelope = new Envelope(this, 32 * 20, 32 * 7, 13).setOrigin(0.5);
    this.interactiveObjects.push(envelope);

    const chest = new Chest(this, 32 * 16, 32 * 7, 15).setOrigin(0.5);
    this.interactiveObjects.push(chest);

    this.createObstacles();
  }

  private createObstacles() {
    const obstaclePositions = [
      { x: 10 * WORLD.TILE.WIDTH, y: 10 * WORLD.TILE.HEIGHT },
      { x: 17 * WORLD.TILE.WIDTH, y: 20 * WORLD.TILE.HEIGHT },
      { x: 25 * WORLD.TILE.WIDTH, y: 15 * WORLD.TILE.HEIGHT },
      { x: 28 * WORLD.TILE.WIDTH, y: 4 * WORLD.TILE.HEIGHT },
      { x: 34 * WORLD.TILE.WIDTH, y: 16 * WORLD.TILE.HEIGHT },
      { x: 10 * WORLD.TILE.WIDTH, y: 30 * WORLD.TILE.HEIGHT },
      { x: 42 * WORLD.TILE.WIDTH, y: 12 * WORLD.TILE.HEIGHT },
      { x: 43 * WORLD.TILE.WIDTH, y: 35 * WORLD.TILE.HEIGHT },
    ];

    obstaclePositions.forEach((pos) => {
      const wallLength = Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < wallLength; i++) {
        for (let j = 0; j < wallLength; j++) {
          this.walls!.create(
            pos.x + i * WORLD.TILE.WIDTH,
            pos.y + j * WORLD.TILE.HEIGHT,
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
    this.interactiveObjects.forEach((obj) => obj.destroy());
    this.interactiveObjects = [];
    this.walls?.clear(true, true);
  }
}
