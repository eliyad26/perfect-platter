import type { DeliveryDay } from "./types";
import type { Lang } from "./i18n";

export const TIME_SLOTS: Record<DeliveryDay, string[]> = {
  wednesday: ["19:00-20:00", "20:00-21:00"],
  thursday:  ["19:00-20:00", "20:00-21:00"],
  friday:    ["09:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", "13:00-14:00"],
};

function toAmPm(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

export function formatTimeSlot(slot: string, lang: Lang): string {
  const [start, end] = slot.split("-");
  if (lang === "he") return `${start} – ${end}`;
  return `${toAmPm(start)} – ${toAmPm(end)}`;
}

export function isValidTimeSlot(day: DeliveryDay, slot: string): boolean {
  return TIME_SLOTS[day]?.includes(slot) ?? false;
}
