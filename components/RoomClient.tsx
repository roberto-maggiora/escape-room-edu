"use client";

import { useMemo, useState } from "react";
import LanguageToggle from "@/components/LanguageToggle";
import { Locale, t } from "@/lib/i18n";
import { generateRoom } from "@/lib/generator";
import { Puzzle, RoomConfig } from "@/types";

type RoomClientProps = {
  config: RoomConfig;
  locale: Locale;
  queryString: string;
};

const normalizeAnswer = (value: string) =>
  value.trim().toLowerCase();

export default function RoomClient({
  config,
  locale,
  queryString,
}: RoomClientProps) {
  const puzzles = useMemo<Puzzle[]>(
    () => generateRoom(config, locale),
    [config, locale]
  );
  const [answers, setAnswers] = useState<string[]>(
    () => puzzles.map(() => "")
  );
  const [results, setResults] = useState<("idle" | "correct" | "wrong")[]>(
    () => puzzles.map(() => "idle")
  );

  const completedCount = results.filter((r) => r === "correct").length;

  const puzzleTypeLabel = (type: Puzzle["type"]) => {
    if (type === "quiz") {
      return t(locale, "room.puzzleType.quiz");
    }
    if (type === "code") {
      return t(locale, "room.puzzleType.code");
    }
    if (type === "keyword") {
      return t(locale, "room.puzzleType.keyword");
    }
    if (type === "logic") {
      return t(locale, "room.puzzleType.logic");
    }
    if (type === "path") {
      return t(locale, "room.puzzleType.path");
    }
    return t(locale, "room.puzzleType.riddle");
  };

  const difficultyLabel = () => {
    if (config.difficulty === "facile") {
      return t(locale, "form.difficulty.easy");
    }
    if (config.difficulty === "media") {
      return t(locale, "form.difficulty.medium");
    }
    return t(locale, "form.difficulty.hard");
  };

  const handleCheck = (index: number) => {
    const puzzle = puzzles[index];
    const userAnswer = answers[index] ?? "";
    const isCorrect =
      normalizeAnswer(userAnswer) === normalizeAnswer(puzzle.answer);
    setResults((prev) =>
      prev.map((value, i) => (i === index ? (isCorrect ? "correct" : "wrong") : value))
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:border-none print:shadow-none">
        <div className="no-print mb-4 flex justify-end">
          <LanguageToggle
            locale={locale}
            pathname="/room"
            queryString={queryString}
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              {t(locale, "room.sectionLabel")}
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              {config.title}
            </h1>
            <p className="text-sm text-slate-500">
              {config.subject} · {config.className} · {difficultyLabel()}
            </p>
          </div>
          <div className="no-print flex items-center gap-3">
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
              {t(locale, "room.progress", {
                done: completedCount,
                total: puzzles.length,
              })}
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {t(locale, "room.print")}
            </button>
          </div>
        </div>
        <div className="print-only mt-4 hidden text-sm text-slate-600 print:block">
          {t(locale, "room.progressPrint", {
            done: completedCount,
            total: puzzles.length,
          })}
        </div>
      </section>

      <section className="grid gap-4">
        {puzzles.map((puzzle, index) => (
          <div
            key={puzzle.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:border-slate-300 print:shadow-none"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t(locale, "room.puzzleLabel", { index: index + 1 })} ·{" "}
                  {puzzleTypeLabel(puzzle.type)}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">
                  {puzzle.question}
                </h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                {puzzle.type === "quiz"
                  ? t(locale, "room.puzzleBadge.multipleChoice")
                  : t(locale, "room.puzzleBadge.freeAnswer")}
              </span>
            </div>

            {puzzle.options && (
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
                value={answers[index]}
                onChange={(event) =>
                  setAnswers((prev) =>
                    prev.map((value, i) => (i === index ? event.target.value : value))
                  )
                }
              />
              <button
                type="button"
                onClick={() => handleCheck(index)}
                className="no-print rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {t(locale, "room.check")}
              </button>
            </div>

            <div className="print-only mt-4 hidden text-sm text-slate-600 print:block">
              {t(locale, "room.printAnswerLine")}
            </div>

            {results[index] === "correct" && (
              <p className="no-print mt-3 text-sm font-semibold text-emerald-600">
                {t(locale, "room.feedback.correct")}
              </p>
            )}
            {results[index] === "wrong" && (
              <p className="no-print mt-3 text-sm font-semibold text-rose-600">
                {t(locale, "room.feedback.wrong")}
              </p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
