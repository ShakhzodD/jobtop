"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createJob } from "../api/create-job";
import type { JobCategory } from "@/entities/job/model/types";

type FormValues = { category: JobCategory; title: string; description: string; district: string; address: string; startsAt: string; endsAt: string; openings: number; payAmount: number };
type Props = { onCreated: () => void };
const categories: JobCategory[] = ["Kuryer", "Xizmat", "Yuk tashish", "Tozalash"];

export function CreateJobForm({ onCreated }: Props) {
  const [error, setError] = useState("");
  const { register, handleSubmit, setValue, control, formState: { errors, isSubmitting } } = useForm<FormValues>({ defaultValues: { category: "Kuryer", openings: 1 } });
  const category = useWatch({ control, name: "category" });

  const submit = handleSubmit(async (values) => {
    setError("");
    try {
      await createJob({ ...values, startsAt: new Date(values.startsAt).toISOString(), endsAt: new Date(values.endsAt).toISOString(), openings: Number(values.openings), payAmount: Number(values.payAmount) });
      onCreated();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "E’lon yaratib bo‘lmadi"); }
  });

  return <form className="jt-route-form" onSubmit={submit}><section className="jt-form-section"><label>Ish turi<Select onValueChange={(value) => setValue("category", value as JobCategory)} value={category}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></label><label>Ish nomi<Input {...register("title", { required: "Ish nomini kiriting" })} placeholder="Masalan, Omborga yuk tushirish" />{errors.title && <small>{errors.title.message}</small>}</label><label>Tavsif<Textarea {...register("description", { required: "Tavsifni kiriting" })} placeholder="Vazifa va talablarni yozing" rows={4} /></label></section><section className="jt-form-section"><div className="jt-form-grid"><label>Tuman<Input {...register("district", { required: true })} placeholder="Chilonzor" /></label><label>Kerakli ishchi<Input {...register("openings", { required: true, min: 1, valueAsNumber: true })} min="1" type="number" /></label></div><label>Aniq manzil<Input {...register("address", { required: true })} placeholder="Ko‘cha va bino raqami" /></label><div className="jt-form-grid"><label>Boshlanish<Input {...register("startsAt", { required: true })} type="datetime-local" /></label><label>Tugash<Input {...register("endsAt", { required: true })} type="datetime-local" /></label></div><label>Bir kunlik haq (so‘m)<Input {...register("payAmount", { required: true, min: 1, valueAsNumber: true })} min="1" placeholder="200000" type="number" /></label></section>{error && <p className="jt-form-error">{error}</p>}<Button className="h-12 w-full bg-emerald-700 hover:bg-emerald-800" disabled={isSubmitting} type="submit">{isSubmitting ? "Saqlanmoqda..." : "Moderatsiyaga yuborish"}</Button><p className="jt-submit-note">Admin tasdiqlaganidan keyin e’lon ochiq lentada ko‘rinadi.</p></form>;
}
