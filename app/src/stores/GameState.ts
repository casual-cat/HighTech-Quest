export const GameState = {
  currentLevel: 1,
  completedLevels: [] as number[],
  completedMinigames: [] as string[],

  markLevelCompleted(level: number) {
    if (!this.completedLevels.includes(level)) {
      this.completedLevels.push(level);
    }
  },

  markMinigameCompleted(minigame: string) {
    if (!this.completedMinigames.includes(minigame)) {
      this.completedMinigames.push(minigame);
    }
  },

  isCompleted({ level, minigame }: { level?: number; minigame?: string }) {
    if (level !== undefined && minigame !== undefined) {
      return (
        this.completedLevels.includes(level) &&
        this.completedMinigames.includes(minigame)
      );
    }

    if (level !== undefined) {
      return this.completedLevels.includes(level);
    }

    if (minigame !== undefined) {
      return this.completedMinigames.includes(minigame);
    }

    return false;
  },
};
