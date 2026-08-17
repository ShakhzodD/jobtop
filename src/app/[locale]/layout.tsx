import type { Metadata, Viewport } from "next";
import "../globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";
import { cn } from "@/lib/utils";
import { Providers } from "@/shared/providers";
import { AppNavigation } from "@/widgets/app-navigation/ui/app-navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "JobTop — Bugungi ishlar",
  description: "Toshkentdagi bir kunlik ishlar uchun Telegram Mini App",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

type Props = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn("h-full antialiased", "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">
        <Script
          src="https://telegram.org/js/telegram-web-app.js?56"
          strategy="beforeInteractive"
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <main className="mx-auto min-h-[var(--tg-viewport-stable-height,100dvh)] w-full max-w-[540px] overscroll-y-contain bg-background px-4 pt-[max(112px,calc(var(--tg-safe-area-inset-top,0px)+var(--tg-content-safe-area-inset-top,0px)+var(--jt-tg-safe-top,0px)+20px))] pb-[calc(90px+env(safe-area-inset-bottom)+var(--tg-safe-area-inset-bottom,0px)+var(--tg-content-safe-area-inset-bottom,0px)+var(--jt-tg-safe-bottom,0px))] text-foreground max-[380px]:px-3.5">
              {children}
              <AppNavigation />
            </main>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
