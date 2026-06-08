export type PlatterSize = "small" | "medium" | "party";
export type DeliveryDay = "wednesday" | "thursday" | "friday";
export type PaymentMethod = "cash" | "bit";

export interface PlatterConfig {
  size: PlatterSize;
  nameHe: string;
  nameEn: string;
  descriptionHe: string;
  price: number;
  fruits: string[];
  imageUrl: string | null;
}

export interface Order {
  id: number;
  createdAt: string;
  platterSize: PlatterSize;
  specialRequest: string;
  deliveryDay: DeliveryDay;
  streetAddress: string;
  entrance: string;
  floor: string;
  deliveryNote: string;
  phone: string;
  paymentMethod: PaymentMethod;
  status: "new" | "confirmed" | "delivered" | "cancelled";
}

export interface DeliverySettings {
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
}

export const PLATTER_LABELS: Record<
  PlatterSize,
  { he: string; en: string; desc: string }
> = {
  small: {
    he: "מגש קטן",
    en: "Small Platter",
    desc: "מושלם ל-2–4 אנשים",
  },
  medium: {
    he: "מגש בינוני",
    en: "Medium Platter",
    desc: "מושלם ל-5–8 אנשים",
  },
  party: {
    he: "מגש מסיבה",
    en: "Party Platter",
    desc: "מושלם לאירועים ומסיבות",
  },
};

export const DAY_LABELS: Record<DeliveryDay, string> = {
  wednesday: "רביעי",
  thursday: "חמישי",
  friday: "שישי",
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "מזומן",
  bit: "ביט",
};
