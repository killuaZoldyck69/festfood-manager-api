import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import envConfig from "../shared/config/env";
import { bearer } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: envConfig.betterAuthUrl,

  trustedOrigins:
    envConfig.nodeEnv === "development"
      ? ["*", "festfoodmanagermobile://", "exp://"]
      : [envConfig.appUrl as string, "festfoodmanagermobile://"],

  emailAndPassword: {
    enabled: true,
  },
  plugins: [bearer()],
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
