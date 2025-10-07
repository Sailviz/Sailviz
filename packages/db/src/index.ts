import "dotenv/config";
import { PrismaClient } from "./generated";

const prisma = new PrismaClient({
  log: ["warn", "error"],
});
export default prisma;
