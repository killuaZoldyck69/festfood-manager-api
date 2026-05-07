import app from "./app";
import { prisma } from "./lib/prisma";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Professional Touch: Graceful Shutdown
// Ensures that if your server restarts, it cleanly disconnects from the database
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
});
