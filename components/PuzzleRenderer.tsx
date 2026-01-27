"use client";

import { Locale, t } from "@/lib/i18n";
import { Puzzle } from "@/types";

type PuzzleRendererProps = {
  puzzle: Puzzle;
  index: number;
  locale: Locale;
  status: "active" | "locked" | "completed";
  answer: string;
  result: "idle" | "correct" | "wrong";
  onAnswerChange: (value: string) => void;
  onCheck: () => void;
  onHint: () => void;
  hintsUsed: number;
  maxHints: number;
  hintText: string;
  showHint: boolean;
  lockedLabel: string;
  completedLabel: string;
  hintLabel: string;
  flash: boolean;
};

export default function PuzzleRenderer({
  puzzle,
  index,
  locale,
  status,
  answer,
  result,
  onAnswerChange,
  onCheck,
  onHint,
  hintsUsed,
  maxHints,
  hintText,
  showHint,
  lockedLabel,
  completedLabel,
  hintLabel,
  flash,
}: PuzzleRendererProps) {
  const puzzleTypeLabel = () => {
    if (puzzle.type === "quiz") {
      return t(locale, "room.puzzleType.quiz");
    }
    if (puzzle.type === "code") {
      return t(locale, "room.puzzleType.code");
    }
    if (puzzle.type === "keyword") {
      return t(locale, "room.puzzleType.keyword");
    }
    if (puzzle.type === "logic") {
      return t(locale, "room.puzzleType.logic");
    }
    if (puzzle.type === "path") {
      return t(locale, "room.puzzleType.path");
    }
    return t(locale, "room.puzzleType.riddle");
  };

  const isQuiz = puzzle.type === "quiz";
  const isCode = puzzle.type === "code";
  const isLocked = status === "locked";
  const isCompleted = status === "completed";

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:border-slate-300 print:shadow-none ${
        result === "correct" ? "ring-2 ring-emerald-200 bg-emerald-50/40" : ""
      } ${flash ? "animate-pulse" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t(locale, "room.puzzleLabel", { index: index + 1 })} ·{" "}
            {puzzleTypeLabel()}
          </p>
          {status === "active" && (
            <h2 className="mt-2 text-lg font-semibold text-slate-900">
              {puzzle.question}
            </h2>
          )}
          {isLocked && (
            <p className="mt-2 text-sm text-slate-500">
              {lockedLabel}
            </p>
          )}
          {isCompleted && (
            <p className="mt-2 text-sm font-semibold text-emerald-600">
              {completedLabel}
            </p>
          )}
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
          {isLocked
            ? "🔒"
            : isCompleted
              ? "🔓"
            : isQuiz
              ? t(locale, "room.puzzleBadge.multipleChoice")
              : t(locale, "room.puzzleBadge.freeAnswer")}
        </span>
      </div>

      {status === "active" ? (
        <>
          {isQuiz && puzzle.options && (
            <ul className="mt-3 grid gap-2 text-sm text-slate-600">
              {puzzle.options.map((option) => (
                <li
                  key={option}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  {option}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              className="no-print w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
              placeholder={t(locale, "room.answerPlaceholder")}
              value={answer}
              onChange={(event) => onAnswerChange(event.target.value)}
              type={isCode ? "number" : "text"}
              inputMode={isCode ? "numeric" : "text"}
            />
            <button
              type="button"
              onClick={onCheck}
              className="no-print rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              {t(locale, "room.check")}
            </button>
            <button
              type="button"
              onClick={onHint}
              disabled={hintsUsed >= maxHints}
              className="no-print rounded-full border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {hintLabel} (-20s) {hintsUsed}/{maxHints}
            </button>
          </div>

          {showHint && (
            <p className="mt-3 text-sm text-amber-700">{hintText}</p>
          )}

          <div className="print-only mt-4 hidden text-sm text-slate-600 print:block">
            {t(locale, "room.printAnswerLine")}
          </div>

          {result === "correct" && (
            <p className="no-print mt-3 text-sm font-semibold text-emerald-600">
              {t(locale, "room.feedback.correct")}
            </p>
          )}
          {result === "wrong" && (
            <p className="no-print mt-3 text-sm font-semibold text-rose-600">
              {t(locale, "room.feedback.wrong")}
            </p>
          )}
        </>
      ) : null}
    </div>
  );
}
