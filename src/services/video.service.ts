import { videos } from "@/data/videos";
import type { VideoItem, VideoPlatform } from "@/types";
import { sortByDateDescending } from "@/utils/data";

export function getVideos(): VideoItem[] {
  return sortByDateDescending(videos, (video) => video.publishedAt);
}

export function getFeaturedVideos(limit?: number): VideoItem[] {
  const featuredVideos = getVideos().filter((video) => video.featured);
  return limit === undefined ? featuredVideos : featuredVideos.slice(0, limit);
}

export function getVideosByPlatform(platform: VideoPlatform): VideoItem[] {
  return getVideos().filter((video) => video.platform === platform);
}

export function getVideosByTopic(topic: string): VideoItem[] {
  const normalizedTopic = topic.trim().toLocaleLowerCase("vi-VN");
  return getVideos().filter(
    (video) => video.topic.toLocaleLowerCase("vi-VN") === normalizedTopic,
  );
}
