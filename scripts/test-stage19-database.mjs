import postgres from "postgres";

process.loadEnvFile(".env.local");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const sql = postgres(connectionString, {
  prepare: false,
  connect_timeout: 15,
  max: 1,
});

try {
  const enumRows = await sql`
    select enumlabel
    from pg_enum
    join pg_type on pg_type.oid = pg_enum.enumtypid
    where pg_type.typname = 'submission_status'
    order by enumsortorder
  `;
  const labels = enumRows.map((row) => row.enumlabel);
  for (const required of ["new", "read", "replied", "spam"]) {
    if (!labels.includes(required)) {
      throw new Error(`Missing submission_status value: ${required}`);
    }
  }

  const tableRows = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in (
        'contact_submissions',
        'newsletter_subscriptions',
        'campaign_submissions'
      )
  `;
  if (tableRows.length !== 3) {
    throw new Error("One or more submission tables are missing");
  }

  console.log("Stage 19 database schema: Passed");
} finally {
  await sql.end();
}
