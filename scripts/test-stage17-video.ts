import { createHmac, randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

import { ValidationError } from "@/server/errors";

if (existsSync(".env.local")) loadEnvFile(".env.local");

async function main() {
  const { MuxVideoProvider } = await import("@/server/video/mux-provider");
  const {
    maximumVideoSizeBytes,
    parseCreateVideoUpload,
  } = await import("@/server/validation/videos.validation");

  const rejected: string[] = [];
  const mustReject = (label: string, input: unknown) => {
    try {
      parseCreateVideoUpload(input);
    } catch (error) {
      if (error instanceof ValidationError) {
        rejected.push(label);
        return;
      }
      throw error;
    }
    throw new Error(`${label} was unexpectedly accepted`);
  };

  const validInput = {
    title: "Stage 17 video",
    description: "Webhook verification test",
    orientation: "landscape",
    topic: "Test",
    featured: false,
    originalFilename: "stage17.mp4",
    mimeType: "video/mp4",
    sizeBytes: 1024,
  };
  parseCreateVideoUpload(validInput);
  mustReject("executable", { ...validInput, originalFilename: "stage17.exe" });
  mustReject("mime-mismatch", { ...validInput, originalFilename: "stage17.mov" });
  mustReject("oversized", { ...validInput, sizeBytes: maximumVideoSizeBytes + 1 });

  const webhookSecret = process.env.MUX_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("MUX_WEBHOOK_SECRET is required for video:test");
  const videoId = randomUUID();
  const assetId = `asset-${randomUUID()}`;
  const playbackId = `playback-${randomUUID()}`;
  const body = JSON.stringify({
    id: `event-${randomUUID()}`,
    type: "video.asset.ready",
    object: { id: assetId, type: "asset" },
    data: {
      id: assetId,
      status: "ready",
      passthrough: videoId,
      playback_ids: [{ id: playbackId, policy: "public" }],
      duration: 12.5,
      aspect_ratio: "16:9",
    },
  });
  const timestamp = Math.floor(Date.now() / 1000);
  const digest = createHmac("sha256", webhookSecret)
    .update(`${timestamp}.${body}`)
    .digest("hex");
  const provider = new MuxVideoProvider();
  const event = await provider.verifyWebhook(body, `t=${timestamp},v1=${digest}`);
  if (
    event.status !== "ready" ||
    event.videoId !== videoId ||
    event.assetId !== assetId ||
    event.playbackId !== playbackId
  ) {
    throw new Error("Verified webhook was mapped incorrectly");
  }

  let invalidSignatureRejected = false;
  try {
    await provider.verifyWebhook(body, `t=${timestamp},v1=${"0".repeat(64)}`);
  } catch {
    invalidSignatureRejected = true;
  }
  if (!invalidSignatureRejected) throw new Error("Invalid webhook signature was accepted");

  const playback = provider.createPlaybackData({
    id: assetId,
    status: "ready",
    passthrough: videoId,
    playbackId,
    duration: 12.5,
    aspectRatio: "16:9",
    error: null,
  });
  if (!playback.posterUrl.includes(playbackId) || !playback.streamUrl.includes(playbackId)) {
    throw new Error("Playback data is invalid");
  }

  const [{ database, postgresClient }, { videoWebhookEvents, videos }, { eq }, videoService] = await Promise.all([
    import("@/server/database/client"),
    import("@/server/database/schema"),
    import("drizzle-orm"),
    import("@/server/services/videos.service"),
  ]);
  const [migrationState] = await postgresClient.unsafe<Array<{
    migration_count: number;
    processing_error_column: boolean;
    row_level_security: boolean;
    webhook_events_table: boolean;
  }>>(`
    select
      (select count(*)::int from drizzle.__drizzle_migrations) as migration_count,
      exists (
        select 1 from information_schema.columns
        where table_schema = 'public'
          and table_name = 'videos'
          and column_name = 'processing_error'
      ) as processing_error_column,
      exists (
        select 1 from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public'
          and c.relname = 'video_webhook_events'
          and c.relrowsecurity
      ) as row_level_security,
      to_regclass('public.video_webhook_events') is not null as webhook_events_table
  `);
  if (
    !migrationState?.processing_error_column ||
    !migrationState.webhook_events_table ||
    !migrationState.row_level_security
  ) {
    throw new Error("Stage 17 migration is not fully applied");
  }
  const databaseVideoId = randomUUID();
  const failedEventId = `event-${randomUUID()}`;
  const readyEventId = `event-${randomUUID()}`;
  const lateProcessingEventId = `event-${randomUUID()}`;
  const lateUploadFailureEventId = `event-${randomUUID()}`;
  const eventIds = [
    failedEventId,
    readyEventId,
    lateProcessingEventId,
    lateUploadFailureEventId,
  ];
  let idempotency = "not-run";
  let failedState = "not-run";
  let readyState = "not-run";
  let lateEvent = "not-run";
  let lateUploadFailure = "not-run";
  let databaseVideoCreated = false;
  try {
    await database.insert(videos).values({
      id: databaseVideoId,
      title: "Stage 17 temporary webhook test",
      platform: "internal",
      orientation: "landscape",
      topic: "Test",
      muxUploadId: `upload-${randomUUID()}`,
      processingStatus: "uploading",
      contentStatus: "draft",
    });
    databaseVideoCreated = true;
    const baseEvent = {
      objectId: assetId,
      videoId: databaseVideoId,
      uploadId: null,
      assetId,
      playbackId: null,
      duration: null,
      aspectRatio: null,
      error: null,
    } as const;
    await videoService.processVerifiedVideoEvent({
      ...baseEvent,
      id: failedEventId,
      type: "video.asset.errored",
      status: "failed",
      error: "Synthetic processing failure",
    });
    const failedRow = await database.query.videos.findFirst({ where: eq(videos.id, databaseVideoId) });
    if (failedRow?.processingStatus !== "failed" || !failedRow.processingError) {
      throw new Error("Failed webhook did not persist the processing error");
    }
    failedState = "passed";

    const readyEvent = {
      ...baseEvent,
      id: readyEventId,
      type: "video.asset.ready",
      status: "ready" as const,
      playbackId,
      duration: 12.5,
      aspectRatio: "16:9",
    };
    const readyResult = await videoService.processVerifiedVideoEvent(readyEvent);
    const duplicateResult = await videoService.processVerifiedVideoEvent(readyEvent);
    if (readyResult.outcome !== "processed" || duplicateResult.outcome !== "duplicate") {
      throw new Error("Webhook event idempotency failed");
    }
    idempotency = "passed";
    const readyRow = await database.query.videos.findFirst({ where: eq(videos.id, databaseVideoId) });
    if (readyRow?.processingStatus !== "ready" || readyRow.muxPlaybackId !== playbackId) {
      throw new Error("Ready webhook did not persist playback data");
    }
    readyState = "passed";

    await videoService.processVerifiedVideoEvent({
      ...baseEvent,
      id: lateProcessingEventId,
      type: "video.asset.created",
      status: "processing",
    });
    const finalRow = await database.query.videos.findFirst({ where: eq(videos.id, databaseVideoId) });
    if (finalRow?.processingStatus !== "ready") {
      throw new Error("Late processing event downgraded a ready video");
    }
    lateEvent = "ignored-status-downgrade";

    await videoService.processVerifiedVideoEvent({
      ...baseEvent,
      id: lateUploadFailureEventId,
      type: "video.upload.errored",
      status: "failed",
      error: "Synthetic late upload failure",
    });
    const rowAfterLateUploadFailure = await database.query.videos.findFirst({
      where: eq(videos.id, databaseVideoId),
    });
    if (rowAfterLateUploadFailure?.processingStatus !== "ready") {
      throw new Error("Late upload failure downgraded a ready asset");
    }
    lateUploadFailure = "ignored-status-downgrade";
  } finally {
    if (databaseVideoCreated) {
      for (const eventId of eventIds) {
        await database.delete(videoWebhookEvents).where(eq(videoWebhookEvents.eventId, eventId));
      }
      await database.delete(videos).where(eq(videos.id, databaseVideoId));
    }
    await postgresClient.end({ timeout: 5 });
  }

  console.log(JSON.stringify({
    assetFailedState: failedState,
    assetReadyState: readyState,
    lateProcessingEvent: lateEvent,
    lateUploadFailureEvent: lateUploadFailure,
    migration: {
      appliedCount: migrationState.migration_count,
      processingErrorColumn: migrationState.processing_error_column,
      rowLevelSecurity: migrationState.row_level_security,
      webhookEventsTable: migrationState.webhook_events_table,
    },
    playbackData: "passed",
    validationRejected: rejected,
    webhookIdempotency: idempotency,
    webhookInvalidSignature: "rejected",
    webhookValidSignature: "passed",
  }));
}

void main();
