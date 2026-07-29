import "server-only";

import { z } from "zod";

const youtubeResponseSchema = z.object({
  items: z.array(z.object({
    id: z.string().min(1),
    statistics: z.object({
      hiddenSubscriberCount: z.boolean().optional(),
      subscriberCount: z.string().regex(/^\d+$/).optional(),
    }),
  })).default([]),
});

export interface YouTubeAudienceResult {
  channelId: string;
  subscriberCount: number | null;
  hiddenSubscriberCount: boolean;
}

type YouTubeReference =
  | { kind: "id"; value: string }
  | { kind: "handle"; value: string }
  | { kind: "username"; value: string };

export function parseYouTubeChannelReference(value: string): YouTubeReference {
  const url = new URL(value);
  const host = url.hostname.toLowerCase().replace(/^www\./, "").replace(/^m\./, "");
  if (host !== "youtube.com") {
    throw new Error("URL phải là liên kết kênh youtube.com.");
  }

  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length === 1 && segments[0]?.startsWith("@")) {
    return { kind: "handle", value: segments[0] };
  }
  if (segments[0] === "channel" && segments[1]) {
    return { kind: "id", value: segments[1] };
  }
  if (segments[0] === "user" && segments[1]) {
    return { kind: "username", value: segments[1] };
  }
  throw new Error("Hãy dùng URL dạng youtube.com/@handle hoặc youtube.com/channel/CHANNEL_ID.");
}

export async function fetchYouTubeAudience(
  channelUrl: string,
  externalId?: string | null,
  fetchImplementation: typeof fetch = fetch,
): Promise<YouTubeAudienceResult> {
  const apiKey = process.env.YOUTUBE_DATA_API_KEY?.trim();
  if (!apiKey) throw new Error("Thiếu cấu hình YOUTUBE_DATA_API_KEY.");

  const reference = externalId
    ? { kind: "id" as const, value: externalId }
    : parseYouTubeChannelReference(channelUrl);
  const query = new URLSearchParams({
    key: apiKey,
    part: "id,statistics",
    maxResults: "1",
  });
  query.set(
    reference.kind === "id"
      ? "id"
      : reference.kind === "handle"
        ? "forHandle"
        : "forUsername",
    reference.value,
  );

  const response = await fetchImplementation(
    `https://www.googleapis.com/youtube/v3/channels?${query.toString()}`,
    { cache: "no-store", signal: AbortSignal.timeout(10_000) },
  );
  if (!response.ok) {
    throw new Error(`YouTube Data API trả về HTTP ${response.status}.`);
  }

  const parsed = youtubeResponseSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("Phản hồi YouTube Data API không hợp lệ.");
  const channel = parsed.data.items[0];
  if (!channel) throw new Error("Không tìm thấy kênh YouTube từ URL đã nhập.");

  const hidden = channel.statistics.hiddenSubscriberCount === true;
  const subscriberCount = channel.statistics.subscriberCount;
  return {
    channelId: channel.id,
    subscriberCount: hidden || subscriberCount === undefined ? null : Number(subscriberCount),
    hiddenSubscriberCount: hidden,
  };
}
