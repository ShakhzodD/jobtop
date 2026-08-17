import type { Job } from "@/entities/job/model/types";
import { ApplyToJobButton } from "@/features/apply-to-job/ui/apply-to-job-button";
import { formatMoney } from "@/shared/lib/format-money";

type Props = {
  job: Job;
  text: {
    address: string;
    staff: string;
    dayPay: string;
    close: string;
    apply: string;
    applied: string;
  };
  applied: boolean;
  error?: string;
  onApply: () => void | Promise<void>;
  onClose: () => void;
};

export function JobDetailsSheet({
  job,
  text,
  applied,
  error,
  onApply,
  onClose,
}: Props) {
  return (
    <div
      className="jt-dialog"
      role="dialog"
      aria-modal="true"
      aria-label={job.title}
    >
      <section className="jt-sheet">
        <button
          className="jt-close"
          type="button"
          aria-label={text.close}
          onClick={onClose}
        >
          ×
        </button>
        <span className="jt-tag-main">{job.category}</span>
        <h2>{job.title}</h2>
        <p>{job.company}</p>
        <div className="jt-detail">
          <b>⌖</b>
          <div>
            <strong>{job.district}</strong>
            <small>{text.address}</small>
          </div>
        </div>
        <div className="jt-detail">
          <b>◷</b>
          <div>
            <strong>{job.schedule}</strong>
            <small>
              {job.openings} {text.staff}
            </small>
          </div>
        </div>
        <div className="jt-pay">
          <span>{text.dayPay}</span>
          <strong>{formatMoney(job.pay)}</strong>
        </div>
        {error && <p className="jt-form-error">{error}</p>}
        <ApplyToJobButton
          applied={applied}
          applyLabel={text.apply}
          appliedLabel={text.applied}
          onApply={onApply}
        />
      </section>
    </div>
  );
}
