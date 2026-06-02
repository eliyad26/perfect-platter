import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/I18nProvider";

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
    <html lang="en" dir="ltr" className={heebo.variable}>
      <body className="font-sans min-h-screen">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
