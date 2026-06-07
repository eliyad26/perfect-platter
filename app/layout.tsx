import type { Metadata } from "next";
import { Heebo, DM_Sans, Anton, Satisfy, Noto_Serif_Hebrew } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/I18nProvider";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});

const satisfy = Satisfy({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dancing",
  display: "swap",
});

const notoSerifHebrew = Noto_Serif_Hebrew({
  subsets: ["hebrew"],
  weight: ["300", "400"],
  variable: "--font-frank",
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
    <html lang="en" dir="ltr" className={`${heebo.variable} ${dmSans.variable} ${anton.variable} ${satisfy.variable} ${notoSerifHebrew.variable}`}>
      <body className="font-sans min-h-screen">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
