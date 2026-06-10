import { NextRequest, NextResponse } from "next/server";
import {
  createOrder,
  getAllOrders,
  getAllPlatters,
  getDeliverySettings,
} from "@/lib/db";
import type { DeliveryDay, PaymentMethod, PlatterItem, PlatterSize } from "@/lib/types";
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
    const lang: "en" | "he" = body.lang === "en" ? "en" : "he";
    const items = (body.items || []) as PlatterItem[];
    const specialRequest = String(body.specialRequest || "").trim();
    const deliveryDay = body.deliveryDay as DeliveryDay;
    const deliveryTime = String(body.deliveryTime || "").trim();
    const streetAddress = String(body.streetAddress || "").trim();
    const entrance = String(body.entrance || "").trim();
    const floor = String(body.floor || "").trim();
    const deliveryNote = String(body.deliveryNote || "").trim();
    const phone = String(body.phone || "").trim();
    const paymentMethod = body.paymentMethod as PaymentMethod;

    const validItems = items.filter(
      (i) => VALID_SIZES.includes(i.size) && Number.isInteger(i.quantity) && i.quantity >= 1
    );
    if (!validItems.length) {
      return NextResponse.json({ error: "נא לבחור לפחות מגש אחד" }, { status: 400 });
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

    const allPlatters = await getAllPlatters();
    const totalPrice = validItems.reduce((sum, i) => {
      const p = allPlatters.find((p) => p.size === i.size);
      return sum + (p?.price ?? 0) * i.quantity;
    }, 0);

    const order = await createOrder({
      name,
      email,
      lang,
      items: validItems,
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

    // Await the confirmation email before responding. On serverless (Netlify),
    // the function is frozen the instant we return, so a fire-and-forget send
    // would be killed before it leaves the server. A failure here must not fail
    // the order, so we swallow and log it.
    try {
      await sendOrderConfirmation(order, totalPrice);
    } catch (e) {
      console.error("Email send failed:", e);
    }

    return NextResponse.json({ success: true, order });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאה בשליחת ההזמנה" }, { status: 500 });
  }
}
