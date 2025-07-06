import Phaser from "phaser";
import { WORLD, PLAYER } from "../constants/game";
import { Player } from "../entities/Player";
import { HealthBar } from "../ui/HealthBar";
import { BookManager } from "../ui/BookManager";
import { SpeechManager } from "../ui/SpeechManager";
import { CareerKey, CareerStore } from "../../stores/CareerStore";

export default class MainScene extends Phaser.Scene {
  private player?: Player;
  private healthBar?: HealthBar;
  private career?: CareerKey;
  private bookManager?: BookManager;
  private speechManager?: SpeechManager;
  private isGameOver = false;
  private wallLayer?: Phaser.Tilemaps.TilemapLayer;
  private collidablesLayer?: Phaser.Tilemaps.TilemapLayer;
  private interactableObjects?: Phaser.Physics.Arcade.StaticGroup;
  private computerObjectData?: { x: number; y: number; id: number };
  private computerInteractable = false;
  private eKey?: Phaser.Input.Keyboard.Key;
  private missionCompleted = false;
  private bookOpenedAfterMission = false;
  private eKeyIndicator?: Phaser.GameObjects.Image;
  private eKeyTargetObject?: Phaser.GameObjects.Sprite;
  private eKeyTween?: Phaser.Tweens.Tween;
  private lastEKeyObject?: Phaser.Physics.Arcade.Sprite;
  private lastEKeyY?: number;

  constructor() {
    super({ key: "MainScene" });
  }

  init() {
    this.isGameOver = false;
    this.missionCompleted = false;
    this.bookOpenedAfterMission = false;
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
    this.load.image("batteryFull", "/assets/ui/motivationBar/battery-full.png");
    this.load.image("batteryHalf", "/assets/ui/motivationBar/battery-half.png");
    this.load.image(
      "batteryEmpty",
      "/assets/ui/motivationBar/battery-empty.png"
    );
    this.load.image("avatarBackground", "/assets/game/avatarBackground.png");
    this.load.image("book", "/assets/game/book.png");
    this.load.image("book-badge", "/assets/game/book-badge.png");
    this.load.image("book-star", "/assets/game/book-star.png");
    this.load.image("book-tasks", "/assets/ui/book/book-tasks.png");
    this.load.image("book-levels", "/assets/ui/book/book-levels.png");
    this.load.image("book-elements", "/assets/ui/book/book-elements.png");
    this.load.image("checkbox", "/assets/ui/book/checkbox.png");
    this.load.image("checkbox-checked", "/assets/ui/book/checkbox-checked.png");
    this.load.image("qKey", "/assets/ui/keys/qKey.png");
    this.load.image("eKey", "/assets/ui/keys/eKey.png");
    this.load.image("speechBubble", "/assets/characters/speechBubble.png");
    this.load.image("3DaysLater", "/assets/backgrounds/3DaysLater.png");

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
    }

    this.createHUD();

    this.cameras.main.setBounds(0, 0, WORLD.WIDTH, WORLD.HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(100, 100);

    this.eKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.speechManager = new SpeechManager(this);

    this.time.delayedCall(1000, () => {
      if (this.player && this.speechManager) {
        this.speechManager.showSpeech(
          ["I need to look around the room for my CV!"],
          {
            target: this.player,
          }
        );
      }
    });
  }

  update() {
    if (this.isGameOver) return;
    this.player?.update();
    this.speechManager?.update();

    this.checkForInteractions();
    this.updateEKeyIndicator();
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

    this.add
      .image(16 * 7, 16 * 5, "qKey")
      .setOrigin(0)
      .setScrollFactor(0)
      .setScale(0.5);

    this.bookManager = new BookManager(this);

    this.events.on("bookStateChanged", (data: { hasNewPieces: boolean }) => {
      bookIcon.setTexture(data.hasNewPieces ? "book-badge" : "book");
    });

    this.events.on("missionCompleted", () => {
      bookIcon.setTexture("book-star");
      this.missionCompleted = true;

      this.computerInteractable = true;

      this.time.delayedCall(1000, () => {
        if (this.player && this.speechManager) {
          this.speechManager.showSpeech(
            [
              "My CV is complete! Time to submit it.",
              "Using my computer of course :)",
            ],
            {
              target: this.player,
            }
          );
        }
      });
    });

    bookIcon.on("pointerdown", () => {
      this.bookManager?.openWithMissionCheck();
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
    const foregroundLayer = map.createLayer("nonCollidableForegrounds", tiles);

    const objectLayer = map.getObjectLayer("Objects");

    if (objectLayer) {
      this.interactableObjects = this.physics.add.staticGroup();
      objectLayer.objects.forEach((obj) => {
        const properties = obj.properties;
        if (properties && properties.some((p: any) => p.name === "pieceIds")) {
          const sprite = this.interactableObjects?.create(obj.x!, obj.y!);
          if (sprite) {
            sprite.setOrigin(0, 1);
            sprite.setData("properties", properties);
            sprite.setVisible(false);
            sprite.refreshBody();
          }
        }

        if (obj.id === 6) {
          this.computerObjectData = {
            x: obj.x!,
            y: obj.y!,
            id: obj.id,
          };
        }
      });
    }

    if (this.wallLayer) {
      this.wallLayer.setCollisionByProperty({ collides: true });
      this.wallLayer.setCollisionBetween(1, 1000);
    }

    if (this.collidablesLayer) {
      this.collidablesLayer.setCollisionByProperty({ collides: true });
      this.collidablesLayer.setCollisionBetween(1, 1000);
    }

    if (foregroundLayer) foregroundLayer.setDepth(1);
  }

  private checkForInteractions() {
    if (!this.player || !this.eKey) return;

    if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
      let closestObject: Phaser.Physics.Arcade.Sprite | null = null;
      let closestComputer = false;
      let minDistance = 64;

      if (this.interactableObjects) {
        this.interactableObjects.children.each((obj) => {
          const sprite = obj as Phaser.Physics.Arcade.Sprite;
          const distance = Phaser.Math.Distance.Between(
            this.player!.x,
            this.player!.y,
            sprite.x,
            sprite.y
          );

          if (distance < minDistance) {
            minDistance = distance;
            closestObject = sprite;
            closestComputer = false;
          }
          return true;
        });
      }

      if (this.computerObjectData && this.computerInteractable) {
        const distance = Phaser.Math.Distance.Between(
          this.player!.x,
          this.player!.y,
          this.computerObjectData.x,
          this.computerObjectData.y
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestObject = null;
          closestComputer = true;
        }
      }

      if (closestComputer) {
        if (this.player && this.speechManager) {
          this.speechManager.showSpeech(
            ["I have submitted my CV! Now it's time to wait..."],
            {
              target: this.player,
              onComplete: () => {
                const { width, height } = this.scale;
                const threeDaysImage = this.add.image(
                  width / 2,
                  height / 2,
                  "3DaysLater"
                );
                threeDaysImage.setOrigin(0.5);
                threeDaysImage.setDepth(9999);

                this.time.delayedCall(4000, () => {
                  threeDaysImage.destroy();
                  this.time.delayedCall(500, () => {
                    if (this.player && this.speechManager) {
                      this.speechManager.showSpeech(
                        ["Yay! I got called to some interviews!"],
                        {
                          target: this.player,
                        }
                      );
                    }
                  });
                });
              },
            }
          );
        }
      } else if (closestObject) {
        this.interactWithObject(closestObject);
      }
    }
  }

  private interactWithObject(obj: Phaser.GameObjects.Sprite) {
    const propertiesArray = obj.getData("properties") as {
      name: string;
      type: string;
      value: any;
    }[];
    if (!propertiesArray) return;

    const properties: { [key: string]: any } = {};
    propertiesArray.forEach((prop) => {
      properties[prop.name] = prop.value;
    });

    if (properties.pieceIds) {
      const pieceIds = String(properties.pieceIds)
        .split(",")
        .map((id: string) => parseInt(id.trim(), 10));
      this.scene.launch("PuzzleScene", { pieceIds, sourceObject: obj });
      this.scene.pause();
      if (this.eKeyIndicator) {
        this.eKeyIndicator.setVisible(false);
        this.eKeyTargetObject = undefined;
      }
      return;
    }
  }

  damagePlayer(amount: number) {
    if (!this.player || !this.healthBar) return;
    const newHealth = this.player.damage(amount);
    this.healthBar.decrease(amount);
    this.events.emit("playerDamaged");

    if (newHealth <= 0) {
      this.handleGameOver();
    }
  }

  private handleGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.events.emit("gameOver");

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
    this.speechManager?.destroy();
  }

  private updateEKeyIndicator() {
    if (!this.player || !this.interactableObjects) return;

    let closestObject: Phaser.Physics.Arcade.Sprite | null = null;
    let minDistance = 64;

    this.interactableObjects.children.each((obj) => {
      const sprite = obj as Phaser.Physics.Arcade.Sprite;
      const distance = Phaser.Math.Distance.Between(
        this.player!.x,
        this.player!.y,
        sprite.x,
        sprite.y
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestObject = sprite;
      }
      return true;
    });

    if (closestObject !== null) {
      const obj = closestObject as Phaser.Physics.Arcade.Sprite;
      const topY = obj.y;

      if (this.lastEKeyObject !== obj || this.lastEKeyY !== topY) {
        if (!this.eKeyIndicator) {
          this.eKeyIndicator = this.add.image(0, 0, "eKey").setOrigin(0, 1);
          this.eKeyIndicator.setDepth(10);
        }
        this.eKeyIndicator.setVisible(true);
        this.eKeyIndicator.setPosition(obj.x, topY);

        if (this.eKeyTween) {
          this.eKeyTween.stop();
        }
        this.eKeyTween = this.tweens.add({
          targets: this.eKeyIndicator,
          y: { from: topY, to: topY - 8 },
          duration: 500,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });

        this.lastEKeyObject = obj;
        this.lastEKeyY = topY;
      }
      this.eKeyTargetObject = closestObject;
    } else {
      if (this.eKeyIndicator) {
        this.eKeyIndicator.setVisible(false);
        this.eKeyTargetObject = undefined;
      }
      if (this.eKeyTween) {
        this.eKeyTween.stop();
        this.eKeyTween = undefined;
      }
      this.lastEKeyObject = undefined;
      this.lastEKeyY = undefined;
    }
  }
}
