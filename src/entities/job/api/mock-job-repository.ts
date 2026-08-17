import type { Job } from "../model/types";

const jobs: Job[] = [
  {
    id: "demo-1",
    category: "Kuryer",
    title: "Buyurtmalarni yetkazib beruvchi",
    company: "Samarqand Osh Markazi",
    district: "Chilonzor",
    schedule: "Bugun · 10:00–19:00",
    pay: 220000,
    openings: 2,
    label: "Tezkor",
  },
  {
    id: "demo-2",
    category: "Xizmat",
    title: "Kafe uchun ofitsiant yordamchisi",
    company: "Mazza Cafe",
    district: "Yunusobod",
    schedule: "Bugun · 12:00–22:00",
    pay: 180000,
    openings: 1,
  },
  {
    id: "demo-3",
    category: "Yuk tashish",
    title: "Omborga yuk tushirish",
    company: "Baraka Logistic",
    district: "Sergeli",
    schedule: "Bugun · 09:00–18:00",
    pay: 250000,
    openings: 3,
    label: "3 joy",
  },
  {
    id: "demo-4",
    category: "Tozalash",
    title: "Xonadon tozalash",
    company: "Dilnoza A.",
    district: "Mirzo Ulug‘bek",
    schedule: "Bugun · 14:00–19:00",
    pay: 160000,
    openings: 1,
  },
];

export function getMockJobs(): Job[] {
  return jobs;
}
