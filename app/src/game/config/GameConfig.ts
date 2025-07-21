import Phaser from "phaser";
import OpeningScene from "../scenes/OpeningScene";
import InfoScene from "../scenes/InfoScene";
import CareerMenu from "../scenes/CareerMenu";
import IntroScene from "../scenes/IntroScene";
import MainMenu from "../scenes/MainMenu";
import MainScene from "../scenes/MainScene";
import { BookScene } from "../../managers/BookManager";
import { PuzzleScene } from "../scenes/PuzzleScene";
import { GameOverScene } from "../scenes/GameOverScene";
import LevelUpScene from "../scenes/LevelUpScene";

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
    MainScene,
    BookScene,
    PuzzleScene,
    GameOverScene,
    LevelUpScene,
  ],
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
