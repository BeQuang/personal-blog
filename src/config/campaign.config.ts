import type { CampaignStatus } from "@/types";

export const campaignStatusLabels: Record<CampaignStatus, string> = {
  draft: "Bản nháp",
  upcoming: "Sắp diễn ra",
  active: "Đang hoạt động",
  ended: "Đã kết thúc",
};
