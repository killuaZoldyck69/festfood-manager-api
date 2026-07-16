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
  segment: string | null;
  university: string | null;
  semester: string | null;
  team: string | null;
  volunteerName: string | null;
  volunteerEmail: string | null;
  mealType: string | null;
}

export type PaginatedVolunteerLogs = PaginatedResponse<VolunteerLogEntry>;
