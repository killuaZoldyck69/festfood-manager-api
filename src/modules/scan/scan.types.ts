import { Attendee } from "../../../prisma/generated/client";

export type ScanResult =
  | { status: "INVALID"; message: string }
  | {
      status: "DUPLICATE";
      message: string;
      attendee: {
        name: string;
        email: string;
        studentId: string;
        semester: string | null;
        team: string | null;
        university: string | null;
        segment: string | null;
        claimedAt: Date | null;
      };
    }
  | { status: "SUCCESS"; message: string; attendee: Attendee }
  | { status: "DEPLETED"; message: string };
