import "server-only";

import { ApplicationError } from "@/server/errors";
import type { AdminListPage } from "@/types";

const responseHeaders = {
  "cache-control": "private, no-store",
  "x-content-type-options": "nosniff",
};

export async function handleAdminListRequest(
  request: Request,
  loader: (query: Record<string, string>) => Promise<AdminListPage<unknown>>,
  errorMessage = "Không thể tải danh sách dữ liệu.",
) {
  try {
    const query = Object.fromEntries(new URL(request.url).searchParams.entries());
    const data = await loader(query);
    return Response.json(data, { status: 200, headers: responseHeaders });
  } catch (error) {
    const status = error instanceof ApplicationError ? error.statusCode : 500;
    return Response.json(
      {
        error: status >= 500
          ? errorMessage
          : error instanceof ApplicationError
            ? error.message
            : "Yêu cầu danh sách chưa hợp lệ.",
      },
      { status, headers: responseHeaders },
    );
  }
}
