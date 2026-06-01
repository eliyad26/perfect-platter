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
import { DAY_LABELS, PAYMENT_LABELS } from "@/lib/types";

type Step = 1 | 2 | 3 | 4 | "success";

export function OrderForm() {
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null
  );
  const [orderId, setOrderId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/platters");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPlatters(data.platters);
      setDelivery(data.delivery);
    } catch {
      setError("לא הצלחנו לטעון את התפריט. נסו לרענן את הדף.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
          platterSize: selectedSize,
          excludedFruits,
          deliveryDay,
          streetAddress,
          entrance,
          floor,
          deliveryNote,
          phone,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה בשליחה");
      setOrderId(data.order.id);
      setStep("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה בשליחה");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="card mx-auto max-w-lg text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-3xl">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-stone-900">ההזמנה התקבלה!</h2>
        <p className="mt-2 text-stone-600">
          מספר הזמנה: <strong>#{orderId}</strong>
        </p>
        <p className="mt-4 text-stone-600">
          ניצור איתכם קשר בקרוב לאישור. תודה שבחרתם בנו!
        </p>
        <button
          type="button"
          className="btn-primary mt-8"
          onClick={() => window.location.reload()}
        >
          הזמנה נוספת
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <StepIndicator current={step} />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {step === 1 && (
        <section>
          <h2 className="section-title mb-2">בחרו את גודל המגש</h2>
          <p className="mb-6 text-stone-600">
            כל המגשים מורכבים מפירות העונה הטריים ביותר
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {platters.map((platter) => (
              <button
                key={platter.size}
                type="button"
                onClick={() => {
                  setSelectedSize(platter.size);
                  setExcludedFruits([]);
                  setStep(2);
                }}
                className={`card group cursor-pointer text-right transition hover:border-brand-400 hover:shadow-md ${
                  selectedSize === platter.size
                    ? "border-brand-500 ring-2 ring-brand-500/30"
                    : ""
                }`}
              >
                <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-brand-50 to-orange-50">
                  {platter.imageUrl ? (
                    <Image
                      src={platter.imageUrl}
                      alt={platter.nameHe}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl">
                      🍉
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-stone-900">
                  {platter.nameHe}
                </h3>
                <p className="mt-1 text-sm text-stone-500">
                  {platter.descriptionHe}
                </p>
                <p className="mt-3 text-xl font-bold text-brand-700">
                  ₪{platter.price}
                </p>
                <span className="mt-3 inline-block text-sm font-medium text-brand-600 opacity-0 transition group-hover:opacity-100">
                  בחירה ←
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 2 && selectedPlatter && (
        <section>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mb-4 text-sm font-medium text-brand-600 hover:underline"
          >
            → חזרה לבחירת מגש
          </button>
          <h2 className="section-title mb-2">
            {selectedPlatter.nameHe} — הסירו פירות שלא תרצו
          </h2>
          <p className="mb-6 text-stone-600">
            לחצו על פירות שברצונכם להוציא מהמגש (אופציונלי)
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedPlatter.fruits.map((fruit) => {
              const excluded = excludedFruits.includes(fruit);
              return (
                <button
                  key={fruit}
                  type="button"
                  onClick={() => toggleFruit(fruit)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    excluded
                      ? "bg-red-100 text-red-700 line-through"
                      : "bg-brand-100 text-brand-800 hover:bg-brand-200"
                  }`}
                >
                  {fruit}
                </button>
              );
            })}
          </div>
          {excludedFruits.length > 0 && (
            <p className="mt-4 text-sm text-stone-500">
              מוציאים: {excludedFruits.join(", ")}
            </p>
          )}
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              className="btn-primary"
              onClick={() => setStep(3)}
            >
              המשך לפרטי משלוח
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="mb-4 text-sm font-medium text-brand-600 hover:underline"
          >
            → חזרה לבחירת פירות
          </button>
          <h2 className="section-title mb-6">פרטי משלוח</h2>

          {availableDays.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
              אין ימי משלוח זמינים כרגע. נסו שוב מאוחר יותר.
            </div>
          ) : (
            <>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                יום משלוח *
              </label>
              <div className="mb-6 flex flex-wrap gap-3">
                {availableDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setDeliveryDay(day)}
                    className={`rounded-xl px-6 py-3 font-semibold transition ${
                      deliveryDay === day
                        ? "bg-brand-600 text-white shadow-md"
                        : "border border-stone-300 bg-white text-stone-700 hover:border-brand-400"
                    }`}
                  >
                    {DAY_LABELS[day]}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  רחוב ומספר בית *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="הרצל 12, תל אביב"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">
                    כניסה *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="א׳ / ב׳ / שער ראשי"
                    value={entrance}
                    onChange={(e) => setEntrance(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">
                    קומה *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="3 / קרקע / פנטהאוז"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  הערה למשלוח
                </label>
                <textarea
                  className="input-field min-h-[80px] resize-y"
                  placeholder="קוד לדלת, הוראות נוספות..."
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  מספר טלפון *
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

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  className="btn-primary"
                  disabled={
                    !deliveryDay ||
                    !streetAddress ||
                    !entrance ||
                    !floor ||
                    !phone
                  }
                  onClick={() => setStep(4)}
                >
                  המשך לתשלום
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {step === 4 && selectedPlatter && (
        <section>
          <button
            type="button"
            onClick={() => setStep(3)}
            className="mb-4 text-sm font-medium text-brand-600 hover:underline"
          >
            → חזרה לפרטי משלוח
          </button>
          <h2 className="section-title mb-6">תשלום וסיכום</h2>

          <div className="card mb-6 bg-stone-50">
            <h3 className="font-bold text-stone-800">סיכום הזמנה</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone-500">מגש</dt>
                <dd className="font-medium">{selectedPlatter.nameHe}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">מחיר</dt>
                <dd className="font-bold text-brand-700">
                  ₪{selectedPlatter.price}
                </dd>
              </div>
              {deliveryDay && (
                <div className="flex justify-between">
                  <dt className="text-stone-500">יום משלוח</dt>
                  <dd className="font-medium">{DAY_LABELS[deliveryDay]}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">כתובת</dt>
                <dd className="text-left font-medium">
                  {streetAddress}
                  <span className="block text-stone-600">
                    כניסה {entrance}, קומה {floor}
                  </span>
                </dd>
              </div>
              {excludedFruits.length > 0 && (
                <div className="flex justify-between">
                  <dt className="text-stone-500">ללא</dt>
                  <dd className="font-medium">{excludedFruits.join(", ")}</dd>
                </div>
              )}
            </dl>
          </div>

          <label className="mb-3 block text-sm font-medium text-stone-700">
            אמצעי תשלום *
          </label>
          <div className="mb-8 flex flex-wrap gap-3">
            {(["cash", "bit"] as PaymentMethod[]).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`flex-1 rounded-xl px-6 py-4 font-semibold transition sm:flex-none sm:min-w-[140px] ${
                  paymentMethod === method
                    ? "bg-brand-600 text-white shadow-md"
                    : "border border-stone-300 bg-white text-stone-700 hover:border-brand-400"
                }`}
              >
                {PAYMENT_LABELS[method]}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn-primary w-full sm:w-auto"
            disabled={!paymentMethod || submitting}
            onClick={submitOrder}
          >
            {submitting ? "שולח..." : "שליחת הזמנה"}
          </button>
        </section>
      )}
    </div>
  );
}

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: "מגש" },
    { n: 2, label: "פירות" },
    { n: 3, label: "משלוח" },
    { n: 4, label: "תשלום" },
  ];
  const currentNum = current === "success" ? 5 : current;

  return (
    <nav className="flex justify-center gap-2 sm:gap-4">
      {steps.map(({ n, label }) => (
        <div
          key={n}
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium sm:text-sm ${
            currentNum >= n
              ? "bg-brand-100 text-brand-800"
              : "bg-stone-100 text-stone-400"
          }`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
              currentNum >= n ? "bg-brand-600 text-white" : "bg-stone-300 text-stone-600"
            }`}
          >
            {n}
          </span>
          <span className="hidden sm:inline">{label}</span>
        </div>
      ))}
    </nav>
  );
}
