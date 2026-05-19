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
      : [
          envConfig.appUrl as string,
          "festfoodmanagermobile://",
          "exp://",
          "http://192.168.0.101:8081",
          "http://localhost:8081",
          "http://192.168.0.102:8081",
        ],

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
