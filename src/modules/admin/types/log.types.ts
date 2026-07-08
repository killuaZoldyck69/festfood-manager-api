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
  segment: string | null;
  university: string | null;
  department: string | null;
  phone: string | null;
  semester: string | null;
  team: string | null;
  role: string | null;
}

export interface LogFilterOptions {
  status?: ScanStatus;
  search?: string;
  segment?: string;
  volunteerEmail?: string;
}
export type PaginatedLogResponse = PaginatedResponse<FormattedLog>;
