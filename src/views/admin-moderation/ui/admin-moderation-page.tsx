"use client";

import {
  Check,
  CircleAlert,
  Clock3,
  MapPin,
  UsersRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { ModerationJob } from "@/entities/job/model/types";
import {
  getPendingJobs,
  moderateJob,
} from "@/features/moderate-job/api/moderate-job";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
}

export function AdminModerationPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const pendingJobsQuery = useQuery({
    queryKey: ["admin", "pending-jobs"],
    queryFn: getPendingJobs,
  });
  const moderationMutation = useMutation({
    mutationFn: ({
      jobId,
      action,
    }: {
      jobId: string;
      action: "publish" | "reject";
    }) => moderateJob(jobId, action),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "pending-jobs"] }),
  });
  const jobs = pendingJobsQuery.data ?? [];
  const requestError =
    pendingJobsQuery.error instanceof Error
      ? pendingJobsQuery.error.message
      : "E’lonlarni yuklab bo‘lmadi";

  async function handleModeration(
    job: ModerationJob,
    action: "publish" | "reject",
  ) {
    if (
      action === "reject" &&
      !window.confirm(`“${job.title}” e’lonini rad etasizmi?`)
    ) {
      return;
    }

    setError("");
    try {
      await moderationMutation.mutateAsync({ jobId: job.id, action });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Moderatsiya bajarilmadi",
      );
    }
  }

  if (pendingJobsQuery.isLoading) {
    return (
      <section className="grid min-h-64 place-items-center text-sm text-muted-foreground">
        E’lonlar yuklanmoqda...
      </section>
    );
  }

  if ((error || pendingJobsQuery.error) && !jobs.length) {
    return (
      <section className="grid min-h-64 place-items-center gap-3 rounded-3xl border border-dashed border-destructive/30 bg-destructive/5 p-7 text-center">
        <CircleAlert className="size-8 text-destructive" />
        <p className="max-w-72 text-sm text-muted-foreground">
          {error || requestError}
        </p>
      </section>
    );
  }

  return (
    <section className="pt-2">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-[10px] font-black tracking-[0.14em] text-emerald-700">
            ADMIN
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Moderatsiya</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            E’lon tekshiruvdan keyin ishchilarga ko‘rinadi.
          </p>
        </div>
        <span className="grid size-8 place-items-center rounded-full bg-emerald-100 text-sm font-extrabold text-emerald-800">
          {jobs.length}
        </span>
      </header>

      {(error || pendingJobsQuery.error) && (
        <p className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          {error || requestError}
        </p>
      )}

      {jobs.length ? (
        <div className="grid gap-3">
          {jobs.map((job) => {
            const isBusy = moderationMutation.isPending;
            return (
              <article
                className="rounded-3xl border border-border bg-card p-4 shadow-sm"
                key={job.id}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-md bg-emerald-100 px-2 py-1 text-[10px] font-extrabold text-emerald-800">
                      {job.category}
                    </span>
                    <h2 className="mt-3 text-lg font-bold">{job.title}</h2>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(job.createdAt)}
                  </span>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {job.description}
                </p>
                {job.sourceName && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    AI manbasi:{" "}
                    {job.sourceUrl ? (
                      <a
                        className="font-semibold text-emerald-700 underline"
                        href={job.sourceUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {job.sourceName}
                      </a>
                    ) : (
                      job.sourceName
                    )}
                  </p>
                )}
                <div className="my-4 grid gap-2 border-y border-border py-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4 text-emerald-700" />
                    {job.district}, {job.address}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock3 className="size-4 text-emerald-700" />
                    {formatDate(job.startsAt)} – {formatDate(job.endsAt)}
                  </span>
                  <span className="flex items-center gap-2">
                    <UsersRound className="size-4 text-emerald-700" />
                    {job.openings} ishchi ·{" "}
                    {job.payAmount.toLocaleString("uz-UZ")} so‘m
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    disabled={isBusy}
                    onClick={() => handleModeration(job, "reject")}
                    variant="outline"
                  >
                    <X /> Rad etish
                  </Button>
                  <Button
                    className="bg-emerald-700 hover:bg-emerald-800"
                    disabled={isBusy}
                    onClick={() => handleModeration(job, "publish")}
                  >
                    <Check /> Tasdiqlash
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="grid min-h-64 place-items-center gap-2 rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/50 p-7 text-center">
          <Check className="size-8 text-emerald-700" />
          <h2 className="text-xl font-semibold">Hammasi tekshirilgan</h2>
          <p className="max-w-72 text-sm leading-6 text-muted-foreground">
            Hozircha moderatsiyani kutayotgan e’lon yo‘q.
          </p>
        </section>
      )}
    </section>
  );
}
