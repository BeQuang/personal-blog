import "server-only";

import {
  ApplicationError,
  ConflictError,
  ValidationError,
} from "@/server/errors";
import type { AdminActionResult } from "@/types";

export function actionSucceeded(message: string): AdminActionResult {
  return { success: true, message };
}

export function actionFailed(error: unknown, conflictField?: string): AdminActionResult {
  if (error instanceof ValidationError) {
    return {
      success: false,
      message: error.message,
      fieldErrors: Object.fromEntries(
        Object.entries(error.fieldErrors).filter((entry): entry is [string, readonly string[]] =>
          Array.isArray(entry[1]),
        ),
      ),
    };
  }

  if (error instanceof ConflictError) {
    return {
      success: false,
      message: error.message,
      ...(conflictField ? { fieldErrors: { [conflictField]: [error.message] } } : {}),
    };
  }

  if (error instanceof ApplicationError) {
    return { success: false, message: error.message };
  }

  return {
    success: false,
    message: "Không thể hoàn tất thao tác. Vui lòng thử lại.",
  };
}
