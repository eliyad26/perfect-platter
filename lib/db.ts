import type {
  DeliverySettings,
  Order,
  PaymentMethod,
  PlatterConfig,
  PlatterSize,
} from "./types";
import { loadStore, saveStore } from "./storage";

export async function getAllPlatters(): Promise<PlatterConfig[]> {
  const store = await loadStore();
  return [...store.platters].sort((a, b) => a.price - b.price);
}

export async function getPlatter(
  size: PlatterSize
): Promise<PlatterConfig | null> {
  const store = await loadStore();
  return store.platters.find((p) => p.size === size) ?? null;
}

export async function updatePlatterImage(
  size: PlatterSize,
  imageUrl: string
): Promise<void> {
  const store = await loadStore();
  const p = store.platters.find((x) => x.size === size);
  if (p) p.imageUrl = imageUrl;
  await saveStore(store);
}

export async function updatePlatterPrice(
  size: PlatterSize,
  price: number
): Promise<void> {
  const store = await loadStore();
  const p = store.platters.find((x) => x.size === size);
  if (p) p.price = price;
  await saveStore(store);
}

export async function getDeliverySettings(): Promise<DeliverySettings> {
  const store = await loadStore();
  return store.delivery;
}

export async function updateDeliverySettings(
  settings: DeliverySettings
): Promise<void> {
  const store = await loadStore();
  store.delivery = settings;
  await saveStore(store);
}

export async function createOrder(data: {
  platterSize: PlatterSize;
  excludedFruits: string[];
  deliveryDay: Order["deliveryDay"];
  streetAddress: string;
  entrance: string;
  floor: string;
  deliveryNote: string;
  phone: string;
  paymentMethod: PaymentMethod;
}): Promise<Order> {
  const store = await loadStore();
  const order: Order = {
    id: store.nextOrderId++,
    createdAt: new Date().toISOString(),
    platterSize: data.platterSize,
    excludedFruits: data.excludedFruits,
    deliveryDay: data.deliveryDay,
    streetAddress: data.streetAddress,
    entrance: data.entrance,
    floor: data.floor,
    deliveryNote: data.deliveryNote,
    phone: data.phone,
    paymentMethod: data.paymentMethod,
    status: "new",
  };
  store.orders.unshift(order);
  await saveStore(store);
  return order;
}

export async function getAllOrders(): Promise<Order[]> {
  const store = await loadStore();
  return store.orders;
}

export async function getOrderById(id: number): Promise<Order | null> {
  const store = await loadStore();
  return store.orders.find((o) => o.id === id) ?? null;
}

export async function updateOrderStatus(
  id: number,
  status: Order["status"]
): Promise<void> {
  const store = await loadStore();
  const order = store.orders.find((o) => o.id === id);
  if (order) order.status = status;
  await saveStore(store);
}

export async function createAdminSession(
  token: string,
  expiresAt: string
): Promise<void> {
  const store = await loadStore();
  store.sessions = store.sessions.filter((s) => s.token !== token);
  store.sessions.push({ token, expiresAt });
  await saveStore(store);
}

export async function isValidAdminSession(token: string): Promise<boolean> {
  await cleanupExpiredSessions();
  const store = await loadStore();
  const now = Date.now();
  return store.sessions.some(
    (s) => s.token === token && new Date(s.expiresAt).getTime() > now
  );
}

export async function deleteAdminSession(token: string): Promise<void> {
  const store = await loadStore();
  store.sessions = store.sessions.filter((s) => s.token !== token);
  await saveStore(store);
}

export async function cleanupExpiredSessions(): Promise<void> {
  const store = await loadStore();
  const now = Date.now();
  const filtered = store.sessions.filter(
    (s) => new Date(s.expiresAt).getTime() > now
  );
  if (filtered.length !== store.sessions.length) {
    store.sessions = filtered;
    await saveStore(store);
  }
}
