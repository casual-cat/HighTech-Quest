import Phaser from "phaser";
import { BOOK_SCENE_CONFIG } from "../constants/book";
import { GameState } from "../../stores/GameState";

export default class PromptScene extends Phaser.Scene {
    private currentLevel: number | undefined;

    constructor() {
        super({ key: "PromptScene" });
    }

    init() {
        this.currentLevel = GameState.currentLevel;
    }

    preload(): void {
        this.load.image("minigame1-prompt", "/assets/game/level3/minigames/hierarchy-tasks/minigame1-prompt.png");
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

        const prompt = this.add.image(width / 2, height / 2, "minigame1-prompt");
    }
}