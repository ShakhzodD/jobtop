"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createJob } from "../api/create-job";
import type { JobCategory } from "@/entities/job/model/types";

type FormValues = {
  category: JobCategory;
  title: string;
  description: string;
  district: string;
  address: string;
  startsAt: string;
  endsAt: string;
  openings: number;
  payAmount: number;
};
type Props = { onCreated: () => void };
const categories: JobCategory[] = [
  "Kuryer",
  "Xizmat",
  "Yuk tashish",
  "Tozalash",
];

export function CreateJobForm({ onCreated }: Props) {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const createJobMutation = useMutation({
    mutationFn: createJob,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["employer", "jobs"] }),
  });
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { category: "Kuryer", openings: 1 },
  });
  const category = useWatch({ control, name: "category" });

  const submit = handleSubmit(async (values) => {
    setError("");
    try {
      await createJobMutation.mutateAsync({
        ...values,
        startsAt: new Date(values.startsAt).toISOString(),
        endsAt: new Date(values.endsAt).toISOString(),
        openings: Number(values.openings),
        payAmount: Number(values.payAmount),
      });
      onCreated();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "E’lon yaratib bo‘lmadi",
      );
    }
  });

  return (
    <form
      className="rounded-3xl border border-border bg-card p-4 shadow-sm"
      onSubmit={submit}
    >
      <section className="my-5 grid gap-3">
        <label className="grid gap-2 text-sm font-bold text-foreground">
          Ish turi
          <Select
            onValueChange={(value) =>
              setValue("category", value as JobCategory)
            }
            value={category}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-foreground">
          Ish nomi
          <Input
            {...register("title", { required: "Ish nomini kiriting" })}
            placeholder="Masalan, Omborga yuk tushirish"
          />
          {errors.title && (
            <small className="text-xs text-red-700">
              {errors.title.message}
            </small>
          )}
        </label>
        <label className="grid gap-2 text-sm font-bold text-foreground">
          Tavsif
          <Textarea
            {...register("description", { required: "Tavsifni kiriting" })}
            placeholder="Vazifa va talablarni yozing"
            rows={4}
          />
        </label>
      </section>
      <section className="my-5 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-foreground">
            Tuman
            <Input
              {...register("district", { required: true })}
              placeholder="Chilonzor"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-foreground">
            Kerakli ishchi
            <Input
              {...register("openings", {
                required: true,
                min: 1,
                valueAsNumber: true,
              })}
              min="1"
              type="number"
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-bold text-foreground">
          Aniq manzil
          <Input
            {...register("address", { required: true })}
            placeholder="Ko‘cha va bino raqami"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-foreground">
            Boshlanish
            <Input
              {...register("startsAt", { required: true })}
              type="datetime-local"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-foreground">
            Tugash
            <Input
              {...register("endsAt", { required: true })}
              type="datetime-local"
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-bold text-foreground">
          Bir kunlik haq (so‘m)
          <Input
            {...register("payAmount", {
              required: true,
              min: 1,
              valueAsNumber: true,
            })}
            min="1"
            placeholder="200000"
            type="number"
          />
        </label>
      </section>
      {error && (
        <p className="mb-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">
          {error}
        </p>
      )}
      <Button
        className="h-12 w-full bg-emerald-700 hover:bg-emerald-800"
        disabled={createJobMutation.isPending}
        type="submit"
      >
        {createJobMutation.isPending
          ? "Saqlanmoqda..."
          : "Moderatsiyaga yuborish"}
      </Button>
      <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
        Admin tasdiqlaganidan keyin e’lon ochiq lentada ko‘rinadi.
      </p>
    </form>
  );
}
