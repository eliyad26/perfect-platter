import { NextResponse } from "next/server";
import { getAllPlatters, getDeliverySettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const platters = await getAllPlatters();
    const delivery = await getDeliverySettings();
    return NextResponse.json({ platters, delivery });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאה בטעינת הנתונים" }, { status: 500 });
  }
}
