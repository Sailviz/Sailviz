import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  platform: "node",
  target: "node22",
  format: ["cjs"],
  bundle: true,
  splitting: false,
  clean: true,
  noExternal: [
    "bullmq",
    "ioredis",
    "@sailviz/activity",
    "@sailviz/queue",
    "dotenv/config",
    "zod",
  ],
  external: ["@prisma/client", "prisma"],
});
