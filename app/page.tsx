"use client";

import { Header } from "@/components/Header";
import { OrderForm } from "@/components/OrderForm";
import { useI18n } from "@/components/I18nProvider";
import { uiText } from "@/lib/i18n";

function LeafIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="18" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1"/>
      <path d="M16 8h4l3 3v5h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  );
}

export default function HomePage() {
  const { lang } = useI18n();
  const isHe = lang === "he";

  return (
    <>
      <div className="urgency-strip">
        {isHe ? (
          <>הזמן לפני <span className="text-gold font-bold">14:00</span> לקבלת משלוח באותו היום · ירושלים והסביבה</>
        ) : (
          <>Order before <span className="text-gold font-bold">2:00 PM</span> for same-day delivery · Jerusalem &amp; surroundings</>
        )}
      </div>
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-10 sm:px-10 sm:py-14">

        {/* Hero */}
        <section className="mb-14 text-center">
          {isHe ? (
            <>
              <p className="font-he-script text-3xl text-brand-400 leading-none mb-1">בחרו את</p>
              <h2 className="font-he-display text-7xl sm:text-9xl text-brand-600 leading-tight">
                המגש המושלם
              </h2>
            </>
          ) : (
            <>
              <p className="font-script text-3xl text-brand-400 leading-none mb-1">pick your</p>
              <h2 className="font-display text-7xl sm:text-9xl tracking-wide text-brand-600 uppercase leading-none">
                Perfect Platter
              </h2>
            </>
          )}
          <p className="mt-5 text-base font-medium text-brand-400 tracking-wide max-w-lg mx-auto">
            {isHe
              ? "מגשי פירות טריים מרשימים! מושלמים לשבת ולכל אירוע"
              : "Fresh fruit platters made to impress! Perfect for Shabbat or any occasion"}
          </p>
          <div className="mt-6 flex justify-center gap-8 text-xs font-medium tracking-widest uppercase text-brand-400">
            <span className="flex items-center gap-1.5"><LeafIcon />{isHe ? "100% טרי" : "100% Fresh"}</span>
            <span className="flex items-center gap-1.5"><SparkleIcon />{isHe ? "מוכן לפי הזמנה" : "Made to order"}</span>
            <span className="flex items-center gap-1.5"><TruckIcon />{isHe ? "משלוח מהיר" : "Same-day delivery"}</span>
          </div>
        </section>

        <OrderForm />
      </main>

      <footer className="border-t-2 border-brand-100 py-10 text-center">
        <p className={`text-lg tracking-widest text-brand-300 uppercase ${isHe ? "font-he-display" : "font-display"}`}>
          {uiText("footerLine", lang)}
        </p>
      </footer>
    </>
  );
}
