import { ScanStatus } from "../../../../prisma/generated/enums";
import { PaginatedResponse } from "../../../types";

export interface FormattedLog {
  id: string;
  status: ScanStatus;
  scannedToken: string;
  scannedAt: Date;
  volunteerName: string | null;
  attendeeName: string | null;
}

export interface LogFilterOptions {
  status?: ScanStatus;
  search?: string;
}

export type PaginatedLogResponse = PaginatedResponse<FormattedLog>;
