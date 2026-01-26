"use client";

import { useEffect, useMemo, useState } from "react";
import CompletionScreen from "@/components/CompletionScreen";
import LanguageToggle from "@/components/LanguageToggle";
import MissionCard from "@/components/MissionCard";
import PuzzleRenderer from "@/components/PuzzleRenderer";
import Timer from "@/components/Timer";
import { Locale, t } from "@/lib/i18n";
import { generateRoom } from "@/lib/generator";
import { Puzzle, RoomConfig } from "@/types";

type RoomExperienceProps = {
  config: RoomConfig;
  locale: Locale;
  queryString: string;
  missionTitle: string;
  missionText: string;
  timerLabel: string;
  completionTitle: string;
  completionSubtitle: string;
  completionTimeLabel: string;
  completionPrintLabel: string;
  completionNewGameLabel: string;
};

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export default function RoomExperience({
  config,
  locale,
  queryString,
  missionTitle,
  missionText,
  timerLabel,
  completionTitle,
  completionSubtitle,
  completionTimeLabel,
  completionPrintLabel,
  completionNewGameLabel,
}: RoomExperienceProps) {
  const [sourceContent, setSourceContent] = useState<string | undefined>(
    undefined
  );
  const puzzles = useMemo<Puzzle[]>(
    () => generateRoom({ ...config, sourceContent }, locale),
    [config, locale, sourceContent]
  );
  const [answers, setAnswers] = useState<string[]>(
    () => puzzles.map(() => "")
  );
  const [results, setResults] = useState<("idle" | "correct" | "wrong")[]>(
    () => puzzles.map(() => "idle")
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem("sourceContent");
    if (stored && stored.trim().length > 0) {
      setSourceContent(stored.trim());
      if (process.env.NODE_ENV !== "production") {
        console.log("LOAD sourceContent len", stored.trim().length);
      }
      return;
    }
    setSourceContent(undefined);
    if (process.env.NODE_ENV !== "production") {
      console.log("LOAD sourceContent len", 0);
    }
  }, []);

  useEffect(() => {
    setAnswers(puzzles.map(() => ""));
    setResults(puzzles.map(() => "idle"));
  }, [puzzles]);

  const completedCount = results.filter((value) => value === "correct").length;
  const isComplete = puzzles.length > 0 && completedCount === puzzles.length;

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
      userAnswer.trim().toLowerCase() === puzzle.answer.trim().toLowerCase();
    setResults((prev) =>
      prev.map((value, i) => (i === index ? (isCorrect ? "correct" : "wrong") : value))
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewGame = () => {
    const params = new URLSearchParams(queryString);
    const query = params.toString();
    window.location.href = query ? `/?${query}` : "/";
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:border-none print:shadow-none">
        <div className="no-print mb-4 flex justify-end">
          <LanguageToggle locale={locale} pathname="/room" queryString={queryString} />
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
          <div className="no-print flex flex-wrap items-center gap-3">
            <Timer
              label={timerLabel}
              seconds={elapsedSeconds}
              isRunning={!isComplete}
              onTick={setElapsedSeconds}
            />
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

      <MissionCard title={missionTitle} text={missionText} />

      {isComplete ? (
        <CompletionScreen
          title={completionTitle}
          subtitle={completionSubtitle}
          timeLabel={completionTimeLabel}
          time={formatTime(elapsedSeconds)}
          printLabel={completionPrintLabel}
          newGameLabel={completionNewGameLabel}
          onPrint={handlePrint}
          onNewGame={handleNewGame}
        />
      ) : (
        <section className="grid gap-4">
          {puzzles.map((puzzle, index) => {
            const isLocked = index > completedCount;
            return (
              <PuzzleRenderer
                key={puzzle.id}
                puzzle={puzzle}
                index={index}
                locale={locale}
                isLocked={isLocked}
                answer={answers[index]}
                result={results[index]}
                onAnswerChange={(value) =>
                  setAnswers((prev) =>
                    prev.map((entry, i) => (i === index ? value : entry))
                  )
                }
                onCheck={() => handleCheck(index)}
              />
            );
          })}
        </section>
      )}
    </div>
  );
}
