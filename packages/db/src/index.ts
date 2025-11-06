import "dotenv/config";
import { PrismaClient } from "./generated/index.js";
import { DATABASE_URL } from "./config.js";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["warn", "error", "info", "query"],
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
