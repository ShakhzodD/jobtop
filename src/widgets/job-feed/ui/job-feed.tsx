import type { Job } from "@/entities/job/model/types";
import { JobCard } from "@/entities/job/ui/job-card";
import { LoaderCircle } from "lucide-react";

type Props = {
  jobs: Job[];
  title: string;
  detailLabel: string;
  emptyLabel: string;
  loadingLabel: string;
  isLoading?: boolean;
  onOpenJob: (job: Job) => void;
};

export function JobFeed({
  jobs,
  title,
  detailLabel,
  emptyLabel,
  loadingLabel,
  isLoading = false,
  onOpenJob,
}: Props) {
  return (
    <section className="pt-7" aria-label={title}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
          {isLoading ? "—" : jobs.length}
        </span>
      </div>
      {isLoading ? (
        <div className="mt-4 flex min-h-36 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 px-4 text-center text-sm text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin text-emerald-700" />
          <span>{loadingLabel}</span>
        </div>
      ) : jobs.length ? (
        <div className="mt-4 grid gap-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              detailLabel={detailLabel}
              onOpen={onOpenJob}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      )}
    </section>
  );
}
