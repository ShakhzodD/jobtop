"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/entities/user/api/get-current-user";
import type { CurrentUser } from "@/entities/user/model/types";
import { ApplicationsPanel } from "@/widgets/role-dashboard/ui/applications-panel";

export function ApplicationsPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);
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
