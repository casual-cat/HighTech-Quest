import Phaser from "phaser";
import OpeningScene from "../scenes/OpeningScene";
import InfoScene from "../scenes/InfoScene";
import CareerMenu from "../scenes/CareerMenu";
import IntroScene from "../scenes/IntroScene";
import MainMenu from "../scenes/MainMenu";
import MainScene from "../scenes/MainScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  physics: {
    default: "arcade",
  },
  scene: [OpeningScene, InfoScene, CareerMenu, IntroScene, MainMenu, MainScene],
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
