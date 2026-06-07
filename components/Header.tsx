"use client";

import Link from "next/link";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/components/I18nProvider";
import { uiText } from "@/lib/i18n";

const businessName =
  process.env.NEXT_PUBLIC_BUSINESS_NAME || "Perfect Platter";

export function Header({ showAdminLink = true }: { showAdminLink?: boolean }) {
  const { lang } = useI18n();
  const [first, ...rest] = businessName.split(" ");
  return (
    <header className="sticky top-0 z-50 border-b-2 border-brand-100 bg-cream/96 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="flex items-baseline gap-1" dir="ltr">
          <span className="font-display text-3xl tracking-widest text-brand-600 uppercase leading-none">
            {first}
          </span>
          <span className="font-script text-2xl text-gold leading-none">
            {rest.join(" ")}
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <LanguageToggle />
          {showAdminLink && (
            <Link
              href="/admin"
              className="font-sans text-xs font-medium tracking-widest uppercase text-brand-300 transition hover:text-brand-600"
            >
              {uiText("admin", lang)}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
