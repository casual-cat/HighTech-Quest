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
    headline: "Show Potential",
    body: "Your first job doesn't depend on how many programming languages you know, but on your ability to demonstrate how you think and solve challenges.",
  },
  "letter-2": {
    id: "letter-2",
    headline: "Turn a small project into a big story",
    body: "Explain why you chose the project, how you solved problems along the way, and what value it provides. This shows system-level thinking, not just coding skills.",
  },
  "letter-3": {
    id: "letter-3",
    headline: "Demonstrate hunger and initiative",
    body: "Did you learn something new because you got stuck? Found a way to improve performance or user experience? Share it - it shows you don't just wait, you push forward.",
  },
  "letter-4": {
    id: "letter-4",
    headline: "Show value (not just job-seeking)",
    body: "Instead of focusing only on “I'm looking for a job“, emphasize “This is the value I bring”. That's what makes recruiters notice you.",
  },
  "letter-5": {
    id: "letter-5",
    headline: "Use your side projects as proof of ability",
    body: "A lot of juniors say they don't have experience. But if you built something, even small, that's already experience. Show what you learned, what challenges you solved, and how you improved the project over time. Recruiters care less about the size of the project, and more about your thought process, ownership, and ability to deliver something that works.",
  },
};

export function getLetterContent(id: string): LetterContent | undefined {
  return LETTER_CONTENT[id as LetterId];
}
