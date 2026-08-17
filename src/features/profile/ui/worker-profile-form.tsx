"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
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
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
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
      setUser(await updateWorkerProfile(values));
      setMessage("Profil saqlandi");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Profilni saqlab bo‘lmadi",
      );
    }
  }

  return (
    <form
      className="mt-5 grid gap-3 rounded-3xl border border-border bg-card p-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <h2 className="font-semibold">Ishchi ma’lumotlari</h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Bu ma’lumotlar siz ariza yuborgan e’lonning ish beruvchisiga
          ko‘rinadi.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1.5 text-xs font-semibold">
          Tug‘ilgan sana
          <Input type="date" {...register("birthDate")} />
        </label>
        <label className="grid gap-1.5 text-xs font-semibold">
          Tajriba (yil)
          <Input
            inputMode="numeric"
            max="60"
            min="0"
            type="number"
            {...register("experienceYears")}
          />
        </label>
      </div>
      <label className="grid gap-1.5 text-xs font-semibold">
        Tuman
        <Input placeholder="Masalan, Chilonzor" {...register("district")} />
      </label>
      <label className="grid gap-1.5 text-xs font-semibold">
        O‘zingiz haqingizda
        <Textarea
          maxLength={500}
          placeholder="Qaysi ishlarda tajribangiz borligini qisqa yozing"
          {...register("about")}
        />
      </label>
      {message && (
        <p className="text-xs text-muted-foreground" role="status">
          {message}
        </p>
      )}
      <Button disabled={isSubmitting} type="submit">
        <Save /> Saqlash
      </Button>
    </form>
  );
}
