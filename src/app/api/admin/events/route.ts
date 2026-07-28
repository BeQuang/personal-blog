import { handleAdminListRequest } from "@/server/http/admin-list-route";
import { getAdminEventPage } from "@/server/services/events.service";

export async function GET(request: Request) {
  return handleAdminListRequest(request, getAdminEventPage, "Không thể tải danh sách sự kiện.");
}
