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
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-label={job.title}
    >
      <section className="relative w-full rounded-t-3xl bg-card p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl">
        <button
          className="absolute top-4 right-4 grid size-8 place-items-center rounded-full bg-muted text-xl text-muted-foreground"
          type="button"
          aria-label={text.close}
          onClick={onClose}
        >
          ×
        </button>
        <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-extrabold text-emerald-800">
          {job.category}
        </span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight">{job.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{job.company}</p>
        <div className="my-5 flex items-start gap-3">
          <b className="text-lg text-emerald-700">⌖</b>
          <div>
            <strong>{job.district}</strong>
            <small className="mt-1 block text-xs text-muted-foreground">
              {text.address}
            </small>
          </div>
        </div>
        <div className="my-5 flex items-start gap-3">
          <b className="text-lg text-emerald-700">◷</b>
          <div>
            <strong>{job.schedule}</strong>
            <small className="mt-1 block text-xs text-muted-foreground">
              {job.openings} {text.staff}
            </small>
          </div>
        </div>
        <div className="my-6 flex items-center justify-between rounded-2xl bg-emerald-50 p-4">
          <span className="text-xs text-emerald-800">{text.dayPay}</span>
          <strong className="text-lg text-emerald-800">
            {formatMoney(job.pay)}
          </strong>
        </div>
        {error && (
          <p className="mb-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">
            {error}
          </p>
        )}
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
