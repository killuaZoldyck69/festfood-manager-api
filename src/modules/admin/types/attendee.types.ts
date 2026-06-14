import { PaginatedResponse } from "../../../types";

export interface AttendeeListItem {
  id: string;
  name: string;
  email: string;
  studentId: string;
  university: string;
  department: string;
  phoneNumber: string;
  role: string;
  category: string;
  semester: string;
  section: string;
  qrToken: string;
  foodClaimed: boolean;
  claimedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  scannerName: string | null;
  scannerRole: string | null;
}

export interface AttendeeFilterOptions {
  search?: string;
  role?: string;
  category?: string;
  status?: "CLAIMED" | "UNCLAIMED";
  university?: string;
}

export type PaginatedAttendeeResponse = PaginatedResponse<AttendeeListItem>;
