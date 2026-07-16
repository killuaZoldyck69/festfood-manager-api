import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";

export const assertInventoryAvailable = async (mealType: "BREAKFAST" | "LUNCH"): Promise<void> => {
  const logistics = await prisma.eventLogistics.findUnique({
    where: { id: 1 },
  });

  if (!logistics) {
    throw new AppError(400, "Event logistics not initialized.");
  }

  const totalBreakfastServed = await prisma.attendee.count({ where: { breakfastClaimed: true } });
  const totalLunchServed = await prisma.attendee.count({ where: { lunchClaimed: true } });

  if (mealType === "BREAKFAST" && totalBreakfastServed >= logistics.totalBreakfastAvailable) {
    throw new AppError(400, "Breakfast inventory depleted.");
  }
  
  if (mealType === "LUNCH" && totalLunchServed >= logistics.totalLunchAvailable) {
    throw new AppError(400, "Lunch inventory depleted.");
  }
};
