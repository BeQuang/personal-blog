"use server";

import { revalidatePath } from "next/cache";

import { actionFailed } from "@/actions/action-result";
import * as mediaService from "@/server/services/media.service";
import type {
  AdminActionResult,
  ConfirmMediaUploadInput,
  CreateMediaUploadData,
  CreateMediaUploadInput,
  MediaActionResult,
  MediaAssetItem,
} from "@/types";

function revalidateMediaRoutes() {
  revalidatePath("/admin/gallery");
  revalidatePath("/admin/posts");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/events");
  revalidatePath("/admin/campaigns");
}

export async function createMediaUploadAction(
  input: CreateMediaUploadInput,
): Promise<MediaActionResult<CreateMediaUploadData>> {
  try {
    const data = await mediaService.createMediaUpload(input);
    return { success: true, message: "Đã cấp URL upload an toàn.", data };
  } catch (error) {
    return actionFailed(error);
  }
}

export async function confirmMediaUploadAction(
  input: ConfirmMediaUploadInput,
): Promise<MediaActionResult<MediaAssetItem>> {
  try {
    const data = await mediaService.confirmMediaUpload(input);
    revalidateMediaRoutes();
    return { success: true, message: "Upload ảnh thành công.", data };
  } catch (error) {
    return actionFailed(error);
  }
}

export async function deleteMediaAssetAction(id: string): Promise<AdminActionResult> {
  try {
    await mediaService.deleteMediaAsset(id);
    revalidateMediaRoutes();
    return { success: true, message: "Đã xóa ảnh khỏi R2 và Media Library." };
  } catch (error) {
    return actionFailed(error);
  }
}
