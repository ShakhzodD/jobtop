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
import { AppNavigation, type AppScreen } from "@/widgets/app-navigation/ui/app-navigation";
import { ApplicationsPanel } from "@/widgets/role-dashboard/ui/applications-panel";
import { Button } from "@/components/ui/button";
import { Plus, UserRound } from "lucide-react";

export function HomePage() {
  const [category, setCategory] = useState<CategoryFilterValue>("Barchasi");
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<string[]>([]);
  const [applicationError, setApplicationError] = useState("");
  const [language, setLanguage] = useState<Language>("uz");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [profileBusy, setProfileBusy] = useState(false);
  const [screen, setScreen] = useState<AppScreen>("jobs");
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

  function navigate(nextScreen: AppScreen) {
    setActiveJob(null);
    setScreen(nextScreen);
  }

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
      {user && <div className="jt-role-status"><span>{isEmployer ? "💼 Ish beruvchi rejimi" : "👷 Ishchi rejimi"}</span><Button onClick={() => navigate("profile")} size="xs" variant="ghost">Almashtirish</Button></div>}
      {screen === "profile" && (user ? <RoleProfilePanel busy={profileBusy} onSelectRole={selectRole} user={user} /> : <section className="jt-empty-panel"><UserRound className="size-8" /><h2>Profil topilmadi</h2><p>Botda /start ni bosing, rolni va telefon raqamingizni tanlang.</p></section>)}
      {screen === "applications" && <ApplicationsPanel appliedJobIds={applications} jobs={allJobs} onAddEmployerRole={() => navigate("profile")} onOpenJob={setActiveJob} role={user?.activeRole} />}
      {screen === "jobs" && <>
        {isEmployer && <Button className="jt-create h-12 w-full rounded-2xl bg-emerald-700 text-base hover:bg-emerald-800" onClick={() => setIsCreateOpen(true)} size="lg"><Plus /> {text.create}</Button>}
        {!isEmployer && user && <Button className="mb-2 h-auto w-full justify-start rounded-2xl border-emerald-100 py-3 text-left text-emerald-800" onClick={() => navigate("profile")} variant="outline">💼 E’lon berish uchun ish beruvchi rolini qo‘shing</Button>}
        <CategoryFilter activeCategory={category} allLabel={text.all} onChange={setCategory} />
        <JobFeed jobs={visibleJobs} title={isEmployer ? "Ishchilarga ko‘rinadigan e’lonlar" : text.newJobs} detailLabel={text.detail} onOpenJob={setActiveJob} />
      </>}
      <AppNavigation activeScreen={screen} onChange={navigate} />
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
