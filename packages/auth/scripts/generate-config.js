// scripts/generate-config.js
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Decide which env file to load
console.log("Generating config.ts from .env files...");
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
const env = process.env.NODE_ENV || "development";
const envPath = `./packages/auth/.env.${env}`;

// Fallback to plain .env if specific file not found
const finalPath = fs.existsSync(envPath)
  ? envPath
  : path.resolve(process.cwd(), ".env");

console.log(`Loading environment from: ${finalPath}`);

// Parse the env file
const parsed = dotenv.config({ path: finalPath }).parsed || {};

// Generate TypeScript config file
const lines = Object.entries(parsed).map(
  ([key, value]) => `export const ${key} = ${JSON.stringify(value)};`
);

const output = `// AUTO-GENERATED FILE. Do not edit.
${lines.join("\n")}
`;

fs.writeFileSync(
  path.resolve(process.cwd(), "./packages/auth/src/config.ts"),
  output
);
console.log("Generated src/config.ts");
