import type { PropsWithChildren } from "react";
import { AppNavigation } from "@/widgets/app-navigation/ui/app-navigation";

export default function MainLayout({ children }: PropsWithChildren) {
  return (
    <main className="mx-auto min-h-[var(--tg-viewport-stable-height,100dvh)] w-full max-w-[540px] overscroll-y-contain bg-background px-4 pt-[max(112px,calc(var(--tg-safe-area-inset-top,0px)+var(--tg-content-safe-area-inset-top,0px)+var(--jt-tg-safe-top,0px)+20px))] pb-[calc(90px+env(safe-area-inset-bottom)+var(--tg-safe-area-inset-bottom,0px)+var(--tg-content-safe-area-inset-bottom,0px)+var(--jt-tg-safe-bottom,0px))] text-foreground max-[380px]:px-3.5">
      {children}
      <AppNavigation />
    </main>
  );
}
