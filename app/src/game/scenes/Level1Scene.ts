import Phaser from "phaser";
import { WORLD, CHARACTER } from "../constants/game";
import { Player } from "../entities/Player";
import { MotivationBar } from "../../managers/MotivationBarManager";
import { BookManager } from "../../managers/BookManager";
import { SpeechManager } from "../../managers/SpeechManager";
import { CareerKey, CareerStore } from "../../stores/CareerStore";
import { PUZZLE_DATA } from "../data/puzzlePieces";
import { EKeyIndicator } from "../../managers/EKeyIndicatorManager";
import {
  moveCharacterToTile,
  buildPathfindingGrid,
} from "../utils/pathfinding";
import { BookStore } from "../../stores/BookStore";
import { ObjectiveManager } from "../../managers/ObjectiveManager";
import { GameState } from "../../stores/GameState";
import { TiledProperty } from "../types/Types";

export default class Level1Scene extends Phaser.Scene {
  private player?: Player;
  private career?: CareerKey;
  private motivationBar?: MotivationBar;
  private bookManager?: BookManager;
  private speechManager?: SpeechManager;
  private isGameOver = false;
  private wallLayer?: Phaser.Tilemaps.TilemapLayer;
  private collidablesLayer?: Phaser.Tilemaps.TilemapLayer;
  private interactableObjects?: Phaser.Physics.Arcade.StaticGroup;
  private computerObjectData?: {
    x: number;
    y: number;
    properties: TiledProperty[];
  };
  private computerInteractable = false;
  private computerSprite?: Phaser.Physics.Arcade.Sprite;
  private eKey?: Phaser.Input.Keyboard.Key;
  private eKeyIndicator!: EKeyIndicator;
  private levelUpShown = false;
  private openBookOnResume = false;
  private bookIcon?: Phaser.GameObjects.Image;
  private pathfindingGrid?: number[][];
  private threeDaysLaterComplete = false;

  constructor() {
    super({ key: "Level1Scene" });
  }

  init() {
    this.isGameOver = false;
    PUZZLE_DATA.forEach((piece) => {
      piece.collected = false;
      piece.isNew = false;
    });
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
    this.load.image("qKey", "/assets/ui/keys/qKey.png");
    this.load.image("eKey", "/assets/ui/keys/eKey.png");
    this.load.image("speechBubble", "/assets/characters/speechBubble.png");

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
      CHARACTER.HEALTH.MAX,
      `character-${this.career}`
    );

    if (this.player) {
      if (this.wallLayer) {
        this.physics.add.collider(this.player, this.wallLayer);
      }
      if (this.collidablesLayer) {
        this.physics.add.collider(this.player, this.collidablesLayer);
      }
      if (this.pathfindingGrid) {
        this.player.setPathfindingGrid(this.pathfindingGrid, [0]);
      }
    }

    this.createHUD();

    this.cameras.main.setBounds(0, 0, WORLD.WIDTH, WORLD.HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(100, 100);

    this.eKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.bookManager?.setCurrentScene(this);

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

    this.events.on("resume", () => {
      if (this.openBookOnResume) {
        this.openBookOnResume = false;
        this.bookManager?.open("Levels");
      }
      if (this.threeDaysLaterComplete) {
        this.threeDaysLaterComplete = false;
        if (this.player && this.speechManager) {
          this.speechManager.showSpeech(
            ["Yay! I got called to some interviews!"],
            {
              target: this.player,
              onComplete: () => {
                if (this.bookManager) {
                  this.bookManager.showUnlockAnimation = true;
                }
                if (this.player) {
                  moveCharacterToTile(this.player, 3, 3, () => {
                    this.scene.pause();
                    if (!this.levelUpShown) {
                      this.levelUpShown = true;
                      this.openBookOnResume = true;
                      this.bookManager?.setLevel1Completed();
                      GameState.markLevelCompleted(GameState.currentLevel);

                      const playerData = {
                        motivation: this.motivationBar?.getCurrentMotivation(),
                      };
                      this.registry.set("playerData", playerData);
                      this.scene.launch("LevelUpScene", {
                        parentScene: this.scene.key,
                      });
                    }
                  });
                }
              },
            }
          );
        }
      }
    });

    if (this.player && this.interactableObjects) {
      this.eKeyIndicator = new EKeyIndicator(
        this,
        this.player,
        this.interactableObjects
      );
    } else {
      console.warn(
        "Could not initialize EKeyIndicator — player or interactables missing"
      );
    }
  }

  update() {
    if (this.isGameOver) return;
    this.player?.update();
    this.speechManager?.update();

    this.checkForInteractions();
    this.eKeyIndicator?.update();
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
    this.motivationBar.setHealth(this.player.getHealth());

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

    this.bookManager = new BookManager(this);
    BookStore.set(this.bookManager);

    this.events.on("bookStateChanged", (data: { hasNewPieces: boolean }) => {
      if (this.bookIcon && this.bookIcon.scene) {
        this.bookIcon.setTexture(data.hasNewPieces ? "book-badge" : "book");
      }
    });

    this.events.on("allPiecesCollected", () => {
      if (this.bookIcon && this.bookIcon.scene) {
        this.bookIcon.setTexture("book-star");
      }

      this.computerInteractable = true;

      if (this.interactableObjects && this.computerObjectData) {
        const { x, y, properties } = this.computerObjectData;
        this.computerSprite = this.interactableObjects.create(
          x,
          y
        ) as Phaser.Physics.Arcade.Sprite;
        this.computerSprite.setOrigin(0.5);
        this.computerSprite.setVisible(false);
        this.computerSprite.refreshBody();
        this.computerSprite.setData("properties", properties);
      }

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

    this.bookIcon.on("pointerdown", () => {
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
    const foregroundLayer = map.createLayer("nonCollidableForegrounds", tiles);

    const objectLayer = map.getObjectLayer("Objects");

    if (objectLayer) {
      this.interactableObjects = this.physics.add.staticGroup();

      objectLayer.objects.forEach((obj) => {
        const centerX = obj.x! + obj.width! / 2;
        const centerY = obj.y! + obj.height! / 2;

        if (obj.properties) {
          const idProperty = obj.properties.find(
            (p: TiledProperty) => p.name === "id"
          );

          if (idProperty.value === "computer") {
            this.computerObjectData = {
              x: obj.x! + obj.width! / 2,
              y: obj.y! + obj.height! / 2,
              properties: obj.properties,
            };
          } else {
            const sprite = this.interactableObjects!.create(centerX, centerY);

            if (sprite) {
              sprite.setOrigin(0.5);
              sprite.setVisible(false);
              sprite.refreshBody();
              if (obj.properties) {
                sprite.setData("properties", obj.properties);
              }
              sprite.setData("id", obj.id);
            }
          }
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

    this.pathfindingGrid = buildPathfindingGrid(
      map,
      this.wallLayer,
      this.collidablesLayer
    );
  }

  private checkForInteractions() {
    if (!this.player || !this.eKey || !this.interactableObjects) return;

    if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
      let closestObject: Phaser.Physics.Arcade.Sprite | null = null;
      let closestComputer = false;
      let minDistance: number = CHARACTER.INTERACTION_DISTANCE;

      if (this.interactableObjects) {
        this.interactableObjects.children.each((obj) => {
          const sprite = obj as Phaser.Physics.Arcade.Sprite;
          const distance = Phaser.Math.Distance.Between(
            this.player!.x,
            this.player!.y,
            sprite.x,
            sprite.y
          );

          if (distance <= minDistance) {
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

        if (distance <= minDistance) {
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
              onStart: () => {
                if (this.computerSprite && this.interactableObjects) {
                  this.interactableObjects.remove(
                    this.computerSprite,
                    true,
                    true
                  );
                  this.computerSprite = undefined;
                }
              },
              onComplete: () => {
                this.computerInteractable = false;
                ObjectiveManager.completeTask(1, "submitCV");
                this.threeDaysLaterComplete = true;
                this.scene.launch("ThreeDaysLaterScene", {
                  parentScene: this.scene.key,
                });
                this.scene.pause();
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
      return;
    }
  }

  damagePlayer(amount: number) {
    if (!this.player || !this.motivationBar) return;
    const newHealth = this.player.damage(amount);
    this.motivationBar.decrease(amount);
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
      this.scene.start("GameOverScene", {
        returnScene: this.scene.key,
        player: this.player,
      });
    });
  }

  healPlayer(amount: number) {
    this.player?.heal(amount);
    this.motivationBar?.increase(amount);
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
    this.events.off("bookStateChanged");
    this.events.off("allPiecesCollected");
  }
}
