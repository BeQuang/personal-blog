import type { Metadata } from "next";

import { AdminPostsManager } from "@/components/admin/AdminPostsManager";
import { hasPermission } from "@/server/auth";
import { getAdminPostsPageData } from "@/server/services/admin-posts-page.service";

export const metadata: Metadata = { title: "Bài viết" };

export default async function AdminPostsPage() {
  const {
    currentUser,
    posts,
    categories,
    tags,
    mediaOptions,
  } = await getAdminPostsPageData();

  return (
    <AdminPostsManager
      posts={posts}
      categories={categories}
      tags={tags}
      mediaOptions={mediaOptions}
      canWrite={hasPermission(currentUser.role, "content:write")}
      canPublish={hasPermission(currentUser.role, "content:publish")}
    />
  );
}
