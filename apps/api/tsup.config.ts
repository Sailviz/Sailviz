import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  platform: "node",
  target: "node22",
  format: ["cjs"],
  bundle: true,
  splitting: false,
  clean: true,
  noExternal: [/^@sailviz\//],
  external: ["@prisma/client", "prisma"],
});
