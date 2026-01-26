import RoomExperience from "@/components/RoomExperience";
import { getLocale, t } from "@/lib/i18n";
import { RoomConfig } from "@/types";

type RoomPageProps = {
  searchParams?: {
    title?: string;
    subject?: string;
    className?: string;
    difficulty?: string;
    puzzleCount?: string;
    lang?: string;
  };
};

const clampPuzzleCount = (value: number) => {
  if (Number.isNaN(value)) return 5;
  return Math.min(8, Math.max(3, value));
};

export default function RoomPage({ searchParams }: RoomPageProps) {
  const params = new URLSearchParams();
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (!value) return;
      if (Array.isArray(value)) {
        if (value[0]) {
          params.set(key, value[0]);
        }
        return;
      }
      params.set(key, value);
    });
  }
  const locale = getLocale(params);
  const copy =
    locale === "en"
      ? {
          missionTitle: "Mission",
          missionText:
            "The lab is locked down. Solve the puzzles to restore the power.",
          timerLabel: "Time",
          completionTitle: "Well done!",
          completionSubtitle: "You restored the lab and completed the escape room.",
          completionTimeLabel: "Time",
          completionPrintLabel: "Print PDF",
          completionNewGameLabel: "New game",
        }
      : {
          missionTitle: "Missione",
          missionText:
            "Il laboratorio è in blocco. Risolvi gli enigmi per ripristinare l'energia.",
          timerLabel: "Tempo",
          completionTitle: "Complimenti!",
          completionSubtitle: "Hai completato l'escape room e riattivato il laboratorio.",
          completionTimeLabel: "Tempo",
          completionPrintLabel: "Esporta PDF",
          completionNewGameLabel: "Nuova partita",
        };
  const config: RoomConfig = {
    title: searchParams?.title?.trim() || t(locale, "room.defaultTitle"),
    subject: searchParams?.subject?.trim() || t(locale, "room.defaultSubject"),
    className: searchParams?.className?.trim() || t(locale, "room.defaultClass"),
    difficulty:
      searchParams?.difficulty === "facile" ||
      searchParams?.difficulty === "media" ||
      searchParams?.difficulty === "difficile"
        ? searchParams.difficulty
        : "media",
    puzzleCount: clampPuzzleCount(Number(searchParams?.puzzleCount)),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <RoomExperience
          config={config}
          locale={locale}
          queryString={params.toString()}
          missionTitle={copy.missionTitle}
          missionText={copy.missionText}
          timerLabel={copy.timerLabel}
          completionTitle={copy.completionTitle}
          completionSubtitle={copy.completionSubtitle}
          completionTimeLabel={copy.completionTimeLabel}
          completionPrintLabel={copy.completionPrintLabel}
          completionNewGameLabel={copy.completionNewGameLabel}
        />
      </div>
    </div>
  );
}
