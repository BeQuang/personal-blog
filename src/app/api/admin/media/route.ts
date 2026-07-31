import { handleAdminListRequest } from "@/server/http/admin-list-route";
import { getMediaLibrary } from "@/server/services/media.service";

export async function GET(request: Request) {
  return handleAdminListRequest(
    request,
    getMediaLibrary,
    "Không thể tải Media Library.",
  );
}
