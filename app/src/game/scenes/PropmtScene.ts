import Phaser from "phaser";
import { BOOK_SCENE_CONFIG } from "../constants/book";
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
        this.load.image("button", "/assets/buttons/Button_DarkGreen.png"); // For development
        this.load.image("buttonPressed", "/assets/buttons/Button_LightGreen.png"); // For development

        if (this.objectId) {
            const imageKey = `${this.objectId}-prompt`;
            const imagePath = `/assets/game/level3/minigames/prompt/${this.objectId}-prompt.png`;
            this.load.image(imageKey, imagePath);
        }
    }

    create(): void {
        const { width, height } = this.scale;

        this.add.rectangle(
            0,
            0,
            width,
            height,
            BOOK_SCENE_CONFIG.OVERLAY.COLOR,
            BOOK_SCENE_CONFIG.OVERLAY.ALPHA
        ).setOrigin(0)
            .setInteractive({ useHandCursor: false })
            .on("pointerdown", () => {
                this.scene.stop();
                this.scene.resume(`Level${this.currentLevel}Scene`);
            });

        if (this.objectId) {
            const imageKey = `${this.objectId}-prompt`;
            const prompt = this.add.image(width / 2, height / 2, imageKey)
                .setInteractive({ useHandCursor: false })
                .on("pointerdown", (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
                    event.stopPropagation();
                });

            const buttonY = prompt.y + prompt.displayHeight / 2 - 60;
            const button = this.add.image(width / 2, buttonY, "button")
                .setInteractive({ useHandCursor: true })
                .on("pointerdown", () => {
                    button.setTexture("buttonPressed");
                })
                .on("pointerup", () => {
                    button.setTexture("button");
                    // this.scene.stop();
                    // this.scene.resume(`Level${this.currentLevel}Scene`);
                })
                .on("pointerout", () => {
                    button.setTexture("button");
                });

            this.add.text(width / 2, buttonY, "Start", {
                fontSize: "24px",
                color: "#ffffff"
            }).setOrigin(0.5);
        }


    }
}