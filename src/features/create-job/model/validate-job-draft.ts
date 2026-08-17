import { jobCategories, type JobCategory } from "@/entities/job/model/types";

export type JobDraft = {
  category: JobCategory;
  title: string;
  description: string;
  district: string;
  address: string;
  startsAt: string;
  endsAt: string;
  payAmount: number;
  openings: number;
};

export function parseJobDraft(value: unknown): JobDraft {
  if (!value || typeof value !== "object") throw new Error("Invalid job data");
  const data = value as Record<string, unknown>;
  const category = data.category;
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const description =
    typeof data.description === "string" ? data.description.trim() : "";
  const district =
    typeof data.district === "string" ? data.district.trim() : "";
  const address = typeof data.address === "string" ? data.address.trim() : "";
  const startsAt = typeof data.startsAt === "string" ? data.startsAt : "";
  const endsAt = typeof data.endsAt === "string" ? data.endsAt : "";
  const payAmount = Number(data.payAmount);
  const openings = Number(data.openings);

  if (
    !jobCategories.includes(category as JobCategory) ||
    !title ||
    !description ||
    !district ||
    !address
  )
    throw new Error("Required job fields are missing");
  if (
    !Number.isInteger(payAmount) ||
    payAmount <= 0 ||
    !Number.isInteger(openings) ||
    openings <= 0
  )
    throw new Error("Invalid pay or worker count");
  if (
    Number.isNaN(Date.parse(startsAt)) ||
    Number.isNaN(Date.parse(endsAt)) ||
    Date.parse(endsAt) <= Date.parse(startsAt)
  )
    throw new Error("Invalid working time");

  return {
    category: category as JobCategory,
    title,
    description,
    district,
    address,
    startsAt,
    endsAt,
    payAmount,
    openings,
  };
}
