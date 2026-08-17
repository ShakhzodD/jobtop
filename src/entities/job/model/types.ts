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
  startsAt: string;
  endsAt: string;
  pay: number;
  openings: number;
  externalUrl?: string;
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
  sourceName?: string;
  sourceUrl?: string;
};

export type EmployerJob = {
  id: string;
  title: string;
  category: JobCategory;
  district: string;
  startsAt: string;
  payAmount: number;
  openings: number;
  status: "pending_moderation" | "published" | "filled" | "cancelled";
  applicationCount: number;
  selectedCount: number;
};
