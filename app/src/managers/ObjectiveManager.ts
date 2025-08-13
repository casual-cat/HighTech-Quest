import { LEVELS_DATA } from "../game/data/levelData";

export const ObjectiveManager = {
  completeTask(levelNumber: number, id: string) {
    const level = LEVELS_DATA[levelNumber];
    if (!level) return;

    for (const objective of level.objectives) {
      if (objective.id === id) {
        objective.complete = true;
        return;
      }

      if (objective.subtasks) {
        for (const subtask of objective.subtasks) {
          if (subtask.id === id) {
            subtask.complete = true;

            if (objective.subtasks.every((st) => st.complete)) {
              objective.complete = true;
            }

            return;
          }
        }
      }
    }
  },

  resetTasks(levelNumber: number) {
    const level = LEVELS_DATA[levelNumber];
    if (!level) return;

    for (const objective of level.objectives) {
      objective.complete = false;

      if (objective.subtasks) {
        for (const subtask of objective.subtasks) {
          subtask.complete = false;
        }
      }
    }
  },
};
