import type { Order } from "./types";
import type { Lang } from "./i18n";
import { formatTimeSlot } from "./time-slots";

const FROM =
  process.env.FROM_EMAIL ?? "Perfect Platter <onboarding@resend.dev>";

const T = {
  he: {
    dir: "rtl",
    htmlLang: "he",
    confirmationLabel: "אישור הזמנה",
    greeting: (name: string) => `היי ${name}! 🍓`,
    body: "המייל הזה הוא אישור ההזמנה שלך.",
    thanks: "תודה שבחרתם ב-Perfect Platter!",
    orderLabel: "הזמנה מספר",
    labels: {
      platter: "מגש",
      day: "יום משלוח",
      time: "שעת משלוח",
      address: "כתובת",
      note: "הערה",
      special: "בקשה מיוחדת",
      payment: "תשלום",
      phone: "טלפון",
    },
    footer: "יש שאלות? פשוט ענו למייל הזה.\nתודה שבחרתם ב-Perfect Platter 🍉",
    subject: (id: number) => `הזמנה #${id} התקבלה – Perfect Platter 🍓`,
    platter: { small: "מגש קטן", medium: "מגש בינוני", party: "מגש מסיבה" },
    day: { wednesday: "רביעי", thursday: "חמישי", friday: "שישי" },
    payment: { cash: "מזומן", bit: "ביט" },
    entrance: (e: string) => `כניסה ${e}`,
    floor: (f: string) => `קומה ${f}`,
  },
  en: {
    dir: "ltr",
    htmlLang: "en",
    confirmationLabel: "Order Confirmation",
    greeting: (name: string) => `Hi ${name}! 🍓`,
    body: "This email confirms your order.",
    thanks: "Thank you for choosing Perfect Platter!",
    orderLabel: "Order number",
    labels: {
      platter: "Platter",
      day: "Delivery day",
      time: "Delivery time",
      address: "Address",
      note: "Note",
      special: "Special request",
      payment: "Payment",
      phone: "Phone",
    },
    footer: "Questions? Just reply to this email.\nThank you for choosing Perfect Platter 🍉",
    subject: (id: number) => `Order #${id} Confirmed – Perfect Platter 🍓`,
    platter: { small: "Small Platter", medium: "Medium Platter", party: "Party Platter" },
    day: { wednesday: "Wednesday", thursday: "Thursday", friday: "Friday" },
    payment: { cash: "Cash", bit: "Bit" },
    entrance: (e: string) => `Entrance ${e}`,
    floor: (f: string) => `Floor ${f}`,
  },
};

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding:10px 16px;font-size:13px;color:#8a7060;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:10px 16px;font-size:15px;color:#3d2c1e;font-weight:600;vertical-align:top;">${value}</td>
    </tr>`;
}

function divider() {
  return `<tr><td colspan="2" style="border-top:1px solid #ede5dc;"></td></tr>`;
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(order: Order, totalPrice: number, lang: Lang): string {
  const t = T[lang];

  const dayName = t.day[order.deliveryDay as keyof typeof t.day] ?? order.deliveryDay;
  const timeLabel = order.deliveryTime ? formatTimeSlot(order.deliveryTime, lang) : "";
  const paymentLabel = t.payment[order.paymentMethod as keyof typeof t.payment] ?? order.paymentMethod;
  const address = [
    order.streetAddress,
    order.entrance ? t.entrance(order.entrance) : "",
    order.floor ? t.floor(order.floor) : "",
  ].filter(Boolean).map(escHtml).join(", ");

  const footerLines = t.footer.split("\n").join("<br/>");

  return `<!DOCTYPE html>
<html dir="${t.dir}" lang="${t.htmlLang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${t.confirmationLabel} – Perfect Platter</title>
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
              ${t.confirmationLabel}
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
              ${t.greeting(escHtml(order.name))}
            </p>
            <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#6b5445;">
              ${t.body}<br/>${t.thanks}
            </p>
          </td>
        </tr>

        <!-- Order number badge -->
        <tr>
          <td style="padding:24px 40px 8px;text-align:center;">
            <span style="display:inline-block;background:#faf7f4;border:2px solid #ede5dc;padding:8px 28px;font-size:13px;letter-spacing:2px;color:#8a7060;text-transform:uppercase;">
              ${t.orderLabel}&nbsp;
              <strong style="color:#3d2c1e;font-size:18px;">#${order.id}</strong>
            </span>
          </td>
        </tr>

        <!-- Details table -->
        <tr>
          <td style="padding:24px 40px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0"
              style="border:1px solid #ede5dc;border-collapse:collapse;">
              ${(order.items ?? []).map((item) => {
                const name = t.platter[item.size as keyof typeof t.platter] ?? item.size;
                const label = item.quantity > 1 ? `${name} ×${item.quantity}` : name;
                return row(t.labels.platter, label);
              }).join("")}
              ${divider()}
              ${row(lang === "he" ? "סה״כ" : "Total", `₪${totalPrice}`)}
              ${divider()}
              ${row(t.labels.day, dayName)}
              ${row(t.labels.time, timeLabel)}
              ${divider()}
              ${row(t.labels.address, address)}
              ${order.deliveryNote ? `${divider()}${row(t.labels.note, escHtml(order.deliveryNote))}` : ""}
              ${order.specialRequest ? `${divider()}${row(t.labels.special, escHtml(order.specialRequest))}` : ""}
              ${divider()}
              ${row(t.labels.payment, paymentLabel)}
              ${row(t.labels.phone, order.phone)}
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:28px 40px;text-align:center;background:#faf7f4;border-top:1px solid #ede5dc;">
            <p style="margin:0;font-size:13px;color:#a08878;line-height:1.8;">
              ${footerLines}
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendOrderConfirmation(
  order: Order,
  price: number
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping order confirmation email");
    return;
  }

  const lang: Lang = order.lang ?? "he";
  const t = T[lang];

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: FROM,
    to: order.email,
    subject: t.subject(order.id),
    html: buildHtml(order, price, lang),  // price = totalPrice passed in
  });
}
