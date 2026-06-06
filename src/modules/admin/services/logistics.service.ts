import { prisma } from "../../../lib/prisma";

export const updateLogisticsInventory = async (
  totalAvailable: number,
): Promise<void> => {
  await prisma.eventLogistics.upsert({
    where: { id: 1 },
    update: { totalAvailable },
    create: { id: 1, totalAvailable },
  });
};

export const resetEventInventory = async (): Promise<void> => {
  await prisma.eventLogistics.upsert({
    where: { id: 1 },
    update: { totalAvailable: 0 },
    create: { id: 1, totalAvailable: 0 },
  });
};
