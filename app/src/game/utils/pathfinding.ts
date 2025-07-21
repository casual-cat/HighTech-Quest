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
