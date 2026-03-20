import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@sailviz/db";
import { anonymous, bearer, organization, username } from "better-auth/plugins";
import * as config from "./config";
import { myPlugin } from "./plugin";
import { userFavouriteOrgsSchema } from "packages/types/src/types";

export const auth = betterAuth({
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://dev.sailviz.com",
    "https://api.dev.sailviz.com",
    "https://sailviz.com",
    "https://api.sailviz.com",
    "http://tauri.localhost",
  ],
  plugins: [
    organization({
      teams: {
        enabled: true,
      },
    }),
    myPlugin(),
    bearer(),
    anonymous(),
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24, // Cache duration in seconds
    },
  },
  user: {
    additionalFields: {
      startPage: {
        type: "string",
        defaultValue: "/dashboard/me",
        required: true,
      },
    },
  },
  database: prismaAdapter(prisma, {
    provider: "mysql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 4,
  },
  socialProviders: {
    github: {
      clientId: config.AUTH_GITHUB_ID as string,
      clientSecret: config.AUTH_GITHUB_SECRET as string,
    },
  },
  advanced: {
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
        },
      },
    },
  },
}) as ReturnType<typeof betterAuth>;
