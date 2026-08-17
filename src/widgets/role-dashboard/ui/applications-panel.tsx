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
      <section className="jt-empty-panel">
        <ClipboardList className="size-8" />
        <h2>E’lonlaringiz</h2>
        <p>
          Yaratilgan e’lonlar avval moderatsiyadan o‘tadi. Tasdiqlangach
          ishchilarning qiziqishlari shu yerda chiqadi.
        </p>
        <span>Hozircha kutilayotgan ariza yo‘q.</span>
      </section>
    );
  }

  if (role !== "worker") {
    return (
      <section className="jt-empty-panel">
        <h2>Profilingizni yakunlang</h2>
        <p>Avval Telegram orqali ro‘yxatdan o‘ting.</p>
      </section>
    );
  }

  return (
    <section className="jt-applications">
      <div className="jt-screen-heading">
        <div>
          <p>ISHCHI</p>
          <h2>Qiziqishlarim</h2>
        </div>
        <span>{appliedJobs.length}</span>
      </div>
      {appliedJobs.length ? (
        <div className="jt-application-list">
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
        <div className="jt-empty-panel">
          <ClipboardList className="size-8" />
          <h2>Hali qiziqish yo‘q</h2>
          <p>Topshiriqni ochib, “Qiziqish bildirish” tugmasini bosing.</p>
          <Button onClick={onAddEmployerRole} variant="outline">
            <PlusCircle /> Ish beruvchi bo‘lish
          </Button>
        </div>
      )}
    </section>
  );
}
