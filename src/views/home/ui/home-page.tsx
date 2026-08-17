"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@bprogress/next/app";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BriefcaseBusiness } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getJobsFromApi } from "@/entities/job/api/get-jobs";
import type { Job } from "@/entities/job/model/types";
import { useUserStore } from "@/entities/user/model/user-store";
import { createApplication } from "@/features/apply-to-job/api/create-application";
import { createGroupApplication } from "@/features/apply-to-job/api/create-group-application";
import {
  CategoryFilter,
  type CategoryFilterValue,
} from "@/features/job-filter/ui/category-filter";
import { messages, type Language } from "@/shared/config/locale";
import { useTranslations } from "next-intl";
import { JobDetailsSheet } from "@/widgets/job-details/ui/job-details-sheet";
import { EmployerApplicationsPanel } from "@/widgets/employer-applications/ui/employer-applications-panel";
import { JobFeed } from "@/widgets/job-feed/ui/job-feed";

export function HomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);
  const [category, setCategory] = useState<CategoryFilterValue>("Barchasi");
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<string[]>([]);
  const [applicationError, setApplicationError] = useState("");
  const [dismissedNotificationJobId, setDismissedNotificationJobId] =
    useState<string>();
  const language: Language = "uz";
  const text = messages[language];
  const t = useTranslations("Jobs");
  const isEmployer = user?.activeRole === "employer";
  const jobsQuery = useQuery({
    queryKey: ["jobs", "published"],
    queryFn: getJobsFromApi,
    enabled: !isEmployer,
  });
  const visibleJobs = useMemo(() => {
    const jobs = jobsQuery.data ?? [];
    return category === "Barchasi"
      ? jobs
      : jobs.filter((job) => job.category === category);
  }, [jobsQuery.data, category]);

  const applyMutation = useMutation({
    mutationFn: createApplication,
    onSuccess: (_, jobId) => {
      setApplications((current) => [...current, jobId]);
      return queryClient.invalidateQueries({
        queryKey: ["worker", "applications"],
      });
    },
  });
  const groupApplyMutation = useMutation({
    mutationFn: ({
      jobId,
      usernames,
    }: {
      jobId: string;
      usernames: string[];
    }) => createGroupApplication(jobId, usernames),
    onSuccess: (_, { jobId }) => {
      setApplications((current) => [...current, jobId]);
      return queryClient.invalidateQueries({
        queryKey: ["worker", "applications"],
      });
    },
  });

  const notificationJob = useMemo(() => {
    if (isEmployer || typeof window === "undefined" || !jobsQuery.data)
      return null;
    const jobId = new URLSearchParams(window.location.search).get("job");
    if (!jobId || jobId === dismissedNotificationJobId) return null;
    return jobsQuery.data.find((job) => job.id === jobId) ?? null;
  }, [dismissedNotificationJobId, isEmployer, jobsQuery.data]);
  const openedJob = activeJob ?? notificationJob;

  function openJob(job: Job) {
    if (notificationJob) setDismissedNotificationJobId(notificationJob.id);
    setActiveJob(job);
  }

  function closeJob() {
    if (!activeJob && notificationJob)
      setDismissedNotificationJobId(notificationJob.id);
    setActiveJob(null);
  }

  async function applyToJob() {
    if (!openedJob || applications.includes(openedJob.id)) return;
    setApplicationError("");
    try {
      await applyMutation.mutateAsync(openedJob.id);
    } catch (error) {
      setApplicationError(
        error instanceof Error ? error.message : "Ariza yuborib bo‘lmadi",
      );
    }
  }

  async function applyGroupToJob(usernames: string[]) {
    if (!openedJob) return;
    await groupApplyMutation.mutateAsync({ jobId: openedJob.id, usernames });
  }

  return (
    <>
      <header className="flex min-h-10 items-center">
        <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
          <Image
            src="/jobtop-logo.png"
            alt="JobTop"
            width={32}
            height={32}
            className="size-8 rounded-lg"
            priority
          />
          JobTop
        </div>
      </header>
      {isEmployer ? (
        <>
          <section className="px-0.5 py-7">
            <p className="mb-2 text-[10px] font-extrabold tracking-[0.15em] text-emerald-700">
              ISH BERUVCHI REJIMI
            </p>
            <h1 className="text-3xl font-bold tracking-tight">E’lonlaringiz</h1>
            <span className="mt-2 block text-sm text-muted-foreground">
              E’lonlar holati va ularga kelgan arizalarni boshqaring.
            </span>
            <Button
              className="mt-5 h-12 w-full bg-emerald-700 hover:bg-emerald-800"
              onClick={() => router.push("/jobs/new")}
            >
              <BriefcaseBusiness /> E’lon yaratish
            </Button>
          </section>
          <EmployerApplicationsPanel hideHeader />
        </>
      ) : (
        <>
          <section className="px-0.5 py-7">
            <p className="mb-2 text-[10px] font-extrabold tracking-[0.15em] text-emerald-700">
              TOSHKENT · BUGUN
            </p>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <span className="mt-2 block text-sm text-muted-foreground">
              {t("subtitle")}
            </span>
          </section>
          <CategoryFilter
            activeCategory={category}
            allLabel={text.all}
            onChange={setCategory}
          />
          <JobFeed
            jobs={visibleJobs}
            title={text.newJobs}
            detailLabel={text.detail}
            emptyLabel={t("empty")}
            loadingLabel={t("loading")}
            isLoading={!isEmployer && jobsQuery.isLoading}
            onOpenJob={openJob}
          />
          {openedJob && (
            <JobDetailsSheet
              job={openedJob}
              text={text}
              applied={applications.includes(openedJob.id)}
              error={applicationError}
              onApply={applyToJob}
              onApplyGroup={applyGroupToJob}
              onClose={closeJob}
            />
          )}
        </>
      )}
    </>
  );
}
