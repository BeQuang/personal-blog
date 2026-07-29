export type SocialPlatform =
  | "facebook"
  | "youtube"
  | "tiktok"
  | "instagram"
  | "x"
  | "threads"
  | "zalo"
  | "telegram"
  | "discord"
  | "website"
  | "email";

export type SocialAudienceSource = "manual" | "youtube_api" | "tiktok_api" | "none";
export type SocialAudienceSyncStatus = "manual" | "pending" | "synced" | "error" | "unavailable";

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  label: string;
  username?: string;
  url: string;
  followerCount?: number;
  likesCount?: number;
  audienceSource: SocialAudienceSource;
  audienceSyncStatus: SocialAudienceSyncStatus;
  audienceLastSyncedAt?: string;
  audienceSyncError?: string;
  description?: string;
  enabled: boolean;
  order: number;
}
