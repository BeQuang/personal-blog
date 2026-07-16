import { campaigns } from "@/data/campaigns";
import { events } from "@/data/events";
import { galleryItems } from "@/data/gallery";
import { posts } from "@/data/posts";
import { socialLinks } from "@/data/social-links";
import { videos } from "@/data/videos";
import type {
  AdminResource,
  AdminTableRow,
  BlogPost,
  GalleryItem,
  SocialLink,
} from "@/types";

export function getAdminRows(resource: AdminResource): AdminTableRow[] {
  switch (resource) {
    case "posts":
      return (posts as readonly BlogPost[]).map((post) => ({
        id: post.id,
        title: post.title,
        detail: post.excerpt,
        group: post.category,
        status: post.status,
        date: post.publishedAt ?? post.updatedAt,
        featured: post.featured,
        enabled: post.status === "published",
      }));
    case "social-links":
      return (socialLinks as readonly SocialLink[]).map((link) => ({
        id: link.id,
        title: link.label,
        detail: link.username ?? link.url,
        group: link.platform,
        enabled: link.enabled,
      }));
    case "videos":
      return videos.map((video) => ({
        id: video.id,
        title: video.title,
        detail: video.description,
        group: `${video.platform} · ${video.orientation}`,
        status: "published",
        date: video.publishedAt,
        featured: video.featured,
        enabled: true,
      }));
    case "gallery":
      return (galleryItems as readonly GalleryItem[]).map((item) => ({
        id: item.id,
        title: item.title,
        detail: item.description,
        group: item.category,
        status: "published",
        date: item.createdAt,
        enabled: true,
      }));
    case "events":
      return events.map((event) => ({
        id: event.id,
        title: event.title,
        detail: event.location ?? event.platform,
        group: event.type,
        status: event.status,
        date: event.startAt,
        featured: event.featured,
        enabled: event.status !== "cancelled",
      }));
    case "campaigns":
      return campaigns.map((campaign) => ({
        id: campaign.id,
        title: campaign.title,
        detail: campaign.description,
        group: "Marketing",
        status: campaign.status,
        date: campaign.startAt,
        featured: campaign.featured,
        enabled: campaign.status !== "draft",
      }));
  }
}
