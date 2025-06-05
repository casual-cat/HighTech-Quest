import Phaser from "phaser";
import { Item } from "./Item";

export class Chest extends Item {
  constructor(scene: Phaser.Scene, x: number, y: number, frame: number) {
    super(scene, x, y, "icons");
    this.setFrame(frame);
  }

  onInteract(player: Phaser.Physics.Arcade.Sprite): void {
    console.log('Chest interacted with!');
  }
} 