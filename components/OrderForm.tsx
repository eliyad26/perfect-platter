"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type {
  DeliveryDay,
  DeliverySettings,
  PaymentMethod,
  PlatterConfig,
  PlatterSize,
} from "@/lib/types";
import {
  DAY_LABELS,
  PAYMENT_LABELS,
  PLATTER_LABELS,
  fruitLabel,
  uiText,
} from "@/lib/i18n";
import { useI18n } from "@/components/I18nProvider";

type Step = 1 | 2 | 3 | 4 | "success";

const FRUIT_COLORS: Record<string, string> = {
  watermelon: "#e74c3c", kiwi: "#7dbb5d", tangerine: "#f39c12",
  mango: "#f1c40f", cherry: "#c0392b", cherries: "#c0392b",
  grapes: "#8e44ad", strawberry: "#e74c3c", strawberries: "#e74c3c",
  pineapple: "#f39c12", melon: "#7dbb5d", peach: "#f97316",
  plum: "#7c3aed", banana: "#eab308", orange: "#f97316",
  apple: "#ef4444", blueberry: "#3b82f6", raspberry: "#ec4899",
};
function fruitColor(fruit: string): string {
  return FRUIT_COLORS[fruit.toLowerCase()] ?? "#8b5520";
}

export function OrderForm() {
  const { lang } = useI18n();
  const [platters, setPlatters] = useState<PlatterConfig[]>([]);
  const [delivery, setDelivery] = useState<DeliverySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [step, setStep] = useState<Step>(1);
  const [selectedSize, setSelectedSize] = useState<PlatterSize | null>(null);
  const [excludedFruits, setExcludedFruits] = useState<string[]>([]);
  const [deliveryDay, setDeliveryDay] = useState<DeliveryDay | null>(null);
  const [streetAddress, setStreetAddress] = useState("");
  const [entrance, setEntrance] = useState("");
  const [floor, setFloor] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/platters");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPlatters(data.platters);
      setDelivery(data.delivery);
    } catch {
      setError(uiText("loadingMenuError", lang));
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => { loadData(); }, [loadData]);

  const selectedPlatter = platters.find((p) => p.size === selectedSize);
  const availableDays = (["wednesday", "thursday", "friday"] as DeliveryDay[]).filter(
    (d) => delivery?.[d]
  );

  function toggleFruit(fruit: string) {
    setExcludedFruits((prev) =>
      prev.includes(fruit) ? prev.filter((f) => f !== fruit) : [...prev, fruit]
    );
  }

  async function submitOrder() {
    if (!selectedSize || !deliveryDay || !paymentMethod) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platterSize: selectedSize, excludedFruits, deliveryDay,
          streetAddress, entrance, floor, deliveryNote, phone, paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || uiText("orderSubmitError", lang));
      setOrderId(data.order.id);
      setStep("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : uiText("orderSubmitError", lang));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="mx-auto max-w-lg text-center py-20">
        <p className="font-script text-3xl text-gold mb-2">
          {lang === "he" ? "תודה רבה!" : "Thank you!"}
        </p>
        <h2 className="font-display text-6xl tracking-wide text-brand-600 uppercase">
          {uiText("orderSuccessTitle", lang)}
        </h2>
        <p className="mt-4 text-brand-400 font-medium">
          {uiText("orderSuccessId", lang)}: <strong className="text-brand-600">#{orderId}</strong>
        </p>
        <p className="mt-3 text-brand-400 leading-relaxed">
          {uiText("orderSuccessBody", lang)}
        </p>
        <button type="button" className="btn-primary mt-10" onClick={() => window.location.reload()}>
          {uiText("orderAnother", lang)}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <StepIndicator current={step} lang={lang} />

      {error && (
        <div className="border-l-4 border-red-500 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* STEP 1 — Choose platter */}
      {step === 1 && (
        <section>
          <div className="mb-10 text-center">
            {lang === "he" ? (
              <>
                <p className="font-he-script text-2xl text-brand-400 leading-none mb-1">בחרו את</p>
                <h2 className="font-he-display text-5xl sm:text-6xl text-brand-600">גודל המגש</h2>
              </>
            ) : (
              <>
                <p className="font-script text-2xl text-brand-400 leading-none mb-1">choose your</p>
                <h2 className="font-display text-5xl sm:text-6xl tracking-wide text-brand-600 uppercase">Platter Size</h2>
              </>
            )}
            <p className="mt-3 text-sm font-medium text-brand-300 tracking-wide">
              {uiText("choosePlatterHint", lang)}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {platters.map((platter) => (
              <button
                key={platter.size}
                type="button"
                onClick={() => { setSelectedSize(platter.size); setExcludedFruits([]); setStep(2); }}
                className={`group cursor-pointer text-center transition-all border-2 bg-cream-warm overflow-hidden hover:border-brand-600 hover:shadow-xl hover:-translate-y-1 ${
                  selectedSize === platter.size ? "border-brand-600 shadow-lg" : "border-cream-blush"
                }`}
              >
                <div className="relative aspect-square overflow-hidden bg-cream">
                  {platter.imageUrl ? (
                    <Image
                      src={platter.imageUrl}
                      alt={PLATTER_LABELS[lang][platter.size].title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-7xl">🍉</div>
                  )}
                </div>
                <div className="p-5 border-t-2 border-cream-blush">
                  <h3 className={`text-2xl tracking-wide text-brand-600 uppercase ${lang === "he" ? "font-he-display" : "font-display"}`}>
                    {PLATTER_LABELS[lang][platter.size].title}
                  </h3>
                  <p className={`mt-1 text-sm text-brand-400 italic ${lang === "he" ? "font-he-script" : "font-sans"}`}>
                    {PLATTER_LABELS[lang][platter.size].subtitle}
                  </p>
                  <p className="mt-3 font-script text-xl text-gold">
                    ₪{platter.price}
                  </p>
                  <span className="mt-3 inline-block font-display text-sm tracking-widest uppercase text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
                    {lang === "he" ? "בחרו ←" : "Select →"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* STEP 2 — Customize fruits */}
      {step === 2 && selectedPlatter && (
        <section>
          <button type="button" onClick={() => setStep(1)}
            className="mb-6 font-display text-sm tracking-widest uppercase text-brand-300 hover:text-brand-600 transition">
            ← {uiText("backToPlatter", lang)}
          </button>
          <div className="mb-8 text-center">
            <p className={`text-2xl text-brand-400 mb-1 ${lang === "he" ? "font-he-script" : "font-script"}`}>
              {PLATTER_LABELS[lang][selectedPlatter.size].title}
            </p>
            <h2 className={`text-5xl tracking-wide text-brand-600 uppercase ${lang === "he" ? "font-he-display" : "font-display"}`}>
              {uiText("pickFruitsTitle", lang)}
            </h2>
            <p className="mt-3 text-sm font-medium text-brand-300 tracking-wide">
              {uiText("pickFruitsHint", lang)}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {selectedPlatter.fruits.map((fruit) => {
              const excluded = excludedFruits.includes(fruit);
              return (
                <button
                  key={fruit} type="button" onClick={() => toggleFruit(fruit)}
                  className={`flex items-center gap-2 border-2 px-5 py-2.5 font-sans text-sm font-medium transition-all ${
                    excluded
                      ? "border-red-300 bg-red-50 text-red-400 line-through"
                      : "border-cream-blush bg-cream-warm text-brand-600 hover:border-brand-600 hover:-translate-y-0.5"
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: fruitColor(fruit) }} />
                  {fruitLabel(fruit, lang)}
                </button>
              );
            })}
          </div>
          {excludedFruits.length > 0 && (
            <p className="mt-5 text-center text-sm text-brand-300">
              {uiText("removedFruits", lang)}: {excludedFruits.map((f) => fruitLabel(f, lang)).join(", ")}
            </p>
          )}
          <div className="mt-10 flex justify-center">
            <button type="button" className="btn-primary" onClick={() => setStep(3)}>
              {uiText("continueToDelivery", lang)}
            </button>
          </div>
        </section>
      )}

      {/* STEP 3 — Delivery */}
      {step === 3 && (
        <section>
          <button type="button" onClick={() => setStep(2)}
            className="mb-6 font-display text-sm tracking-widest uppercase text-brand-300 hover:text-brand-600 transition">
            ← {uiText("backToFruits", lang)}
          </button>
          <div className="mb-8 text-center">
            <h2 className={`text-5xl tracking-wide text-brand-600 uppercase ${lang === "he" ? "font-he-display" : "font-display"}`}>
              {uiText("deliveryDetails", lang)}
            </h2>
          </div>

          {availableDays.length === 0 ? (
            <div className="border-l-4 border-amber-400 bg-amber-50 p-5 text-amber-800 text-sm">
              {uiText("noDeliveryDays", lang)}
            </div>
          ) : (
            <div className="mx-auto max-w-lg space-y-8">
              <div>
                <label className="mb-3 block font-display text-sm tracking-widest uppercase text-brand-400">
                  {uiText("deliveryDay", lang)} {uiText("requiredMark", lang)}
                </label>
                <div className="flex flex-wrap gap-3">
                  {availableDays.map((day) => (
                    <button key={day} type="button" onClick={() => setDeliveryDay(day)}
                      className={`flex-1 border-2 py-3 font-display text-lg tracking-widest uppercase transition ${
                        deliveryDay === day
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-cream-blush bg-cream-warm text-brand-600 hover:border-brand-600"
                      }`}>
                      {DAY_LABELS[lang][day]}
                    </button>
                  ))}
                </div>
              </div>

              {[
                { label: uiText("streetAddress", lang), ph: uiText("streetPlaceholder", lang), val: streetAddress, set: setStreetAddress, req: true },
              ].map(({ label, ph, val, set, req }) => (
                <div key={label}>
                  <label className="mb-2 block font-display text-sm tracking-widest uppercase text-brand-400">
                    {label} {req && uiText("requiredMark", lang)}
                  </label>
                  <input type="text" className="input-field" placeholder={ph} value={val} onChange={(e) => set(e.target.value)} />
                </div>
              ))}

              <div className="grid gap-6 sm:grid-cols-2">
                {[
                  { label: uiText("entrance", lang), ph: uiText("entrancePlaceholder", lang), val: entrance, set: setEntrance },
                  { label: uiText("floor", lang), ph: uiText("floorPlaceholder", lang), val: floor, set: setFloor },
                ].map(({ label, ph, val, set }) => (
                  <div key={label}>
                    <label className="mb-2 block font-display text-sm tracking-widest uppercase text-brand-400">
                      {label} {uiText("requiredMark", lang)}
                    </label>
                    <input type="text" className="input-field" placeholder={ph} value={val} onChange={(e) => set(e.target.value)} />
                  </div>
                ))}
              </div>

              <div>
                <label className="mb-2 block font-display text-sm tracking-widest uppercase text-brand-400">
                  {uiText("deliveryNote", lang)}
                </label>
                <textarea className="input-field min-h-[80px] resize-y" placeholder={uiText("deliveryNotePlaceholder", lang)}
                  value={deliveryNote} onChange={(e) => setDeliveryNote(e.target.value)} />
              </div>

              <div>
                <label className="mb-2 block font-display text-sm tracking-widest uppercase text-brand-400">
                  {uiText("phone", lang)} {uiText("requiredMark", lang)}
                </label>
                <input type="tel" className="input-field" placeholder="050-0000000" dir="ltr"
                  value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>

              <div className="flex justify-center pt-2">
                <button type="button" className="btn-primary"
                  disabled={!deliveryDay || !streetAddress || !entrance || !floor || !phone}
                  onClick={() => setStep(4)}>
                  {uiText("continueToPayment", lang)}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* STEP 4 — Payment */}
      {step === 4 && selectedPlatter && (
        <section>
          <button type="button" onClick={() => setStep(3)}
            className="mb-6 font-display text-sm tracking-widest uppercase text-brand-300 hover:text-brand-600 transition">
            ← {uiText("backToDelivery", lang)}
          </button>
          <div className="mb-8 text-center">
            <h2 className={`text-5xl tracking-wide text-brand-600 uppercase ${lang === "he" ? "font-he-display" : "font-display"}`}>
              {uiText("paymentSummary", lang)}
            </h2>
          </div>

          <div className="mx-auto max-w-lg">
            <div className="border-2 border-cream-blush bg-cream-warm p-6 mb-8">
              <h3 className="font-display text-2xl tracking-wide text-brand-600 uppercase mb-5">
                {uiText("orderSummary", lang)}
              </h3>
              <dl className="space-y-4 text-sm">
                {[
                  { label: uiText("platter", lang), value: PLATTER_LABELS[lang][selectedPlatter.size].title },
                  { label: uiText("deliveryDay", lang), value: deliveryDay ? DAY_LABELS[lang][deliveryDay] : "" },
                  { label: uiText("address", lang), value: `${streetAddress} — ${uiText("entrance", lang)} ${entrance}, ${uiText("floor", lang)} ${floor}` },
                  ...(excludedFruits.length > 0 ? [{ label: uiText("without", lang), value: excludedFruits.map((f) => fruitLabel(f, lang)).join(", ") }] : []),
                ].map(({ label, value }) => value ? (
                  <div key={label} className="flex justify-between border-b border-cream-blush pb-4">
                    <dt className="font-display text-xs tracking-widest uppercase text-brand-300">{label}</dt>
                    <dd className="font-medium text-brand-600 text-right max-w-[60%]">{value}</dd>
                  </div>
                ) : null)}
                <div className="flex justify-between pt-1">
                  <dt className="font-display text-xs tracking-widest uppercase text-brand-300">{uiText("price", lang)}</dt>
                  <dd className="font-script text-3xl text-gold">₪{selectedPlatter.price}</dd>
                </div>
              </dl>
            </div>

            <label className="mb-3 block font-display text-sm tracking-widest uppercase text-brand-400">
              {uiText("paymentMethod", lang)} {uiText("requiredMark", lang)}
            </label>
            <div className="mb-8 flex flex-wrap gap-3">
              {(["cash", "bit"] as PaymentMethod[]).map((method) => (
                <button key={method} type="button" onClick={() => setPaymentMethod(method)}
                  className={`flex-1 border-2 py-4 font-display text-xl tracking-widest uppercase transition ${
                    paymentMethod === method
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-cream-blush bg-cream-warm text-brand-600 hover:border-brand-600"
                  }`}>
                  {PAYMENT_LABELS[lang][method]}
                </button>
              ))}
            </div>

            <button type="button" className="btn-primary w-full" disabled={!paymentMethod || submitting} onClick={submitOrder}>
              {submitting ? uiText("submitting", lang) : uiText("submitOrder", lang)}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function StepIndicator({ current, lang }: { current: Step; lang: "en" | "he" }) {
  const steps = [
    { n: 1, labelEn: "Platter", labelHe: "מגש" },
    { n: 2, labelEn: "Fruits",  labelHe: "פירות" },
    { n: 3, labelEn: "Delivery",labelHe: "משלוח" },
    { n: 4, labelEn: "Payment", labelHe: "תשלום" },
  ];
  const currentNum = current === "success" ? 5 : current;

  return (
    <nav className="flex justify-center gap-1 sm:gap-2">
      {steps.map(({ n, labelEn, labelHe }, i) => (
        <div key={n} className="flex items-center gap-1 sm:gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 transition ${
            currentNum >= n ? "text-brand-600" : "text-brand-200"
          }`}>
            <span className={`flex h-6 w-6 items-center justify-center font-display text-sm border-2 transition ${
              currentNum >= n ? "border-brand-600 text-brand-600" : "border-brand-200 text-brand-200"
            }`}>{n}</span>
            <span className={`hidden sm:inline font-display text-xs tracking-widest uppercase`}>
              {lang === "he" ? labelHe : labelEn}
            </span>
          </div>
          {i < steps.length - 1 && (
            <span className={`text-sm font-light ${currentNum > n ? "text-brand-400" : "text-brand-100"}`}>—</span>
          )}
        </div>
      ))}
    </nav>
  );
}
