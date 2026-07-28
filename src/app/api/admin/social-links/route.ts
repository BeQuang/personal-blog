import { handleAdminListRequest } from "@/server/http/admin-list-route";
import { getAdminSocialLinkPage } from "@/server/services/social-links.service";

export async function GET(request: Request) {
  return handleAdminListRequest(
    request,
    getAdminSocialLinkPage,
    "Không thể tải danh sách mạng xã hội.",
  );
}
