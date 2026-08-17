type TelegramWebApp = {
  initData?: string;
  ready?: () => void;
  expand?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  disableVerticalSwipes?: () => void;
  contentSafeAreaInset?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  onEvent?: (
    eventType: "contentSafeAreaChanged" | "viewportChanged",
    eventHandler: () => void,
  ) => void;
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function initializeTelegramWebApp() {
  const webApp = window.Telegram?.WebApp;
  const syncInsets = () => {
    const inset = webApp?.contentSafeAreaInset;
    document.documentElement.style.setProperty(
      "--jt-tg-safe-top",
      `${inset?.top ?? 0}px`,
    );
    document.documentElement.style.setProperty(
      "--jt-tg-safe-bottom",
      `${inset?.bottom ?? 0}px`,
    );
  };

  webApp?.ready?.();
  webApp?.expand?.();
  webApp?.disableVerticalSwipes?.();
  syncInsets();
  webApp?.onEvent?.("contentSafeAreaChanged", syncInsets);
  webApp?.setHeaderColor?.("#f8faf8");
  webApp?.setBackgroundColor?.("#f8faf8");
}

export function getTelegramInitData(): string {
  return window.Telegram?.WebApp?.initData ?? "";
}
