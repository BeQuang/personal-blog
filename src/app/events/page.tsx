import type { Metadata } from "next";

import { Container } from "@/components/common/Container";
import { EventExplorer } from "@/components/events/EventExplorer";
import { siteConfig } from "@/config/site.config";
import { withSocialMetadata } from "@/lib/metadata";
import { getEvents } from "@/services/event.service";
import type { EventType } from "@/types";

export const metadata: Metadata = withSocialMetadata({
  title: "Sự kiện",
  description:
    "Theo dõi lịch livestream, workshop, công chiếu và các hoạt động cộng đồng của Quang.",
  alternates: { canonical: "/events" },
  openGraph: {
    title: `Sự kiện | ${siteConfig.siteName}`,
    description: "Lịch sự kiện và hoạt động cộng đồng mới nhất của Quang.",
    url: "/events",
    images: [{ url: siteConfig.coverImage, alt: `Sự kiện của ${siteConfig.creatorName}` }],
  },
});

export default async function EventsPage() {
  const events = await getEvents();
  const types = Array.from(new Set(events.map((event) => event.type))) as EventType[];

  return (
    <div className="pb-20 sm:pb-24">
      <header className="border-b border-[var(--border)] bg-[var(--background-secondary)] py-14 sm:py-20">
        <Container>
          <p className="text-xs font-bold tracking-[0.18em] text-[var(--primary)] uppercase">
            Gặp nhau và kết nối
          </p>
          <h1 className="mt-3 max-w-3xl text-[length:var(--text-h1)] font-bold leading-tight tracking-[-0.04em]">
            Sự kiện, livestream và các hoạt động sắp tới
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
            Cập nhật lịch phát trực tiếp, workshop, buổi công chiếu và những dịp gặp gỡ cộng đồng.
          </p>
        </Container>
      </header>

      <Container className="pt-12 sm:pt-16">
        <EventExplorer events={events} types={types} />
      </Container>
    </div>
  );
}
