import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { envConfig } from "../shared/config/env";
import { bearer } from "better-auth/plugins";

const parseTrustedOrigins = (): string[] => {
  const baseOrigins = ["festfoodmanagermobile://", "exp://"];

  if (envConfig.APP_URL) {
    baseOrigins.push(envConfig.APP_URL);
  }

  if (envConfig.TRUSTED_ORIGINS) {
    const extra = envConfig.TRUSTED_ORIGINS.split(",").map((o) => o.trim());
    baseOrigins.push(...extra);
  }

  return envConfig.NODE_ENV === "development"
    ? ["*", ...baseOrigins]
    : baseOrigins;
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: envConfig.BETTER_AUTH_URL,
  trustedOrigins: parseTrustedOrigins(),
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
      phone: {
        type: "string",
        required: false,
      },
    },
  },
});
