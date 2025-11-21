import Phaser from "phaser";
import OpeningScene from "../scenes/OpeningScene";
import InfoScene from "../scenes/InfoScene";
import CareerMenu from "../scenes/CareerMenu";
import IntroScene from "../scenes/IntroScene";
import MainMenu from "../scenes/MainMenu";
import Level1Scene from "../scenes/Level1Scene";
import Level2Scene from "../scenes/Level2Scene";
import Level3Scene from "../scenes/Level3Scene";
import LetterScene from "../scenes/LetterScene";
import { BookScene } from "../scenes/BookScene";
import { PuzzleScene } from "../scenes/PuzzleScene";
import { GameOverScene } from "../scenes/GameOverScene";
import LevelUpScene from "../scenes/LevelUpScene";
import ThreeDaysLaterScene from "../scenes/ThreeDaysLaterScene";
import { ControlsScene } from "../scenes/ControlsScene";
import PromptScene from "../scenes/PropmtScene";
import minigame1Scene from "../scenes/minigame1Scene";
import minigame2Scene from "../scenes/minigame2Scene";
import minigame3Scene from "../scenes/minigame3Scene";
import minigame4Scene from "../scenes/minigame4Scene";

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
    ControlsScene,
    Level1Scene,
    Level2Scene,
    Level3Scene,
    LetterScene,
    BookScene,
    PuzzleScene,
    GameOverScene,
    LevelUpScene,
    ThreeDaysLaterScene,
    PromptScene,
    minigame1Scene,
    minigame2Scene,
    minigame3Scene,
    minigame4Scene,
  ],
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
