export type VideoPlatform =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "facebook"
  | "internal";

export type VideoOrientation = "landscape" | "portrait";

export interface VideoItem {
  id: string;
  title: string;
  description?: string;
  platform: VideoPlatform;
  orientation: VideoOrientation;
  thumbnail: string;
  videoUrl: string;
  duration?: string;
  viewCount?: number;
  topic: string;
  featured: boolean;
  publishedAt: string;
}
