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
  const envFromFile = parseEnvFile(envPath);
  const databaseUrlRaw = process.env.DATABASE_URL || envFromFile.DATABASE_URL;

  if (!databaseUrlRaw) {
    throw new Error("DATABASE_URL not found in environment or .env.local");
  }

  const client = new Client({
    connectionString: stripQuotes(databaseUrlRaw).trim(),
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    const result = await client.query(`
      SELECT
        (SELECT COUNT(*)::int FROM auth.users) AS users,
        (SELECT COUNT(*)::int FROM public.books WHERE pdf_url = '/project-hailmary-book/phm-book.pdf') AS seeded,
        (SELECT COUNT(*)::int FROM auth.users u WHERE NOT EXISTS (
          SELECT 1 FROM public.books b
          WHERE b.user_id = u.id
            AND b.pdf_url = '/project-hailmary-book/phm-book.pdf'
        )) AS missing,
        (SELECT COUNT(*)::int
         FROM pg_trigger t
         JOIN pg_class c ON c.oid = t.tgrelid
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE t.tgname = 'on_auth_user_created_seed_project_hailmary'
           AND n.nspname = 'auth'
           AND NOT t.tgisinternal
        ) AS trigger_count;
    `);

    console.log(result.rows[0]);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Check failed:", err.message);
  process.exit(1);
});
