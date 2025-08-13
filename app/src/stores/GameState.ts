export const GameState = {
  currentLevel: 1,
  completedLevels: [] as number[],

  markLevelCompleted(level: number) {
    if (!this.completedLevels.includes(level)) {
      this.completedLevels.push(level);
    }
  },
};
