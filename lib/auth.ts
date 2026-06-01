import { cookies } from "next/headers";
import crypto from "crypto";
import {
  createAdminSession,
  deleteAdminSession,
  isValidAdminSession,
  cleanupExpiredSessions,
} from "./db";

export const ADMIN_COOKIE = "fp_admin_session";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "fruit2026";
}

export function verifyAdminPassword(password: string): boolean {
  return password === getAdminPassword();
}

export function createSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function loginAdmin(password: string): Promise<boolean> {
  if (!verifyAdminPassword(password)) return false;
  await cleanupExpiredSessions();
  const token = createSessionToken();
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  await createAdminSession(token, expires.toISOString());
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
  return true;
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (token) await deleteAdminSession(token);
  cookieStore.delete(ADMIN_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return await isValidAdminSession(token);
}
