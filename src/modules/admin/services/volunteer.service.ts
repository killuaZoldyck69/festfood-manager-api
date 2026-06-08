import { prisma } from "../../../lib/prisma";
import { auth } from "../../../lib/auth";
import { AppError } from "../../../errors/AppError";
import {
  CreateVolunteerDTO,
  VolunteerListItem,
} from "../types/volunteer.types";

export const registerVolunteerAccount = async (
  name: string,
  email: string,
  password: string,
): Promise<CreateVolunteerDTO> => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError(400, "An account with this email already exists.");
  }

  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
      role: "VOLUNTEER",
    },
  });

  return {
    id: result.user.id,
    name: result.user.name,
    email: result.user.email,
    role: result.user.role || "VOLUNTEER",
    createdAt: result.user.createdAt,
  };
};

export const getVolunteersList = async (): Promise<VolunteerListItem[]> => {
  const volunteers = await prisma.user.findMany({
    where: { role: "VOLUNTEER", deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { scanLogs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (volunteers.length === 0) return [];

  const volunteerIds = volunteers.map((v) => v.id);

  const scanStats = await prisma.scanLog.groupBy({
    by: ["volunteerId", "status"],
    where: { volunteerId: { in: volunteerIds } },
    _count: { _all: true },
  });

  return volunteers.map((volunteer) => {
    const vStats = scanStats.filter((s) => s.volunteerId === volunteer.id);

    const getCount = (statusName: string) =>
      vStats.find((s) => s.status === statusName)?._count._all || 0;

    return {
      id: volunteer.id,
      name: volunteer.name,
      email: volunteer.email,
      role: volunteer.role || "VOLUNTEER",
      createdAt: volunteer.createdAt,
      totalScans: volunteer._count.scanLogs,
      successScans: getCount("SUCCESS"),
      duplicateScans: getCount("DUPLICATE"),
      invalidScans: getCount("INVALID"),
    };
  });
};

export const removeVolunteer = async (volunteerId: string): Promise<void> => {
  const existingUser = await prisma.user.findUnique({
    where: { id: volunteerId, deletedAt: null },
  });

  if (!existingUser) throw new AppError(404, "Volunteer not found.");
  if (existingUser.role === "ADMIN")
    throw new AppError(403, "Cannot delete other Admins.");

  await prisma.user.update({
    where: { id: volunteerId },
    data: { deletedAt: new Date() },
  });
};

export const wipeAllVolunteers = async (): Promise<void> => {
  await prisma.user.deleteMany({
    where: { role: "VOLUNTEER" },
  });
};
