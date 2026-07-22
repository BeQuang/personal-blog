"use server";

import { revalidatePath } from "next/cache";
import { actionFailed, actionSucceeded } from "@/actions/action-result";
import * as service from "@/server/services/events.service";
import type { AdminActionResult, EventMutationInput } from "@/types";

function revalidate(slug?: string) { revalidatePath("/admin/events"); revalidatePath("/events"); revalidatePath("/events/[slug]", "page"); revalidatePath("/"); revalidatePath("/sitemap.xml"); if (slug) revalidatePath(`/events/${slug}`); }
export async function createEventAction(input: EventMutationInput): Promise<AdminActionResult> { try { const row = await service.createEvent(input); revalidate(row.slug); return actionSucceeded("Đã tạo sự kiện."); } catch (error) { return actionFailed(error, "slug"); } }
export async function updateEventAction(id: string, input: EventMutationInput): Promise<AdminActionResult> { try { const row = await service.updateEvent(id, input); revalidate(row.slug); return actionSucceeded("Đã cập nhật sự kiện."); } catch (error) { return actionFailed(error, "slug"); } }
export async function archiveEventAction(id: string): Promise<AdminActionResult> { try { const row = await service.archiveEvent(id); revalidate(row.slug); return actionSucceeded("Đã lưu trữ sự kiện."); } catch (error) { return actionFailed(error); } }
