"use server";

import { revalidatePath } from "next/cache";
import { actionFailed, actionSucceeded } from "@/actions/action-result";
import * as service from "@/server/services/campaigns.service";
import type { AdminActionResult, CampaignMutationInput } from "@/types";

function revalidate(slug?: string) { revalidatePath("/admin/campaigns"); revalidatePath("/campaigns"); revalidatePath("/campaigns/[slug]", "page"); revalidatePath("/"); revalidatePath("/sitemap.xml"); if (slug) revalidatePath(`/campaigns/${slug}`); }
export async function createCampaignAction(input: CampaignMutationInput): Promise<AdminActionResult> { try { const row = await service.createCampaign(input); revalidate(row.slug); return actionSucceeded("Đã tạo chiến dịch."); } catch (error) { return actionFailed(error, "slug"); } }
export async function updateCampaignAction(id: string, input: CampaignMutationInput): Promise<AdminActionResult> { try { const row = await service.updateCampaign(id, input); revalidate(row.slug); return actionSucceeded("Đã cập nhật chiến dịch."); } catch (error) { return actionFailed(error, "slug"); } }
export async function archiveCampaignAction(id: string): Promise<AdminActionResult> { try { const row = await service.archiveCampaign(id); revalidate(row.slug); return actionSucceeded("Đã lưu trữ chiến dịch."); } catch (error) { return actionFailed(error); } }
