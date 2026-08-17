import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobTop — Bugungi ishlar",
  description: "Toshkentdagi bir kunlik ishlar uchun Telegram Mini App",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uz" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
