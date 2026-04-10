import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { Client } from "pg";

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};

  const out = {};
  const raw = readFileSync(filePath, "utf8");

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    out[key] = value;
  }

  return out;
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

async function main() {
  const root = process.cwd();
  const envPath = resolve(root, ".env.local");
  const sqlPath = resolve(root, "scripts", "seed-project-hailmary.sql");

  const envFromFile = parseEnvFile(envPath);
  const databaseUrlRaw = process.env.DATABASE_URL || envFromFile.DATABASE_URL;

  if (!databaseUrlRaw) {
    throw new Error("DATABASE_URL not found in environment or .env.local");
  }

  const databaseUrl = stripQuotes(databaseUrlRaw).trim();
  const sql = readFileSync(sqlPath, "utf8");

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    await client.query(sql);
    console.log("Seed completed: Project Hail Mary now exists for all current users and will be auto-added for new users.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
