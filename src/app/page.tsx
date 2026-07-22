import type { Metadata } from "next";

import {
  CollaborationSection,
  FeaturedContentSection,
  GalleryPreviewSection,
  HeroSection,
  LatestPostsSection,
  LatestVideosSection,
  NewsletterSection,
  SocialLinksSection,
  UpcomingEventsSection,
} from "@/components/home/HomeSections";
import { ActiveCampaignSection } from "@/components/home/ActiveCampaignSection";
import { getFeaturedCampaign } from "@/services/campaign.service";
import { getUpcomingEvents } from "@/services/event.service";
import { getGalleryPreview } from "@/services/gallery.service";
import { getFeaturedPosts, getPublishedPosts } from "@/services/post.service";
import { getEnabledSocialLinks } from "@/services/social.service";
import { getVideos } from "@/services/video.service";
import { getSiteSettings } from "@/server/services/settings.service";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [settings, featuredPosts, publishedPosts, videos, galleryItems, upcomingEventItems, activeCampaign, socialLinks] = await Promise.all([
    getSiteSettings(), getFeaturedPosts(1), getPublishedPosts(), getVideos(), getGalleryPreview(8), getUpcomingEvents(), getFeaturedCampaign(), getEnabledSocialLinks(),
  ]);
  const sections = settings.homepageSections;
  const featuredPost = featuredPosts[0];
  const latestPosts = publishedPosts.slice(0, 6);
  const latestVideos = videos.slice(0, 6);
  const upcomingEvents = upcomingEventItems.slice(0, 3);

  return (
    <div className="home-page">
      {sections.hero ? <HeroSection links={socialLinks} settings={settings} /> : null}
      {sections.socialLinks ? <SocialLinksSection links={socialLinks} /> : null}
      {sections.featuredContent && featuredPost ? (
        <FeaturedContentSection post={featuredPost} />
      ) : null}
      {sections.latestPosts ? <LatestPostsSection posts={latestPosts} /> : null}
      {sections.latestVideos ? <LatestVideosSection videos={latestVideos} /> : null}
      {sections.gallery ? <GalleryPreviewSection items={galleryItems} /> : null}
      {sections.events ? <UpcomingEventsSection events={upcomingEvents} /> : null}
      {sections.campaign && activeCampaign ? (
        <ActiveCampaignSection campaign={activeCampaign} />
      ) : null}
      {sections.newsletter ? <NewsletterSection /> : null}
      {sections.collaboration ? <CollaborationSection /> : null}
    </div>
  );
}
