import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

const businessName =
  process.env.NEXT_PUBLIC_BUSINESS_NAME || "Perfect Platter";

export const metadata: Metadata = {
  title: `${businessName} | Fruit Platter Orders`,
  description:
    "Order fresh fruit platters from Perfect Platter — small, medium, or party. Delivery Wed–Fri.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="font-sans min-h-screen">{children}</body>
    </html>
  );
}
