import type { Job } from "@/entities/job/model/types";
import { JobCard } from "@/entities/job/ui/job-card";

type Props = {
  jobs: Job[];
  title: string;
  detailLabel: string;
  onOpenJob: (job: Job) => void;
};

export function JobFeed({ jobs, title, detailLabel, onOpenJob }: Props) {
  return (
    <section className="pt-7" aria-label={title}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
          {jobs.length}
        </span>
      </div>
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
    </section>
  );
}
