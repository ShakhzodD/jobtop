"use client";

import { useUserStore } from "@/entities/user/model/user-store";
import { ApplicationsPanel } from "@/widgets/role-dashboard/ui/applications-panel";

export function ApplicationsPage() {
  const user = useUserStore((state) => state.user);
  const status = useUserStore((state) => state.status);
  if (status !== "ready") {
    return (
      <section className="grid min-h-64 place-items-center text-sm text-muted-foreground">
        Profil yuklanmoqda...
      </section>
    );
  }
  return (
    <section className="pt-2">
      <ApplicationsPanel
        appliedJobIds={[]}
        jobs={[]}
        onAddEmployerRole={() => undefined}
        onOpenJob={() => undefined}
        role={user?.activeRole}
      />
    </section>
  );
}
