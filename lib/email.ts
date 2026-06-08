import type { Order } from "./types";
import { formatTimeSlot } from "./time-slots";

const FROM =
  process.env.FROM_EMAIL ?? "Perfect Platter <onboarding@resend.dev>";

const DAY_HE: Record<string, string> = {
  wednesday: "רביעי",
  thursday: "חמישי",
  friday: "שישי",
};

const PLATTER_HE: Record<string, string> = {
  small: "מגש קטן",
  medium: "מגש בינוני",
  party: "מגש מסיבה",
};

const PAYMENT_HE: Record<string, string> = {
  cash: "מזומן",
  bit: "ביט",
};

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding:10px 16px;font-size:13px;color:#8a7060;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:10px 16px;font-size:15px;color:#3d2c1e;font-weight:600;vertical-align:top;">${value}</td>
    </tr>`;
}

function buildHtml(order: Order, price: number): string {
  const platterName = PLATTER_HE[order.platterSize] ?? order.platterSize;
  const dayName = DAY_HE[order.deliveryDay] ?? order.deliveryDay;
  const timeLabel = order.deliveryTime
    ? formatTimeSlot(order.deliveryTime, "he")
    : "";
  const paymentLabel = PAYMENT_HE[order.paymentMethod] ?? order.paymentMethod;
  const address = [
    order.streetAddress,
    order.entrance ? `כניסה ${order.entrance}` : "",
    order.floor ? `קומה ${order.floor}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>אישור הזמנה – Perfect Platter</title>
</head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0ea;padding:48px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
        style="max-width:560px;width:100%;background:#ffffff;border-top:5px solid #8b6343;">

        <!-- Header -->
        <tr>
          <td style="padding:40px 40px 28px;text-align:center;background:#faf7f4;border-bottom:1px solid #ede5dc;">
            <p style="margin:0 0 4px;font-size:12px;letter-spacing:3px;color:#b08060;text-transform:uppercase;">
              אישור הזמנה
            </p>
            <h1 style="margin:0;font-size:30px;letter-spacing:5px;color:#3d2c1e;text-transform:uppercase;">
              PERFECT Platter
            </h1>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:36px 40px 8px;text-align:center;">
            <p style="margin:0;font-size:22px;color:#3d2c1e;">
              היי ${escHtml(order.name)}! 🍓
            </p>
            <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#6b5445;">
              המייל הזה הוא אישור ההזמנה שלך.<br/>
              תודה שבחרתם ב-Perfect Platter!
            </p>
          </td>
        </tr>

        <!-- Order number badge -->
        <tr>
          <td style="padding:24px 40px 8px;text-align:center;">
            <span style="display:inline-block;background:#faf7f4;border:2px solid #ede5dc;padding:8px 28px;font-size:13px;letter-spacing:2px;color:#8a7060;text-transform:uppercase;">
              הזמנה מספר&nbsp;
              <strong style="color:#3d2c1e;font-size:18px;">#${order.id}</strong>
            </span>
          </td>
        </tr>

        <!-- Details table -->
        <tr>
          <td style="padding:24px 40px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0"
              style="border:1px solid #ede5dc;border-collapse:collapse;">
              ${row("מגש", `${platterName} — ₪${price}`)}
              <tr><td colspan="2" style="border-top:1px solid #ede5dc;"></td></tr>
              ${row("יום משלוח", dayName)}
              ${row("שעת משלוח", timeLabel)}
              <tr><td colspan="2" style="border-top:1px solid #ede5dc;"></td></tr>
              ${row("כתובת", escHtml(address))}
              ${order.deliveryNote ? `<tr><td colspan="2" style="border-top:1px solid #ede5dc;"></td></tr>${row("הערה", escHtml(order.deliveryNote))}` : ""}
              ${order.specialRequest ? `<tr><td colspan="2" style="border-top:1px solid #ede5dc;"></td></tr>${row("בקשה מיוחדת", escHtml(order.specialRequest))}` : ""}
              <tr><td colspan="2" style="border-top:1px solid #ede5dc;"></td></tr>
              ${row("תשלום", paymentLabel)}
              ${row("טלפון", order.phone)}
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:28px 40px;text-align:center;background:#faf7f4;border-top:1px solid #ede5dc;">
            <p style="margin:0;font-size:13px;color:#a08878;line-height:1.8;">
              יש שאלות? פשוט ענו למייל הזה.<br/>
              תודה שבחרתם ב-Perfect Platter 🍉
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendOrderConfirmation(
  order: Order,
  price: number
): Promise<void> {
  if (!process.env.RESEND_API_KEY) return; // silently skip if not configured

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: FROM,
    to: order.email,
    subject: `הזמנה #${order.id} התקבלה – Perfect Platter 🍓`,
    html: buildHtml(order, price),
  });
}
