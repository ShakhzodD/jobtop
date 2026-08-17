"use client";

import { useEffect, useMemo, useState } from "react";
import { getJobsFromApi } from "@/entities/job/api/get-jobs";
import { getMockJobs } from "@/entities/job/api/mock-job-repository";
import type { Job } from "@/entities/job/model/types";
import { getCurrentUser, updateCurrentUserRole } from "@/entities/user/api/get-current-user";
import type { CurrentUser, UserRole } from "@/entities/user/model/types";
import { createApplication } from "@/features/apply-to-job/api/create-application";
import {
  CategoryFilter,
  type CategoryFilterValue,
} from "@/features/job-filter/ui/category-filter";
import { CreateJobSheet } from "@/features/create-job/ui/create-job-sheet";
import { RoleProfilePanel } from "@/features/profile/ui/role-profile-panel";
import { LanguageSwitch } from "@/features/language-switch/ui/language-switch";
import { messages, type Language } from "@/shared/config/locale";
import { initializeTelegramWebApp } from "@/shared/lib/telegram/initialize-web-app";
import { JobDetailsSheet } from "@/widgets/job-details/ui/job-details-sheet";
import { JobFeed } from "@/widgets/job-feed/ui/job-feed";

export function HomePage() {
  const [category, setCategory] = useState<CategoryFilterValue>("Barchasi");
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<string[]>([]);
  const [applicationError, setApplicationError] = useState("");
  const [language, setLanguage] = useState<Language>("uz");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [profileBusy, setProfileBusy] = useState(false);
  const [screen, setScreen] = useState<"jobs" | "profile">("jobs");
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
    initializeTelegramWebApp();
    getJobsFromApi()
      .then(setAllJobs)
      .catch(() => undefined);
    getCurrentUser().then(setUser).catch(() => undefined);
  }, []);

  async function applyToJob() {
    if (!activeJob || applications.includes(activeJob.id)) return;
    setApplicationError("");
    try {
      await createApplication(activeJob.id);
      setApplications(current => [...current, activeJob.id]);
    } catch (error) {
      setApplicationError(error instanceof Error ? error.message : "Ariza yuborib bo‘lmadi");
    }
  }

  async function selectRole(role: UserRole, addRole = false) {
    setProfileBusy(true);
    try {
      await updateCurrentUserRole(role, addRole);
      setUser(await getCurrentUser());
      setScreen("jobs");
    } finally {
      setProfileBusy(false);
    }
  }

  const isEmployer = user?.activeRole === "employer";

  return (
    <main className="jobtop-app">
      <header className="jt-topbar">
        <div className="jt-brand">
          <span>J</span>JobTop
        </div>
        <LanguageSwitch language={language} onChange={setLanguage} />
      </header>
      <section className="jt-greeting">
        <p>TOSHKENT · BUGUN</p>
        <h1>{text.greeting}</h1>
        <span>{text.headline}</span>
      </section>
      {user && <div className="jt-role-status"><span>{isEmployer ? "💼 Ish beruvchi" : "👷 Ishchi"}</span><button onClick={() => setScreen("profile")} type="button">Almashtirish</button></div>}
      {screen === "profile" && user ? <RoleProfilePanel busy={profileBusy} onSelectRole={selectRole} user={user} /> : <>
        {isEmployer && <button className="jt-create" type="button" onClick={() => setIsCreateOpen(true)}><b>＋</b>{text.create}</button>}
        {!isEmployer && user && <button className="jt-worker-hint" onClick={() => setScreen("profile")} type="button">💼 E’lon berish uchun ish beruvchi rolini qo‘shing</button>}
        <CategoryFilter activeCategory={category} allLabel={text.all} onChange={setCategory} />
        <JobFeed jobs={visibleJobs} title={text.newJobs} detailLabel={text.detail} onOpenJob={setActiveJob} />
      </>}
      <nav className="jt-nav" aria-label="Asosiy navigatsiya">
        <button className={screen === "jobs" ? "selected" : ""} onClick={() => setScreen("jobs")} type="button">
          <strong>⌂</strong>
          <span>{text.jobs}</span>
        </button>
        <button type="button">
          <strong>▢</strong>
          <span>{text.applications}</span>
        </button>
        <button className={screen === "profile" ? "selected" : ""} onClick={() => setScreen("profile")} type="button">
          <strong>◉</strong>
          <span>{text.profile}</span>
        </button>
      </nav>
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
      {isCreateOpen && (
        <CreateJobSheet
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => setIsCreateOpen(false)}
        />
      )}
    </main>
  );
}
