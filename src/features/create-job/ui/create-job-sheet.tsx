"use client";

import { FormEvent, useState } from "react";
import { createJob } from "../api/create-job";
import type { JobCategory } from "@/entities/job/model/types";

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
    <div className="jt-dialog" role="dialog" aria-modal="true" aria-label="Yangi e’lon">
      <form className="jt-sheet jt-form" onSubmit={submit}>
        <button className="jt-close" type="button" aria-label="Yopish" onClick={onClose}>×</button>
        <span className="jt-form-eyebrow">ISH BERUVCHI</span>
        <h2>Yangi e’lon yarating</h2>
        <p>Tekshiruvdan keyin e’lon ishchilarga ko‘rinadi.</p>

        <section className="jt-form-section">
          <label>Ish turi
            <select value={category} onChange={(event) => setCategory(event.target.value as JobCategory)}>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>Ish nomi<input name="title" required placeholder="Masalan, Omborga yuk tushirish" /></label>
          <label>Tavsif<textarea name="description" required placeholder="Vazifa va talablarni yozing" rows={3} /></label>
        </section>

        <section className="jt-form-section">
          <div className="jt-form-grid">
            <label>Tuman<input name="district" required placeholder="Chilonzor" /></label>
            <label>Kerakli ishchi<input name="openings" required min="1" type="number" defaultValue="1" /></label>
          </div>
          <label>Aniq manzil<input name="address" required placeholder="Ko‘cha va bino raqami" /></label>
          <div className="jt-form-grid">
            <label>Boshlanish<input name="startsAt" required type="datetime-local" /></label>
            <label>Tugash<input name="endsAt" required type="datetime-local" /></label>
          </div>
          <label>Bir kunlik haq (so‘m)<input name="payAmount" required min="1" type="number" placeholder="200000" /></label>
        </section>

        {error && <p className="jt-form-error">{error}</p>}
        <button className="jt-apply" disabled={saving} type="submit">{saving ? "Saqlanmoqda..." : "Moderatsiyaga yuborish"}</button>
        <p className="jt-submit-note">Admin tasdiqlaganidan keyingina e’lon ochiq lentaga chiqadi.</p>
      </form>
    </div>
  );
}
