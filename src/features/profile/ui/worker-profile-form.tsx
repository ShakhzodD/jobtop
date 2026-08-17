"use client";

import { BriefcaseBusiness, CalendarDays, MapPin, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateWorkerProfile } from "@/features/profile/api/update-worker-profile";
import type { CurrentUser } from "@/entities/user/model/types";
import { useUserStore } from "@/entities/user/model/user-store";

type Props = { user: CurrentUser };

type FormValues = {
  birthDate: string;
  district: string;
  experienceYears: string;
  about: string;
};

export function WorkerProfileForm({ user }: Props) {
  const setUser = useUserStore((state) => state.setUser);
  const [message, setMessage] = useState("");
  const updateProfileMutation = useMutation({
    mutationFn: updateWorkerProfile,
    onSuccess: (updatedUser) => setUser(updatedUser),
  });
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      birthDate: user.birthDate ?? "",
      district: user.district ?? "",
      experienceYears: user.experienceYears?.toString() ?? "",
      about: user.about ?? "",
    },
  });

  useEffect(() => {
    reset({
      birthDate: user.birthDate ?? "",
      district: user.district ?? "",
      experienceYears: user.experienceYears?.toString() ?? "",
      about: user.about ?? "",
    });
  }, [reset, user]);

  async function onSubmit(values: FormValues) {
    setMessage("");
    try {
      await updateProfileMutation.mutateAsync(values);
      setMessage("Profil saqlandi");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Profilni saqlab bo‘lmadi",
      );
    }
  }

  return (
    <form
      className="mt-5 overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="border-b border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
            <BriefcaseBusiness className="size-4" />
          </span>
          <div>
            <h2 className="font-semibold">Ishchi ma’lumotlari</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Bu ma’lumotlar ariza yuborganingizda ish beruvchiga ko‘rinadi.
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-5 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <CalendarDays className="size-3.5" /> Tug‘ilgan sana
            </span>
            <Input type="date" {...register("birthDate")} />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <BriefcaseBusiness className="size-3.5" /> Tajriba (yil)
            </span>
            <Input
              inputMode="numeric"
              max="60"
              min="0"
              placeholder="Masalan, 2"
              type="number"
              {...register("experienceYears")}
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-medium">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-3.5" /> Tuman
          </span>
          <Input placeholder="Masalan, Chilonzor" {...register("district")} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span className="text-muted-foreground">O‘zingiz haqingizda</span>
          <Textarea
            maxLength={500}
            placeholder="Qaysi ishlarda tajribangiz borligini qisqa yozing"
            rows={4}
            {...register("about")}
          />
          <span className="text-xs text-muted-foreground">
            Tajriba va sizga mos ish turlarini yozing.
          </span>
        </label>
        {message && (
          <p
            className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800"
            role="status"
          >
            {message}
          </p>
        )}
        <Button
          className="h-11 bg-emerald-700 hover:bg-emerald-800"
          disabled={updateProfileMutation.isPending}
          type="submit"
        >
          <Save />{" "}
          {updateProfileMutation.isPending
            ? "Saqlanmoqda..."
            : "Ma’lumotlarni saqlash"}
        </Button>
      </div>
    </form>
  );
}
