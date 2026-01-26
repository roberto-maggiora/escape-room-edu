export type Difficulty = "facile" | "media" | "difficile";

export type RoomConfig = {
  title: string;
  subject: string;
  className: string;
  difficulty: Difficulty;
  puzzleCount: number;
  sourceContent?: string;
};

export type PuzzleType = "quiz" | "code" | "keyword" | "riddle" | "logic" | "path";

export type Puzzle = {
  id: string;
  type: PuzzleType;
  question: string;
  answer: string;
  options?: string[];
};
