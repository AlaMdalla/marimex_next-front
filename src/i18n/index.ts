import en from "./locales/en.json";
import fr from "./locales/fr.json";
import tn from "./locales/tn.json";
import it from "./locales/it.json";
import zh from "./locales/zh.json";

export type Locale = "en" | "fr" | "tn" | "it" | "zh";

const dictionaries = { en, fr, tn, it, zh } as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries.en;
}

export function t(locale: Locale, path: string): string {
  const dict = getDictionary(locale);
  const parts = path.split(".");
  let node: any = dict;
  for (const p of parts) {
    node = node?.[p];
    if (node == null) return path;
  }
  return typeof node === "string" ? node : path;
}
