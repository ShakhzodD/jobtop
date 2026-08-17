"use client";

import { useState } from "react";
import { useRouter } from "@bprogress/next/app";
import { BriefcaseBusiness, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateCurrentUserRole } from "@/entities/user/api/get-current-user";
import type { UserRole } from "@/entities/user/model/types";
import { useUserStore } from "@/entities/user/model/user-store";
import { RoleProfilePanel } from "@/features/profile/ui/role-profile-panel";
import { ProfileEditSheet } from "@/features/profile/ui/profile-edit-sheet";
import { WorkerProfileCompletionNotice } from "@/features/profile/ui/worker-profile-completion-notice";

export function ProfilePage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [busy, setBusy] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  async function selectRole(role: UserRole, addRole = false) {
    setBusy(true);
    try {
      setUser(await updateCurrentUserRole(role, addRole));
    } finally {
      setBusy(false);
    }
  }

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
      <div className="mb-4">
        <div>
          <p className="mb-1 text-[10px] font-black tracking-[0.14em] text-emerald-700">
            ACCOUNT
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Profil</h1>
        </div>
      </div>
      <RoleProfilePanel
        busy={busy}
        onEdit={() => setIsEditing(true)}
        onSelectRole={selectRole}
        user={user}
      />
      {user.activeRole === "worker" && (
        <>
          <WorkerProfileCompletionNotice user={user} />
        </>
      )}
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
      <ProfileEditSheet
        onOpenChange={setIsEditing}
        open={isEditing}
        user={user}
      />
    </section>
  );
}
