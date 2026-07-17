import type { Metadata } from "next";

import { AdminPostsManager } from "@/components/admin/AdminPostsManager";
import { hasPermission, requireAdminPagePermission } from "@/server/auth";
import {
  getAdminPosts,
  getPostMediaOptions,
} from "@/server/services/posts.service";
import { getCategories, getTags } from "@/server/services/taxonomies.service";

export const metadata: Metadata = { title: "Bài viết" };

export default async function AdminPostsPage() {
  const currentUser = await requireAdminPagePermission("content:view");
  const [posts, categories, tags, mediaOptions] = await Promise.all([
    getAdminPosts(),
    getCategories(),
    getTags(),
    getPostMediaOptions(),
  ]);

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
