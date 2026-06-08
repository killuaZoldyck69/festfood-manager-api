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
        section: string | null;
        university: string | null;
        category: string | null;
        claimedAt: Date | null;
      };
    }
  | { status: "SUCCESS"; message: string; attendee: Attendee }
  | { status: "DEPLETED"; message: string };
