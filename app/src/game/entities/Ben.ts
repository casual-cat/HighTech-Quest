import Phaser from "phaser";
import { Character } from "./Character";
import { WORLD } from "../constants/game";
import { moveCharacterToTile } from "../utils/pathfinding";

export class Ben extends Character {
  private player?: Phaser.Physics.Arcade.Sprite;
  private hasPathfoundToPlayer = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 1, "ben");

    scene.physics.world.disable(this);

    scene.physics.add.existing(this, true);

    this.disableMovement();
    this.setImmovable(true);
  }

  public setPlayer(player: Phaser.Physics.Arcade.Sprite) {
    this.player = player;
    this.startPathfindingToPlayer();
  }

  private startPathfindingToPlayer() {
    if (!this.player || this.hasPathfoundToPlayer) return;

    const playerTileX = Math.floor(this.player.x / WORLD.TILE.WIDTH);
    const playerTileY = Math.floor(this.player.y / WORLD.TILE.HEIGHT);

    console.log(
      "Ben is pathfinding to player at tile:",
      playerTileX + 1,
      playerTileY
    );

    moveCharacterToTile(this, playerTileX + 1, playerTileY, () => {
      console.log("Ben has reached the player");
      this.hasPathfoundToPlayer = true;
      if (this.player && "enableMovement" in this.player) {
        (this.player as any).enableMovement();
      }
    });
  }

  public interact(): void {
    if (!this.player) {
      console.log("Ben interaction triggered, but no player reference");
      return;
    }

    if (this.hasPathfoundToPlayer) {
      console.log("Ben interaction triggered");
      return;
    }
    this.startPathfindingToPlayer();
  }
}
