import {
  ArrowRight,
  CalendarDays,
  Clock3,
  ExternalLink,
  Eye,
  Handshake,
  MapPin,
  Play,
  Sparkles,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { LinkButton } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { SectionHeader } from "@/components/common/SectionHeader";
import { SocialIcon } from "@/components/common/SocialIcon";
import { AnalyticsLink } from "@/components/home/AnalyticsLink";
import { GalleryLightbox } from "@/components/home/GalleryLightbox";
import { HeroMedia } from "@/components/home/HeroMedia";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { SocialLinksDialog } from "@/components/layout/SocialLinksDialog";
import { homepageConfig } from "@/config/homepage.config";
import { siteConfig } from "@/config/site.config";
import type {
  BlogPost,
  EventItem,
  GalleryItem,
  SocialLink,
  VideoItem,
} from "@/types";
import { formatDate, formatDateTime, formatDay, formatMonthYear } from "@/utils/date";
import { formatViewCount } from "@/utils/format";

const platformLabels: Record<VideoItem["platform"], string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Reels",
  facebook: "Facebook",
  internal: "Video",
};

const eventStatusLabels: Record<EventItem["status"], string> = {
  upcoming: "Sắp diễn ra",
  live: "Đang trực tiếp",
  ended: "Đã kết thúc",
  cancelled: "Đã hủy",
};

export function HeroSection() {
  const config = homepageConfig.hero;

  return (
    <section className="home-hero" aria-labelledby="hero-title">
      <Container className="hero-grid">
        <div className="hero-copy">
          <p className="hero-eyebrow"><Sparkles size={16} aria-hidden="true" />{config.eyebrow}</p>
          <h1 id="hero-title">Xin chào, mình là <span>{siteConfig.creatorName}</span>.</h1>
          <p className="hero-username">{siteConfig.username}</p>
          <p className="hero-description">{config.description}</p>

          <ul className="hero-topics" aria-label="Chủ đề nội dung">
            {config.topics.map((topic) => <li key={topic}>{topic}</li>)}
          </ul>

          <div className="hero-actions">
            <LinkButton href="#featured-content" size="lg">
              Xem nội dung mới <ArrowRight size={18} aria-hidden="true" />
            </LinkButton>
            <SocialLinksDialog variant="outline" />
          </div>

          <dl className="hero-stats">
            {config.statistics.map((statistic) => (
              <div key={statistic.label}>
                <dt>{statistic.label}</dt>
                <dd>{statistic.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <HeroMedia
          avatar={siteConfig.avatar}
          coverImage={siteConfig.coverImage}
          creatorName={siteConfig.creatorName}
        />
      </Container>
    </section>
  );
}

interface SocialLinksSectionProps {
  links: readonly SocialLink[];
}

export function SocialLinksSection({ links }: SocialLinksSectionProps) {
  const config = homepageConfig.socialLinks;

  return (
    <section className="home-section home-section-soft" aria-labelledby="social-title">
      <Container>
        <SectionHeader titleId="social-title" eyebrow={config.eyebrow} title={config.title} description={config.description} />
        <ul className="social-card-grid">
          {links.map((link) => (
            <li key={link.id}>
              <AnalyticsLink
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                analytics={{ type: "social", id: link.platform }}
                className="social-card group"
              >
                <span className="social-card-icon"><SocialIcon platform={link.platform} size={22} /></span>
                <span className="social-card-copy">
                  <strong>{link.label}</strong>
                  <small>{link.username ?? "Xem trang cá nhân"}</small>
                  {link.followerCount ? <span>{formatViewCount(link.followerCount)} người theo dõi</span> : null}
                </span>
                <ExternalLink className="social-card-arrow" size={17} aria-hidden="true" />
              </AnalyticsLink>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

interface FeaturedContentSectionProps {
  post: BlogPost;
}

export function FeaturedContentSection({ post }: FeaturedContentSectionProps) {
  const config = homepageConfig.featuredContent;

  return (
    <section id="featured-content" className="home-section scroll-mt-24" aria-labelledby="featured-title">
      <Container>
        <article className="featured-card">
          <div className="featured-image">
            <Image src={post.coverImage ?? post.thumbnail} alt={`Ảnh bìa: ${post.title}`} fill sizes="(max-width: 1023px) 100vw, 52vw" className="object-cover" />
            <span className="featured-image-shade" />
            <span className="featured-badge"><Sparkles size={14} aria-hidden="true" /> Nổi bật</span>
          </div>
          <div className="featured-copy">
            <p className="section-eyebrow">{config.eyebrow}</p>
            <h2 id="featured-title">{config.title}</h2>
            <span className="content-badge">{post.category}</span>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <div className="content-meta">
              <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
              <span>{post.readingTime} phút đọc</span>
              {post.viewCount ? <span><Eye size={15} aria-hidden="true" /> {formatViewCount(post.viewCount)}</span> : null}
            </div>
            <LinkButton href={`/blog/${post.slug}`} size="lg">Đọc nội dung nổi bật <ArrowRight size={18} aria-hidden="true" /></LinkButton>
          </div>
        </article>
      </Container>
    </section>
  );
}

interface LatestPostsSectionProps {
  posts: readonly BlogPost[];
}

export function LatestPostsSection({ posts }: LatestPostsSectionProps) {
  const config = homepageConfig.latestPosts;

  return (
    <section className="home-section home-section-soft" aria-labelledby="latest-posts-title">
      <Container>
        <SectionHeader
          titleId="latest-posts-title"
          eyebrow={config.eyebrow}
          title={config.title}
          description={config.description}
          action={<LinkButton href="/blog" variant="outline">Xem tất cả <ArrowRight size={17} aria-hidden="true" /></LinkButton>}
        />
        <div className="post-grid">
          {posts.map((post) => (
            <article className="post-card group" key={post.id}>
              <Link href={`/blog/${post.slug}`} className="post-card-image" tabIndex={-1} aria-hidden="true">
                <Image src={post.thumbnail} alt="" fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
              </Link>
              <div className="post-card-body">
                <div className="post-card-topline"><span>{post.category}</span><time dateTime={post.publishedAt}>{formatDate(post.publishedAt ?? post.createdAt)}</time></div>
                <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
                <p>{post.excerpt}</p>
                <div className="post-card-footer">
                  <span><Clock3 size={15} aria-hidden="true" /> {post.readingTime} phút</span>
                  {post.viewCount ? <span><Eye size={15} aria-hidden="true" /> {formatViewCount(post.viewCount)}</span> : null}
                  <Link href={`/blog/${post.slug}`} aria-label={`Đọc: ${post.title}`}><ArrowRight size={18} aria-hidden="true" /></Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

interface LatestVideosSectionProps {
  videos: readonly VideoItem[];
}

export function LatestVideosSection({ videos }: LatestVideosSectionProps) {
  const config = homepageConfig.latestVideos;

  return (
    <section className="home-section" aria-labelledby="latest-videos-title">
      <Container>
        <SectionHeader
          titleId="latest-videos-title"
          eyebrow={config.eyebrow}
          title={config.title}
          description={config.description}
          action={<LinkButton href="/videos" variant="outline">Xem tất cả <ArrowRight size={17} aria-hidden="true" /></LinkButton>}
        />
        <div className="video-grid">
          {videos.map((video) => (
            <AnalyticsLink
              key={video.id}
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              analytics={{ type: "video", id: video.id }}
              className={`video-card video-card-${video.orientation} group`}
              aria-label={`Xem video: ${video.title}`}
            >
              <span className="video-card-image">
                <Image src={video.thumbnail} alt="" fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                <span className="video-card-shade" />
                <span className="video-play"><Play fill="currentColor" size={20} aria-hidden="true" /></span>
                <span className="video-platform">{platformLabels[video.platform]}</span>
                {video.duration ? <span className="video-duration">{video.duration}</span> : null}
              </span>
              <span className="video-card-body">
                <strong>{video.title}</strong>
                <span>{formatDate(video.publishedAt)}{video.viewCount ? ` · ${formatViewCount(video.viewCount)} lượt xem` : ""}</span>
              </span>
            </AnalyticsLink>
          ))}
        </div>
      </Container>
    </section>
  );
}

interface GalleryPreviewSectionProps {
  items: readonly GalleryItem[];
}

export function GalleryPreviewSection({ items }: GalleryPreviewSectionProps) {
  const config = homepageConfig.gallery;
  return (
    <section className="home-section home-section-soft" aria-labelledby="gallery-title">
      <Container>
        <SectionHeader
          titleId="gallery-title"
          eyebrow={config.eyebrow}
          title={config.title}
          description={config.description}
          action={<LinkButton href="/gallery" variant="outline">Mở thư viện <ArrowRight size={17} aria-hidden="true" /></LinkButton>}
        />
        <GalleryLightbox items={items} />
      </Container>
    </section>
  );
}

interface UpcomingEventsSectionProps {
  events: readonly EventItem[];
}

export function UpcomingEventsSection({ events }: UpcomingEventsSectionProps) {
  const config = homepageConfig.events;
  return (
    <section className="home-section" aria-labelledby="events-title">
      <Container>
        <SectionHeader titleId="events-title" eyebrow={config.eyebrow} title={config.title} description={config.description} />
        <div className="event-list">
          {events.map((event) => (
            <article className="event-card" key={event.id}>
              <time className="event-date" dateTime={event.startAt}>
                <strong>{formatDay(event.startAt)}</strong>
                <span>{formatMonthYear(event.startAt)}</span>
              </time>
              <div className="event-copy">
                <div className="event-badges"><span>{eventStatusLabels[event.status]}</span><small>{event.type.replace("-", " ")}</small></div>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <div className="event-meta">
                  <span><Clock3 size={16} aria-hidden="true" /> {formatDateTime(event.startAt)}</span>
                  <span><MapPin size={16} aria-hidden="true" /> {event.location ?? event.platform ?? "Trực tuyến"}</span>
                </div>
              </div>
              <LinkButton href={`/events/${event.slug}`} variant="outline">Chi tiết <ArrowRight size={17} aria-hidden="true" /></LinkButton>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function NewsletterSection() {
  const config = homepageConfig.newsletter;
  return (
    <section className="home-section" aria-labelledby="newsletter-title">
      <Container>
        <div className="newsletter-card">
          <div className="newsletter-copy">
            <p className="section-eyebrow">{config.eyebrow}</p>
            <h2 id="newsletter-title">{config.title}</h2>
            <p>{config.description}</p>
          </div>
          <NewsletterForm privacyNote={config.privacyNote} />
        </div>
      </Container>
    </section>
  );
}

export function CollaborationSection() {
  const config = homepageConfig.collaboration;
  return (
    <section className="home-section collaboration-section" aria-labelledby="collaboration-title">
      <Container>
        <div className="collaboration-card">
          <span className="collaboration-icon"><Handshake size={30} aria-hidden="true" /></span>
          <p className="section-eyebrow">{config.eyebrow}</p>
          <h2 id="collaboration-title">{config.title}</h2>
          <p>{config.description}</p>
          <LinkButton href="/contact" size="lg">Liên hệ hợp tác <ArrowRight size={18} aria-hidden="true" /></LinkButton>
          <div className="collaboration-notes" aria-hidden="true">
            <span><Users size={15} /> Cộng đồng phù hợp</span>
            <span><CalendarDays size={15} /> Quy trình rõ ràng</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
