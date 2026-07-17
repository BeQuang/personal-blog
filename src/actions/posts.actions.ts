"use server";

import { revalidatePath } from "next/cache";

import {
  actionFailed,
  actionSucceeded,
} from "@/actions/action-result";
import * as postsService from "@/server/services/posts.service";
import type { AdminActionResult, PostMutationInput } from "@/types";

function revalidatePostRoutes(slug?: string) {
  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function createPostAction(input: PostMutationInput): Promise<AdminActionResult> {
  try {
    const post = await postsService.createPost(input);
    revalidatePostRoutes(post.slug);
    return actionSucceeded("Đã tạo bài viết.");
  } catch (error) {
    return actionFailed(error, "slug");
  }
}

export async function updatePostAction(
  id: string,
  input: PostMutationInput,
): Promise<AdminActionResult> {
  try {
    const post = await postsService.updatePost(id, input);
    revalidatePostRoutes(post.slug);
    return actionSucceeded("Đã cập nhật bài viết.");
  } catch (error) {
    return actionFailed(error, "slug");
  }
}

export async function setPostStatusAction(
  id: string,
  status: "draft" | "published",
): Promise<AdminActionResult> {
  try {
    const post = await postsService.setPostStatus(id, status);
    revalidatePostRoutes(post.slug);
    return actionSucceeded(status === "published" ? "Đã xuất bản bài viết." : "Đã gỡ xuất bản bài viết.");
  } catch (error) {
    return actionFailed(error);
  }
}

export async function setPostFeaturedAction(
  id: string,
  featured: boolean,
): Promise<AdminActionResult> {
  try {
    await postsService.setPostFeatured(id, featured);
    revalidatePostRoutes();
    return actionSucceeded(featured ? "Đã đặt bài viết nổi bật." : "Đã bỏ trạng thái nổi bật.");
  } catch (error) {
    return actionFailed(error);
  }
}

export async function archivePostAction(id: string): Promise<AdminActionResult> {
  try {
    const post = await postsService.archivePost(id);
    revalidatePostRoutes(post.slug);
    return actionSucceeded("Đã lưu trữ bài viết.");
  } catch (error) {
    return actionFailed(error);
  }
}
