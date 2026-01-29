"use client";

import { useMemo, useState } from "react";
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
    if (puzzle.type === "match") {
      return t(locale, "room.puzzleType.logic");
    }
    if (puzzle.type === "click-word") {
      return t(locale, "room.puzzleType.keyword");
    }
    return t(locale, "room.puzzleType.riddle");
  };

  const isQuiz = puzzle.type === "quiz";
  const isCode = puzzle.type === "code";
  const isMatch = puzzle.type === "match";
  const isClickWord = puzzle.type === "click-word";
  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const isCorrect = result === "correct";
  const isWrong = result === "wrong";
  const correctMessage = locale === "en" ? "Correct! +1 key" : "Corretto! +1 chiave";
  const wrongMessage = locale === "en" ? "Wrong, try again" : "Sbagliato, riprova";
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedLefts, setMatchedLefts] = useState<string[]>([]);

  const rightOptions = useMemo(() => {
    const pairs = puzzle.matchPairs ?? [];
    const rights = pairs.map((pair) => pair.right);
    if (rights.length <= 1) return rights;
    return [...rights.slice(1), rights[0]];
  }, [puzzle.matchPairs]);

  const normalizeWord = (word: string) =>
    word.toLowerCase().replace(/[^\wÀ-ÿ]/g, "");

  const handleMatchSelect = (left: string, right: string) => {
    if (!puzzle.matchPairs || isCorrect) return;
    const isMatchPair = puzzle.matchPairs.some(
      (pair) => pair.left === left && pair.right === right
    );
    if (isMatchPair) {
      setMatchedLefts((prev) => [...prev, left]);
      setSelectedLeft(null);
      setSelectedRight(null);
      const totalMatches = puzzle.matchPairs.length;
      const nextCount = matchedLefts.length + 1;
      if (nextCount === totalMatches) {
        onAnswerChange("matched");
        window.setTimeout(() => onCheck(), 0);
      }
      return;
    }
    setSelectedLeft(null);
    setSelectedRight(null);
    onAnswerChange("__wrong__");
    window.setTimeout(() => onCheck(), 0);
  };

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:border-slate-300 print:shadow-none ${
        isCorrect ? "ring-2 ring-emerald-200 bg-emerald-50/40" : ""
      } ${flash ? "scale-[1.02] transition-transform duration-200" : ""} ${
        isWrong ? "animate-[shake_0.25s_ease-in-out]" : ""
      }`}
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
          {isMatch && puzzle.matchPairs && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                {puzzle.matchPairs.map((pair) => (
                  <button
                    key={pair.left}
                    type="button"
                    disabled={isCorrect || matchedLefts.includes(pair.left)}
                    onClick={() => {
                      setSelectedLeft(pair.left);
                      if (selectedRight) {
                        handleMatchSelect(pair.left, selectedRight);
                      }
                    }}
                    className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                      matchedLefts.includes(pair.left)
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : selectedLeft === pair.left
                          ? "border-slate-400 bg-slate-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    {pair.left}
                  </button>
                ))}
              </div>
              <div className="grid gap-2">
                {rightOptions.map((right) => (
                  <button
                    key={right}
                    type="button"
                    disabled={isCorrect}
                    onClick={() => {
                      setSelectedRight(right);
                      if (selectedLeft) {
                        handleMatchSelect(selectedLeft, right);
                      }
                    }}
                    className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                      selectedRight === right
                        ? "border-slate-400 bg-slate-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    {right}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isClickWord && puzzle.clickWords && (
            <div className="mt-4 flex flex-wrap gap-2">
              {puzzle.clickWords.map((word, idx) => (
                <button
                  key={`${word}-${idx}`}
                  type="button"
                  disabled={isCorrect}
                  onClick={() => {
                    onAnswerChange(normalizeWord(word));
                    window.setTimeout(() => onCheck(), 0);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  {word}
                </button>
              ))}
            </div>
          )}

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

          {!isMatch && !isClickWord && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                className="no-print w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
                placeholder={t(locale, "room.answerPlaceholder")}
                value={answer}
                onChange={(event) => onAnswerChange(event.target.value)}
                type={isCode ? "number" : "text"}
                inputMode={isCode ? "numeric" : "text"}
                disabled={isCorrect}
                data-puzzle-input="true"
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
          )}

          {(isMatch || isClickWord) && (
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={onHint}
                disabled={hintsUsed >= maxHints}
                className="no-print rounded-full border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {hintLabel} (-20s) {hintsUsed}/{maxHints}
              </button>
            </div>
          )}

          {showHint && (
            <p className="mt-3 text-sm text-amber-700">{hintText}</p>
          )}

          <div className="print-only mt-4 hidden text-sm text-slate-600 print:block">
            {t(locale, "room.printAnswerLine")}
          </div>

          {isCorrect && (
            <p className="no-print mt-3 text-sm font-semibold text-emerald-600 transition-opacity duration-200">
              {correctMessage}
            </p>
          )}
          {isWrong && (
            <p className="no-print mt-3 text-sm font-semibold text-rose-600 transition-opacity duration-200">
              {wrongMessage}
            </p>
          )}
        </>
      ) : null}
      <style jsx>{`
        @keyframes shake {
          0% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          50% {
            transform: translateX(4px);
          }
          75% {
            transform: translateX(-3px);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
