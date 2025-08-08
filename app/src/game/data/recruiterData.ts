export type RecruiterAnswer = {
  text: string;
  score: number;
};

export type RecruiterQA = {
  question: string;
  answers: RecruiterAnswer[];
};

export const RECRUITER_QUESTIONS: Record<string, RecruiterQA> = {
  shelly: {
    question: "How do you plan to stand out in the competitive tech world?",
    answers: [
      {
        text: "I'll build a solid portfolio and keep improving.",
        score: 50,
      },
      {
        text: "I'll just copy someone else’s GitHub and change the name.",
        score: 25,
      },
      {
        text: "I'll manifest a job offer using crystals and good vibes.",
        score: 0,
      },
    ],
  },
  dor: {
    question: "Where do you see yourself in five years?",
    answers: [
      {
        text: "In a mid-level role, still learning and contributing.",
        score: 50,
      },
      { text: "Running this company. Better watch out.", score: 25 },
      {
        text: "Living in Bali, automating everything while surfing.",
        score: 0,
      },
    ],
  },
  adi: {
    question:
      "How many years have you worked with AI-powered blockchain serverless microservices?",
    answers: [
      {
        text: "I've experimented with it in side projects and some tutorials.",
        score: 50,
      },
      {
        text: "I put it on my resume. That counts, right?",
        score: 25,
      },
      {
        text: "No idea, but I can Google it real fast!",
        score: 0,
      },
    ],
  },
  daniel: {
    question: "Please explain your employment gap in 2023.",
    answers: [
      {
        text: "I used the time to study and build side projects.",
        score: 50,
      },
      {
        text: "I was busy refreshing LinkedIn and crying into my keyboard.",
        score: 25,
      },
      {
        text: "I got stuck in Elden Ring. It was a tough year.",
        score: 0,
      },
    ],
  },
  noya: {
    question: "Where do you see yourself in five years?",
    answers: [
      {
        text: "In a mid-level role, still learning and contributing.",
        score: 50,
      },
      { text: "Running this company. Better watch out.", score: 25 },
      {
        text: "Living in Bali, automating everything while surfing.",
        score: 0,
      },
    ],
  },
};
