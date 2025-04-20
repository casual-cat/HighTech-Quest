import Phaser from "phaser";
import MainScene from "../scenes/MainScene";
import CarrerMenu from "../scenes/CarrerMenu";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  physics: {
    default: "arcade",
  },
  scene: [CarrerMenu, MainScene],
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
