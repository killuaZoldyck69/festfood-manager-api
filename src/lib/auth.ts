import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import envConfig from "../shared/config/env";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: envConfig.betterAuthUrl,
  trustedOrigins:
    envConfig.nodeEnv === "development" ? ["*"] : [envConfig.appUrl as string],
  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "VOLUNTEER",
      },
    },
  },
});
