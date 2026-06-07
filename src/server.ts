import { Server } from "node:http";
import app from "./app";
import { connectDatabase, disconnectDatabase } from "./lib";
import { envConfig } from "./shared/config/env";
import { logger } from "./shared/logger";

const PORT = envConfig.PORT;

let server: Server;

const startServer = async () => {
  try {
    await connectDatabase();
    server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
};

startServer();

const shutdown = async () => {
  logger.info("🛑 Shutting down gracefully...");
  await disconnectDatabase();
  if (server) {
    server.close(() => {
      logger.info("HTTP server closed.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled Rejection");
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (error) => {
  logger.error({ error }, "Uncaught Exception");
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
