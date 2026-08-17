import type { ApplicationStatus } from "./types";
import type { JobCategory } from "@/entities/job/model/types";

export type WorkerApplication = {
  id: string;
  status: ApplicationStatus;
  note: string | null;
  createdAt: string;
  job: {
    id: string;
    category: JobCategory;
    title: string;
    district: string;
    payAmount: number;
  } | null;
};
