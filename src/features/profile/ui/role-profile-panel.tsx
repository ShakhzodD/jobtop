"use client";

import type { CurrentUser, UserRole } from "@/entities/user/model/types";
import { Button } from "@/components/ui/button";

type Props = {
  user: CurrentUser;
  busy?: boolean;
  onSelectRole: (role: UserRole, addRole?: boolean) => void;
};

const roleCopy: Record<
  UserRole,
  { emoji: string; title: string; description: string }
> = {
  worker: {
    emoji: "👷",
    title: "Ishchi",
    description: "E’lonlarni ko‘ring va qiziqish bildiring.",
  },
  employer: {
    emoji: "💼",
    title: "Ish beruvchi",
    description: "E’lon yarating va nomzodlarni tanlang.",
  },
};

export function RoleProfilePanel({ user, busy, onSelectRole }: Props) {
  const otherRole: UserRole =
    user.activeRole === "worker" ? "employer" : "worker";

  return (
    <section className="mt-1">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-full bg-emerald-50 font-black text-emerald-800">
          {user.fullName.slice(0, 1).toUpperCase()}
        </span>
        <div>
          <h2 className="text-xl font-bold tracking-tight">{user.fullName}</h2>
          <p className="text-xs text-muted-foreground">
            {user.phone ?? "Telefon raqam tasdiqlanmagan"}
          </p>
        </div>
      </div>
      <p className="mb-2 text-xs text-muted-foreground">Sizning rollaringiz</p>
      <div className="grid gap-3">
        {user.roles.map((role) => {
          const item = roleCopy[role];
          const selected = role === user.activeRole;
          return (
            <Button
              className={`grid h-auto min-h-24 w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl p-4 text-left ${selected ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-50" : "bg-card"}`}
              disabled={busy}
              key={role}
              onClick={() => onSelectRole(role)}
              type="button"
              variant="outline"
            >
              <span className="text-2xl">{item.emoji}</span>
              <div>
                <b className="block text-sm">{item.title}</b>
                <small className="mt-1 block text-[11px] leading-snug text-muted-foreground">
                  {item.description}
                </small>
              </div>
              {selected && (
                <i className="rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800 not-italic">
                  Faol
                </i>
              )}
            </Button>
          );
        })}
      </div>
      {!user.roles.includes(otherRole) && (
        <Button
          className="mt-3 h-auto min-h-12 w-full border-dashed text-emerald-700"
          disabled={busy}
          onClick={() => onSelectRole(otherRole, true)}
          type="button"
          variant="outline"
        >
          ＋ {roleCopy[otherRole].title} rolini qo‘shish
        </Button>
      )}
      <p className="mx-0.5 mt-5 text-xs leading-relaxed text-muted-foreground">
        Bitta telefon raqami bilan ishchi va ish beruvchi sifatida alohida
        ishlashingiz mumkin.
      </p>
    </section>
  );
}
