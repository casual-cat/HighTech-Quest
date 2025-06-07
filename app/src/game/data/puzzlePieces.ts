export interface PuzzlePiece {
  id: number;
  isCorrect: boolean;
  label: string;
  wasPicked: boolean;
}

export const PUZZLE_DATA: PuzzlePiece[] = [
  {
    id: 1,
    isCorrect: true,
    label: "Header (Name, Phone, Email)",
    wasPicked: false,
  },
  {
    id: 2,
    isCorrect: true,
    label: "Work Experience",
    wasPicked: false,
  },
  {
    id: 3,
    isCorrect: true,
    label: "Projects",
    wasPicked: false,
  },
  {
    id: 4,
    isCorrect: true,
    label: "Education",
    wasPicked: false,
  },
  {
    id: 5,
    isCorrect: true,
    label: "Technical / Soft Skills",
    wasPicked: false,
  },
  {
    id: 6,
    isCorrect: false,
    label: "Date of Birth / Age",
    wasPicked: false,
  },
  {
    id: 7,
    isCorrect: false,
    label: "Marital Status",
    wasPicked: false,
  },
  {
    id: 8,
    isCorrect: false,
    label: "Full Home Address",
    wasPicked: false,
  },
  {
    id: 9,
    isCorrect: false,
    label: "Personal Photo",
    wasPicked: false,
  },
  {
    id: 10,
    isCorrect: false,
    label: "Salary Expectations",
    wasPicked: false,
  },
  {
    id: 11,
    isCorrect: false,
    label: "References Available",
    wasPicked: false,
  },
  {
    id: 12,
    isCorrect: false,
    label: "Signature",
    wasPicked: false,
  },
  {
    id: 13,
    isCorrect: false,
    label: "ID Number",
    wasPicked: false,
  },
  {
    id: 14,
    isCorrect: false,
    label: "Outdated Job Experience",
    wasPicked: false,
  },
  {
    id: 15,
    isCorrect: false,
    label: "Unrelated General Courses",
    wasPicked: false,
  },
  {
    id: 16,
    isCorrect: false,
    label: "General Hobbies",
    wasPicked: false,
  },
  {
    id: 17,
    isCorrect: false,
    label: "IQ Test Results",
    wasPicked: false,
  },
  {
    id: 18,
    isCorrect: false,
    label: "Names of Professors",
    wasPicked: false,
  },
  {
    id: 19,
    isCorrect: false,
    label: "Languages Not Fluent In",
    wasPicked: false,
  },
  {
    id: 20,
    isCorrect: false,
    label: "High School Grades",
    wasPicked: false,
  },
]; 