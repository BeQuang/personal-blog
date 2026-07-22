"use server";

import { revalidatePath } from "next/cache";
import { actionFailed, actionSucceeded } from "@/actions/action-result";
import { updateSiteSettings } from "@/server/services/settings.service";
import type { AdminActionResult, SiteSettingsMutationInput } from "@/types";

export async function updateSiteSettingsAction(input: SiteSettingsMutationInput): Promise<AdminActionResult> {
  try {
    await updateSiteSettings(input);
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/appearance");
    revalidatePath("/sitemap.xml");
    return actionSucceeded("Đã lưu cài đặt website vào PostgreSQL.");
  } catch (error) { return actionFailed(error); }
}
