import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getDeliverySettings, updateDeliverySettings } from "@/lib/db";
import type { DeliverySettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
  }
  return NextResponse.json({ delivery: await getDeliverySettings() });
}

export async function PUT(request: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const settings: DeliverySettings = {
      wednesday: !!body.wednesday,
      thursday: !!body.thursday,
      friday: !!body.friday,
    };
    await updateDeliverySettings(settings);
    return NextResponse.json({ success: true, delivery: settings });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאה" }, { status: 500 });
  }
}
