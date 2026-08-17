export const jobCategories = [
  "Kuryer",
  "Xizmat",
  "Yuk tashish",
  "Tozalash",
] as const;

export type JobCategory = (typeof jobCategories)[number];
export type Job = {
  id: string;
  category: JobCategory;
  title: string;
  company: string;
  district: string;
  schedule: string;
  pay: number;
  openings: number;
  label?: string;
};

export type ModerationJob = {
  id: string;
  category: JobCategory;
  title: string;
  description: string;
  district: string;
  address: string;
  startsAt: string;
  endsAt: string;
  payAmount: number;
  openings: number;
  createdAt: string;
};
