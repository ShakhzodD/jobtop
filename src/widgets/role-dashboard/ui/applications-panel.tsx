import { ClipboardList, PlusCircle } from "lucide-react";
import type { Job } from "@/entities/job/model/types";
import type { UserRole } from "@/entities/user/model/types";
import { Button } from "@/components/ui/button";

type Props = {
  appliedJobIds: string[];
  jobs: Job[];
  role: UserRole | undefined;
  onAddEmployerRole: () => void;
  onOpenJob: (job: Job) => void;
};

export function ApplicationsPanel({
  appliedJobIds,
  jobs,
  role,
  onAddEmployerRole,
  onOpenJob,
}: Props) {
  const appliedJobs = jobs.filter((job) => appliedJobIds.includes(job.id));

  if (role === "employer") {
    return (
      <section className="grid min-h-64 place-items-center gap-2 rounded-3xl border border-dashed border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-7 text-center text-emerald-800">
        <ClipboardList className="size-8" />
        <h2 className="text-xl font-semibold">E’lonlaringiz</h2>
        <p className="max-w-72 text-sm leading-6 text-muted-foreground">
          Yaratilgan e’lonlar avval moderatsiyadan o‘tadi. Tasdiqlangach
          ishchilarning qiziqishlari shu yerda chiqadi.
        </p>
        <span className="text-xs text-muted-foreground">
          Hozircha kutilayotgan ariza yo‘q.
        </span>
      </section>
    );
  }

  if (role !== "worker") {
    return (
      <section className="grid min-h-64 place-items-center gap-2 rounded-3xl border border-dashed border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-7 text-center text-emerald-800">
        <h2 className="text-xl font-semibold">Profilingizni yakunlang</h2>
        <p className="max-w-72 text-sm leading-6 text-muted-foreground">
          Avval Telegram orqali ro‘yxatdan o‘ting.
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between py-2 pb-4">
        <div>
          <p className="mb-1 text-[10px] font-black tracking-[0.1em] text-emerald-700">
            ISHCHI
          </p>
          <h2 className="text-xl font-semibold">Qiziqishlarim</h2>
        </div>
        <span className="grid size-7 place-items-center rounded-full bg-emerald-100 text-xs font-extrabold text-emerald-800">
          {appliedJobs.length}
        </span>
      </div>
      {appliedJobs.length ? (
        <div className="grid gap-2.5">
          {appliedJobs.map((job) => (
            <Button
              className="h-auto justify-between rounded-2xl border border-border bg-card px-4 py-3 text-left"
              key={job.id}
              onClick={() => onOpenJob(job)}
              variant="outline"
            >
              <span>
                <b className="block">{job.title}</b>
                <small className="text-muted-foreground">
                  {job.district} · Ko‘rib chiqilmoqda
                </small>
              </span>
              <span className="text-emerald-700">
                {job.pay.toLocaleString("uz-UZ")} so‘m
              </span>
            </Button>
          ))}
        </div>
      ) : (
        <div className="grid min-h-64 place-items-center gap-2 rounded-3xl border border-dashed border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-7 text-center text-emerald-800">
          <ClipboardList className="size-8" />
          <h2 className="text-xl font-semibold">Hali qiziqish yo‘q</h2>
          <p className="max-w-72 text-sm leading-6 text-muted-foreground">
            Topshiriqni ochib, “Qiziqish bildirish” tugmasini bosing.
          </p>
          <Button onClick={onAddEmployerRole} variant="outline">
            <PlusCircle /> Ish beruvchi bo‘lish
          </Button>
        </div>
      )}
    </section>
  );
}
