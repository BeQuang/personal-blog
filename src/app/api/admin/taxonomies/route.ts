import { handleAdminListRequest } from "@/server/http/admin-list-route";
import { getTaxonomyPage } from "@/server/services/taxonomies.service";

export async function GET(request: Request) {
  return handleAdminListRequest(
    request,
    getTaxonomyPage,
    "Không thể tải dữ liệu phân loại.",
  );
}
