"use client";

import { useRouter } from "next/navigation";
import { Locale, t } from "@/lib/i18n";

type LanguageToggleProps = {
  locale: Locale;
  pathname: string;
  queryString: string;
};

export default function LanguageToggle({
  locale,
  pathname,
  queryString,
}: LanguageToggleProps) {
  const router = useRouter();

  const handleChange = (nextLocale: Locale) => {
    const params = new URLSearchParams(queryString);
    params.set("lang", nextLocale);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div
      className="inline-flex items-center rounded-full bg-slate-100 p-1 text-xs font-semibold text-slate-500"
      aria-label={t(locale, "language.label")}
    >
      <button
        type="button"
        onClick={() => handleChange("it")}
        className={`rounded-full px-3 py-1 transition ${
          locale === "it"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        {t(locale, "language.it")}
      </button>
      <button
        type="button"
        onClick={() => handleChange("en")}
        className={`rounded-full px-3 py-1 transition ${
          locale === "en"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        {t(locale, "language.en")}
      </button>
    </div>
  );
}
