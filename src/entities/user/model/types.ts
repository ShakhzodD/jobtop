export type UserRole = "worker" | "employer";

export type CurrentUser = {
  id: string;
  telegramId: number;
  fullName: string;
  telegramUsername: string | null;
  avatarUrl: string | null;
  phone: string | null;
  birthDate: string | null;
  district: string | null;
  experienceYears: number | null;
  about: string | null;
  workerCategories: JobCategory[];
  activeRole: UserRole;
  roles: UserRole[];
  isAdmin?: boolean;
};
import type { JobCategory } from "@/entities/job/model/types";
