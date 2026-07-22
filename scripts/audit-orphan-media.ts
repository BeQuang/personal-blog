import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

if (existsSync(".env.local")) loadEnvFile(".env.local");

async function main() {
  const shouldDelete = process.argv.includes("--delete");
  const minimumAgeHours = Number(process.env.MEDIA_ORPHAN_MIN_AGE_HOURS ?? "24");
  if (!Number.isFinite(minimumAgeHours) || minimumAgeHours < 1) {
    throw new Error("MEDIA_ORPHAN_MIN_AGE_HOURS must be at least 1");
  }

  const [{ getMediaStorage }, { findAllMediaObjectKeys }, { postgresClient }] =
    await Promise.all([
      import("@/server/storage/media-storage"),
      import("@/server/repositories/media.repository"),
      import("@/server/database/client"),
    ]);

  try {
    const storage = getMediaStorage();
    const [storedObjects, databaseKeys] = await Promise.all([
      storage.listObjects("images/"),
      findAllMediaObjectKeys(),
    ]);
    const cutoff = Date.now() - minimumAgeHours * 60 * 60 * 1_000;
    const orphans = storedObjects.filter(
      (item) =>
        !databaseKeys.has(item.objectKey) &&
        item.lastModified !== null &&
        item.lastModified.getTime() <= cutoff,
    );

    console.log(JSON.stringify({
      mode: shouldDelete ? "delete" : "dry-run",
      minimumAgeHours,
      scanned: storedObjects.length,
      orphanCount: orphans.length,
      orphans: orphans.map((item) => ({
        objectKey: item.objectKey,
        lastModified: item.lastModified?.toISOString() ?? null,
        sizeBytes: item.sizeBytes,
      })),
    }, null, 2));

    if (shouldDelete) {
      for (const orphan of orphans) {
        await storage.deleteObject(orphan.objectKey);
      }
      console.log(`Deleted ${orphans.length} confirmed orphan object(s).`);
    }
  } finally {
    await postgresClient.end({ timeout: 5 });
  }
}

void main();
