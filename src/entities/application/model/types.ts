export type ApplicationStatus =
  | "pending"
  | "selected"
  | "rejected"
  | "withdrawn";

export type JobApplication = {
  id: string;
  jobId: string;
  workerId: string;
  status: ApplicationStatus;
  note: string | null;
  createdAt: string;
};
