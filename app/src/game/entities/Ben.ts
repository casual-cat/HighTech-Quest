import Phaser from "phaser";
import { Character } from "./Character";
import { WORLD } from "../constants/game";
import { moveCharacterToTile } from "../utils/pathfinding";

export class Ben extends Character {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 1, "ben");

    scene.physics.world.disable(this);

    scene.physics.add.existing(this, true);

    this.disableMovement();
    this.setImmovable(true);
  }

  public moveToPlayer(
    player: Phaser.Physics.Arcade.Sprite,
    onComplete?: () => void
  ): void {
    const playerTileX = Math.floor(player.x / WORLD.TILE.WIDTH);
    const playerTileY = Math.floor(player.y / WORLD.TILE.HEIGHT);

    moveCharacterToTile(this, playerTileX + 1, playerTileY, () => {
      if (onComplete) {
        onComplete();
      }
    });
  }

  public interact(): void {
    console.log("Ben interaction triggered");
  }
}
