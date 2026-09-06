/**
 * Pushes the fixtures in src/lib/seed-data.ts into a connected Supabase
 * project. Idempotent — every row has a stable deterministic id, so
 * re-running this is a safe upsert, not a duplicate insert.
 *
 * Usage: npm run seed   (requires SUPABASE_SERVICE_ROLE_KEY in .env.local)
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import {
  courses,
  institutions,
  programRequirements,
  programs,
  sourceSnapshots,
  supplementalRequirements,
} from "../../src/lib/seed-data";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY in .env.local.\n" +
      "See README.md 'Supabase setup' — the app itself runs fine without these; " +
      "only `npm run seed` needs them."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function upsert(table: string, rows: object[]) {
  if (rows.length === 0) return;
  const { error } = await supabase.from(table).upsert(rows, { onConflict: "id" });
  if (error) {
    console.error(`Failed to seed ${table}:`, error.message);
    process.exit(1);
  }
  console.log(`Seeded ${rows.length} row(s) into ${table}`);
}

async function main() {
  console.log("Seeding Pathfinder Canada fixture data (see docs/DATA_VERIFICATION.md)...\n");

  // Order matters for FKs: institutions/courses first, then programs, then
  // source_snapshots, then program_requirements/supplemental_requirements.
  await upsert("institutions", institutions);
  await upsert("courses", courses);
  await upsert("programs", programs);
  await upsert("source_snapshots", sourceSnapshots);
  await upsert("program_requirements", programRequirements);
  await upsert("supplemental_requirements", supplementalRequirements);

  console.log("\nDone. This is fictional sample data — see docs/DATA_VERIFICATION.md.");
}

main();
