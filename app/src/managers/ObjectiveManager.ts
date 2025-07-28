interface SubObjective {
  label: string;
  completed: boolean;
}

interface Objective {
  title: string;
  subtasks?: SubObjective[];
  completed: boolean;
}

class ObjectiveManager {
  static currentObjective: Objective = {
    title: "Find all CV pieces in the room",
    completed: false,
    subtasks: [],
  };

  static setObjective(objective: Objective) {
    this.currentObjective = objective;
  }

  static getObjective(): Objective {
    return this.currentObjective;
  }
}
