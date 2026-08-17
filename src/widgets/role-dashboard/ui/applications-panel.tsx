import { ClipboardList, MapPin } from "lucide-react";
import type { UserRole } from "@/entities/user/model/types";
import type { WorkerApplication } from "@/entities/application/model/worker-application";
import { Button } from "@/components/ui/button";
import { EmployerApplicationsPanel } from "@/widgets/employer-applications/ui/employer-applications-panel";

type Props = {
  applications: WorkerApplication[];
  isLoading?: boolean;
  error?: string;
  role: UserRole | undefined;
  onOpenJob: (application: WorkerApplication) => void;
};

const statusCopy = {
  pending: {
    label: "Ko‘rib chiqilmoqda",
    className: "bg-amber-100 text-amber-800",
  },
  selected: {
    label: "Tanlandingiz",
    className: "bg-emerald-100 text-emerald-800",
  },
  rejected: { label: "Rad etildi", className: "bg-red-100 text-red-800" },
  withdrawn: {
    label: "Bekor qilindi",
    className: "bg-muted text-muted-foreground",
  },
} as const;

function getStatus(application: WorkerApplication) {
  if (application.job?.status === "completed") {
    return {
      label: "Ish yakunlandi",
      className: "bg-sky-100 text-sky-800",
    };
  }
  if (application.job?.status === "cancelled") {
    return {
      label: "E’lon bekor qilindi",
      className: "bg-muted text-muted-foreground",
    };
  }
  if (application.job?.status === "expired") {
    return {
      label: "E’lon muddati tugadi",
      className: "bg-muted text-muted-foreground",
    };
  }
  return statusCopy[application.status];
}

export function ApplicationsPanel({
  applications,
  isLoading,
  error,
  role,
  onOpenJob,
}: Props) {
  if (role === "employer") {
    return <EmployerApplicationsPanel />;
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

  if (isLoading) {
    return (
      <section className="grid min-h-64 place-items-center text-sm text-muted-foreground">
        Arizalar yuklanmoqda...
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
          {applications.length}
        </span>
      </div>
      {error && (
        <p className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {applications.length ? (
        <div className="grid gap-2.5">
          {applications.map((application) => {
            const status = getStatus(application);
            const job = application.job;
            if (!job) return null;
            return (
              <Button
                className="h-auto justify-between rounded-2xl border border-border bg-card px-4 py-3 text-left"
                key={application.id}
                onClick={() => onOpenJob(application)}
                variant="outline"
              >
                <span>
                  <span
                    className={`mb-2 inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${status.className}`}
                  >
                    {status.label}
                  </span>
                  <b className="block text-sm">{job.title}</b>
                  <small className="mt-1 flex items-center gap-1 text-muted-foreground">
                    <MapPin className="size-3" /> {job.district}
                  </small>
                </span>
                <span className="text-emerald-700">
                  {job.payAmount.toLocaleString("uz-UZ")} so‘m
                </span>
              </Button>
            );
          })}
        </div>
      ) : (
        <div className="grid min-h-64 place-items-center gap-2 rounded-3xl border border-dashed border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-7 text-center text-emerald-800">
          <ClipboardList className="size-8" />
          <h2 className="text-xl font-semibold">Hali qiziqish yo‘q</h2>
          <p className="max-w-72 text-sm leading-6 text-muted-foreground">
            Topshiriqni ochib, “Qiziqish bildirish” tugmasini bosing.
          </p>
        </div>
      )}
    </section>
  );
}
