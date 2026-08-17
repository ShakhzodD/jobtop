"use client";

import { BriefcaseBusiness, ClipboardList, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AppScreen = "jobs" | "applications" | "profile";

type Props = {
  activeScreen: AppScreen;
  onChange: (screen: AppScreen) => void;
};

const navigation = [
  { id: "jobs", label: "Ishlar", icon: BriefcaseBusiness },
  { id: "applications", label: "Arizalar", icon: ClipboardList },
  { id: "profile", label: "Profil", icon: UserRound },
] as const;

export function AppNavigation({ activeScreen, onChange }: Props) {
  return (
    <nav className="jt-nav" aria-label="Asosiy navigatsiya">
      {navigation.map(({ id, label, icon: Icon }) => (
        <Button
          className={cn("h-auto flex-col gap-1 rounded-xl py-1 text-[11px]", activeScreen === id && "bg-emerald-50 text-emerald-700 hover:bg-emerald-50")}
          key={id}
          onClick={() => onChange(id)}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Icon className="size-4" />
          {label}
        </Button>
      ))}
    </nav>
  );
}
