import Phaser from "phaser";
import { Player } from "../entities/Player";
import { CareerKey, CareerStore } from "../../stores/CareerStore";
import { MotivationBar } from "../../managers/MotivationBarManager";
import { BookManager } from "../../managers/BookManager";
import { SpeechManager } from "../../managers/SpeechManager";
import { EKeyIndicator } from "../../managers/EKeyIndicatorManager";
import { CHARACTER, WORLD } from "../constants/game";
import { BookStore } from "../../stores/BookStore";
import { Recruiter } from "../entities/Recruiter";
import {
  RECRUITER_QUESTIONS,
  RecruiterQA,
  UserAnswer,
} from "../data/recruiterData";

export default class Level2Scene extends Phaser.Scene {
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
  private spotlight!: Phaser.GameObjects.Graphics;
  private recruitersGroup!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super({ key: "Level2Scene" });
  }

  init() {}

  preload() {
    const career = CareerStore.getCareer();
    this.playerData = this.registry.get("playerData");
    // const career = CareerStore.getCareer() || "fullstack"; // For development
    // this.playerData = this.registry.get("playerData") || { motivation: 99 }; // For development

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

    this.load.image("optionBubble", "/assets/characters/optionBubble.png");
    this.load.image("level2-tileset", "/assets/maps/level2/level2-tileset.png");
    this.load.tilemapTiledJSON("level2-map", "/assets/maps/level2/level2.tmj");
    this.load.spritesheet(
      "character-fullstack",
      "/assets/characters/fullstack.png",
      { frameWidth: 32, frameHeight: 48 }
    );
    this.load.spritesheet("shelly", "/assets/game/level2/shelly.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.spritesheet("adi", "/assets/game/level2/adi.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.spritesheet("dor", "/assets/game/level2/dor.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.spritesheet("daniel", "/assets/game/level2/daniel.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.spritesheet("noya", "/assets/game/level2/noya.png", {
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
    if (this.player) {
      this.eKeyIndicator = new EKeyIndicator(
        this,
        this.player,
        this.recruitersGroup
      );
    }
  }

  update() {
    if (this.isGameOver) return;

    if (this.player) {
      this.player.update();
      this.eKeyIndicator?.update();

      const cam = this.cameras.main;
      const playerScreenX = this.player.x - cam.scrollX;
      const playerScreenY = this.player.y - cam.scrollY;

      this.spotlight.clear();
      this.spotlight.fillStyle(0xffffff);
      this.spotlight.fillCircle(playerScreenX, playerScreenY, 70);

      if (Phaser.Input.Keyboard.JustDown(this.eKey!)) {
        const target = this.eKeyIndicator.getTarget();
        if (target) {
          this.handleRecruiterInteraction(target);
        }
      }
    }
  }

  private createWorld() {
    this.physics.world.setBounds(0, 0, WORLD.WIDTH, WORLD.HEIGHT);

    this.map = this.add.tilemap("level2-map");
    const tiles = this.map.addTilesetImage("level2-tileset", "level2-tileset");

    if (!tiles) {
      console.error("Failed to load tiles");
      return;
    }

    const floor = this.map.createLayer("Floor", tiles);
    this.collidables = this.map.createLayer("Collidables", tiles) || undefined;

    if (this.collidables) {
      this.collidables.setCollisionByProperty({ collides: true });
      this.collidables.setCollisionBetween(1, 1000);
    }

    const darkness = this.add.graphics(); // highlight on development
    darkness.fillStyle(0x000000, 1); // highlight on development
    darkness.fillRect(0, 0, WORLD.WIDTH, WORLD.HEIGHT); // highlight on development
    darkness.setScrollFactor(0); // highlight on development
    darkness.setDepth(1); // highlight on development

    this.spotlight = this.make.graphics({}, false);
    this.spotlight.fillStyle(0xffffff);
    this.spotlight.fillCircle(100, 100, 100);

    const mask = this.spotlight.createGeometryMask();
    mask.invertAlpha = true;

    darkness.setMask(mask); // highlight on development
  }

  private createPlayer() {
    this.player = new Player(
      this,
      4 * WORLD.TILE.WIDTH,
      4 * WORLD.TILE.HEIGHT,
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

    if (!this.bookManager) {
      console.warn("BookManager is not available");
    }

    this.bookManager?.setCurrentScene(this);
  }

  private createObjects() {
    const objectLayer = this.map?.getObjectLayer("Objects");
    if (!objectLayer || !this.player) return;

    this.recruitersGroup = this.physics.add.staticGroup();

    objectLayer.objects.forEach((obj) => {
      const props =
        obj.properties?.reduce((acc: Record<string, any>, p: any) => {
          acc[p.name] = p.value;
          return acc;
        }, {} as Record<string, any>) || {};

      const spriteKey = props.id;

      if (spriteKey) {
        const centerX = obj.x! + obj.width! / 2;
        const centerY = obj.y! + obj.height! / 2;

        const recruiter = new Recruiter(this, centerX, centerY, spriteKey);
        recruiter.setData("id", spriteKey);
        recruiter.setData("properties", props);
        this.add.existing(recruiter);
        this.physics.add.existing(recruiter, true);
        this.recruitersGroup.add(recruiter);
        recruiter.body!.immovable = true;

        if (
          spriteKey === "shelly" ||
          spriteKey === "noya" ||
          spriteKey === "dor"
        ) {
          recruiter.setFlipX(true);
        }

        this.physics.add.collider(this.player!, recruiter);
      }
    });
  }

  private handleRecruiterInteraction(recruiter: Phaser.GameObjects.Sprite) {
    const recruiterId = recruiter.getData("id");
    const recruiterData: RecruiterQA = RECRUITER_QUESTIONS[recruiterId];
    if (recruiterData && this.player) {
      if (recruiterData.interacted) {
        this.speechManager?.showSpeech([recruiterData.rejection], {
          target: recruiter,
        });
        return;
      }

      recruiterData.interacted = true;
      this.eKeyIndicator.setEnabled(false);
      this.player?.disableMovement();

      this.speechManager?.startInterview(recruiterData, {
        target: recruiter,
        player: this.player,
        onAnswerSelected: (selectedAnswer: UserAnswer) => {
          setTimeout(() => {
            this.speechManager?.showSpeech(
              [selectedAnswer.recruiterResponse.text],
              { target: recruiter }
            );

            this.player?.enableMovement();
            this.eKeyIndicator.setEnabled(true);
          }, 100);
          selectedAnswer.recruiterResponse.score === 50
            ? this.motivationBar?.decrease(10)
            : selectedAnswer.recruiterResponse.score === 25
            ? this.motivationBar?.decrease(30)
            : this.motivationBar?.decrease(100);

          this.player?.enableMovement();
          this.eKeyIndicator.setEnabled(true);
        },
      });
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
