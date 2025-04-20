import Phaser from "phaser";
import { Coin } from "../game/objects/Coin";
import { TILE_HEIGHT, TILE_WIDTH } from "../game/utils/Constants";

export class CoinManager {
  private scene: Phaser.Scene;
  private coins: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.coins = this.scene.physics.add.group({
      classType: Coin,
      runChildUpdate: true,
    });
  }

  createCoins(
    count: number,
    startX: number,
    startY: number,
    stepX: number,
    stepY: number = 0
  ) {
    for (let i = 0; i < count; i++) {
      const x = startX + i * stepX;
      const y = startY + i * stepY;
      const coin = new Coin(this.scene, x, y);
      this.coins.add(coin);
    }
  }

  createDefaultCoins() {
    this.createCoins(5, 4 * TILE_WIDTH, 4 * TILE_HEIGHT, TILE_WIDTH * 4);
  }

  getCoins() {
    return this.coins;
  }

  handlePlayerCollision(
    player: Phaser.GameObjects.GameObject,
    coinObject: Phaser.GameObjects.GameObject
  ) {
    const coin = coinObject as Coin;
    const value = coin.collect();

    return value;
  }
}
