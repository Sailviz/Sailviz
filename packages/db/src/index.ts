import "dotenv/config";
import { PrismaClient, Prisma } from "./generated/index.js";
import { DATABASE_URL } from "./config.js";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const prisma = (globalForPrisma.prisma ||
  new PrismaClient({
    log: ["warn", "error", "info"],
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
  }).$extends({
    query: {
      user: {
        async findUnique({ args, query }) {
          args.include = {
            ...args.include,
            userFavouriteOrgs: true,
            signOnProfiles: true,
          };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.include = {
            ...args.include,
            userFavouriteOrgs: true,
            signOnProfiles: true,
          };
          return query(args);
        },
      },
      organization: {
        async findUnique({ args, query }) {
          args.include = {
            ...args.include,
            orgData: {
              include: {
                duties: true,
              },
            },
          };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.include = {
            ...args.include,
            orgData: {
              include: {
                duties: true,
              },
            },
          };
          return query(args);
        },
      },
    },
  })) as PrismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
