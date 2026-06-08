import { ScanStatus } from "../../../prisma/generated/enums";
import { PaginatedResponse } from "../../types";

export interface VolunteerLogEntry {
  id: string;
  status: ScanStatus;
  scannedToken: string;
  scannedAt: Date;
  attendeeName: string | null;
  attendeeEmail: string | null;
  studentId: string | null;
  category: string | null;
  university: string | null;
  semester: string | null;
  section: string | null;
  volunteerName: string | null;
  volunteerEmail: string | null;
}

export type PaginatedVolunteerLogs = PaginatedResponse<VolunteerLogEntry>;
