import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { gameConfig } from "../game/config/GameConfig";

const Game = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameContainerRef.current && !gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        ...gameConfig,
        parent: gameContainerRef.current,
      };

      gameRef.current = new Phaser.Game(config);
    }

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div ref={gameContainerRef} style={{ width: "100%", height: "100%" }} />
  );
};

export default Game;
