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
} from "@/lib/types";

const STATUS_LABELS: Record<Order["status"], string> = {
  new: "חדשה",
  confirmed: "אושרה",
  delivered: "נמסרה",
  cancelled: "בוטלה",
};

const STATUS_COLORS: Record<Order["status"], string> = {
  new: "bg-blue-100 text-blue-800",
  confirmed: "bg-amber-100 text-amber-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-stone-100 text-stone-600",
};

type Tab = "orders" | "platters" | "delivery";

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
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
      setMessage("הסטטוס עודכן");
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
      setMessage("ימי המשלוח עודכנו");
    }
  }

  async function uploadImage(size: PlatterSize, file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("size", size);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = await res.json();
    if (res.ok) {
      setMessage("התמונה הועלתה בהצלחה");
      loadPlatters();
    } else {
      setMessage(data.error || "שגיאה בהעלאה");
    }
  }

  async function updatePrice(size: PlatterSize, price: number) {
    const res = await fetch("/api/admin/platters", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ size, price }),
    });
    if (res.ok) {
      setMessage("המחיר עודכן");
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
          <h2 className="text-2xl font-bold text-stone-900">לוח ניהול</h2>
          {newCount > 0 && (
            <p className="mt-1 text-sm text-brand-600">
              {newCount} הזמנות חדשות ממתינות
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadAll}
            className="btn-secondary text-sm"
          >
            רענון
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            יציאה
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
            ["orders", "הזמנות"],
            ["platters", "מגשים ותמונות"],
            ["delivery", "ימי משלוח"],
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
              onStatusChange={updateStatus}
            />
          )}
          {tab === "platters" && (
            <PlattersTab
              platters={platters}
              onUpload={uploadImage}
              onPriceChange={updatePrice}
            />
          )}
          {tab === "delivery" && delivery && (
            <DeliveryTab settings={delivery} onSave={saveDelivery} />
          )}
        </>
      )}
    </div>
  );
}

function OrdersTab({
  orders,
  platters,
  onStatusChange,
}: {
  orders: Order[];
  platters: PlatterConfig[];
  onStatusChange: (id: number, status: Order["status"]) => void;
}) {
  if (orders.length === 0) {
    return (
      <p className="py-12 text-center text-stone-500">אין הזמנות עדיין</p>
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
                {STATUS_LABELS[order.status]}
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
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-stone-500">מגש</dt>
              <dd className="font-medium">
                {PLATTER_LABELS[order.platterSize].he}
                {price != null && ` · ₪${price}`}
              </dd>
            </div>
            <div>
              <dt className="text-stone-500">יום משלוח</dt>
              <dd className="font-medium">{DAY_LABELS[order.deliveryDay]}</dd>
            </div>
            <div>
              <dt className="text-stone-500">טלפון</dt>
              <dd className="font-medium" dir="ltr">
                <a href={`tel:${order.phone}`} className="text-brand-600">
                  {order.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-stone-500">תשלום</dt>
              <dd className="font-medium">
                {PAYMENT_LABELS[order.paymentMethod]}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-stone-500">כתובת</dt>
              <dd className="font-medium">
                {order.streetAddress || "—"}
                <span className="block text-stone-600">
                  כניסה {order.entrance}, קומה {order.floor}
                </span>
                {order.deliveryNote && (
                  <span className="block text-stone-600">
                    הערה: {order.deliveryNote}
                  </span>
                )}
              </dd>
            </div>
            {order.excludedFruits.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-stone-500">ללא פירות</dt>
                <dd className="font-medium text-red-700">
                  {order.excludedFruits.join(", ")}
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
  onUpload,
  onPriceChange,
}: {
  platters: PlatterConfig[];
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
          <h3 className="font-bold">{platter.nameHe}</h3>
          <label className="mt-4 block text-sm text-stone-600">
            מחיר (₪)
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
              העלאת תמונה
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
}: {
  settings: DeliverySettings;
  onSave: (s: DeliverySettings) => void;
}) {
  const [local, setLocal] = useState(settings);

  useEffect(() => {
    setLocal(settings);
  }, [settings]);

  const days: Array<{ key: keyof DeliverySettings; label: string }> = [
    { key: "wednesday", label: "רביעי" },
    { key: "thursday", label: "חמישי" },
    { key: "friday", label: "שישי" },
  ];

  return (
    <div className="card max-w-md">
      <h3 className="font-bold text-stone-900">ימי משלוח זמינים</h3>
      <p className="mt-2 text-sm text-stone-500">
        כבו ימים שלא מבצעים בהם משלוח — הלקוחות לא יוכלו לבחור אותם
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
        שמירה
      </button>
    </div>
  );
}
