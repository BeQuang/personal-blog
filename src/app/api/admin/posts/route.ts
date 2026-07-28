import { handleAdminListRequest } from "@/server/http/admin-list-route";
import { getAdminPostPage } from "@/server/services/posts.service";

export async function GET(request: Request) {
  return handleAdminListRequest(request, getAdminPostPage, "Không thể tải danh sách bài viết.");
}
