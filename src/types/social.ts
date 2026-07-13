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

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  label: string;
  username?: string;
  url: string;
  followerCount?: number;
  description?: string;
  enabled: boolean;
  order: number;
}
