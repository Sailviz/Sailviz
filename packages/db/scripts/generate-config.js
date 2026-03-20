// scripts/generate-config.js
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

function findPnpmMonorepoRoot(startDir = process.cwd()) {
  let currentDir = startDir;

  while (currentDir !== path.parse(currentDir).root) {
    const workspaceFile = path.join(currentDir, "pnpm-workspace.yaml");
    if (fs.existsSync(workspaceFile)) {
      return currentDir; // Found the root
    }
    currentDir = path.dirname(currentDir); // Move up one directory
  }

  throw new Error(
    "pnpm-workspace.yaml not found. Are you sure this is a PNPM monorepo?"
  );
}

const monorepoRoot = findPnpmMonorepoRoot();

// Decide which env file to load
console.log("Generating config.ts from .env files...");
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
const env = process.env.NODE_ENV || "development";
const envPath = monorepoRoot + `/packages/db/.env.${env}`;

console.log(`Loading environment from: ${envPath}`);

// Parse the env file
const parsed = dotenv.config({ path: envPath }).parsed || {};

// Generate TypeScript config file
const lines = Object.entries(parsed).map(
  ([key, value]) => `export const ${key} = ${JSON.stringify(value)};`
);

const output = `// AUTO-GENERATED FILE. Do not edit.
${lines.join("\n")}
`;

fs.writeFileSync(monorepoRoot + "/packages/db/src/config.ts", output);
console.log("Generated src/config.ts");
