import type { SocialLink } from "@/types";

import type { SocialLinkRow } from "@/server/repositories/social-links.repository";

export function mapSocialLinkRow(row: SocialLinkRow): SocialLink {
  return {
    id: row.id,
    platform: row.platform,
    label: row.label,
    ...(row.username ? { username: row.username } : {}),
    url: row.url,
    ...(row.followerCount === null ? {} : { followerCount: row.followerCount }),
    ...(row.description ? { description: row.description } : {}),
    enabled: row.enabled,
    order: row.sortOrder,
  };
}
