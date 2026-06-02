"use client";

import { Header } from "@/components/Header";
import { OrderForm } from "@/components/OrderForm";
import { useI18n } from "@/components/I18nProvider";
import { uiText } from "@/lib/i18n";

export default function HomePage() {
  const { lang } = useI18n();
  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            {uiText("homeTitle", lang)}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-stone-600">
            {uiText("homeSubtitle", lang)}
          </p>
        </section>
        <OrderForm />
      </main>
      <footer className="border-t border-stone-200 py-8 text-center text-sm text-stone-500">
        <p>{uiText("footerLine", lang)}</p>
      </footer>
    </>
  );
}
