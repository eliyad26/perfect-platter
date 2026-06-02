"use client";

import Link from "next/link";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/components/I18nProvider";
import { uiText } from "@/lib/i18n";

const businessName =
  process.env.NEXT_PUBLIC_BUSINESS_NAME || "Perfect Platter";

export function Header({ showAdminLink = true }: { showAdminLink?: boolean }) {
  const { lang } = useI18n();
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl shadow-md">
            🍇
          </span>
          <div>
            <h1 className="text-lg font-bold text-stone-900 sm:text-xl">
              {businessName}
            </h1>
            <p className="text-xs text-stone-500 sm:text-sm">
              {uiText("businessTagline", lang)}
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          {showAdminLink && (
            <Link
              href="/admin"
              className="rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-stone-600 transition hover:border-stone-200 hover:bg-white hover:text-brand-700"
            >
              {uiText("admin", lang)}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
