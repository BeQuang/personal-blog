"use server";

import { revalidatePath } from "next/cache";

import { actionFailed, actionSucceeded } from "@/actions/action-result";
import { createPublicRequestContext } from "@/server/anti-spam/request-context";
import {
  ApplicationError,
  RateLimitError,
  ValidationError,
} from "@/server/errors";
import * as service from "@/server/services/submissions.service";
import type {
  AdminActionResult,
  CampaignSubmissionInput,
  ContactSubmissionInput,
  NewsletterSubscriptionInput,
  PublicSubmissionActionResult,
  SubmissionResource,
} from "@/types";

function publicActionFailed(error: unknown): PublicSubmissionActionResult {
  if (error instanceof ValidationError) {
    return {
      success: false,
      message: error.message,
      fieldErrors: Object.fromEntries(
        Object.entries(error.fieldErrors).filter(
          (entry): entry is [string, readonly string[]] => Array.isArray(entry[1]),
        ),
      ),
    };
  }

  if (error instanceof RateLimitError) {
    return {
      success: false,
      message: error.message,
      retryAfterSeconds: error.retryAfterSeconds,
    };
  }

  return {
    success: false,
    message:
      error instanceof ApplicationError && error.statusCode < 500
        ? error.message
        : "Không thể gửi yêu cầu lúc này. Vui lòng thử lại sau.",
  };
}

export async function submitContactAction(
  input: ContactSubmissionInput,
): Promise<PublicSubmissionActionResult> {
  try {
    await service.submitContact(input, await createPublicRequestContext());
    revalidatePath("/admin/submissions");
    return {
      success: true,
      message: "Yêu cầu hợp tác đã được ghi nhận.",
    };
  } catch (error) {
    return publicActionFailed(error);
  }
}

export async function subscribeNewsletterAction(
  input: NewsletterSubscriptionInput,
): Promise<PublicSubmissionActionResult> {
  try {
    await service.subscribeNewsletter(input, await createPublicRequestContext());
    revalidatePath("/admin/submissions");
    return {
      success: true,
      message: "Yêu cầu đăng ký đã được ghi nhận.",
    };
  } catch (error) {
    return publicActionFailed(error);
  }
}

export async function submitCampaignAction(
  input: CampaignSubmissionInput,
): Promise<PublicSubmissionActionResult> {
  try {
    await service.submitCampaign(input, await createPublicRequestContext());
    revalidatePath("/admin/submissions");
    return {
      success: true,
      message: "Thông tin tham gia đã được ghi nhận.",
    };
  } catch (error) {
    return publicActionFailed(error);
  }
}

export async function updateSubmissionStatusAction(
  resource: SubmissionResource,
  id: string,
  status: string,
): Promise<AdminActionResult> {
  try {
    await service.updateSubmissionStatus(resource, id, status);
    revalidatePath("/admin/submissions");
    return actionSucceeded("Đã cập nhật trạng thái.");
  } catch (error) {
    return actionFailed(error, "status");
  }
}
