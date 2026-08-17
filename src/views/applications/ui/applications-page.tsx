"use client";

import { useEffect, useState } from "react";
import { getJobsFromApi } from "@/entities/job/api/get-jobs";
import { getMockJobs } from "@/entities/job/api/mock-job-repository";
import type { Job } from "@/entities/job/model/types";
import { getCurrentUser } from "@/entities/user/api/get-current-user";
import type { CurrentUser } from "@/entities/user/model/types";
import { ApplicationsPanel } from "@/widgets/role-dashboard/ui/applications-panel";

export function ApplicationsPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [jobs, setJobs] = useState<Job[]>(getMockJobs);
  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
    getJobsFromApi()
      .then(setJobs)
      .catch(() => undefined);
  }, []);
  return (
    <section className="pt-2">
      <ApplicationsPanel
        appliedJobIds={[]}
        jobs={jobs}
        onAddEmployerRole={() => undefined}
        onOpenJob={() => undefined}
        role={user?.activeRole}
      />
    </section>
  );
}
