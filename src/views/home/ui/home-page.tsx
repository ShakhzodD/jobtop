"use client";

import { useEffect, useMemo, useState } from "react";
import { getJobsFromApi } from "@/entities/job/api/get-jobs";
import { getMockJobs } from "@/entities/job/api/mock-job-repository";
import type { Job } from "@/entities/job/model/types";
import { createApplication } from "@/features/apply-to-job/api/create-application";
import {
  CategoryFilter,
  type CategoryFilterValue,
} from "@/features/job-filter/ui/category-filter";
import { messages, type Language } from "@/shared/config/locale";
import { JobDetailsSheet } from "@/widgets/job-details/ui/job-details-sheet";
import { JobFeed } from "@/widgets/job-feed/ui/job-feed";

export function HomePage() {
  const [category, setCategory] = useState<CategoryFilterValue>("Barchasi");
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<string[]>([]);
  const [applicationError, setApplicationError] = useState("");
  const language: Language = "uz";
  const text = messages[language];
  const [allJobs, setAllJobs] = useState<Job[]>(getMockJobs);
  const visibleJobs = useMemo(
    () =>
      category === "Barchasi"
        ? allJobs
        : allJobs.filter(job => job.category === category),
    [allJobs, category]
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
      setApplications(current => [...current, activeJob.id]);
    } catch (error) {
      setApplicationError(
        error instanceof Error ? error.message : "Ariza yuborib bo‘lmadi"
      );
    }
  }

  return (
    <>
      <header className="jt-topbar">
        <div className="jt-brand">
          <span>J</span>JobTop
        </div>
      </header>
      <section className="jt-greeting">
        <p>TOSHKENT · BUGUN</p>
        <h1>{text.newJobs}</h1>
        <span>Bugun e’lon qilingan bir kunlik ishlar</span>
      </section>
      <CategoryFilter activeCategory={category} allLabel={text.all} onChange={setCategory} />
      <JobFeed jobs={visibleJobs} title={text.newJobs} detailLabel={text.detail} onOpenJob={setActiveJob} />
      {activeJob && (
        <JobDetailsSheet
          job={activeJob}
          text={text}
          applied={applications.includes(activeJob.id)}
          error={applicationError}
          onApply={applyToJob}
          onClose={() => setActiveJob(null)}
        />
      )}
    </>
  );
}
