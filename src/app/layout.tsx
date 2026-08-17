import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "JobTop — Bugungi ishlar",
  description: "Toshkentdagi bir kunlik ishlar uchun Telegram Mini App",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uz" className={cn("h-full antialiased", "font-sans", inter.variable)}>
      <body className="min-h-full flex flex-col">
        <Script src="https://telegram.org/js/telegram-web-app.js?56" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
