"use client";

import { FormEvent, useState } from "react";
import { createJob } from "../api/create-job";
import type { JobCategory } from "@/entities/job/model/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type Props = { onClose: () => void; onCreated: () => void };

const categories: JobCategory[] = ["Kuryer", "Xizmat", "Yuk tashish", "Tozalash"];

export function CreateJobSheet({ onClose, onCreated }: Props) {
  const [category, setCategory] = useState<JobCategory>("Kuryer");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    try {
      await createJob({ category, title: String(data.get("title") ?? ""), description: String(data.get("description") ?? ""), district: String(data.get("district") ?? ""), address: String(data.get("address") ?? ""), startsAt: new Date(String(data.get("startsAt"))).toISOString(), endsAt: new Date(String(data.get("endsAt"))).toISOString(), payAmount: Number(data.get("payAmount")), openings: Number(data.get("openings")) });
      onCreated();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "E’lon yaratib bo‘lmadi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet onOpenChange={(open) => !open && onClose()} open>
      <SheetContent className="max-h-[92dvh] overflow-y-auto rounded-t-3xl" side="bottom">
        <SheetHeader className="px-0 pt-1">
          <span className="jt-form-eyebrow">ISH BERUVCHI</span>
          <SheetTitle className="text-2xl">Yangi e’lon yarating</SheetTitle>
          <SheetDescription>Tekshiruvdan keyin e’lon ishchilarga ko‘rinadi.</SheetDescription>
        </SheetHeader>
        <form className="jt-form pt-2" onSubmit={submit}>

        <section className="jt-form-section">
          <label>Ish turi
            <Select onValueChange={(value) => setCategory(value as JobCategory)} value={category}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label>Ish nomi<Input name="title" required placeholder="Masalan, Omborga yuk tushirish" /></label>
          <label>Tavsif<Textarea name="description" required placeholder="Vazifa va talablarni yozing" rows={3} /></label>
        </section>

        <section className="jt-form-section">
          <div className="jt-form-grid">
            <label>Tuman<Input name="district" required placeholder="Chilonzor" /></label>
            <label>Kerakli ishchi<Input name="openings" required min="1" type="number" defaultValue="1" /></label>
          </div>
          <label>Aniq manzil<Input name="address" required placeholder="Ko‘cha va bino raqami" /></label>
          <div className="jt-form-grid">
            <label>Boshlanish<Input name="startsAt" required type="datetime-local" /></label>
            <label>Tugash<Input name="endsAt" required type="datetime-local" /></label>
          </div>
          <label>Bir kunlik haq (so‘m)<Input name="payAmount" required min="1" type="number" placeholder="200000" /></label>
        </section>

        {error && <p className="jt-form-error">{error}</p>}
        <Button className="h-12 w-full rounded-2xl bg-emerald-700 hover:bg-emerald-800" disabled={saving} type="submit">{saving ? "Saqlanmoqda..." : "Moderatsiyaga yuborish"}</Button>
        <p className="jt-submit-note">Admin tasdiqlaganidan keyingina e’lon ochiq lentaga chiqadi.</p>
        </form>
      </SheetContent>
    </Sheet>
  );
}
