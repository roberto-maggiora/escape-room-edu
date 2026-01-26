import en from "./en";
import it from "./it";

export type Locale = "it" | "en";

export const defaultLocale: Locale = "it";

const dictionaries: Record<Locale, Record<string, string>> = {
  it,
  en,
};

export function getLocale(
  searchParams: URLSearchParams | { get: (key: string) => string | null }
): Locale {
  const lang = searchParams?.get("lang");
  return lang === "it" || lang === "en" ? lang : defaultLocale;
}

export function t(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>
): string {
  const template = dictionaries[locale]?.[key];
  if (!template) {
    return key;
  }
  if (!vars) {
    return template;
  }
  return Object.entries(vars).reduce((value, [varKey, varValue]) => {
    return value.replaceAll(`{${varKey}}`, String(varValue));
  }, template);
}
