import dotenv from "dotenv";

dotenv.config();

const envConfig = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL,
  betterAuthSecret: process.env.BETTER_AUTH_SECRET,
  betterAuthUrl: process.env.BETTER_AUTH_URL,
  appUrl: process.env.APP_URL,
};

// Type Guards: Force the server to crash IMMEDIATELY if a critical variable is missing
if (!envConfig.databaseUrl) {
  throw new Error("FATAL ERROR: DATABASE_URL is missing from your .env file!");
}

if (!envConfig.betterAuthSecret) {
  throw new Error(
    "FATAL ERROR: BETTER_AUTH_SECRET is missing from your .env file!",
  );
}
export default envConfig;
