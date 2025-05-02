import Phaser from "phaser";
import OpeningScene from "../scenes/OpeningScene";
import CareerMenu from "../scenes/CareerMenu";
import MainScene from "../scenes/MainScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  physics: {
    default: "arcade",
  },
  scene: [OpeningScene, CareerMenu, MainScene],
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
