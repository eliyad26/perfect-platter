export type Lang = "en" | "he";

export const DEFAULT_LANG: Lang = "en";

export function isLang(value: unknown): value is Lang {
  return value === "en" || value === "he";
}

export function langDir(lang: Lang): "ltr" | "rtl" {
  return lang === "he" ? "rtl" : "ltr";
}

export function langLabel(lang: Lang): string {
  return lang === "he" ? "עברית" : "English";
}

export const UI = {
  businessTagline: {
    en: "Fresh fruit platters",
    he: "מגשי פירות טריים",
  },
  admin: {
    en: "Admin",
    he: "ניהול",
  },
  backToSite: {
    en: "← Back to site",
    he: "→ חזרה לאתר",
  },
  homeTitle: {
    en: "Order a fresh fruit platter",
    he: "הזמינו מגש פירות טרי",
  },
  homeSubtitle: {
    en: "Choose a platter, add any special requests, and pick a delivery day — quick and easy.",
    he: "בחרו מגש, הוסיפו בקשות מיוחדות, והזמינו משלוח ליום שמתאים לכם — פשוט ומהיר.",
  },
  footerLine: {
    en: "Delivery Wed/Thu/Fri · Pay with cash or Bit",
    he: "משלוח ברביעי, חמישי ושישי · תשלום במזומן או ביט",
  },
  loadingMenuError: {
    en: "We couldn’t load the menu. Please refresh and try again.",
    he: "לא הצלחנו לטעון את התפריט. נסו לרענן את הדף.",
  },
  orderSubmitError: {
    en: "Failed to submit order",
    he: "שגיאה בשליחה",
  },
  orderSuccessTitle: {
    en: "Order received!",
    he: "ההזמנה התקבלה!",
  },
  orderSuccessId: {
    en: "Order number",
    he: "מספר הזמנה",
  },
  orderSuccessBody: {
    en: "A confirmation email is on its way to you. Thank you for choosing Perfect Platter!",
    he: "אישור ההזמנה נשלח לאימייל שלך. תודה שבחרתם ב-Perfect Platter!",
  },
  orderAnother: {
    en: "Place another order",
    he: "הזמנה נוספת",
  },
  choosePlatter: {
    en: "Choose your platter size",
    he: "בחרו את גודל המגש",
  },
  choosePlatterHint: {
    en: "All platters are made with fresh seasonal fruit.",
    he: "כל המגשים מורכבים מפירות העונה הטריים ביותר",
  },
  pickFruitsTitle: {
    en: "Special Requests",
    he: "בקשות מיוחדות",
  },
  pickFruitsHint: {
    en: "Any preferences or fruits to avoid? Leave a note (optional).",
    he: "בקשות מיוחדות, אלרגיות, או פירות שלא תרצו? השאירו הערה (אופציונלי)",
  },
  specialRequestPlaceholder: {
    en: "e.g. no watermelon…",
    he: "למשל: ללא אבטיח...",
  },
  continueToDelivery: {
    en: "Continue to delivery",
    he: "המשך לפרטי משלוח",
  },
  customerName: {
    en: "Full name",
    he: "שם מלא",
  },
  customerNamePlaceholder: {
    en: "Your name",
    he: "שמך",
  },
  customerEmail: {
    en: "Email",
    he: "אימייל",
  },
  customerEmailPlaceholder: {
    en: "your@email.com",
    he: "your@email.com",
  },
  deliveryTime: {
    en: "Delivery time",
    he: "שעת משלוח",
  },
  deliveryDetails: {
    en: "Delivery details",
    he: "פרטי משלוח",
  },
  noDeliveryDays: {
    en: "No delivery days available right now. Please try again later.",
    he: "אין ימי משלוח זמינים כרגע. נסו שוב מאוחר יותר.",
  },
  deliveryDay: {
    en: "Delivery day",
    he: "יום משלוח",
  },
  streetAddress: {
    en: "Street address",
    he: "רחוב ומספר בית",
  },
  streetPlaceholder: {
    en: "Herzl 12, Tel Aviv",
    he: "הרצל 12, תל אביב",
  },
  entrance: {
    en: "Entrance",
    he: "כניסה",
  },
  entrancePlaceholder: {
    en: "A / B / Main gate",
    he: "א׳ / ב׳ / שער ראשי",
  },
  floor: {
    en: "Floor",
    he: "קומה",
  },
  floorPlaceholder: {
    en: "3 / Ground / Penthouse",
    he: "3 / קרקע / פנטהאוז",
  },
  deliveryNote: {
    en: "Delivery note",
    he: "הערה למשלוח",
  },
  deliveryNotePlaceholder: {
    en: "Door code, special instructions…",
    he: "קוד לדלת, הוראות נוספות...",
  },
  phone: {
    en: "Phone number",
    he: "מספר טלפון",
  },
  continueToPayment: {
    en: "Continue to payment",
    he: "המשך לתשלום",
  },
  paymentSummary: {
    en: "Payment & summary",
    he: "תשלום וסיכום",
  },
  orderSummary: {
    en: "Order summary",
    he: "סיכום הזמנה",
  },
  platter: {
    en: "Platter",
    he: "מגש",
  },
  price: {
    en: "Price",
    he: "מחיר",
  },
  total: {
    en: "Total",
    he: "סה״כ",
  },
  address: {
    en: "Address",
    he: "כתובת",
  },
  specialRequest: {
    en: "Special request",
    he: "בקשה מיוחדת",
  },
  name: {
    en: "Name",
    he: "שם",
  },
  paymentMethod: {
    en: "Payment method",
    he: "אמצעי תשלום",
  },
  submitOrder: {
    en: "Submit order",
    he: "שליחת הזמנה",
  },
  submitting: {
    en: "Submitting…",
    he: "שולח...",
  },
  backToPlatter: {
    en: "← Back to platter selection",
    he: "→ חזרה לבחירת מגש",
  },
  backToFruits: {
    en: "← Back to special requests",
    he: "→ חזרה לבקשות מיוחדות",
  },
  backToDelivery: {
    en: "← Back to delivery details",
    he: "→ חזרה לפרטי משלוח",
  },
  requiredMark: {
    en: "*",
    he: "*",
  },
  adminLoginTitle: {
    en: "Admin login",
    he: "כניסת מנהל",
  },
  adminLoginSubtitle: {
    en: "Enter your admin password",
    he: "הזינו את סיסמת הניהול",
  },
  passwordPlaceholder: {
    en: "Password",
    he: "סיסמה",
  },
  login: {
    en: "Log in",
    he: "כניסה",
  },
  loggingIn: {
    en: "Logging in…",
    he: "מתחבר...",
  },
};

export const DAY_LABELS: Record<Lang, Record<"wednesday" | "thursday" | "friday", string>> =
  {
    en: { wednesday: "Wednesday", thursday: "Thursday", friday: "Friday" },
    he: { wednesday: "רביעי", thursday: "חמישי", friday: "שישי" },
  };

export const PAYMENT_LABELS: Record<Lang, Record<"cash" | "bit", string>> = {
  en: { cash: "Cash", bit: "Bit" },
  he: { cash: "מזומן", bit: "ביט" },
};

export const PLATTER_LABELS: Record<
  Lang,
  Record<"small" | "medium" | "party", { title: string; subtitle: string }>
> = {
  en: {
    small: { title: "Small Platter", subtitle: "A little taste of luxury" },
    medium: { title: "Medium Platter", subtitle: "Everyone's favourite. Every time." },
    party: { title: "Party Platter", subtitle: "Go big or go home" },
  },
  he: {
    small: { title: "מגש קטן", subtitle: "הסוד? רק הפירות הכי טריים" },
    medium: { title: "מגש בינוני", subtitle: "מביא אושר לכל שולחן" },
    party: { title: "מגש מסיבה", subtitle: "כשרוצים לעשות רושם" },
  },
};

const FRUIT_HE_TO_EN: Record<string, string> = {
  "תפוח": "Apple",
  "בננה": "Banana",
  "תפוז": "Orange",
  "מנדרינה": "Mandarin",
  "ענבים": "Grapes",
  "אגס": "Pear",
  "מלון": "Melon",
  "אבטיח": "Watermelon",
  "אפרסק": "Peach",
  "שזיף": "Plum",
  "אננס": "Pineapple",
  "מנגו": "Mango",
  "רימון": "Pomegranate",
  "תמרים": "Dates",
  "קיוי": "Kiwi",
  "תות": "Strawberry",
};

const FRUIT_EN_TO_HE: Record<string, string> = Object.fromEntries(
  Object.entries(FRUIT_HE_TO_EN).map(([he, en]) => [en, he])
);

export function fruitLabel(fruit: string, lang: Lang): string {
  if (lang === "en") return FRUIT_HE_TO_EN[fruit] ?? fruit;
  return FRUIT_EN_TO_HE[fruit] ?? fruit;
}

export function uiText<K extends keyof typeof UI>(
  key: K,
  lang: Lang
): string {
  return (UI as Record<string, Record<Lang, string>>)[key][lang];
}

