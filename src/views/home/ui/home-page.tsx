"use client";

import { useEffect, useMemo, useState } from "react";
import { getJobsFromApi } from "@/entities/job/api/get-jobs";
import { getMockJobs } from "@/entities/job/api/mock-job-repository";
import type { Job } from "@/entities/job/model/types";
import { createApplication } from "@/features/apply-to-job/api/create-application";
import { createGroupApplication } from "@/features/apply-to-job/api/create-group-application";
import {
  CategoryFilter,
  type CategoryFilterValue,
} from "@/features/job-filter/ui/category-filter";
import { messages, type Language } from "@/shared/config/locale";
import { LanguageSwitch } from "@/features/language-switch/ui/language-switch";
import { useTranslations } from "next-intl";
import { JobDetailsSheet } from "@/widgets/job-details/ui/job-details-sheet";
import { JobFeed } from "@/widgets/job-feed/ui/job-feed";

export function HomePage() {
  const [category, setCategory] = useState<CategoryFilterValue>("Barchasi");
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<string[]>([]);
  const [applicationError, setApplicationError] = useState("");
  const language: Language = "uz";
  const text = messages[language];
  const t = useTranslations("Jobs");
  const [allJobs, setAllJobs] = useState<Job[]>(getMockJobs);
  const visibleJobs = useMemo(
    () =>
      category === "Barchasi"
        ? allJobs
        : allJobs.filter((job) => job.category === category),
    [allJobs, category],
  );

  useEffect(() => {
    getJobsFromApi()
      .then(setAllJobs)
      .catch(() => undefined);
  }, []);

  async function applyToJob() {
    if (!activeJob || applications.includes(activeJob.id)) return;
    setApplicationError("");
    try {
      await createApplication(activeJob.id);
      setApplications((current) => [...current, activeJob.id]);
    } catch (error) {
      setApplicationError(
        error instanceof Error ? error.message : "Ariza yuborib bo‘lmadi",
      );
    }
  }

  async function applyGroupToJob(usernames: string[]) {
    if (!activeJob) return;
    await createGroupApplication(activeJob.id, usernames);
    setApplications((current) => [...current, activeJob.id]);
  }

  return (
    <>
      <header className="flex min-h-10 items-center justify-between">
        <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-emerald-700 text-lg text-white">
            J
          </span>
          JobTop
        </div>
        <LanguageSwitch />
      </header>
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
        onOpenJob={setActiveJob}
      />
      {activeJob && (
        <JobDetailsSheet
          job={activeJob}
          text={text}
          applied={applications.includes(activeJob.id)}
          error={applicationError}
          onApply={applyToJob}
          onApplyGroup={applyGroupToJob}
          onClose={() => setActiveJob(null)}
        />
      )}
    </>
  );
}
