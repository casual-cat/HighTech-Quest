import Phaser from "phaser";
import { BOOK_SCENE_CONFIG } from "../constants/book";
import { getMinigameInfo } from "../data/minigames";
import { GameState } from "../../stores/GameState";

export default class PromptScene extends Phaser.Scene {
  private currentLevel: number | undefined;
  private objectId: string | undefined;

  constructor() {
    super({ key: "PromptScene" });
  }

  init(data: { objectId: string }) {
    this.currentLevel = GameState.currentLevel;
    this.objectId = data.objectId;
  }

  preload(): void {
    if (!this.textures.exists("close")) {
      this.load.image("close", "/assets/ui/icons/button-x.png");
    }

    if (!this.textures.exists("info")) {
      this.load.image("info", "/assets/ui/icons/info.png");
    }

    if (this.objectId) {
      const imageKey = `${this.objectId}-prompt`;
      const imagePath = `/assets/game/level3/minigames/prompt/${this.objectId}-prompt.png`;
      this.load.image(imageKey, imagePath);
    }
  }

  create(): void {
    const { width, height } = this.scale;

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
      .setInteractive({ useHandCursor: false })
      .on("pointerdown", () => {
        this.scene.stop();
        this.scene.resume(`Level${this.currentLevel}Scene`);
      });

    if (this.objectId) {
      const imageKey = `${this.objectId}-prompt`;
      const prompt = this.add
        .image(width / 2, height / 2, imageKey)
        .setInteractive({ useHandCursor: false })
        .on(
          "pointerdown",
          (
            pointer: Phaser.Input.Pointer,
            localX: number,
            localY: number,
            event: Phaser.Types.Input.EventData
          ) => {
            event.stopPropagation();
          }
        );

      const closeButton = this.add
        .image(
          prompt.x + prompt.displayWidth / 2 - 30,
          prompt.y - prompt.displayHeight / 2 + 30,
          "close"
        )
        .setInteractive({ useHandCursor: true })
        .on(
          "pointerdown",
          (
            pointer: Phaser.Input.Pointer,
            localX: number,
            localY: number,
            event: Phaser.Types.Input.EventData
          ) => {
            event.stopPropagation();
            this.scene.stop();
            this.scene.resume(`Level${this.currentLevel}Scene`);
          }
        );

      const infoIcon = this.add
        .image(
          prompt.x - prompt.displayWidth / 2 + 30,
          prompt.y - prompt.displayHeight / 2 + 32,
          "info"
        )
        .setInteractive({ useHandCursor: true })
        .on(
          "pointerdown",
          (
            pointer: Phaser.Input.Pointer,
            localX: number,
            localY: number,
            event: Phaser.Types.Input.EventData
          ) => {
            event.stopPropagation();
            const info = this.objectId
              ? getMinigameInfo(this.objectId)
              : undefined;
            if (info) {
              console.log(`[${info.title}]`, {
                summary: info.summary,
                objective: info.objective,
                instructions: info.instructions,
                controls: info.controls,
                tips: info.tips,
              });
            } else {
              console.log(`Prompt info clicked for ${this.objectId}`);
            }
          }
        );
      infoIcon.setScale(0.9);

      const buttonY = prompt.y + prompt.displayHeight / 2 - 60;
      const button = this.add
        .image(width / 2, buttonY, "button")
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
          button.setTexture("buttonPressed");
        })
        .on("pointerup", () => {
          button.setTexture("button");
          this.scene.stop();
          this.scene.launch(`${this.objectId}Scene`);
        })
        .on("pointerout", () => {
          button.setTexture("button");
        });

      this.add
        .text(width / 2, buttonY, "Start", {
          fontSize: "24px",
          color: "#ffffff",
        })
        .setOrigin(0.5);
    }
  }
}
