import { ScanStatus } from "../../../prisma/generated/enums";
import { PaginatedResponse } from "../../types";

export interface VolunteerLogEntry {
  id: string;
  status: ScanStatus;
  scannedToken: string;
  scannedAt: Date;
  attendeeName: string | null;
  attendeeUniversity: string | null;
  attendeeCategory: string | null;
}

export type PaginatedVolunteerLogs = PaginatedResponse<VolunteerLogEntry>;
