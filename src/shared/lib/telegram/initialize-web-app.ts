type TelegramWebApp = {
  initData?: string;
  ready?: () => void;
  expand?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  disableVerticalSwipes?: () => void;
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function initializeTelegramWebApp() {
  const webApp = window.Telegram?.WebApp;
  webApp?.ready?.();
  webApp?.expand?.();
  webApp?.disableVerticalSwipes?.();
  webApp?.setHeaderColor?.("#f8faf8");
  webApp?.setBackgroundColor?.("#f8faf8");
}

export function getTelegramInitData(): string {
  return window.Telegram?.WebApp?.initData ?? "";
}
