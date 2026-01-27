"use client";

import { useEffect, useMemo, useState } from "react";
import CompletionScreen from "@/components/CompletionScreen";
import LanguageToggle from "@/components/LanguageToggle";
import MissionCard from "@/components/MissionCard";
import PuzzleRenderer from "@/components/PuzzleRenderer";
import { Locale, t } from "@/lib/i18n";
import { generateRoom } from "@/lib/generator";
import { roomCopy } from "@/lib/roomCopy";
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

const TIME_LIMIT_SECONDS = 600;
const HINT_PENALTY_SECONDS = 20;
const MAX_HINTS_PER_PUZZLE = 2;

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
  const [remainingSeconds, setRemainingSeconds] = useState(TIME_LIMIT_SECONDS);
  const [hasStarted, setHasStarted] = useState(false);
  const [hintsUsed, setHintsUsed] = useState<number[]>(
    () => puzzles.map(() => 0)
  );
  const [showHints, setShowHints] = useState<boolean[]>(
    () => puzzles.map(() => false)
  );
  const [flashIndex, setFlashIndex] = useState<number | null>(null);

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
    setHintsUsed(puzzles.map(() => 0));
    setShowHints(puzzles.map(() => false));
    setElapsedSeconds(0);
    setRemainingSeconds(TIME_LIMIT_SECONDS);
    setHasStarted(false);
    setFlashIndex(null);
  }, [puzzles]);

  const completedCount = results.filter((value) => value === "correct").length;
  const isComplete = puzzles.length > 0 && completedCount === puzzles.length;

  useEffect(() => {
    if (!hasStarted || isComplete) return undefined;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      setRemainingSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isComplete]);

  const activeIndex = Math.min(completedCount, Math.max(puzzles.length - 1, 0));
  const totalHintsUsed = hintsUsed.reduce((sum, value) => sum + value, 0);
  const score = Math.max(remainingSeconds - totalHintsUsed * 15, 0);

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
    if (!hasStarted || index !== activeIndex) return;
    const puzzle = puzzles[index];
    const userAnswer = answers[index] ?? "";
    const isCorrect =
      userAnswer.trim().toLowerCase() === puzzle.answer.trim().toLowerCase();
    setResults((prev) =>
      prev.map((value, i) => (i === index ? (isCorrect ? "correct" : "wrong") : value))
    );
    if (isCorrect) {
      setFlashIndex(index);
      window.setTimeout(() => setFlashIndex(null), 600);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewGame = () => {
    const params = new URLSearchParams(queryString);
    const query = params.toString();
    window.location.href = query ? `/?${query}` : "/";
  };

  const handleHint = (index: number) => {
    if (!hasStarted || index !== activeIndex) return;
    if (hintsUsed[index] >= MAX_HINTS_PER_PUZZLE) return;
    setHintsUsed((prev) =>
      prev.map((value, i) => (i === index ? value + 1 : value))
    );
    setShowHints((prev) =>
      prev.map((value, i) => (i === index ? true : value))
    );
    setRemainingSeconds((prev) => Math.max(prev - HINT_PENALTY_SECONDS, 0));
  };

  const hintText = (puzzle: Puzzle) => {
    if (locale === "en") {
      if (puzzle.type === "quiz") {
        return "Pick the option that best describes the concept.";
      }
      if (puzzle.type === "code") {
        return "Count the letters of the key word carefully.";
      }
      if (puzzle.type === "logic") {
        return "Recall the original sentence and complete the meaning.";
      }
      if (puzzle.type === "path") {
        return "Find the cause or required condition.";
      }
      return "Look for the main concept in the text.";
    }
    if (puzzle.type === "quiz") {
      return "Considera quale opzione descrive meglio il concetto.";
    }
    if (puzzle.type === "code") {
      return "Conta con attenzione le lettere della parola chiave.";
    }
    if (puzzle.type === "logic") {
      return "Ripensa alla frase originale e completa il significato.";
    }
    if (puzzle.type === "path") {
      return "Individua la causa o la condizione necessaria.";
    }
    return "Cerca il concetto principale nel testo.";
  };

  const copy = roomCopy[locale];

  const missionLines = missionText.split("\n");
  const isUrgent = remainingSeconds <= 30;

  return (
    <div className="space-y-6">
      {!hasStarted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-6 py-10 print:hidden">
          <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {missionTitle}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              {missionLines[0] ?? missionText}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {missionLines[1] ?? copy.missionFallbackLine}
            </p>
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p>
                ⏱️ {copy.rulesTimeLabel}: {formatTime(TIME_LIMIT_SECONDS)}
              </p>
              <p>
                💡 {copy.rulesHintLabel}: -{HINT_PENALTY_SECONDS}s
              </p>
              <p>
                🔑 {copy.rulesUnlockLabel}: {puzzles.length} {copy.rulesUnlockSuffix}
              </p>
              <p>
                ✅ {copy.rulesGoalLabel}: {copy.rulesGoalText}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHasStarted(true)}
              className="mt-6 w-full rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              {copy.startMissionLabel}
            </button>
          </div>
        </div>
      )}

      <div className="sticky top-4 z-10 print:hidden">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                isUrgent
                  ? "bg-rose-100 text-rose-700 animate-pulse"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {timerLabel}: {formatTime(remainingSeconds)}
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
              {copy.hudEnergyLabel}{" "}
              {Math.round((completedCount / Math.max(puzzles.length, 1)) * 100)}%
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
              🔑 {copy.hudKeysLabel} {completedCount}
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
      </div>

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
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
              {t(locale, "room.progress", {
                done: completedCount,
                total: puzzles.length,
              })}
            </div>
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
          extraInfo={`${copy.completionInfoLabel}: ${totalHintsUsed} · ${copy.completionScoreLabel}: ${score}`}
        />
      ) : (
        <section className="grid gap-4">
          {puzzles.map((puzzle, index) => {
            const status =
              index < completedCount
                ? "completed"
                : index === activeIndex
                  ? "active"
                  : "locked";
            return (
              <PuzzleRenderer
                key={puzzle.id}
                puzzle={puzzle}
                index={index}
                locale={locale}
                status={status}
                answer={answers[index]}
                result={results[index]}
                onAnswerChange={(value) =>
                  setAnswers((prev) =>
                    prev.map((entry, i) => (i === index ? value : entry))
                  )
                }
                onCheck={() => handleCheck(index)}
                onHint={() => handleHint(index)}
                hintsUsed={hintsUsed[index] ?? 0}
                maxHints={MAX_HINTS_PER_PUZZLE}
                hintText={hintText(puzzle)}
                showHint={showHints[index] ?? false}
                lockedLabel={copy.lockedLabel}
                completedLabel={copy.completedLabel}
                hintLabel={copy.hintLabel}
                flash={flashIndex === index}
              />
            );
          })}
        </section>
      )}
    </div>
  );
}
