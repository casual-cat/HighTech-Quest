export const LETTER_IDS = [
  "letter-1",
  "letter-2",
  "letter-3",
  "letter-4",
  "letter-5",
] as const;

export type LetterId = (typeof LETTER_IDS)[number];

export type LetterContent = {
  id: LetterId;
  headline: string;
  body: string;
};

export const LETTER_CONTENT: Record<LetterId, LetterContent> = {
  "letter-1": {
    id: "letter-1",
    headline: "Day One Notes",
    body:
      "The labs are busier than expected. I need to remember to check the notice board before heading out again.",
  },
  "letter-2": {
    id: "letter-2",
    headline: "Unexpected Challenge",
    body:
      "Ben mentioned a surprise assessment is coming up. I should review the last sprint's retro tonight.",
  },
  "letter-3": {
    id: "letter-3",
    headline: "Mentor Reminder",
    body:
      "A new mentor session is unlocked for tomorrow. Bring thoughtful questions and recent learnings.",
  },
  "letter-4": {
    id: "letter-4",
    headline: "Collaborator's Tip",
    body:
      "Pairing with Maya boosted my confidence. Maybe we can co-lead the next stand-up rehearsal.",
  },
  "letter-5": {
    id: "letter-5",
    headline: "Final Encouragement",
    body:
      "You're closer than you think. Take a breath, prepare carefully, and remember why you started.",
  },
};

export function getLetterContent(id: string): LetterContent | undefined {
  return LETTER_CONTENT[id as LetterId];
}

