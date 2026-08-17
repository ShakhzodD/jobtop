export type UserRole = "worker" | "employer";

export type CurrentUser = {
  id: string;
  telegramId: number;
  fullName: string;
  telegramUsername: string | null;
  phone: string | null;
  activeRole: UserRole;
  roles: UserRole[];
  isAdmin?: boolean;
};
