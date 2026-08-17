"use client";

import type { CurrentUser, UserRole } from "@/entities/user/model/types";

type Props = {
  user: CurrentUser;
  busy?: boolean;
  onSelectRole: (role: UserRole, addRole?: boolean) => void;
};

const roleCopy: Record<UserRole, { emoji: string; title: string; description: string }> = {
  worker: { emoji: "👷", title: "Ishchi", description: "E’lonlarni ko‘ring va qiziqish bildiring." },
  employer: { emoji: "💼", title: "Ish beruvchi", description: "E’lon yarating va nomzodlarni tanlang." },
};

export function RoleProfilePanel({ user, busy, onSelectRole }: Props) {
  const otherRole: UserRole = user.activeRole === "worker" ? "employer" : "worker";

  return (
    <section className="jt-profile-panel">
      <div className="jt-profile-head">
        <span>{user.fullName.slice(0, 1).toUpperCase()}</span>
        <div><h2>{user.fullName}</h2><p>{user.phone ?? "Telefon raqam tasdiqlanmagan"}</p></div>
      </div>
      <p className="jt-profile-label">Sizning rollaringiz</p>
      <div className="jt-role-list">
        {user.roles.map(role => {
          const item = roleCopy[role];
          const selected = role === user.activeRole;
          return <button className={`jt-role-card ${selected ? "active" : ""}`} disabled={busy} key={role} onClick={() => onSelectRole(role)} type="button"><span>{item.emoji}</span><div><b>{item.title}</b><small>{item.description}</small></div>{selected && <i>Faol</i>}</button>;
        })}
      </div>
      {!user.roles.includes(otherRole) && <button className="jt-add-role" disabled={busy} onClick={() => onSelectRole(otherRole, true)} type="button">＋ {roleCopy[otherRole].title} rolini qo‘shish</button>}
      <p className="jt-profile-note">Bitta telefon raqami bilan ishchi va ish beruvchi sifatida alohida ishlashingiz mumkin.</p>
    </section>
  );
}
