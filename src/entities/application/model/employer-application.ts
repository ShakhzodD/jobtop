export type EmployerApplication = {
  id: string;
  status: "pending" | "selected" | "rejected" | "withdrawn";
  note: string | null;
  createdAt: string;
  worker: {
    id: string;
    fullName: string;
    telegramUsername: string | null;
    phone: string | null;
    district: string | null;
    birthDate: string | null;
    experienceYears: number | null;
    about: string | null;
  } | null;
};
