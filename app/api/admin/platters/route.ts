import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllPlatters, updatePlatterPrice } from "@/lib/db";
import type { PlatterSize } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
  }
  return NextResponse.json({ platters: await getAllPlatters() });
}

export async function PATCH(request: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const size = body.size as PlatterSize;
    const price = parseInt(body.price, 10);
    if (!size || isNaN(price) || price < 0) {
      return NextResponse.json({ error: "נתונים לא תקינים" }, { status: 400 });
    }
    await updatePlatterPrice(size, price);
    return NextResponse.json({ success: true, platters: await getAllPlatters() });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאה" }, { status: 500 });
  }
}
