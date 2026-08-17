export type UserRole = "worker" | "employer";

export type CurrentUser = {
  id: string;
  telegramId: number;
  fullName: string;
  telegramUsername: string | null;
  phone: string | null;
  birthDate: string | null;
  district: string | null;
  experienceYears: number | null;
  about: string | null;
  activeRole: UserRole;
  roles: UserRole[];
  isAdmin?: boolean;
};
