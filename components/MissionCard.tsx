"use client";

type MissionCardProps = {
  title: string;
  text: string;
};

export default function MissionCard({ title, text }: MissionCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
    </section>
  );
}
