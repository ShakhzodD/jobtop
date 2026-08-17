import type { Job } from "../model/types";
import { formatMoney } from "@/shared/lib/format-money";

type Props = {
  job: Job;
  detailLabel: string;
  onOpen: (job: Job) => void;
};

export function JobCard({ job, detailLabel, onOpen }: Props) {
  return (
    <article className="jt-card">
      <div className="jt-tags"><span>{job.category}</span>{job.label && <i>{job.label}</i>}</div>
      <h3>{job.title}</h3>
      <p>{job.company}</p>
      <div className="jt-info"><span>⌖&nbsp; {job.district}</span><span>◷&nbsp; {job.schedule}</span></div>
      <div className="jt-card-footer"><b>{formatMoney(job.pay)}</b><button type="button" onClick={() => onOpen(job)}>{detailLabel} <span>→</span></button></div>
    </article>
  );
}
