"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import LanguageToggle from "@/components/LanguageToggle";
import { Locale, t } from "@/lib/i18n";
import { Difficulty } from "@/types";

type HomeClientProps = {
  locale: Locale;
  queryString: string;
};

export default function HomeClient({ locale, queryString }: HomeClientProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);

  const [title, setTitle] = useState(() => t(locale, "home.defaultTitle"));
  const [subject, setSubject] = useState(() => t(locale, "home.defaultSubject"));
  const [className, setClassName] = useState(() => t(locale, "home.defaultClass"));
  const [difficulty, setDifficulty] = useState<Difficulty>("media");
  const [puzzleCount, setPuzzleCount] = useState(5);
  const [sourceContent, setSourceContent] = useState("");

  const handleSubmit = (
    event?:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement>
  ) => {
    event?.preventDefault();
    const formData = formRef.current ? new FormData(formRef.current) : null;
    const rawValue = formData?.get("sourceContent");
    const contentValue =
      typeof rawValue === "string" ? rawValue.trim() : sourceContent.trim();
    if (contentValue.length > 0) {
      sessionStorage.setItem("sourceContent", contentValue);
      if (process.env.NODE_ENV !== "production") {
        console.log("SAVE sourceContent len", contentValue.length);
      }
    } else {
      sessionStorage.removeItem("sourceContent");
      if (process.env.NODE_ENV !== "production") {
        console.log("SAVE sourceContent len", 0);
      }
    }
    const params = new URLSearchParams({
      title,
      subject,
      className,
      difficulty,
      puzzleCount: String(puzzleCount),
      lang: locale,
    });
    router.push(`/room?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t(locale, "app.name")}
            </p>
            <h1 className="text-lg font-semibold text-slate-900">
              {t(locale, "app.generatorTitle")}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle locale={locale} pathname="/" queryString={queryString} />
            <span className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
              {t(locale, "app.badgeMvp")}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold text-slate-900">
              {t(locale, "home.title")}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {t(locale, "home.description")}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 grid gap-6 md:grid-cols-2"
            ref={formRef}
          >
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              {t(locale, "form.title.label")}
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={t(locale, "form.title.placeholder")}
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              {t(locale, "form.subject.label")}
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder={t(locale, "form.subject.placeholder")}
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              {t(locale, "form.class.label")}
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
                value={className}
                onChange={(event) => setClassName(event.target.value)}
                placeholder={t(locale, "form.class.placeholder")}
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              {t(locale, "form.difficulty.label")}
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as Difficulty)}
              >
                <option value="facile">{t(locale, "form.difficulty.easy")}</option>
                <option value="media">{t(locale, "form.difficulty.medium")}</option>
                <option value="difficile">{t(locale, "form.difficulty.hard")}</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
              {t(locale, "form.puzzleCount.label")}
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={3}
                  max={8}
                  value={puzzleCount}
                  onChange={(event) => setPuzzleCount(Number(event.target.value))}
                  className="w-full accent-indigo-600"
                />
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                  {puzzleCount}
                </span>
              </div>
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
              {t(locale, "form.sourceContent.label")}
              <textarea
                name="sourceContent"
                className="min-h-[120px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
                value={sourceContent}
                onChange={(event) => setSourceContent(event.target.value)}
                placeholder={t(locale, "form.sourceContent.placeholder")}
              />
            </label>

            <div className="md:col-span-2">
              <button
                type="submit"
                onClick={handleSubmit}
                className="w-full rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                {t(locale, "form.submit")}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
