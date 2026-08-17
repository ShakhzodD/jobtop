"use client";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  ClipboardList,
  MapPin,
  Phone,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { EmployerApplication } from "@/entities/application/model/employer-application";
import type { EmployerJob } from "@/entities/job/model/types";
import {
  getEmployerJobs,
  getJobApplications,
  selectGroupApplication,
  type GroupApplication,
} from "@/features/manage-applications/api/employer-jobs";
import { selectWorker } from "@/features/select-worker/api/select-worker";
import { completeJob } from "@/features/manage-applications/api/complete-job";

const statusLabel: Record<EmployerJob["status"], string> = {
  pending_moderation: "Moderatsiyada",
  published: "Ochiq",
  filled: "To‘lgan",
  cancelled: "Rad etilgan",
};

function getAge(birthDate: string | null) {
  if (!birthDate) return null;
  const birth = new Date(`${birthDate}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birth.getDate())
  ) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

type Props = {
  hideHeader?: boolean;
};

export function EmployerApplicationsPanel({ hideHeader = false }: Props) {
  const queryClient = useQueryClient();
  const [selectedJobId, setSelectedJobId] = useState<string>();
  const [error, setError] = useState("");
  const jobsQuery = useQuery({
    queryKey: ["employer", "jobs"],
    queryFn: getEmployerJobs,
  });
  const jobs = jobsQuery.data ?? [];
  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? null;
  const applicationsQuery = useQuery({
    queryKey: ["employer", "jobs", selectedJobId, "applications"],
    queryFn: () => getJobApplications(selectedJobId!),
    enabled: Boolean(selectedJobId),
  });
  const refreshSelectedJob = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["employer", "jobs"] }),
      queryClient.invalidateQueries({
        queryKey: ["employer", "jobs", selectedJobId, "applications"],
      }),
    ]);
  };
  const selectWorkerMutation = useMutation({
    mutationFn: selectWorker,
    onSuccess: refreshSelectedJob,
  });
  const selectGroupMutation = useMutation({
    mutationFn: selectGroupApplication,
    onSuccess: refreshSelectedJob,
  });
  const completeJobMutation = useMutation({
    mutationFn: completeJob,
    onSuccess: refreshSelectedJob,
  });
  const applications = applicationsQuery.data?.applications ?? [];
  const groupApplications = applicationsQuery.data?.groupApplications ?? [];
  const requestError = [jobsQuery.error, applicationsQuery.error].find(
    (queryError): queryError is Error => queryError instanceof Error,
  )?.message;

  async function handleSelect(application: EmployerApplication) {
    if (!selectedJob || application.status === "selected") return;
    setError("");
    try {
      await selectWorkerMutation.mutateAsync(application.id);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Nomzod tanlab bo‘lmadi",
      );
    }
  }

  async function handleSelectGroup(group: GroupApplication) {
    if (!selectedJob) return;
    try {
      await selectGroupMutation.mutateAsync(group.id);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Guruhni tanlab bo‘lmadi",
      );
    }
  }

  async function handleCompleteJob() {
    if (!selectedJob) return;
    try {
      await completeJobMutation.mutateAsync(selectedJob.id);
      setError(
        "Ish yakunlandi. Tanlangan ishchilarga tasdiqlash xabari yuborildi.",
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Ishni yakunlab bo‘lmadi",
      );
    }
  }

  if (jobsQuery.isLoading) {
    return (
      <section className="grid min-h-64 place-items-center text-sm text-muted-foreground">
        E’lonlar yuklanmoqda...
      </section>
    );
  }

  if (selectedJob) {
    const canSelect =
      selectedJob.status === "published" &&
      selectedJob.selectedCount < selectedJob.openings;
    return (
      <section>
        <Button
          className="mb-4"
          onClick={() => setSelectedJobId(undefined)}
          size="sm"
          variant="ghost"
        >
          <ArrowLeft /> E’lonlarim
        </Button>
        <div className="mb-5 rounded-3xl border border-border bg-card p-4">
          <span className="rounded-md bg-emerald-100 px-2 py-1 text-[10px] font-extrabold text-emerald-800">
            {selectedJob.category}
          </span>
          <h1 className="mt-3 text-xl font-bold">{selectedJob.title}</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <UsersRound className="size-4" /> {selectedJob.selectedCount}/
            {selectedJob.openings} ishchi tanlangan
          </p>
        </div>
        <h2 className="mb-3 text-lg font-semibold">Qiziqish bildirganlar</h2>
        {selectedJob.status === "filled" && (
          <Button
            className="mb-3 w-full"
            disabled={completeJobMutation.isPending}
            onClick={() => void handleCompleteJob()}
          >
            <Check /> Ish bajarildi
          </Button>
        )}
        {(error || requestError) && (
          <p className="mb-3 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            {error || requestError}
          </p>
        )}
        {applicationsQuery.isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Arizalar yuklanmoqda...
          </p>
        ) : applications.length || groupApplications.length ? (
          <div className="grid gap-3">
            {groupApplications.map((group) => (
              <article
                className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4"
                key={group.id}
              >
                <h3 className="font-semibold">
                  Guruh arizasi · {group.memberCount} kishi
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {group.status === "ready"
                    ? "Barcha a’zolar tasdiqlagan"
                    : group.status === "selected"
                      ? "Guruh tanlangan"
                      : "A’zolar tasdiqlashi kutilmoqda"}
                </p>
                <div className="mt-3 grid gap-2">
                  {group.members.map((member, index) => (
                    <div
                      className="rounded-xl bg-card p-3 text-sm"
                      key={`${group.id}-${index}`}
                    >
                      <b>
                        {member.user?.full_name ?? "Noma’lum foydalanuvchi"}
                      </b>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {member.user?.district ?? "Tuman ko‘rsatilmagan"} ·{" "}
                        {member.user?.birth_date
                          ? `${getAge(member.user.birth_date)} yosh`
                          : "Yoshi kiritilmagan"}{" "}
                        · {member.user?.experience_years ?? 0} yil tajriba
                      </p>
                      {member.user?.about && (
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          {member.user.about}
                        </p>
                      )}
                      <span className="mt-2 inline-block text-[11px] font-semibold text-emerald-800">
                        {member.status === "pending"
                          ? "⏳ Tasdiqlash kutilmoqda"
                          : "✓ Tasdiqlagan"}
                      </span>
                    </div>
                  ))}
                </div>
                {group.status === "ready" && (
                  <Button
                    className="mt-3 w-full bg-emerald-700 hover:bg-emerald-800"
                    disabled={!canSelect || selectGroupMutation.isPending}
                    onClick={() => handleSelectGroup(group)}
                  >
                    <UsersRound /> Guruhni tanlash
                  </Button>
                )}
              </article>
            ))}
            {applications.map((application) => {
              const isSelected = application.status === "selected";
              return (
                <article
                  className="rounded-2xl border border-border bg-card p-4"
                  key={application.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">
                        {application.worker?.fullName ?? "Noma’lum ishchi"}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" />
                        {application.worker?.district ?? "Tuman ko‘rsatilmagan"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {[
                          getAge(application.worker?.birthDate ?? null) &&
                            `${getAge(application.worker?.birthDate ?? null)} yosh`,
                          application.worker?.experienceYears != null &&
                            `${application.worker.experienceYears} yil tajriba`,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Qo‘shimcha ma’lumot kiritilmagan"}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">
                        Tanlangan
                      </span>
                    )}
                  </div>
                  {application.note && (
                    <p className="mt-3 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
                      {application.note}
                    </p>
                  )}
                  {application.worker?.about && (
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {application.worker.about}
                    </p>
                  )}
                  {isSelected && application.worker?.phone && (
                    <a
                      className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800"
                      href={`tel:${application.worker.phone}`}
                    >
                      <Phone className="size-4" /> {application.worker.phone}
                    </a>
                  )}
                  {!isSelected && (
                    <Button
                      className="mt-4 w-full bg-emerald-700 hover:bg-emerald-800"
                      disabled={!canSelect || selectWorkerMutation.isPending}
                      onClick={() => handleSelect(application)}
                    >
                      <Check /> Ishchini tanlash
                    </Button>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <section className="grid min-h-52 place-items-center gap-2 rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/50 p-7 text-center">
            <ClipboardList className="size-8 text-emerald-700" />
            <p className="max-w-72 text-sm leading-6 text-muted-foreground">
              Hozircha bu e’longa qiziqish bildirgan ishchi yo‘q.
            </p>
          </section>
        )}
      </section>
    );
  }

  return (
    <section>
      {!hideHeader && (
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="mb-1 text-[10px] font-black tracking-[0.14em] text-emerald-700">
              ISH BERUVCHI
            </p>
            <h1 className="text-2xl font-bold tracking-tight">E’lonlarim</h1>
          </div>
          <span className="grid size-8 place-items-center rounded-full bg-emerald-100 text-sm font-extrabold text-emerald-800">
            {jobs.length}
          </span>
        </div>
      )}
      {(error || requestError) && (
        <p className="mb-3 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          {error || requestError}
        </p>
      )}
      {jobs.length ? (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <Button
              className="h-auto justify-between rounded-2xl border border-border bg-card p-4 text-left hover:bg-muted/40"
              key={job.id}
              onClick={() => {
                setError("");
                setSelectedJobId(job.id);
              }}
              variant="outline"
            >
              <span>
                <span className="block text-[10px] font-extrabold tracking-[0.1em] text-emerald-700">
                  {statusLabel[job.status]} · {job.category}
                </span>
                <b className="mt-1 block text-base">{job.title}</b>
                <small className="mt-1 block text-muted-foreground">
                  {job.district} · {job.payAmount.toLocaleString("uz-UZ")} so‘m
                </small>
              </span>
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-sm font-extrabold text-emerald-800">
                {job.applicationCount}
              </span>
            </Button>
          ))}
        </div>
      ) : (
        <section className="grid min-h-64 place-items-center gap-2 rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/50 p-7 text-center">
          <BriefcaseBusiness className="size-8 text-emerald-700" />
          <h2 className="text-xl font-semibold">E’lon yo‘q</h2>
          <p className="max-w-72 text-sm leading-6 text-muted-foreground">
            Yaratgan e’lonlaringiz shu bo‘limda va ularga kelgan arizalar bilan
            ko‘rinadi.
          </p>
        </section>
      )}
    </section>
  );
}
