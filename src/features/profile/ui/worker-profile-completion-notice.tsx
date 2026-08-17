"use client";

import { CircleAlert } from "lucide-react";
import type { CurrentUser } from "@/entities/user/model/types";

type Props = { user: CurrentUser };

export function WorkerProfileCompletionNotice({ user }: Props) {
  const missingFields = [
    !user.phone && "telefon raqami",
    !user.birthDate && "tug‘ilgan sana",
    !user.district && "tuman",
    user.experienceYears === null && "tajriba",
    !user.about && "o‘zingiz haqingizda qisqa ma’lumot",
    !user.workerCategories.length && "mos ish turlari",
  ].filter(Boolean) as string[];

  if (!missingFields.length) return null;

  return (
    <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
          <CircleAlert className="size-5" />
        </span>
        <div>
          <h2 className="font-semibold">Ma’lumotlaringiz to‘liq emas</h2>
          <p className="mt-1 text-sm leading-5 text-amber-900/80">
            Iltimos, quyidagi ma’lumotlarni to‘ldiring. Bu sizga tezroq mos ish
            topishga yordam beradi.
          </p>
          <p className="mt-2 text-xs font-medium leading-5 text-amber-800">
            Yetishmayapti: {missingFields.join(", ")}.
          </p>
        </div>
      </div>
    </section>
  );
}
