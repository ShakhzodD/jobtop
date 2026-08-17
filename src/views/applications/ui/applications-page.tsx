"use client";

import { useState } from "react";
import { useUserStore } from "@/entities/user/model/user-store";
import { useQuery } from "@tanstack/react-query";
import { getWorkerApplications } from "@/entities/application/api/get-worker-applications";
import type { WorkerApplication } from "@/entities/application/model/worker-application";
import type { Job } from "@/entities/job/model/types";
import { messages, type Language } from "@/shared/config/locale";
import { formatJobSchedule } from "@/shared/lib/format-job-schedule";
import { ApplicationsPanel } from "@/widgets/role-dashboard/ui/applications-panel";
import { JobDetailsSheet } from "@/widgets/job-details/ui/job-details-sheet";

function toJob(application: WorkerApplication): Job | null {
  if (!application.job) return null;
  const { job } = application;
  return {
    id: job.id,
    category: job.category,
    title: job.title,
    company: job.company,
    district: job.district,
    schedule: formatJobSchedule(job.startsAt, job.endsAt),
    startsAt: job.startsAt,
    endsAt: job.endsAt,
    pay: job.payAmount,
    openings: job.openings,
  };
}

export function ApplicationsPage() {
  const user = useUserStore((state) => state.user);
  const status = useUserStore((state) => state.status);
  const [activeApplication, setActiveApplication] =
    useState<WorkerApplication | null>(null);
  const language: Language = "uz";
  const activeJob = activeApplication ? toJob(activeApplication) : null;
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
    <>
      <section className="pt-2">
        <ApplicationsPanel
          applications={workerApplicationsQuery.data ?? []}
          error={
            workerApplicationsQuery.error instanceof Error
              ? workerApplicationsQuery.error.message
              : undefined
          }
          isLoading={workerApplicationsQuery.isLoading}
          onOpenJob={setActiveApplication}
          role={user?.activeRole}
        />
      </section>
      {activeJob && (
        <JobDetailsSheet
          applied
          job={activeJob}
          onApply={() => undefined}
          onApplyGroup={async () => undefined}
          onClose={() => setActiveApplication(null)}
          text={messages[language]}
        />
      )}
    </>
  );
}
