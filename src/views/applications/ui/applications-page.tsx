"use client";

import { useUserStore } from "@/entities/user/model/user-store";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@bprogress/next/app";
import { getWorkerApplications } from "@/entities/application/api/get-worker-applications";
import { ApplicationsPanel } from "@/widgets/role-dashboard/ui/applications-panel";

export function ApplicationsPage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const status = useUserStore((state) => state.status);
  const workerApplicationsQuery = useQuery({
    queryKey: ["worker", "applications"],
    queryFn: getWorkerApplications,
    enabled: user?.activeRole === "worker",
  });
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
        applications={workerApplicationsQuery.data ?? []}
        error={
          workerApplicationsQuery.error instanceof Error
            ? workerApplicationsQuery.error.message
            : undefined
        }
        isLoading={workerApplicationsQuery.isLoading}
        onOpenJob={(jobId) => router.push(`/?job=${jobId}`)}
        role={user?.activeRole}
      />
    </section>
  );
}
