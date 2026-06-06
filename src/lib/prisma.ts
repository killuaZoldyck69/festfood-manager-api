import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../prisma/generated/client";
import { envConfig } from "../shared/config/env";
import { logger } from "../shared/logger";

const connectionString = `${envConfig.DATABASE_URL}`;

const adapter = new PrismaPg({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const prisma = new PrismaClient({ adapter });

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info("Database connection established.");
  } catch (error) {
    logger.error({ error }, "Failed to connect to the database.");
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  logger.info("Database connection closed.");
};

export { prisma };
