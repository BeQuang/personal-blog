"use server";

import { revalidatePath } from "next/cache";

import { actionFailed, actionSucceeded } from "@/actions/action-result";
import * as taxonomiesService from "@/server/services/taxonomies.service";
import type { AdminActionResult, TaxonomyMutationInput } from "@/types";

function revalidateTaxonomyRoutes() {
  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
}

export async function createCategoryAction(input: TaxonomyMutationInput): Promise<AdminActionResult> {
  try {
    await taxonomiesService.createCategory(input);
    revalidateTaxonomyRoutes();
    return actionSucceeded("Đã tạo danh mục.");
  } catch (error) {
    return actionFailed(error, "slug");
  }
}

export async function updateCategoryAction(id: string, input: TaxonomyMutationInput): Promise<AdminActionResult> {
  try {
    await taxonomiesService.updateCategory(id, input);
    revalidateTaxonomyRoutes();
    return actionSucceeded("Đã cập nhật danh mục.");
  } catch (error) {
    return actionFailed(error, "slug");
  }
}

export async function deleteCategoryAction(id: string): Promise<AdminActionResult> {
  try {
    await taxonomiesService.deleteCategory(id);
    revalidateTaxonomyRoutes();
    return actionSucceeded("Đã xóa danh mục.");
  } catch (error) {
    return actionFailed(error);
  }
}

export async function createTagAction(input: TaxonomyMutationInput): Promise<AdminActionResult> {
  try {
    await taxonomiesService.createTag(input);
    revalidateTaxonomyRoutes();
    return actionSucceeded("Đã tạo thẻ.");
  } catch (error) {
    return actionFailed(error, "slug");
  }
}

export async function updateTagAction(id: string, input: TaxonomyMutationInput): Promise<AdminActionResult> {
  try {
    await taxonomiesService.updateTag(id, input);
    revalidateTaxonomyRoutes();
    return actionSucceeded("Đã cập nhật thẻ.");
  } catch (error) {
    return actionFailed(error, "slug");
  }
}

export async function deleteTagAction(id: string): Promise<AdminActionResult> {
  try {
    await taxonomiesService.deleteTag(id);
    revalidateTaxonomyRoutes();
    return actionSucceeded("Đã xóa thẻ.");
  } catch (error) {
    return actionFailed(error);
  }
}
