import { Attendee } from "../../../prisma/generated/client";

export type ScanResult =
  | { status: "INVALID"; message: string }
  | {
      status: "DUPLICATE";
      message: string;
      attendee: { name: string; claimedAt: Date | null };
    }
  | { status: "SUCCESS"; message: string; attendee: Attendee }
  | { status: "DEPLETED"; message: string };
