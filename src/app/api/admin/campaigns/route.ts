import { handleAdminListRequest } from "@/server/http/admin-list-route";
import { getAdminCampaignPage } from "@/server/services/campaigns.service";

export async function GET(request: Request) {
  return handleAdminListRequest(request, getAdminCampaignPage, "Không thể tải danh sách chiến dịch.");
}
