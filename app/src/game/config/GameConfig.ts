import Phaser from "phaser";
import OpeningScene from "../scenes/OpeningScene";
import InfoScene from "../scenes/InfoScene";
import CareerMenu from "../scenes/CareerMenu";
import IntroScene from "../scenes/IntroScene";
import MainMenu from "../scenes/MainMenu";
import Level1Scene from "../scenes/Level1Scene";
import { BookScene } from "../scenes/BookScene";
import { PuzzleScene } from "../scenes/PuzzleScene";
import { GameOverScene } from "../scenes/GameOverScene";
import LevelUpScene from "../scenes/LevelUpScene";
import ThreeDaysLaterScene from "../scenes/ThreeDaysLaterScene";
import Level2Scene from "../scenes/Level2Scene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  physics: {
    default: "arcade",
  },
  scene: [
    InfoScene,
    OpeningScene,
    CareerMenu,
    IntroScene,
    MainMenu,
    Level1Scene,
    BookScene,
    PuzzleScene,
    GameOverScene,
    LevelUpScene,
    ThreeDaysLaterScene,
    Level2Scene,
  ],
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
