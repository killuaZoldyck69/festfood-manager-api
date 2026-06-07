import { ScanStatus } from "../../../../prisma/generated/enums";
import { PaginatedResponse } from "../../../types";

export interface FormattedLog {
  id: string;
  status: ScanStatus;
  scannedToken: string;
  scannedAt: Date;
  volunteerName: string | null;
  volunteerEmail: string | null;
  attendeeName: string | null;
  attendeeEmail: string | null;
  studentId: string | null;
  category: string | null;
  university: string | null;
  section: string | null;
}

export interface LogFilterOptions {
  status?: ScanStatus;
  search?: string;
  category?: string;
  volunteerEmail?: string;
}
export type PaginatedLogResponse = PaginatedResponse<FormattedLog>;
