export type RecruiterAnswer = {
  text: string;
  score: number;
};

export type UserAnswer = {
  text: string;
  recruiterResponse: RecruiterAnswer;
};

export type RecruiterQA = {
  taskId: string;
  question: string;
  answers: UserAnswer[];
  rejection: string;
  interacted?: boolean;
};

export const RECRUITER_QUESTIONS: Record<string, RecruiterQA> = {
  shelly: {
    taskId: "shelly",
    question: "How do you plan to stand out in the competitive tech world?",
    answers: [
      {
        text: "I'll build a solid portfolio and keep improving.",
        recruiterResponse: {
          text: "That's a solid approach. Consistency is key!",
          score: 50,
        },
      },
      {
        text: "I'll just copy someone else's GitHub and change the name.",
        recruiterResponse: {
          text: "Hmm, originality matters. Let's rethink that.",
          score: 25,
        },
      },
      {
        text: "I'll manifest a job offer using crystals and good vibes.",
        recruiterResponse: {
          text: "Positive vibes are great, but skills pay the bills!",
          score: 0,
        },
      },
    ],
    rejection:
      "That's... a journey. Let me know how that crystal thing works out.",
    interacted: false,
  },
  dor: {
    taskId: "dor",
    question: "Where do you see yourself in five years?",
    answers: [
      {
        text: "In a mid-level role, still learning and contributing.",
        recruiterResponse: {
          text: "Nice, growth mindset always impresses.",
          score: 50,
        },
      },
      {
        text: "Running this company. Better watch out.",
        recruiterResponse: {
          text: "Ambitious, I like it!",
          score: 25,
        },
      },
      {
        text: "Living in Bali, automating everything while surfing.",
        recruiterResponse: {
          text: "Sounds like a dream - let's bring you back to tech though.",
          score: 0,
        },
      },
    ],
    rejection:
      "Unfourtunatly, this is for a junior QA internship. Let's circle back in five years.",

    interacted: false,
  },
  adi: {
    taskId: "adi",
    question:
      "How many years have you worked with AI-powered blockchain serverless microservices?",
    answers: [
      {
        text: "I've experimented with it in side projects and some tutorials.",
        recruiterResponse: {
          text: "Great! Hands-on experience really counts.",
          score: 50,
        },
      },
      {
        text: "I put it on my resume. That counts, right?",
        recruiterResponse: {
          text: "Honesty is key. Let's aim to build real skills next.",
          score: 25,
        },
      },
      {
        text: "No idea, but I can Google it real fast!",
        recruiterResponse: {
          text: "Quick learning is good, but understanding deeply is better.",
          score: 0,
        },
      },
    ],
    rejection:
      "We were looking for someone who was born using AI-powered blockchain. Sad.",
    interacted: false,
  },
  daniel: {
    taskId: "daniel",
    question: "Please explain your employment gap in 2023.",
    answers: [
      {
        text: "I used the time to study and build side projects.",
        recruiterResponse: {
          text: "That's a productive way to stay sharp!",
          score: 50,
        },
      },
      {
        text: "I was busy refreshing LinkedIn and crying into my keyboard.",
        recruiterResponse: {
          text: "It happens! But let's focus on moving forward.",
          score: 25,
        },
      },
      {
        text: "I got stuck in Elden Ring. It was a tough year.",
        recruiterResponse: {
          text: "Gaming can be a great break, but don't forget your goals!",
          score: 0,
        },
      },
    ],
    rejection:
      "Thank you, we've logged your emotional journey... and moved on.",
    interacted: false,
  },
  noya: {
    taskId: "noya",
    question: "What's the most important thing when designing a new app?",
    answers: [
      {
        text: "Making sure it's easy and intuitive for users.",
        recruiterResponse: {
          text: "Exactly! User experience is king.",
          score: 50,
        },
      },
      {
        text: "Adding as many features and buttons as possible so it looks advanced.",
        recruiterResponse: {
          text: "Features are great, but simplicity wins hearts.",
          score: 25,
        },
      },
      {
        text: "Just copy the design from three different apps and mash it together.",
        recruiterResponse: {
          text: "Bold. But unless our users are puzzle enthusiasts, maybe we skip the mash-up.",
          score: 0,
        },
      },
    ],
    rejection:
      "After careful consideration, I'm afraid we won't be moving forward at this time.",
    interacted: false,
  },
};
