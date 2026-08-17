import type { PropsWithChildren } from "react";
import { AppNavigation } from "@/widgets/app-navigation/ui/app-navigation";

export default function MainLayout({ children }: PropsWithChildren) {
  return (
    <main className="jobtop-app">
      {children}
      <AppNavigation />
    </main>
  );
}
