import { describe, expect, it } from "vitest";
import { generateRoom } from "@/lib/generator";
import { PuzzleType, RoomConfig } from "@/types";

const baseConfig: RoomConfig = {
  title: "Test",
  subject: "Test",
  className: "1A",
  difficulty: "media",
  puzzleCount: 5,
};

describe("generator", () => {
  it("produces N puzzles", () => {
    const puzzles = generateRoom(baseConfig, "it");
    expect(puzzles).toHaveLength(baseConfig.puzzleCount);
  });

  it("produces valid puzzle schema", () => {
    const puzzles = generateRoom(baseConfig, "it");
    const allowedTypes: PuzzleType[] = [
      "quiz",
      "code",
      "keyword",
      "riddle",
      "logic",
      "path",
    ];
    puzzles.forEach((puzzle) => {
      expect(typeof puzzle.id).toBe("string");
      expect(typeof puzzle.question).toBe("string");
      expect(typeof puzzle.answer).toBe("string");
      expect(allowedTypes).toContain(puzzle.type);
      if (puzzle.type === "quiz") {
        expect(Array.isArray(puzzle.options)).toBe(true);
        expect(puzzle.options?.length).toBeGreaterThan(0);
      } else {
        expect(puzzle.options).toBeUndefined();
      }
    });
  });
});
