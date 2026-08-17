"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateCurrentUserRole } from "@/entities/user/api/get-current-user";
import type { UserRole } from "@/entities/user/model/types";
import { useUserStore } from "@/entities/user/model/user-store";
import { LanguageSwitch } from "@/features/language-switch/ui/language-switch";
import { RoleProfilePanel } from "@/features/profile/ui/role-profile-panel";
import { WorkerProfileForm } from "@/features/profile/ui/worker-profile-form";

export function ProfilePage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const status = useUserStore((state) => state.status);
  const setUser = useUserStore((state) => state.setUser);
  const [busy, setBusy] = useState(false);

  async function selectRole(role: UserRole, addRole = false) {
    setBusy(true);
    try {
      setUser(await updateCurrentUserRole(role, addRole));
    } finally {
      setBusy(false);
    }
  }

  if (status !== "ready")
    return (
      <section className="grid min-h-64 place-items-center text-sm text-muted-foreground">
        Profil yuklanmoqda...
      </section>
    );
  if (!user)
    return (
      <section className="grid min-h-64 place-items-center gap-3 rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/50 p-7 text-center">
        <UserRound className="size-8" />
        <h2>Profilingizni yakunlang</h2>
        <p>
          Botda /start ni bosing, rolni tanlang va telefon raqamingizni
          yuboring.
        </p>
      </section>
    );

  return (
    <section className="pt-2">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="mb-1 text-[10px] font-black tracking-[0.14em] text-emerald-700">
            ACCOUNT
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Profil</h1>
        </div>
        <LanguageSwitch />
      </div>
      <RoleProfilePanel busy={busy} onSelectRole={selectRole} user={user} />
      {user.roles.includes("worker") && <WorkerProfileForm user={user} />}
      {user.activeRole === "employer" && (
        <Button
          className="mt-5 h-12 w-full bg-emerald-700 hover:bg-emerald-800"
          onClick={() => router.push("/jobs/new")}
        >
          <BriefcaseBusiness /> E’lon yaratish
        </Button>
      )}
      {user.isAdmin && (
        <Button
          className="mt-3 h-11 w-full"
          onClick={() => router.push("/admin/moderation")}
          variant="outline"
        >
          <ShieldCheck /> Moderatsiya
        </Button>
      )}
    </section>
  );
}
