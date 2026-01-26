"use client";

type CompletionScreenProps = {
  title: string;
  subtitle: string;
  timeLabel: string;
  time: string;
  printLabel: string;
  newGameLabel: string;
  onPrint: () => void;
  onNewGame: () => void;
};

export default function CompletionScreen({
  title,
  subtitle,
  timeLabel,
  time,
  printLabel,
  newGameLabel,
  onPrint,
  onNewGame,
}: CompletionScreenProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
      <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
        {timeLabel}: {time}
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onPrint}
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {printLabel}
        </button>
        <button
          type="button"
          onClick={onNewGame}
          className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          {newGameLabel}
        </button>
      </div>
    </section>
  );
}
