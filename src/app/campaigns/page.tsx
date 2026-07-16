import type { Metadata } from "next";
import { connection } from "next/server";

import { CampaignGroup } from "@/components/campaigns/CampaignGroup";
import { Container } from "@/components/common/Container";
import { siteConfig } from "@/config/site.config";
import { withSocialMetadata } from "@/lib/metadata";
import {
  getEffectiveCampaignStatus,
  getPublicCampaigns,
} from "@/services/campaign.service";

export const metadata: Metadata = withSocialMetadata({
  title: "Chiến dịch",
  description:
    "Khám phá giveaway, thử thách sáng tạo và các chiến dịch cộng đồng của Quang.",
  alternates: { canonical: "/campaigns" },
  openGraph: {
    title: `Chiến dịch | ${siteConfig.siteName}`,
    description: "Giveaway, thử thách và những hoạt động cộng đồng mới nhất.",
    url: "/campaigns",
    images: [{ url: siteConfig.coverImage, alt: `Chiến dịch của ${siteConfig.creatorName}` }],
  },
});

export default async function CampaignsPage() {
  await connection();
  const referenceDate = new Date();
  const campaigns = getPublicCampaigns().map((campaign) => ({
    ...campaign,
    status: getEffectiveCampaignStatus(campaign, referenceDate),
  }));
  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "active");
  const upcomingCampaigns = campaigns.filter(
    (campaign) => campaign.status === "upcoming",
  );
  const endedCampaigns = campaigns.filter((campaign) => campaign.status === "ended");

  return (
    <div className="pb-20 sm:pb-24">
      <header className="border-b border-[var(--border)] bg-[var(--background-secondary)] py-14 sm:py-20">
        <Container>
          <p className="text-xs font-bold tracking-[0.18em] text-[var(--primary)] uppercase">
            Cùng nhau tham gia
          </p>
          <h1 className="mt-3 max-w-3xl text-[length:var(--text-h1)] font-bold leading-tight tracking-[-0.04em]">
            Chiến dịch sáng tạo và hoạt động cộng đồng
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
            Theo dõi giveaway, thử thách và những chương trình mà bạn có thể cùng tham gia.
          </p>
        </Container>
      </header>

      <Container className="space-y-16 pt-12 sm:space-y-20 sm:pt-16">
        <CampaignGroup
          titleId="active-campaigns-title"
          title="Đang hoạt động"
          description="Những chương trình đang mở và chờ bạn tham gia."
          campaigns={activeCampaigns}
          emptyMessage="Hiện chưa có chiến dịch đang hoạt động"
        />
        <CampaignGroup
          titleId="upcoming-campaigns-title"
          title="Sắp diễn ra"
          description="Lưu lịch cho những hoạt động chuẩn bị bắt đầu."
          campaigns={upcomingCampaigns}
          emptyMessage="Hiện chưa có chiến dịch sắp diễn ra"
        />
        <CampaignGroup
          titleId="ended-campaigns-title"
          title="Đã kết thúc"
          description="Xem lại các chiến dịch và hoạt động đã hoàn thành."
          campaigns={endedCampaigns}
          emptyMessage="Chưa có chiến dịch đã kết thúc"
        />
      </Container>
    </div>
  );
}
