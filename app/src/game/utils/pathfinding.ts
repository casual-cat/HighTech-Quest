import { Character } from "../entities/Character";

/**
 * Moves a character to the specified tile using pathfinding and animation.
 * @param character The character to move (must have setPathfindingGrid called first)
 * @param x The target tile X coordinate
 * @param y The target tile Y coordinate
 * @param onComplete Optional callback when movement is finished or no path found
 */
export function moveCharacterToTile(
  character: Character,
  x: number,
  y: number,
  onComplete?: () => void
) {
  character.findPathTo(x, y, (path) => {
    if (path && path.length > 0) {
      character.followPath(path, onComplete);
    } else if (onComplete) {
      onComplete();
    }
  });
}

/**
 * Builds a pathfinding grid from tilemap layers.
 * @param map The Phaser tilemap
 * @param wallLayer Optional wall layer for collision detection
 * @param collidablesLayer Optional collidables layer for collision detection
 * @returns A 2D grid array where 0 = walkable, 1 = blocked
 */
export function buildPathfindingGrid(
  map: Phaser.Tilemaps.Tilemap,
  wallLayer?: Phaser.Tilemaps.TilemapLayer,
  collidablesLayer?: Phaser.Tilemaps.TilemapLayer
): number[][] {
  const grid: number[][] = [];
  
  for (let y = 0; y < map.height; y++) {
    const row: number[] = [];
    for (let x = 0; x < map.width; x++) {
      const wallTile = wallLayer?.getTileAt(x, y);
      const collidableTile = collidablesLayer?.getTileAt(x, y);
      const blocked = wallTile || collidableTile;
      row.push(blocked ? 1 : 0);
    }
    grid.push(row);
  }
  
  return grid;
}
