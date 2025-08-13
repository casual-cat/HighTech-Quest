type Task = {
  id?: string;
  task: string;
  subtasks?: Task[];
  hideSubtasks?: boolean;
  complete: boolean;
};

export interface LevelData {
  titleKey: string;
  imageKey: string;
  objectives: Task[];
  stars: number;
}

export const LEVELS_DATA: Record<number, LevelData> = {
  1: {
    titleKey: "level1-title",
    imageKey: "level1-image",
    objectives: [
      {
        task: "Find all CV pieces",
        subtasks: [
          { id: "1", task: "Contact", complete: false },
          { id: "2", task: "About", complete: false },
          { id: "3", task: "Work Experience", complete: false },
          { id: "4", task: "Projects", complete: false },
          { id: "5", task: "Skills", complete: false },
          { id: "6", task: "Education", complete: false },
          { id: "7", task: "Languages", complete: false },
        ],
        hideSubtasks: true,
        complete: false,
      },
      { task: "Submit CV", complete: false },
    ],
    stars: 0,
  },

  2: {
    titleKey: "level2-title",
    imageKey: "level2-image",
    objectives: [
      {
        task: "Pass all recruiter questions",
        subtasks: [
          { id: "shelly", task: "Speak with Shelly", complete: false },
          { id: "adi", task: "Speak with Adi", complete: false },
          { id: "daniel", task: "Speak with Daniel", complete: false },
          { id: "noya", task: "Speak with Noya", complete: false },
          { id: "dor", task: "Speak with Dor", complete: false },
        ],
        complete: false,
      },
    ],
    stars: 0,
  },
};
