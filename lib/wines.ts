import type { WineId } from "./types";

export interface Wine {
  id: WineId;
  nameHe: string;
  nameEn: string;
  descHe: string;
  descEn: string;
  varietyHe: string;
  varietyEn: string;
  /** Customer price (winery retail + ₪60 service markup) */
  price: number;
  /** Emoji used as card image fallback */
  emoji: string;
}

/**
 * Three wines from יקב הר חברון (Har Hebron Winery).
 * Prices include a ₪60 service/handling markup on the winery retail price.
 */
export const WINES: Wine[] = [
  {
    id: "light",
    nameHe: 'הר חברון "כרמים"',
    nameEn: 'Har Hebron "Keramim"',
    descHe: "יין אדום עדין ומאוזן, מושלם לשולחן שבת ולארוחות משפחתיות",
    descEn: "Light and elegant red — perfect for Shabbat and family gatherings",
    varietyHe: "קברנה סוביניון-מרלו",
    varietyEn: "Cabernet-Merlot",
    price: 160, // ~₪100 winery + ₪60 service
    emoji: "🍷",
  },
  {
    id: "classic",
    nameHe: 'הר חברון "גפן"',
    nameEn: 'Har Hebron "Gefen"',
    descHe: "קברנה סוביניון איכותי עם ארומות עשירות של פירות יער ועץ אלון",
    descEn: "Premium Cabernet Sauvignon with rich dark fruit and toasted oak",
    varietyHe: "קברנה סוביניון",
    varietyEn: "Cabernet Sauvignon",
    price: 360, // ~₪300 winery + ₪60 service
    emoji: "🍷",
  },
  {
    id: "reserve",
    nameHe: 'הר חברון "שיא"',
    nameEn: 'Har Hebron "Shia"',
    descHe: "יין הדגל של היקב — מיזוג בורדו פרמיום עם בשלות ואלגנטיות יוצאי דופן",
    descEn: "The winery's flagship — a premium Bordeaux blend of exceptional depth",
    varietyHe: "מיזוג בורדו",
    varietyEn: "Bordeaux Blend",
    price: 560, // ~₪500 winery + ₪60 service
    emoji: "🍾",
  },
];
