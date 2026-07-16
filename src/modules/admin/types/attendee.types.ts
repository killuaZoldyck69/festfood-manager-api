import { PaginatedResponse } from "../../../types";

export interface AttendeeListItem {
  id: string;
  name: string;
  email: string;
  studentId: string;
  university: string;
  department: string;
  phone: string;
  role: string;
  segment: string;
  semester: string;
  team: string;
  qrToken: string;
  emailStatus: string;
  foodClaimed: boolean;
  breakfastClaimed?: boolean;
  breakfastClaimedAt?: Date | null;
  lunchClaimed?: boolean;
  lunchClaimedAt?: Date | null;
  claimedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  scannerName: string | null;
  scannerRole: string | null;
  breakfastScannerName?: string | null;
  lunchScannerName?: string | null;
}

export interface AttendeeFilterOptions {
  search?: string;
  role?: string;
  segment?: string;
  status?: "CLAIMED" | "UNCLAIMED";
  university?: string;
  mealType?: string;
}

export type PaginatedAttendeeResponse = PaginatedResponse<AttendeeListItem>;
