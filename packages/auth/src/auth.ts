import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@sailviz/db";
import { organization, username } from "better-auth/plugins";
import { reactStartCookies } from "better-auth/react-start";
import * as config from "./config";

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
  plugins: [username(), organization(), reactStartCookies()],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24, // Cache duration in seconds
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
}) as ReturnType<typeof betterAuth>;
