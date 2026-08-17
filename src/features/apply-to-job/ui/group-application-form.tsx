"use client";

import { UsersRound } from "lucide-react";
import { useState } from "react";

type Props = {
  disabled: boolean;
  onSubmit: (usernames: string[]) => Promise<void>;
};

export function GroupApplicationForm({ disabled, onSubmit }: Props) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    const usernames = value
      .split(/[,\n\s]+/)
      .map((username) => username.trim())
      .filter(Boolean);
    setError("");
    setBusy(true);
    try {
      await onSubmit(usernames);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Guruh arizasini yuborib bo‘lmadi",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
        <UsersRound className="size-4" /> Sheriklar bilan ariza
      </div>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Sheriklarning Telegram username’larini vergul bilan yozing. Ular botdan
        taklifni tasdiqlaydi.
      </p>
      <input
        className="mt-3 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-emerald-500"
        disabled={disabled || busy}
        onChange={(event) => setValue(event.target.value)}
        placeholder="@aziz, @sardor, @jasur"
        value={value}
      />
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      <button
        className="mt-3 h-10 w-full rounded-xl border border-emerald-200 bg-card text-sm font-bold text-emerald-800 disabled:opacity-50"
        disabled={disabled || busy || !value.trim()}
        onClick={() => void submit()}
        type="button"
      >
        {busy ? "Yuborilmoqda..." : "Guruh arizasini yuborish"}
      </button>
    </div>
  );
}
