export interface PuzzlePiece {
  id: number;
  isCorrect: boolean;
  label: string;
  wasPicked: boolean;
  image: string;
}

export const PUZZLE_DATA: PuzzlePiece[] = [
  {
    id: 1,
    isCorrect: true,
    label: "Contact",
    wasPicked: false,
    image: "puzzlePiece1",
  },
  {
    id: 2,
    isCorrect: true,
    label: "Work Experience",
    wasPicked: false,
    image: "puzzlePiece2",
  },
  {
    id: 3,
    isCorrect: true,
    label: "Projects",
    wasPicked: false,
    image: "puzzlePiece3",
  },
  {
    id: 4,
    isCorrect: true,
    label: "Education",
    wasPicked: false,
    image: "puzzlePiece4",
  },
  {
    id: 5,
    isCorrect: true,
    label: "Skills",
    wasPicked: false,
    image: "puzzlePiece5",
  },
  {
    id: 6,
    isCorrect: true,
    label: "About",
    wasPicked: false,
    image: "puzzlePiece6",
  },
  {
    id: 7,
    isCorrect: true,
    label: "Languages",
    wasPicked: false,
    image: "puzzlePiece7",
  },
  {
    id: 8,
    isCorrect: false,
    label: "Full Address",
    wasPicked: false,
    image: "puzzlePiece8",
  },
  {
    id: 9,
    isCorrect: false,
    label: "Photo",
    wasPicked: false,
    image: "puzzlePiece9",
  },
  {
    id: 10,
    isCorrect: false,
    label: "Salary Expectations",
    wasPicked: false,
    image: "puzzlePiece10",
  },
  {
    id: 11,
    isCorrect: false,
    label: "References Available",
    wasPicked: false,
    image: "puzzlePiece11",
  },
  {
    id: 12,
    isCorrect: false,
    label: "Signature",
    wasPicked: false,
    image: "puzzlePiece12",
  },
  {
    id: 13,
    isCorrect: false,
    label: "ID Number",
    wasPicked: false,
    image: "puzzlePiece13",
  },
  {
    id: 14,
    isCorrect: false,
    label: "Outdated Experience",
    wasPicked: false,
    image: "puzzlePiece14",
  },
  {
    id: 15,
    isCorrect: false,
    label: "Unrelated Courses",
    wasPicked: false,
    image: "puzzlePiece14",
  },
  {
    id: 16,
    isCorrect: false,
    label: "Hobbies",
    wasPicked: false,
    image: "puzzlePiece13",
  },
  {
    id: 17,
    isCorrect: false,
    label: "IQ",
    wasPicked: false,
    image: "puzzlePiece12",
  },
  {
    id: 18,
    isCorrect: false,
    label: "Names of Professors",
    wasPicked: false,
    image: "puzzlePiece11",
  },
  {
    id: 19,
    isCorrect: false,
    label: "Pets",
    wasPicked: false,
    image: "puzzlePiece10",
  },
  {
    id: 20,
    isCorrect: false,
    label: "High School Grades",
    wasPicked: false,
    image: "puzzlePiece9",
  },
  {
    id: 21,
    isCorrect: false,
    label: "Age",
    wasPicked: false,
    image: "puzzlePiece8",
  },
  {
    id: 22,
    isCorrect: false,
    label: "Marital Status",
    wasPicked: false,
    image: "puzzlePiece9",
  },
];
