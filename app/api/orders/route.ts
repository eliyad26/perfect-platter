import { NextRequest, NextResponse } from "next/server";
import {
  createOrder,
  getAllOrders,
  getDeliverySettings,
  getPlatter,
} from "@/lib/db";
import type { DeliveryDay, PaymentMethod, PlatterSize } from "@/lib/types";
import { isValidTimeSlot } from "@/lib/time-slots";
import { sendOrderConfirmation } from "@/lib/email";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

const VALID_DAYS: DeliveryDay[] = ["wednesday", "thursday", "friday"];
const VALID_SIZES: PlatterSize[] = ["small", "medium", "party"];
const VALID_PAYMENTS: PaymentMethod[] = ["cash", "bit"];

export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
  }
  try {
    const orders = await getAllOrders();
    return NextResponse.json({ orders });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאה" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const platterSize = body.platterSize as PlatterSize;
    const specialRequest = String(body.specialRequest || "").trim();
    const deliveryDay = body.deliveryDay as DeliveryDay;
    const deliveryTime = String(body.deliveryTime || "").trim();
    const streetAddress = String(body.streetAddress || "").trim();
    const entrance = String(body.entrance || "").trim();
    const floor = String(body.floor || "").trim();
    const deliveryNote = String(body.deliveryNote || "").trim();
    const phone = String(body.phone || "").trim();
    const paymentMethod = body.paymentMethod as PaymentMethod;

    if (!VALID_SIZES.includes(platterSize)) {
      return NextResponse.json({ error: "סוג מגש לא תקין" }, { status: 400 });
    }
    if (!VALID_DAYS.includes(deliveryDay)) {
      return NextResponse.json({ error: "יום משלוח לא תקין" }, { status: 400 });
    }
    if (!VALID_PAYMENTS.includes(paymentMethod)) {
      return NextResponse.json({ error: "אמצעי תשלום לא תקין" }, { status: 400 });
    }
    if (!name || !email) {
      return NextResponse.json({ error: "נא למלא שם ואימייל" }, { status: 400 });
    }
    if (!streetAddress || !entrance || !floor || !phone) {
      return NextResponse.json(
        { error: "נא למלא כתובת, כניסה, קומה ומספר טלפון" },
        { status: 400 }
      );
    }

    const delivery = await getDeliverySettings();
    if (!delivery[deliveryDay]) {
      return NextResponse.json(
        { error: "יום המשלוח שבחרת אינו זמין כרגע" },
        { status: 400 }
      );
    }
    if (!isValidTimeSlot(deliveryDay, deliveryTime)) {
      return NextResponse.json({ error: "שעת משלוח לא תקינה" }, { status: 400 });
    }

    const platter = await getPlatter(platterSize);
    if (!platter) {
      return NextResponse.json({ error: "מגש לא נמצא" }, { status: 400 });
    }

    const order = await createOrder({
      name,
      email,
      platterSize,
      specialRequest,
      deliveryTime,
      deliveryDay,
      streetAddress,
      entrance,
      floor,
      deliveryNote,
      phone,
      paymentMethod,
    });

    // Send confirmation email — fire-and-forget, never blocks the response
    sendOrderConfirmation(order, platter.price).catch((e) =>
      console.error("Email send failed:", e)
    );

    return NextResponse.json({ success: true, order });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאה בשליחת ההזמנה" }, { status: 500 });
  }
}
