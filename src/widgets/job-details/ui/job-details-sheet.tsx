"use client";

import type { Job } from "@/entities/job/model/types";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ApplyToJobButton } from "@/features/apply-to-job/ui/apply-to-job-button";
import { GroupApplicationForm } from "@/features/apply-to-job/ui/group-application-form";
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
  onApplyGroup: (usernames: string[]) => Promise<void>;
  onClose: () => void;
};

export function JobDetailsSheet({
  job,
  text,
  applied,
  error,
  onApply,
  onApplyGroup,
  onClose,
}: Props) {
  return (
    <Drawer
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      open
      showSwipeHandle
    >
      <DrawerContent className="max-h-[85dvh] border-x-0">
        <div className="overflow-y-auto px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <DrawerHeader className="p-0 pt-3 text-left">
            <span className="w-fit rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-extrabold text-emerald-800">
              {job.category}
            </span>
            <DrawerTitle className="mt-3 text-2xl font-bold tracking-tight">
              {job.title}
            </DrawerTitle>
            <DrawerDescription>{job.company}</DrawerDescription>
          </DrawerHeader>
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
          {!applied && (
            <GroupApplicationForm disabled={applied} onSubmit={onApplyGroup} />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
