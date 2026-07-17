import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

import { and, eq, inArray } from "drizzle-orm";

if (existsSync(".env.local")) loadEnvFile(".env.local");

async function main() {
  const { database, postgresClient } = await import("@/server/database/client");
  const { auditLogs, galleryItems, mediaAssets, profiles } = await import("@/server/database/schema");
  const repository = await import("@/server/repositories/media.repository");
  const [actor] = await database
    .select({ id: profiles.id })
    .from(profiles)
    .where(and(eq(profiles.role, "super_admin"), eq(profiles.status, "active")))
    .limit(1);
  if (!actor) throw new Error("An active super_admin profile is required");

  const unreferencedId = randomUUID();
  const referencedId = randomUUID();
  const galleryId = randomUUID();
  const mediaIds = [unreferencedId, referencedId];

  try {
    await database.insert(mediaAssets).values(mediaIds.map((id) => ({
      id,
      type: "image" as const,
      provider: "r2" as const,
      visibility: "public" as const,
      status: "ready" as const,
      objectKey: `images/2026/07/${randomUUID()}.png`,
      publicUrl: `https://example.invalid/${id}.png`,
      originalFilename: `${id}.png`,
      mimeType: "image/png",
      extension: "png",
      sizeBytes: 1,
      uploadedBy: actor.id,
      metadata: { purpose: "gallery", test: "stage16" },
    })));
    await database.insert(galleryItems).values({
      id: galleryId,
      mediaAssetId: referencedId,
      title: "Stage 16 media usage test",
      category: "test",
      alt: "Temporary test image",
      status: "draft",
    });

    const blocked = await repository.softDeleteMediaAssetIfUnused(referencedId, actor.id);
    if (blocked.outcome !== "in_use" || !blocked.usage.includes("gallery")) {
      throw new Error("Referenced media was not protected from deletion");
    }

    const deleted = await repository.softDeleteMediaAssetIfUnused(unreferencedId, actor.id);
    if (deleted.outcome !== "deleted" || !deleted.row.deletedAt) {
      throw new Error("Unreferenced media was not soft-deleted");
    }
    const restored = await repository.restoreMediaAssetAfterStorageFailure(unreferencedId, actor.id);
    if (!restored || restored.status !== "ready" || restored.deletedAt) {
      throw new Error("Media rollback did not restore the ready record");
    }

    console.log(JSON.stringify({
      referencedDelete: "blocked",
      rollback: "passed",
      softDelete: "passed",
    }));
  } finally {
    await database.delete(galleryItems).where(eq(galleryItems.id, galleryId));
    await database.delete(auditLogs).where(and(
      eq(auditLogs.entityType, "media_asset"),
      inArray(auditLogs.entityId, mediaIds),
    ));
    await database.delete(mediaAssets).where(inArray(mediaAssets.id, mediaIds));
    await postgresClient.end({ timeout: 5 });
  }
}

void main();
