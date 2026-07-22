"use server";

import { revalidatePath } from "next/cache";
import { actionFailed, actionSucceeded } from "@/actions/action-result";
import * as service from "@/server/services/gallery.service";
import type { AdminActionResult, GalleryMutationInput } from "@/types";

function revalidate() { revalidatePath("/admin/gallery"); revalidatePath("/gallery"); revalidatePath("/"); }
export async function createGalleryItemAction(input: GalleryMutationInput): Promise<AdminActionResult> { try { await service.createGalleryItem(input); revalidate(); return actionSucceeded("Đã tạo ảnh Gallery."); } catch (error) { return actionFailed(error); } }
export async function updateGalleryItemAction(id: string, input: GalleryMutationInput): Promise<AdminActionResult> { try { await service.updateGalleryItem(id, input); revalidate(); return actionSucceeded("Đã cập nhật ảnh Gallery."); } catch (error) { return actionFailed(error); } }
export async function deleteGalleryItemAction(id: string): Promise<AdminActionResult> { try { await service.deleteGalleryItem(id); revalidate(); return actionSucceeded("Đã xóa item Gallery; file gốc vẫn được giữ trong Media Library."); } catch (error) { return actionFailed(error); } }
