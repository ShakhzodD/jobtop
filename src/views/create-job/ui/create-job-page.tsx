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
  useEffect(() => { getCurrentUser().then(setUser).catch(() => setUser(null)); }, []);
  if (user === undefined) return <section className="jt-page-state">Tekshirilmoqda...</section>;
  if (user?.activeRole !== "employer") return <section className="jt-empty-panel"><ShieldCheck className="size-8" /><h2>Ish beruvchi roli kerak</h2><p>Profilingizdan ish beruvchi rolini qo‘shing va faollashtiring.</p><Button onClick={() => router.push("/profile")}>Profilga o‘tish</Button></section>;
  return <section className="jt-route-page"><Button className="mb-4" onClick={() => router.back()} size="sm" variant="ghost"><ArrowLeft /> Orqaga</Button><div className="jt-page-heading"><p>ISH BERUVCHI</p><h1>Yangi e’lon yarating</h1><span>Ma’lumotlar admin tomonidan tekshiriladi.</span></div><CreateJobForm onCreated={() => router.replace("/profile")} /></section>;
}
