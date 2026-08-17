"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/entities/user/api/get-current-user";
import type { CurrentUser } from "@/entities/user/model/types";
import { CreateJobForm } from "@/features/create-job/ui/create-job-form";

export function CreateJobPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null | undefined>(undefined);
  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);
  if (user === undefined)
    return (
      <section className="grid min-h-64 place-items-center text-sm text-muted-foreground">
        Tekshirilmoqda...
      </section>
    );
  if (user?.activeRole !== "employer")
    return (
      <section className="grid min-h-64 place-items-center gap-3 rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/50 p-7 text-center">
        <ShieldCheck className="size-8" />
        <h2>Ish beruvchi roli kerak</h2>
        <p>Profilingizdan ish beruvchi rolini qo‘shing va faollashtiring.</p>
        <Button onClick={() => router.push("/profile")}>Profilga o‘tish</Button>
      </section>
    );
  return (
    <section className="pt-2">
      <Button
        className="mb-4"
        onClick={() => router.back()}
        size="sm"
        variant="ghost"
      >
        <ArrowLeft /> Orqaga
      </Button>
      <div className="mb-5">
        <p className="mb-2 text-[10px] font-black tracking-[0.14em] text-emerald-700">
          ISH BERUVCHI
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          Yangi e’lon yarating
        </h1>
        <span className="mt-2 block text-sm text-muted-foreground">
          Ma’lumotlar admin tomonidan tekshiriladi.
        </span>
      </div>
      <CreateJobForm onCreated={() => router.replace("/profile")} />
    </section>
  );
}
