import { handleAdminListRequest } from "@/server/http/admin-list-route";
import { getAdminGalleryItemPage } from "@/server/services/gallery.service";

export async function GET(request: Request) {
  return handleAdminListRequest(request, getAdminGalleryItemPage, "Không thể tải danh sách hình ảnh.");
}
