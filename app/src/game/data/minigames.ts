export interface MinigameInfo {
  id: string;
  title: string;
  summary: string;
  objective: string;
  instructions: string[];
  controls: string[];
  tips?: string[];
}

export const MINIGAMES_INFO: Record<string, MinigameInfo> = {
  minigame1: {
    id: "minigame1",
    title: "Task Board Triage",
    summary:
      "Sort the daily workload by placing each task card into the column that matches its current status.",
    objective:
      "Organize every task into the correct column before the timer expires, then submit your board.",
    instructions: [
      "Review each task card and decide whether it belongs in To Do, In Progress, or Done.",
      "Drag a card over a column to move it.",
      "Double-check the board and press Submit once all cards are correctly placed.",
    ],
    controls: [
      "Click and drag to move task cards.",
      "Click the Submit button to finish the exercise.",
    ],
    tips: [
      "Cards snap into the column when you release them—use that to your advantage.",
      "If a card ends up in the wrong spot, just drag it again; there’s no penalty until time runs out.",
    ],
  },
  minigame2: {
    id: "minigame2",
    title: "Deliverable Match-Up",
    summary:
      "Flip cards to find matching deliverable pairs tailored to your chosen career track.",
    objective:
      "Clear the board by revealing every matching pair before time runs out and avoid too many mismatches.",
    instructions: [
      "Select two cards to flip them face-up.",
      "Remember the deliverable on each card so you can find its pair.",
      "Matched cards reveal a deliverable slot—fill all slots to win.",
    ],
    controls: [
      "Click a facedown card to flip it.",
      "Click another card to attempt a match.",
    ],
    tips: [
      "Focus on one area of the board at a time to reduce backtracking.",
      "Too many mismatches will cost motivation—pace yourself.",
    ],
  },
};

export type MinigameKey = keyof typeof MINIGAMES_INFO;

export const getMinigameInfo = (
  id: string
): MinigameInfo | undefined => MINIGAMES_INFO[id as MinigameKey];

