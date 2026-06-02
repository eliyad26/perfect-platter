"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type {
  DeliverySettings,
  Order,
  PlatterConfig,
  PlatterSize,
} from "@/lib/types";
import {
  DAY_LABELS,
  PAYMENT_LABELS,
  PLATTER_LABELS,
  fruitLabel,
  type Lang,
} from "@/lib/i18n";
import { useI18n } from "@/components/I18nProvider";

const STATUS_LABELS: Record<Lang, Record<Order["status"], string>> = {
  en: {
    new: "New",
    confirmed: "Confirmed",
    delivered: "Delivered",
    cancelled: "Cancelled",
  },
  he: {
    new: "חדשה",
    confirmed: "אושרה",
    delivered: "נמסרה",
    cancelled: "בוטלה",
  },
};

const STATUS_COLORS: Record<Order["status"], string> = {
  new: "bg-blue-100 text-blue-800",
  confirmed: "bg-amber-100 text-amber-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-stone-100 text-stone-600",
};

type Tab = "orders" | "platters" | "delivery";

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { lang } = useI18n();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [platters, setPlatters] = useState<PlatterConfig[]>([]);
  const [delivery, setDelivery] = useState<DeliverySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadOrders = useCallback(async () => {
    const res = await fetch("/api/orders");
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders);
    }
  }, []);

  const loadPlatters = useCallback(async () => {
    const res = await fetch("/api/admin/platters");
    if (res.ok) {
      const data = await res.json();
      setPlatters(data.platters);
    }
  }, []);

  const loadDelivery = useCallback(async () => {
    const res = await fetch("/api/admin/delivery");
    if (res.ok) {
      const data = await res.json();
      setDelivery(data.delivery);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadOrders(), loadPlatters(), loadDelivery()]);
    setLoading(false);
  }, [loadOrders, loadPlatters, loadDelivery]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function updateStatus(id: number, status: Order["status"]) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setMessage(lang === "he" ? "הסטטוס עודכן" : "Status updated");
      loadOrders();
    }
  }

  async function saveDelivery(settings: DeliverySettings) {
    const res = await fetch("/api/admin/delivery", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      const data = await res.json();
      setDelivery(data.delivery);
      setMessage(lang === "he" ? "ימי המשלוח עודכנו" : "Delivery days updated");
    }
  }

  async function uploadImage(size: PlatterSize, file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("size", size);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = await res.json();
    if (res.ok) {
      setMessage(lang === "he" ? "התמונה הועלתה בהצלחה" : "Image uploaded");
      loadPlatters();
    } else {
      setMessage(data.error || (lang === "he" ? "שגיאה בהעלאה" : "Upload failed"));
    }
  }

  async function updatePrice(size: PlatterSize, price: number) {
    const res = await fetch("/api/admin/platters", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ size, price }),
    });
    if (res.ok) {
      setMessage(lang === "he" ? "המחיר עודכן" : "Price updated");
      loadPlatters();
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    onLogout();
  }

  const newCount = orders.filter((o) => o.status === "new").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">
            {lang === "he" ? "לוח ניהול" : "Admin dashboard"}
          </h2>
          {newCount > 0 && (
            <p className="mt-1 text-sm text-brand-600">
              {lang === "he"
                ? `${newCount} הזמנות חדשות ממתינות`
                : `${newCount} new orders waiting`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadAll}
            className="btn-secondary text-sm"
          >
            {lang === "he" ? "רענון" : "Refresh"}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            {lang === "he" ? "יציאה" : "Log out"}
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm text-brand-800">
          {message}
          <button
            type="button"
            className="mr-2 underline"
            onClick={() => setMessage("")}
          >
            סגור
          </button>
        </div>
      )}

      <div className="flex gap-2 border-b border-stone-200">
        {(
          [
            ["orders", lang === "he" ? "הזמנות" : "Orders"],
            ["platters", lang === "he" ? "מגשים ותמונות" : "Platters & images"],
            ["delivery", lang === "he" ? "ימי משלוח" : "Delivery days"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
              tab === id
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            {label}
            {id === "orders" && newCount > 0 && (
              <span className="mr-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                {newCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      ) : (
        <>
          {tab === "orders" && (
            <OrdersTab
              orders={orders}
              platters={platters}
              lang={lang}
              onStatusChange={updateStatus}
            />
          )}
          {tab === "platters" && (
            <PlattersTab
              platters={platters}
              lang={lang}
              onUpload={uploadImage}
              onPriceChange={updatePrice}
            />
          )}
          {tab === "delivery" && delivery && (
            <DeliveryTab settings={delivery} onSave={saveDelivery} lang={lang} />
          )}
        </>
      )}
    </div>
  );
}

function OrdersTab({
  orders,
  platters,
  lang,
  onStatusChange,
}: {
  orders: Order[];
  platters: PlatterConfig[];
  lang: Lang;
  onStatusChange: (id: number, status: Order["status"]) => void;
}) {
  if (orders.length === 0) {
    return (
      <p className="py-12 text-center text-stone-500">
        {lang === "he" ? "אין הזמנות עדיין" : "No orders yet"}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const price =
          platters.find((p) => p.size === order.platterSize)?.price ?? null;
        return (
        <article key={order.id} className="card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="text-lg font-bold">#{order.id}</span>
              <span
                className={`mr-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[order.status]}`}
              >
                {STATUS_LABELS[lang][order.status]}
              </span>
              <p className="mt-1 text-xs text-stone-400">
                {new Date(order.createdAt).toLocaleString("he-IL")}
              </p>
            </div>
            <select
              value={order.status}
              onChange={(e) =>
                onStatusChange(order.id, e.target.value as Order["status"])
              }
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm"
            >
              {Object.entries(STATUS_LABELS[lang]).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-stone-500">{lang === "he" ? "מגש" : "Platter"}</dt>
              <dd className="font-medium">
                {PLATTER_LABELS[lang][order.platterSize].title}
                {price != null && ` · ₪${price}`}
              </dd>
            </div>
            <div>
              <dt className="text-stone-500">{lang === "he" ? "יום משלוח" : "Delivery day"}</dt>
              <dd className="font-medium">{DAY_LABELS[lang][order.deliveryDay]}</dd>
            </div>
            <div>
              <dt className="text-stone-500">{lang === "he" ? "טלפון" : "Phone"}</dt>
              <dd className="font-medium" dir="ltr">
                <a href={`tel:${order.phone}`} className="text-brand-600">
                  {order.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-stone-500">{lang === "he" ? "תשלום" : "Payment"}</dt>
              <dd className="font-medium">
                {PAYMENT_LABELS[lang][order.paymentMethod]}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-stone-500">{lang === "he" ? "כתובת" : "Address"}</dt>
              <dd className="font-medium">
                {order.streetAddress || "—"}
                <span className="block text-stone-600">
                  {(lang === "he" ? "כניסה" : "Entrance")}: {order.entrance},{" "}
                  {(lang === "he" ? "קומה" : "Floor")}: {order.floor}
                </span>
                {order.deliveryNote && (
                  <span className="block text-stone-600">
                    {(lang === "he" ? "הערה" : "Note")}: {order.deliveryNote}
                  </span>
                )}
              </dd>
            </div>
            {order.excludedFruits.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-stone-500">
                  {lang === "he" ? "ללא פירות" : "Excluded fruits"}
                </dt>
                <dd className="font-medium text-red-700">
                  {order.excludedFruits.map((f) => fruitLabel(f, lang)).join(", ")}
                </dd>
              </div>
            )}
          </dl>
        </article>
      );
      })}
    </div>
  );
}

function PlattersTab({
  platters,
  lang,
  onUpload,
  onPriceChange,
}: {
  platters: PlatterConfig[];
  lang: Lang;
  onUpload: (size: PlatterSize, file: File) => void;
  onPriceChange: (size: PlatterSize, price: number) => void;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {platters.map((platter) => (
        <div key={platter.size} className="card">
          <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-stone-100">
            {platter.imageUrl ? (
              <Image
                src={platter.imageUrl}
                alt={platter.nameHe}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl">
                🍓
              </div>
            )}
          </div>
          <h3 className="font-bold">{PLATTER_LABELS[lang][platter.size].title}</h3>
          <label className="mt-4 block text-sm text-stone-600">
            {lang === "he" ? "מחיר (₪)" : "Price (₪)"}
            <input
              type="number"
              className="input-field mt-1"
              defaultValue={platter.price}
              onBlur={(e) => {
                const p = parseInt(e.target.value, 10);
                if (!isNaN(p) && p !== platter.price) {
                  onPriceChange(platter.size, p);
                }
              }}
            />
          </label>
          <label className="mt-4 block">
            <span className="btn-secondary mt-2 inline-block cursor-pointer text-sm">
              {lang === "he" ? "העלאת תמונה" : "Upload image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload(platter.size, file);
                }}
              />
            </span>
          </label>
        </div>
      ))}
    </div>
  );
}

function DeliveryTab({
  settings,
  onSave,
  lang,
}: {
  settings: DeliverySettings;
  onSave: (s: DeliverySettings) => void;
  lang: Lang;
}) {
  const [local, setLocal] = useState(settings);

  useEffect(() => {
    setLocal(settings);
  }, [settings]);

  const days: Array<{ key: keyof DeliverySettings; label: string }> = [
    { key: "wednesday", label: DAY_LABELS[lang].wednesday },
    { key: "thursday", label: DAY_LABELS[lang].thursday },
    { key: "friday", label: DAY_LABELS[lang].friday },
  ];

  return (
    <div className="card max-w-md">
      <h3 className="font-bold text-stone-900">
        {lang === "he" ? "ימי משלוח זמינים" : "Available delivery days"}
      </h3>
      <p className="mt-2 text-sm text-stone-500">
        {lang === "he"
          ? "כבו ימים שלא מבצעים בהם משלוח — הלקוחות לא יוכלו לבחור אותם"
          : "Disable days you don’t deliver — customers won’t be able to select them."}
      </p>
      <div className="mt-6 space-y-4">
        {days.map(({ key, label }) => (
          <label
            key={key}
            className="flex cursor-pointer items-center justify-between rounded-xl border border-stone-200 px-4 py-3"
          >
            <span className="font-medium">{label}</span>
            <input
              type="checkbox"
              checked={local[key]}
              onChange={(e) =>
                setLocal((prev) => ({ ...prev, [key]: e.target.checked }))
              }
              className="h-5 w-5 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
            />
          </label>
        ))}
      </div>
      <button
        type="button"
        className="btn-primary mt-6"
        onClick={() => onSave(local)}
      >
        {lang === "he" ? "שמירה" : "Save"}
      </button>
    </div>
  );
}
