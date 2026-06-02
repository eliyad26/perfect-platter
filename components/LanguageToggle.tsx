"use client";

import { langLabel } from "@/lib/i18n";
import { useI18n } from "@/components/I18nProvider";

export function LanguageToggle() {
  const { lang, toggleLang } = useI18n();
  const next = lang === "en" ? "he" : "en";

  return (
    <button
      type="button"
      onClick={toggleLang}
      className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
      aria-label={`Switch language to ${langLabel(next)}`}
      title={`Switch to ${langLabel(next)}`}
    >
      {langLabel(next)}
    </button>
  );
}

