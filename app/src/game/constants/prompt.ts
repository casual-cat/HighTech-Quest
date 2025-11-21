import Phaser from "phaser";

export const PROMPT_SCENE_CONFIG = {
    ANIMATION: {
        BACKGROUND_DEPTH: 10,
        BUTTON_DEPTH: 20,
        EXPAND_DURATION: 800,
        SHRINK_DURATION: 800,
        EXPAND_EASING: Phaser.Math.Easing.Cubic.Out,
        SHRINK_EASING: Phaser.Math.Easing.Cubic.In,
        BACKGROUND_COLOR: 0xfef7de,
        BACKGROUND_ALPHA: 1,
        EXPAND_OFFSET: 50,
    },
    UI_POSITIONS: {
        CLOSE_BUTTON: { offsetX: -30, offsetY: 30 },
        INFO_ICON: { offsetX: 30, offsetY: 32 },
        START_BUTTON_OFFSET_Y: -60,
    },
} as const;

