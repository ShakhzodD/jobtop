"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getCurrentUser,
  updateCurrentUserRole,
} from "@/entities/user/api/get-current-user";
import type { CurrentUser, UserRole } from "@/entities/user/model/types";
import { RoleProfilePanel } from "@/features/profile/ui/role-profile-panel";

export function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setBusy(false));
  }, []);

  async function selectRole(role: UserRole, addRole = false) {
    setBusy(true);
    try {
      await updateCurrentUserRole(role, addRole);
      setUser(await getCurrentUser());
    } finally {
      setBusy(false);
    }
  }

  if (busy && !user)
    return <section className="jt-page-state">Profil yuklanmoqda...</section>;
  if (!user)
    return (
      <section className="jt-empty-panel">
        <UserRound className="size-8" />
        <h2>Profilingizni yakunlang</h2>
        <p>
          Botda /start ni bosing, rolni tanlang va telefon raqamingizni
          yuboring.
        </p>
      </section>
    );

  return (
    <section className="jt-route-page">
      <div className="jt-screen-heading">
        <div>
          <p>ACCOUNT</p>
          <h1>Profil</h1>
        </div>
      </div>
      <RoleProfilePanel busy={busy} onSelectRole={selectRole} user={user} />
      {user.activeRole === "employer" && (
        <Button
          className="mt-5 h-12 w-full bg-emerald-700 hover:bg-emerald-800"
          onClick={() => router.push("/jobs/new")}
        >
          <BriefcaseBusiness /> E’lon yaratish
        </Button>
      )}
    </section>
  );
}
