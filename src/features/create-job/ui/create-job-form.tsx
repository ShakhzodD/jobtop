"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { Sparkles } from "lucide-react";
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
import { parseJobText } from "../api/parse-job-text";
import { DateTimePicker } from "./date-time-picker";
import type { JobCategory } from "@/entities/job/model/types";

type FormValues = {
  quickText?: string;
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
    getValues,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { category: "Kuryer", openings: 1 },
  });
  const category = useWatch({ control, name: "category" });
  const startsAt = useWatch({ control, name: "startsAt" });
  const endsAt = useWatch({ control, name: "endsAt" });
  const quickText = useWatch({ control, name: "quickText" });
  const parseTextMutation = useMutation({
    mutationFn: parseJobText,
    onSuccess: (job) => {
      const options = { shouldDirty: true, shouldValidate: true };
      if (job.category) setValue("category", job.category, options);
      if (job.title) setValue("title", job.title, options);
      if (job.description) setValue("description", job.description, options);
      if (job.district) setValue("district", job.district, options);
      if (job.address) setValue("address", job.address, options);
      if (job.startsAt) setValue("startsAt", job.startsAt, options);
      if (job.endsAt) setValue("endsAt", job.endsAt, options);
      if (job.payAmount) setValue("payAmount", job.payAmount, options);
      if (job.openings) setValue("openings", job.openings, options);
    },
  });

  const fillFromText = async () => {
    setError("");
    const text = getValues("quickText");
    try {
      await parseTextMutation.mutateAsync(text ?? "");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Matnni tahlil qilib bo‘lmadi",
      );
    }
  };

  const submit = handleSubmit(async (values) => {
    setError("");

    if (new Date(values.endsAt) <= new Date(values.startsAt)) {
      setError("Tugash vaqti boshlanish vaqtidan keyin bo‘lishi kerak");
      return;
    }

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
      <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-emerald-950">
          <Sparkles className="size-4 text-emerald-700" />
          Tezkor e’lon yaratish
        </div>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
          E’lonni oddiy tilda yozing. AI asosiy maydonlarni to‘ldiradi, siz esa
          jo‘natishdan oldin tekshirasiz.
        </p>
        <Textarea
          {...register("quickText")}
          placeholder="Masalan: Ertaga Chilonzorda 2 ta yuk tushiruvchi kerak. 09:00–18:00, 250 000 so‘m. Manzil: ..."
          rows={4}
        />
        <Button
          className="mt-3 w-full"
          disabled={!quickText?.trim() || parseTextMutation.isPending}
          onClick={fillFromText}
          type="button"
          variant="outline"
        >
          <Sparkles />
          {parseTextMutation.isPending
            ? "AI to‘ldirmoqda..."
            : "AI bilan to‘ldirish"}
        </Button>
      </section>
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
            <input
              {...register("startsAt", {
                required: "Boshlanish vaqti tanlanishi kerak",
              })}
              type="hidden"
            />
            <DateTimePicker
              onChange={(value) =>
                setValue("startsAt", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              placeholder="Sana va vaqtni tanlang"
              value={startsAt}
            />
            {errors.startsAt && (
              <small className="text-xs text-red-700">
                {errors.startsAt.message}
              </small>
            )}
          </label>
          <label className="grid gap-2 text-sm font-bold text-foreground">
            Tugash
            <input
              {...register("endsAt", {
                required: "Tugash vaqti tanlanishi kerak",
              })}
              type="hidden"
            />
            <DateTimePicker
              onChange={(value) =>
                setValue("endsAt", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              placeholder="Sana va vaqtni tanlang"
              value={endsAt}
            />
            {errors.endsAt && (
              <small className="text-xs text-red-700">
                {errors.endsAt.message}
              </small>
            )}
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
