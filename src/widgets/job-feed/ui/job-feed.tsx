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
    <section className="jt-jobs" aria-label={title}>
      <div className="jt-section-title">
        <h2>{title}</h2>
        <span>{jobs.length}</span>
      </div>
      <div className="jt-list">
        {jobs.map(job => (
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
