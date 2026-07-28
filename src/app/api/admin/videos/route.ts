import { handleAdminListRequest } from "@/server/http/admin-list-route";
import { getAdminVideoPage } from "@/server/services/videos.service";

export async function GET(request: Request) {
  return handleAdminListRequest(request, getAdminVideoPage, "Không thể tải danh sách video.");
}
