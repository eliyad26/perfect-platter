import type {
  DeliverySettings,
  Order,
  PlatterConfig,
  PlatterSize,
} from "./types";

export const STORE_SCHEMA_VERSION = 2;

/** Fruits commonly sold in Israel */
export const DEFAULT_FRUITS: Record<PlatterSize, string[]> = {
  small: [
    "תפוח",
    "בננה",
    "תפוז",
    "מנדרינה",
    "ענבים",
    "אגס",
    "מלון",
    "קיוי",
  ],
  medium: [
    "תפוח",
    "בננה",
    "תפוז",
    "מנדרינה",
    "ענבים",
    "אגס",
    "מלון",
    "אבטיח",
    "אפרסק",
    "שזיף",
    "אננס",
  ],
  party: [
    "תפוח",
    "בננה",
    "תפוז",
    "מנדרינה",
    "ענבים",
    "אגס",
    "מלון",
    "אבטיח",
    "אפרסק",
    "שזיף",
    "אננס",
    "מנגו",
    "רימון",
    "תמרים",
  ],
};

export const DEFAULT_PRICES: Record<PlatterSize, number> = {
  small: 150,
  medium: 250,
  party: 400,
};

export interface Store {
  schemaVersion: number;
  orders: Order[];
  platters: PlatterConfig[];
  delivery: DeliverySettings;
  sessions: Array<{ token: string; expiresAt: string }>;
  nextOrderId: number;
}

export function defaultStore(): Store {
  const platterConfigs: Array<{
    size: PlatterSize;
    nameHe: string;
    nameEn: string;
    desc: string;
  }> = [
    {
      size: "small",
      nameHe: "מגש קטן",
      nameEn: "Small Platter",
      desc: "מושלם ל-2–4 אנשים",
    },
    {
      size: "medium",
      nameHe: "מגש בינוני",
      nameEn: "Medium Platter",
      desc: "מושלם ל-5–8 אנשים",
    },
    {
      size: "party",
      nameHe: "מגש מסיבה",
      nameEn: "Party Platter",
      desc: "מושלם לאירועים ומסיבות",
    },
  ];

  return {
    schemaVersion: STORE_SCHEMA_VERSION,
    orders: [],
    platters: platterConfigs.map((c) => ({
      size: c.size,
      nameHe: c.nameHe,
      nameEn: c.nameEn,
      descriptionHe: c.desc,
      price: DEFAULT_PRICES[c.size],
      fruits: DEFAULT_FRUITS[c.size],
      imageUrl: null,
    })),
    delivery: { wednesday: true, thursday: true, friday: true },
    sessions: [],
    nextOrderId: 500,
  };
}

export function migrateStore(store: Store): { store: Store; changed: boolean } {
  let changed = false;
  const next = {
    ...store,
    orders: store.orders.map((o) => ({ ...o })),
    platters: store.platters.map((p) => ({ ...p })),
    sessions: [...store.sessions],
  };

  if (!next.schemaVersion) {
    next.schemaVersion = 0;
    changed = true;
  }

  for (const order of next.orders) {
    if (order.streetAddress === undefined) {
      order.streetAddress = "";
      changed = true;
    }
    if (order.specialRequest === undefined) {
      const legacy = (order as unknown as { excludedFruits?: string[] }).excludedFruits;
      order.specialRequest = legacy?.length ? legacy.join(", ") : "";
      changed = true;
    }
    if (order.name === undefined) { order.name = ""; changed = true; }
    if (order.email === undefined) { order.email = ""; changed = true; }
    if (order.deliveryTime === undefined) { order.deliveryTime = ""; changed = true; }
  }

  if (next.nextOrderId < 500) {
    next.nextOrderId = 500;
    changed = true;
  }

  if (next.schemaVersion < STORE_SCHEMA_VERSION) {
    const defaults = defaultStore();
    for (const platter of next.platters) {
      const def = defaults.platters.find((p) => p.size === platter.size);
      if (def) {
        platter.price = def.price;
        platter.fruits = def.fruits;
      }
    }
    next.schemaVersion = STORE_SCHEMA_VERSION;
    changed = true;
  }

  return { store: next, changed };
}
