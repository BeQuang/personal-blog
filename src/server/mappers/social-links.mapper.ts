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
    ...(row.likesCount === null ? {} : { likesCount: row.likesCount }),
    audienceSource: row.audienceSource as SocialLink["audienceSource"],
    audienceSyncStatus: row.audienceSyncStatus as SocialLink["audienceSyncStatus"],
    ...(row.audienceLastSyncedAt
      ? { audienceLastSyncedAt: row.audienceLastSyncedAt.toISOString() }
      : {}),
    ...(row.audienceSyncError ? { audienceSyncError: row.audienceSyncError } : {}),
    ...(row.description ? { description: row.description } : {}),
    enabled: row.enabled,
    order: row.sortOrder,
  };
}
