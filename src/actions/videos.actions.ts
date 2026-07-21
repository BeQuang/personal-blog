"use server";

import { revalidatePath } from "next/cache";

import { actionFailed, actionSucceeded } from "@/actions/action-result";
import * as videosService from "@/server/services/videos.service";
import type { AdminActionResult, VideoMutationInput } from "@/types";

function revalidateVideoRoutes() {
  revalidatePath("/admin/videos");
  revalidatePath("/videos");
  revalidatePath("/");
}

export async function createExternalVideoAction(
  input: VideoMutationInput,
): Promise<AdminActionResult> {
  try {
    await videosService.createExternalVideo(input);
    revalidateVideoRoutes();
    return actionSucceeded("Đã tạo video nền tảng ngoài.");
  } catch (error) {
    return actionFailed(error);
  }
}

export async function updateVideoAction(
  id: string,
  input: VideoMutationInput,
): Promise<AdminActionResult> {
  try {
    await videosService.updateVideo(id, input);
    revalidateVideoRoutes();
    return actionSucceeded("Đã cập nhật video.");
  } catch (error) {
    return actionFailed(error);
  }
}

export async function setVideoPublishedAction(
  id: string,
  published: boolean,
): Promise<AdminActionResult> {
  try {
    await videosService.setVideoPublished(id, published);
    revalidateVideoRoutes();
    return actionSucceeded(published ? "Đã xuất bản video." : "Đã gỡ xuất bản video.");
  } catch (error) {
    return actionFailed(error);
  }
}

export async function setVideoFeaturedAction(
  id: string,
  featured: boolean,
): Promise<AdminActionResult> {
  try {
    await videosService.setVideoFeatured(id, featured);
    revalidateVideoRoutes();
    return actionSucceeded(featured ? "Đã đặt video nổi bật." : "Đã bỏ trạng thái nổi bật.");
  } catch (error) {
    return actionFailed(error);
  }
}

export async function deleteVideoAction(
  id: string,
  confirmProviderDelete: boolean,
): Promise<AdminActionResult> {
  try {
    await videosService.deleteVideo(id, confirmProviderDelete);
    revalidateVideoRoutes();
    return actionSucceeded("Đã xóa video.");
  } catch (error) {
    return actionFailed(error);
  }
}
