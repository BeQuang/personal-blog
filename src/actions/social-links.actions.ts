"use server";

import { revalidatePath } from "next/cache";

import { actionFailed, actionSucceeded } from "@/actions/action-result";
import * as socialLinksService from "@/server/services/social-links.service";
import type { AdminActionResult, SocialLinkMutationInput } from "@/types";

function revalidateSocialRoutes() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/social-links");
  revalidatePath("/about");
  revalidatePath("/contact");
}

export async function createSocialLinkAction(input: SocialLinkMutationInput): Promise<AdminActionResult> {
  try {
    await socialLinksService.createSocialLink(input);
    revalidateSocialRoutes();
    return actionSucceeded(input.platform === "youtube"
      ? "Đã tạo kênh YouTube và đồng bộ số người đăng ký."
      : "Đã tạo social link.");
  } catch (error) {
    return actionFailed(error);
  }
}

export async function updateSocialLinkAction(
  id: string,
  input: SocialLinkMutationInput,
): Promise<AdminActionResult> {
  try {
    await socialLinksService.updateSocialLink(id, input);
    revalidateSocialRoutes();
    return actionSucceeded("Đã cập nhật social link.");
  } catch (error) {
    return actionFailed(error);
  }
}

export async function deleteSocialLinkAction(id: string): Promise<AdminActionResult> {
  try {
    await socialLinksService.deleteSocialLink(id);
    revalidateSocialRoutes();
    return actionSucceeded("Đã xóa social link.");
  } catch (error) {
    return actionFailed(error);
  }
}

export async function setSocialLinkEnabledAction(
  id: string,
  enabled: boolean,
): Promise<AdminActionResult> {
  try {
    await socialLinksService.setSocialLinkEnabled(id, enabled);
    revalidateSocialRoutes();
    return actionSucceeded(enabled ? "Đã bật social link." : "Đã tắt social link.");
  } catch (error) {
    return actionFailed(error);
  }
}

export async function disconnectTikTokSocialLinkAction(
  id: string,
): Promise<AdminActionResult> {
  try {
    await socialLinksService.disconnectTikTokSocialLink(id);
    revalidateSocialRoutes();
    return actionSucceeded("Đã ngắt kết nối TikTok. Bạn có thể nhập số liệu thủ công.");
  } catch (error) {
    return actionFailed(error);
  }
}
