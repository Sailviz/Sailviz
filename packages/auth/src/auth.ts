import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@sailviz/db";
import { customSession, username } from "better-auth/plugins";
import { myPluginClient } from "./client-plugin";
import type { UserType, ClubType } from "@sailviz/types";
import { reactStartCookies } from "better-auth/react-start";

export const auth = betterAuth({
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://dev.sailviz.com",
    "https://sailviz.com",
  ],
  plugins: [
    username(),
    customSession(async ({ user, session }) => {
      const dbUser = (await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          roles: true,
        },
      })) as unknown as UserType | null;
      if (!dbUser) {
        throw new Error("User not found");
      }
      // some users may not have a clubId, so we need to handle that
      if (!dbUser.clubId) {
        return {
          user: dbUser,
          session,
          club: null,
        };
      }
      const club = (await prisma.club.findFirst({
        where: {
          id: dbUser.clubId,
        },
        include: {
          stripe: true,
        },
      })) as unknown as ClubType | null;
      return {
        club,
        user: dbUser,
        session,
      };
    }),
    myPluginClient(),
    reactStartCookies(),
  ],
  user: {
    additionalFields: {
      startPage: {
        type: "string",
        required: true,
        defaultValue: "Dashboard",
        input: false,
      },
    },
  },
  club: {
    type: "json",
    required: true,
    defaultValue: null,
    input: false,
  },
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
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
    },
  },
}) as ReturnType<typeof betterAuth>;
