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
import { siteConfig } from "@/config/site.config";
import { getFeaturedCampaign } from "@/services/campaign.service";
import { getUpcomingEvents } from "@/services/event.service";
import { getGalleryPreview } from "@/services/gallery.service";
import { getFeaturedPosts, getPublishedPosts } from "@/services/post.service";
import { getEnabledSocialLinks } from "@/services/social.service";
import { getVideos } from "@/services/video.service";

export default function Home() {
  const sections = siteConfig.homepageSections;
  const featuredPost = getFeaturedPosts(1)[0];
  const latestPosts = getPublishedPosts().slice(0, 6);
  const latestVideos = getVideos().slice(0, 6);
  const galleryItems = getGalleryPreview(8);
  const upcomingEvents = getUpcomingEvents().slice(0, 3);
  const activeCampaign = getFeaturedCampaign();
  const socialLinks = getEnabledSocialLinks();

  return (
    <div className="home-page">
      {sections.hero ? <HeroSection /> : null}
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
