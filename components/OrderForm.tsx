"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type {
  DeliveryDay,
  DeliverySettings,
  PaymentMethod,
  PlatterConfig,
  PlatterSize,
  WineId,
} from "@/lib/types";

import {
  DAY_LABELS,
  PAYMENT_LABELS,
  PLATTER_LABELS,
  uiText,
} from "@/lib/i18n";
import { TIME_SLOTS, formatTimeSlot } from "@/lib/time-slots";
import { WINES } from "@/lib/wines";
import { useI18n } from "@/components/I18nProvider";

type Step = 1 | 2 | 3 | 4 | "success";


export function OrderForm() {
  const { lang } = useI18n();
  const [platters, setPlatters] = useState<PlatterConfig[]>([]);
  const [delivery, setDelivery] = useState<DeliverySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [step, setStep] = useState<Step>(1);
  const [quantities, setQuantities] = useState<Record<PlatterSize, number>>({ small: 0, medium: 0, party: 0 });
  const [wineQty, setWineQty] = useState<Record<WineId, number>>({ light: 0, classic: 0, reserve: 0 });
  const [specialRequest, setSpecialRequest] = useState("");
  const [deliveryDay, setDeliveryDay] = useState<DeliveryDay | null>(null);
  const [deliveryTime, setDeliveryTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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

  const selectedItems = platters
    .filter((p) => quantities[p.size] > 0)
    .map((p) => ({ ...p, quantity: quantities[p.size] }));
  const hasItems = selectedItems.length > 0;
  const platterTotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const selectedWines = WINES
    .filter((w) => wineQty[w.id] > 0)
    .map((w) => ({ ...w, quantity: wineQty[w.id] }));
  const wineTotal = selectedWines.reduce((sum, w) => sum + w.price * w.quantity, 0);

  const totalPrice = platterTotal + wineTotal;

  function updateQty(size: PlatterSize, delta: number) {
    setQuantities((prev) => ({ ...prev, [size]: Math.max(0, (prev[size] || 0) + delta) }));
  }

  function updateWineQty(id: WineId, delta: number) {
    setWineQty((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
  }

  const availableDays = (["wednesday", "thursday", "friday"] as DeliveryDay[]).filter(
    (d) => delivery?.[d]
  );

  async function submitOrder() {
    if (!hasItems || !deliveryDay || !paymentMethod) return;
    setSubmitting(true);
    setError("");
    try {
      const items = selectedItems.map((i) => ({ size: i.size, quantity: i.quantity }));
      const wines = selectedWines.map((w) => ({ id: w.id, quantity: w.quantity }));
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, lang, items, wines, specialRequest,
          deliveryDay, deliveryTime,
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

      {/* STEP 1 — Choose platters */}
      {step === 1 && (
        <section>
          <div className="mb-10 text-center">
            {lang === "he" ? (
              <>
                <p className="font-he-script text-2xl text-brand-400 leading-none mb-1">בחרו את</p>
                <h2 className="font-he-display text-5xl sm:text-6xl text-brand-600">המגשים שלכם</h2>
              </>
            ) : (
              <>
                <p className="font-script text-2xl text-brand-400 leading-none mb-1">build your</p>
                <h2 className="font-display text-5xl sm:text-6xl tracking-wide text-brand-600 uppercase">Order</h2>
              </>
            )}
            <p className="mt-3 text-sm font-medium text-brand-300 tracking-wide">
              {lang === "he" ? "ניתן להזמין מגשים משילובים שונים" : "Mix and match as many platters as you like"}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {platters.map((platter) => {
              const qty = quantities[platter.size] || 0;
              return (
                <div
                  key={platter.size}
                  className={`text-center border-2 bg-cream-warm overflow-hidden transition-all ${
                    qty > 0 ? "border-brand-600 shadow-lg" : "border-cream-blush"
                  }`}
                >
                  <div className="relative aspect-square overflow-hidden bg-cream">
                    {platter.imageUrl ? (
                      <Image
                        src={platter.imageUrl}
                        alt={PLATTER_LABELS[lang][platter.size].title}
                        fill
                        className="object-cover"
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
                    <p className="mt-2 font-script text-xl text-gold">₪{platter.price}</p>

                    {/* Quantity control */}
                    <div className="mt-4 flex items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => updateQty(platter.size, -1)}
                        disabled={qty === 0}
                        className="flex h-9 w-9 items-center justify-center border-2 border-brand-200 text-brand-400 text-xl font-bold transition hover:border-brand-600 hover:text-brand-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-display text-xl text-brand-600">{qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(platter.size, +1)}
                        className="flex h-9 w-9 items-center justify-center border-2 border-brand-200 text-brand-400 text-xl font-bold transition hover:border-brand-600 hover:text-brand-600"
                      >
                        +
                      </button>
                    </div>

                    {qty > 0 && (
                      <p className="mt-3 font-display text-sm tracking-widest text-brand-400 uppercase">
                        {lang === "he" ? "סה״כ" : "Subtotal"}: ₪{platter.price * qty}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Wine upsell ── */}
          <div className="mt-14">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 border-t border-cream-blush" />
              <div className="text-center px-2">
                <p className={`text-2xl text-brand-500 ${lang === "he" ? "font-he-script" : "font-script"}`}>
                  יקב הר חברון
                </p>
                <p className="font-display text-[10px] tracking-widest uppercase text-brand-300 mt-0.5">
                  {lang === "he" ? "הוסיפו בקבוק יין להזמנה (אופציונלי)" : "Add a bottle of wine · optional"}
                </p>
              </div>
              <div className="flex-1 border-t border-cream-blush" />
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {WINES.map((wine) => {
                const qty = wineQty[wine.id] || 0;
                return (
                  <div
                    key={wine.id}
                    className={`text-center border-2 bg-cream-warm overflow-hidden transition-all ${
                      qty > 0 ? "border-brand-600 shadow-lg" : "border-cream-blush hover:border-brand-200"
                    }`}
                  >
                    {/* Wine image area */}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-red-50 via-rose-50 to-amber-50 flex flex-col items-center justify-center gap-2">
                      <span className="text-6xl leading-none select-none">{wine.emoji}</span>
                      <span className="font-display text-[9px] tracking-[0.2em] uppercase text-brand-300">
                        יקב הר חברון
                      </span>
                    </div>

                    <div className="p-5 border-t-2 border-cream-blush">
                      <p className="font-display text-[10px] tracking-widest uppercase text-brand-300 mb-1">
                        {lang === "he" ? wine.varietyHe : wine.varietyEn}
                      </p>
                      <h3 className={`text-lg leading-tight tracking-wide text-brand-600 ${lang === "he" ? "font-he-display" : "font-display"}`}>
                        {lang === "he" ? wine.nameHe : wine.nameEn}
                      </h3>
                      <p className="mt-2 text-xs text-brand-400 leading-relaxed">
                        {lang === "he" ? wine.descHe : wine.descEn}
                      </p>
                      <p className="mt-3 font-script text-2xl text-gold">₪{wine.price}</p>

                      {/* Quantity control */}
                      <div className="mt-4 flex items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => updateWineQty(wine.id, -1)}
                          disabled={qty === 0}
                          className="flex h-9 w-9 items-center justify-center border-2 border-brand-200 text-brand-400 text-xl font-bold transition hover:border-brand-600 hover:text-brand-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-display text-xl text-brand-600">{qty}</span>
                        <button
                          type="button"
                          onClick={() => updateWineQty(wine.id, +1)}
                          className="flex h-9 w-9 items-center justify-center border-2 border-brand-200 text-brand-400 text-xl font-bold transition hover:border-brand-600 hover:text-brand-600"
                        >
                          +
                        </button>
                      </div>

                      {qty > 0 && (
                        <p className="mt-3 font-display text-xs tracking-widest text-brand-400 uppercase">
                          {lang === "he" ? "סה״כ" : "Subtotal"}: ₪{wine.price * qty}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-center text-xs text-brand-300 tracking-wide">
              {lang === "he"
                ? "כל הייינות כשרים למהדרין · המחיר כולל דמי שירות"
                : "All wines are strictly kosher · Price includes service fee"}
            </p>
          </div>

          {hasItems && (
            <div className="mt-10 flex flex-col items-center gap-4">
              <p className="font-script text-3xl text-gold">
                {uiText("total", lang)}: ₪{totalPrice}
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => { setSpecialRequest(""); setStep(2); }}
              >
                {lang === "he" ? "המשך ←" : "Continue →"}
              </button>
            </div>
          )}
        </section>
      )}

      {/* STEP 2 — Special requests */}
      {step === 2 && (
        <section>
          <button type="button" onClick={() => setStep(1)}
            className="mb-6 font-display text-sm tracking-widest uppercase text-brand-300 hover:text-brand-600 transition">
            ← {uiText("backToPlatter", lang)}
          </button>
          <div className="mb-8 text-center">
            <p className="font-script text-xl text-brand-400 mb-1">
              {selectedItems.map((i) => `${PLATTER_LABELS[lang][i.size].title}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`).join(" · ")}
            </p>
            <h2 className={`text-5xl tracking-wide text-brand-600 uppercase ${lang === "he" ? "font-he-display" : "font-display"}`}>
              {uiText("pickFruitsTitle", lang)}
            </h2>
            <p className="mt-3 text-sm font-medium text-brand-300 tracking-wide">
              {uiText("pickFruitsHint", lang)}
            </p>
          </div>
          <div className="mx-auto max-w-lg">
            <textarea
              className="input-field min-h-[120px] resize-y w-full"
              placeholder={uiText("specialRequestPlaceholder", lang)}
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
            />
          </div>
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

              {/* Name + Email */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-display text-sm tracking-widest uppercase text-brand-400">
                    {uiText("customerName", lang)} {uiText("requiredMark", lang)}
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={uiText("customerNamePlaceholder", lang)}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block font-display text-sm tracking-widest uppercase text-brand-400">
                    {uiText("customerEmail", lang)} {uiText("requiredMark", lang)}
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder={uiText("customerEmailPlaceholder", lang)}
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Delivery day */}
              <div>
                <label className="mb-3 block font-display text-sm tracking-widest uppercase text-brand-400">
                  {uiText("deliveryDay", lang)} {uiText("requiredMark", lang)}
                </label>
                <div className="flex flex-wrap gap-3">
                  {availableDays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => { setDeliveryDay(day); setDeliveryTime(""); }}
                      className={`flex-1 border-2 py-3 font-display text-lg tracking-widest uppercase transition ${
                        deliveryDay === day
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-cream-blush bg-cream-warm text-brand-600 hover:border-brand-600"
                      }`}
                    >
                      {DAY_LABELS[lang][day]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slot — appears once a day is chosen */}
              {deliveryDay && (
                <div>
                  <label className="mb-3 block font-display text-sm tracking-widest uppercase text-brand-400">
                    {uiText("deliveryTime", lang)} {uiText("requiredMark", lang)}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {TIME_SLOTS[deliveryDay].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setDeliveryTime(slot)}
                        className={`border-2 px-6 py-3 font-display text-sm tracking-widest uppercase transition hover:-translate-y-0.5 ${
                          deliveryTime === slot
                            ? "border-brand-600 bg-brand-600 text-white shadow-md"
                            : "border-cream-blush bg-cream-warm text-brand-600 hover:border-brand-600 hover:shadow-sm"
                        }`}
                      >
                        {formatTimeSlot(slot, lang)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Street address */}
              <div>
                <label className="mb-2 block font-display text-sm tracking-widest uppercase text-brand-400">
                  {uiText("streetAddress", lang)} {uiText("requiredMark", lang)}
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder={uiText("streetPlaceholder", lang)}
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                />
              </div>

              {/* Entrance + Floor */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-display text-sm tracking-widest uppercase text-brand-400">
                    {uiText("entrance", lang)} {uiText("requiredMark", lang)}
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={uiText("entrancePlaceholder", lang)}
                    value={entrance}
                    onChange={(e) => setEntrance(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block font-display text-sm tracking-widest uppercase text-brand-400">
                    {uiText("floor", lang)} {uiText("requiredMark", lang)}
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={uiText("floorPlaceholder", lang)}
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                  />
                </div>
              </div>

              {/* Delivery note */}
              <div>
                <label className="mb-2 block font-display text-sm tracking-widest uppercase text-brand-400">
                  {uiText("deliveryNote", lang)}
                </label>
                <textarea
                  className="input-field min-h-[80px] resize-y"
                  placeholder={uiText("deliveryNotePlaceholder", lang)}
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-2 block font-display text-sm tracking-widest uppercase text-brand-400">
                  {uiText("phone", lang)} {uiText("requiredMark", lang)}
                </label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="050-0000000"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  className="btn-primary"
                  disabled={
                    !name.trim() || !email.trim() ||
                    !deliveryDay || !deliveryTime ||
                    !streetAddress || !entrance || !floor || !phone
                  }
                  onClick={() => setStep(4)}
                >
                  {uiText("continueToPayment", lang)}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* STEP 4 — Payment */}
      {step === 4 && hasItems && (
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
                {/* Platters */}
                {selectedItems.map((item) => (
                  <div key={item.size} className="flex justify-between border-b border-cream-blush pb-4">
                    <dt className="font-display text-xs tracking-widest uppercase text-brand-300">
                      {PLATTER_LABELS[lang][item.size].title}
                      {item.quantity > 1 && ` ×${item.quantity}`}
                    </dt>
                    <dd className="font-medium text-brand-600">₪{item.price * item.quantity}</dd>
                  </div>
                ))}
                {/* Wines */}
                {selectedWines.map((wine) => (
                  <div key={wine.id} className="flex justify-between border-b border-cream-blush pb-4">
                    <dt className="font-display text-xs tracking-widest uppercase text-brand-300">
                      🍷 {lang === "he" ? wine.nameHe : wine.nameEn}
                      {wine.quantity > 1 && ` ×${wine.quantity}`}
                    </dt>
                    <dd className="font-medium text-brand-600">₪{wine.price * wine.quantity}</dd>
                  </div>
                ))}
                {/* Other details */}
                {[
                  { label: uiText("name", lang), value: name },
                  { label: uiText("deliveryDay", lang), value: deliveryDay ? DAY_LABELS[lang][deliveryDay] : "" },
                  { label: uiText("deliveryTime", lang), value: deliveryTime ? formatTimeSlot(deliveryTime, lang) : "" },
                  { label: uiText("address", lang), value: `${streetAddress} — ${uiText("entrance", lang)} ${entrance}, ${uiText("floor", lang)} ${floor}` },
                  ...(specialRequest ? [{ label: uiText("specialRequest", lang), value: specialRequest }] : []),
                ].map(({ label, value }) => value ? (
                  <div key={label} className="flex justify-between border-b border-cream-blush pb-4">
                    <dt className="font-display text-xs tracking-widest uppercase text-brand-300">{label}</dt>
                    <dd className="font-medium text-brand-600 text-right max-w-[60%]">{value}</dd>
                  </div>
                ) : null)}
                <div className="flex justify-between pt-1">
                  <dt className="font-display text-xs tracking-widest uppercase text-brand-300">{uiText("total", lang)}</dt>
                  <dd className="font-script text-3xl text-gold">₪{totalPrice}</dd>
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
    { n: 2, labelEn: "Requests", labelHe: "בקשות" },
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
