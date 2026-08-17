type TelegramWebApp = {
  initData?: string;
  ready?: () => void;
  expand?: () => void;
  requestFullscreen?: () => void;
  openLink?: (url: string) => void;
  isFullscreen?: boolean;
  viewportHeight?: number;
  viewportStableHeight?: number;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  enableVerticalSwipes?: () => void;
  disableVerticalSwipes?: () => void;
  safeAreaInset?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  contentSafeAreaInset?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  onEvent?: (
    eventType:
      | "contentSafeAreaChanged"
      | "safeAreaChanged"
      | "viewportChanged"
      | "fullscreenChanged",
    eventHandler: () => void,
  ) => void;
  offEvent?: (
    eventType:
      | "contentSafeAreaChanged"
      | "safeAreaChanged"
      | "viewportChanged"
      | "fullscreenChanged",
    eventHandler: () => void,
  ) => void;
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export async function waitForTelegramWebApp(timeout = 3_000) {
  if (window.Telegram?.WebApp) return;

  await new Promise<void>((resolve) => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      if (window.Telegram?.WebApp || Date.now() - startedAt >= timeout) {
        window.clearInterval(timer);
        resolve();
      }
    }, 50);
  });
}

export function initializeTelegramWebApp() {
  const webApp = window.Telegram?.WebApp;
  const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(
    navigator.userAgent,
  );
  const syncViewport = () => {
    const inset = webApp?.contentSafeAreaInset ?? webApp?.safeAreaInset;

    document.documentElement.style.setProperty(
      "--jt-tg-safe-top",
      `${inset?.top ?? 0}px`,
    );
    document.documentElement.style.setProperty(
      "--jt-tg-safe-bottom",
      `${inset?.bottom ?? 0}px`,
    );
    document.documentElement.style.setProperty(
      "--jt-tg-viewport-height",
      `${webApp?.viewportHeight ?? window.innerHeight}px`,
    );
    document.documentElement.style.setProperty(
      "--jt-tg-viewport-stable-height",
      `${webApp?.viewportStableHeight ?? window.innerHeight}px`,
    );
  };

  webApp?.ready?.();
  webApp?.expand?.();
  // Oddiy uzun sahifalarda Telegramning native scroll gesture'i faol turishi
  // kerak. Vertical swipe'ni faqat o'zimizda pull-to-refresh kabi gesture
  // bo'lganda o'chirish mumkin.
  webApp?.enableVerticalSwipes?.();
  if (isMobileDevice) webApp?.requestFullscreen?.();
  syncViewport();
  webApp?.onEvent?.("contentSafeAreaChanged", syncViewport);
  webApp?.onEvent?.("safeAreaChanged", syncViewport);
  webApp?.onEvent?.("viewportChanged", syncViewport);
  webApp?.onEvent?.("fullscreenChanged", syncViewport);
  webApp?.setHeaderColor?.("#f8faf8");
  webApp?.setBackgroundColor?.("#f8faf8");

  return () => {
    webApp?.offEvent?.("contentSafeAreaChanged", syncViewport);
    webApp?.offEvent?.("safeAreaChanged", syncViewport);
    webApp?.offEvent?.("viewportChanged", syncViewport);
    webApp?.offEvent?.("fullscreenChanged", syncViewport);
  };
}

export function getTelegramInitData(): string {
  return window.Telegram?.WebApp?.initData ?? "";
}
