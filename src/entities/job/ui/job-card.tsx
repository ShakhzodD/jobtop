import type { Job } from "../model/types";
import { formatMoney } from "@/shared/lib/format-money";

type Props = {
  job: Job;
  detailLabel: string;
  onOpen: (job: Job) => void;
};

export function JobCard({ job, detailLabel, onOpen }: Props) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex gap-2">
        <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-extrabold text-emerald-800">
          {job.category}
        </span>
        {job.label && (
          <i className="rounded-md bg-amber-50 px-2 py-1 text-[10px] font-extrabold text-amber-700 not-italic">
            {job.label}
          </i>
        )}
      </div>
      <h3 className="mt-3 text-base font-bold leading-tight tracking-tight">
        {job.title}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{job.company}</p>
      <div className="my-4 grid gap-2 text-xs text-muted-foreground">
        <span>⌖&nbsp; {job.district}</span>
        <span>◷&nbsp; {job.schedule}</span>
      </div>
      <div className="flex items-center justify-between border-t border-border pt-3">
        <b className="text-sm text-emerald-800">{formatMoney(job.pay)}</b>
        <button
          className="text-xs font-bold text-emerald-700"
          type="button"
          onClick={() => onOpen(job)}
        >
          {detailLabel} <span className="text-base">→</span>
        </button>
      </div>
    </article>
  );
}
