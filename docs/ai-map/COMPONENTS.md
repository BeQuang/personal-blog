# Component catalog

> Generated artifact — source fingerprint: `4d689e1cad1696a94e78ce4e1931bca6d670fb8bbbc18b1ecb89c7509e31fa15`

Tra bảng này trước khi tạo component mới. “Client” chỉ ra module có directive `"use client"`; Server Component không có directive.

| Module | Exports UI | Runtime | Imported by |
| --- | --- | --- | --- |
| `src/components/admin/admin-table-columns.tsx` | — | Server-compatible | `src/components/admin/AdminResourceTable.tsx` |
| `src/components/admin/admin-table.config.ts` | — | Server-compatible | `src/components/admin/AdminPostsManager.tsx`<br>`src/components/admin/AdminResourceTable.tsx`<br>`src/components/admin/admin-table-columns.tsx` |
| `src/components/admin/AdminAnalyticsChart.tsx` | `AdminAnalyticsChart` | Client | `src/components/admin/AdminDashboard.tsx` |
| `src/components/admin/AdminAppearanceEditor.tsx` | `AdminAppearanceEditor` | Client | `src/app/admin/(protected)/appearance/page.tsx` |
| `src/components/admin/AdminCampaignsManager.tsx` | `AdminCampaignsManager` | Client | `src/app/admin/(protected)/campaigns/page.tsx` |
| `src/components/admin/AdminDashboard.tsx` | `AdminDashboard` | Client | `src/app/admin/(protected)/page.tsx` |
| `src/components/admin/AdminEventsManager.tsx` | `AdminEventsManager` | Client | `src/app/admin/(protected)/events/page.tsx` |
| `src/components/admin/AdminGalleryManager.tsx` | `AdminGalleryManager` | Client | `src/app/admin/(protected)/gallery/page.tsx` |
| `src/components/admin/AdminLoginForm.tsx` | `AdminLoginForm` | Client | `src/app/admin/login/page.tsx` |
| `src/components/admin/AdminMediaLibrary.tsx` | `AdminMediaLibrary` | Client | `src/app/admin/(protected)/gallery/page.tsx` |
| `src/components/admin/AdminMediaPicker.tsx` | `AdminMediaPicker` | Client | `src/components/admin/AdminCampaignsManager.tsx`<br>`src/components/admin/AdminEventsManager.tsx`<br>`src/components/admin/AdminGalleryManager.tsx`<br>`src/components/admin/AdminPostEditorModal.tsx`<br>`src/components/admin/AdminResourceEditorModal.tsx`<br>`src/components/admin/AdminSettingsForm.tsx`<br>`src/components/admin/AdminVideoEditorModal.tsx`<br>`src/components/admin/AdminVideoUploadPanel.tsx` |
| `src/components/admin/AdminPageHeader.tsx` | `AdminPageHeader` | Server-compatible | `src/components/admin/AdminAppearanceEditor.tsx`<br>`src/components/admin/AdminCampaignsManager.tsx`<br>`src/components/admin/AdminDashboard.tsx`<br>`src/components/admin/AdminEventsManager.tsx`<br>`src/components/admin/AdminGalleryManager.tsx`<br>`src/components/admin/AdminMediaLibrary.tsx`<br>`src/components/admin/AdminPostsManager.tsx`<br>`src/components/admin/AdminResourceTable.tsx`<br>`src/components/admin/AdminSettingsForm.tsx`<br>`src/components/admin/AdminSocialLinksManager.tsx`<br>`src/components/admin/AdminSubmissionsManager.tsx`<br>`src/components/admin/AdminVideosManager.tsx` |
| `src/components/admin/AdminPostEditorModal.tsx` | `AdminPostEditorModal` | Client | `src/components/admin/AdminPostsManager.tsx` |
| `src/components/admin/AdminPostsManager.tsx` | `AdminPostsManager` | Client | `src/app/admin/(protected)/posts/page.tsx` |
| `src/components/admin/AdminResourceEditorModal.tsx` | `AdminResourceEditorModal` | Client | `src/components/admin/AdminResourceTable.tsx` |
| `src/components/admin/AdminResourceTable.tsx` | `AdminResourceTable` | Client | Chưa có import nội bộ |
| `src/components/admin/AdminSettingsForm.tsx` | `AdminSettingsForm` | Client | `src/app/admin/(protected)/settings/page.tsx` |
| `src/components/admin/AdminShell.tsx` | `AdminShell` | Client | `src/app/admin/(protected)/layout.tsx` |
| `src/components/admin/AdminSocialLinkEditorModal.tsx` | `AdminSocialLinkEditorModal` | Client | `src/components/admin/AdminSocialLinksManager.tsx` |
| `src/components/admin/AdminSocialLinksManager.tsx` | `AdminSocialLinksManager` | Client | `src/app/admin/(protected)/social-links/page.tsx` |
| `src/components/admin/AdminSubmissionsManager.tsx` | `AdminSubmissionsManager` | Client | `src/app/admin/(protected)/submissions/page.tsx` |
| `src/components/admin/AdminTaxonomyManager.tsx` | `AdminTaxonomyManager` | Client | `src/components/admin/AdminPostsManager.tsx` |
| `src/components/admin/AdminVideoEditorModal.tsx` | `AdminVideoEditorModal` | Client | `src/components/admin/AdminVideosManager.tsx` |
| `src/components/admin/AdminVideosManager.tsx` | `AdminVideosManager` | Client | `src/app/admin/(protected)/videos/page.tsx` |
| `src/components/admin/AdminVideoUploadPanel.tsx` | `AdminVideoUploadPanel` | Client | `src/components/admin/AdminVideosManager.tsx` |
| `src/components/analytics/AnalyticsProvider.tsx` | `AnalyticsProvider` | Client | `src/app/layout.tsx` |
| `src/components/analytics/AnalyticsView.tsx` | `AnalyticsView` | Client | `src/app/blog/[slug]/page.tsx`<br>`src/app/campaigns/[slug]/page.tsx` |
| `src/components/blog/BlogExplorer.tsx` | `BlogExplorer` | Client | `src/app/blog/page.tsx` |
| `src/components/blog/FeaturedPost.tsx` | `FeaturedPost` | Server-compatible | `src/app/blog/page.tsx` |
| `src/components/blog/PostCard.tsx` | `PostCard` | Server-compatible | `src/app/blog/[slug]/page.tsx`<br>`src/app/blog/page.tsx`<br>`src/components/blog/BlogExplorer.tsx` |
| `src/components/blog/PostContent.tsx` | `PostContent` | Server-compatible | `src/app/blog/[slug]/page.tsx` |
| `src/components/blog/ShareButtons.tsx` | `ShareButtons` | Client | `src/app/blog/[slug]/page.tsx` |
| `src/components/campaigns/CampaignCard.tsx` | `CampaignCard` | Server-compatible | `src/components/campaigns/CampaignGroup.tsx` |
| `src/components/campaigns/CampaignGroup.tsx` | `CampaignGroup` | Server-compatible | `src/app/campaigns/page.tsx` |
| `src/components/campaigns/CampaignParticipation.tsx` | `CampaignParticipation` | Client | `src/app/campaigns/[slug]/page.tsx` |
| `src/components/campaigns/CampaignRegistrationForm.tsx` | `CampaignRegistrationForm` | Client | `src/components/campaigns/CampaignParticipation.tsx` |
| `src/components/common/Button.tsx` | `Button`, `LinkButton` | Server-compatible | `src/app/about/page.tsx`<br>`src/app/blog/[slug]/page.tsx`<br>`src/app/campaigns/[slug]/page.tsx`<br>`src/app/events/[slug]/page.tsx`<br>`src/app/newsletter/unsubscribe/page.tsx`<br>`src/app/not-found.tsx`<br>`src/components/analytics/AnalyticsProvider.tsx`<br>`src/components/blog/BlogExplorer.tsx`<br>`src/components/blog/FeaturedPost.tsx`<br>`src/components/blog/PostContent.tsx`<br>`src/components/campaigns/CampaignRegistrationForm.tsx`<br>`src/components/common/ThemeToggle.tsx`<br>`src/components/contact/ContactForm.tsx`<br>`src/components/events/EventExplorer.tsx`<br>`src/components/gallery/GalleryExplorer.tsx`<br>`src/components/home/GalleryLightbox.tsx`<br>`src/components/home/HomeSections.tsx`<br>`src/components/home/NewsletterForm.tsx`<br>`src/components/layout/MobileMenu.tsx`<br>`src/components/layout/SocialLinksDialog.tsx`<br>`src/components/videos/VideoExplorer.tsx`<br>`src/components/videos/VideoPlaybackTrigger.tsx` |
| `src/components/common/Container.tsx` | `Container` | Server-compatible | `src/app/about/page.tsx`<br>`src/app/blog/[slug]/page.tsx`<br>`src/app/blog/page.tsx`<br>`src/app/campaigns/[slug]/page.tsx`<br>`src/app/campaigns/page.tsx`<br>`src/app/contact/page.tsx`<br>`src/app/events/[slug]/page.tsx`<br>`src/app/events/page.tsx`<br>`src/app/gallery/page.tsx`<br>`src/app/newsletter/unsubscribe/page.tsx`<br>`src/app/not-found.tsx`<br>`src/app/videos/page.tsx`<br>`src/components/home/ActiveCampaignSection.tsx`<br>`src/components/home/HomeSections.tsx`<br>`src/components/layout/Footer.tsx`<br>`src/components/layout/Header.tsx`<br>`src/components/legal/LegalDocument.tsx` |
| `src/components/common/EmptyState.tsx` | `EmptyState` | Server-compatible | `src/components/blog/BlogExplorer.tsx`<br>`src/components/campaigns/CampaignGroup.tsx`<br>`src/components/events/EventExplorer.tsx`<br>`src/components/gallery/GalleryExplorer.tsx`<br>`src/components/videos/VideoExplorer.tsx` |
| `src/components/common/LoadingState.tsx` | `LoadingState` | Server-compatible | Chưa có import nội bộ |
| `src/components/common/SectionHeader.tsx` | `SectionHeader` | Server-compatible | `src/app/about/page.tsx`<br>`src/components/home/HomeSections.tsx` |
| `src/components/common/SocialIcon.tsx` | `SocialIcon` | Server-compatible | `src/app/about/page.tsx`<br>`src/app/contact/page.tsx`<br>`src/components/home/HomeSections.tsx`<br>`src/components/layout/Footer.tsx`<br>`src/components/layout/SocialLinksDialog.tsx` |
| `src/components/common/ThemeToggle.tsx` | `ThemeToggle` | Client | `src/components/layout/Header.tsx` |
| `src/components/common/TurnstileWidget.tsx` | `TurnstileWidget` | Client | `src/components/campaigns/CampaignRegistrationForm.tsx`<br>`src/components/contact/ContactForm.tsx`<br>`src/components/home/NewsletterForm.tsx` |
| `src/components/contact/contact-form.types.ts` | — | Server-compatible | `src/components/contact/ContactForm.tsx`<br>`src/components/contact/ContactFormFields.tsx` |
| `src/components/contact/ContactForm.tsx` | `ContactForm` | Client | `src/app/contact/page.tsx` |
| `src/components/contact/ContactFormFields.tsx` | `ContactFieldError`, `ContactFormFields` | Server-compatible | `src/components/contact/ContactForm.tsx` |
| `src/components/events/EventCard.tsx` | `EventCard` | Server-compatible | `src/components/events/EventExplorer.tsx` |
| `src/components/events/EventExplorer.tsx` | `EventExplorer` | Client | `src/app/events/page.tsx` |
| `src/components/events/EventShareButtons.tsx` | `EventShareButtons` | Client | `src/app/events/[slug]/page.tsx` |
| `src/components/gallery/GalleryExplorer.tsx` | `GalleryExplorer` | Client | `src/app/gallery/page.tsx` |
| `src/components/home/ActiveCampaignSection.tsx` | `ActiveCampaignSection` | Client | `src/app/page.tsx` |
| `src/components/home/AnalyticsLink.tsx` | `AnalyticsLink` | Client | `src/app/about/page.tsx`<br>`src/components/home/ActiveCampaignSection.tsx`<br>`src/components/home/HomeSections.tsx` |
| `src/components/home/Countdown.tsx` | `Countdown` | Client | `src/components/campaigns/CampaignParticipation.tsx`<br>`src/components/home/ActiveCampaignSection.tsx` |
| `src/components/home/GalleryLightbox.tsx` | `GalleryLightbox` | Client | `src/components/gallery/GalleryExplorer.tsx`<br>`src/components/home/HomeSections.tsx` |
| `src/components/home/HeroMedia.tsx` | `HeroMedia` | Client | `src/components/home/HomeSections.tsx` |
| `src/components/home/HomeSections.tsx` | `CollaborationSection`, `FeaturedContentSection`, `GalleryPreviewSection`, `HeroSection`, `LatestPostsSection`, `LatestVideosSection`, `NewsletterSection`, `SocialLinksSection`, `UpcomingEventsSection` | Server-compatible | `src/app/page.tsx` |
| `src/components/home/NewsletterForm.tsx` | `NewsletterForm` | Client | `src/components/home/HomeSections.tsx` |
| `src/components/layout/DesktopNavigation.tsx` | `DesktopNavigation` | Client | `src/components/layout/Header.tsx` |
| `src/components/layout/Footer.tsx` | `Footer` | Server-compatible | `src/app/layout.tsx` |
| `src/components/layout/Header.tsx` | `Header` | Server-compatible | `src/app/layout.tsx` |
| `src/components/layout/MobileMenu.tsx` | `MobileMenu` | Client | `src/components/layout/Header.tsx` |
| `src/components/layout/RouteChrome.tsx` | `RouteChrome` | Client | `src/app/layout.tsx` |
| `src/components/layout/SocialLinksDialog.tsx` | `SocialLinksDialog` | Client | `src/components/home/HomeSections.tsx`<br>`src/components/layout/Header.tsx`<br>`src/components/layout/MobileMenu.tsx` |
| `src/components/legal/LegalDocument.tsx` | `LegalDocument` | Server-compatible | `src/app/privacy/page.tsx`<br>`src/app/terms/page.tsx` |
| `src/components/providers/ThemeProvider.tsx` | `ThemeProvider` | Client | `src/app/layout.tsx`<br>`src/components/common/ThemeToggle.tsx` |
| `src/components/videos/FeaturedVideo.tsx` | `FeaturedVideo` | Server-compatible | `src/app/videos/page.tsx` |
| `src/components/videos/VideoCard.tsx` | `VideoCard` | Server-compatible | `src/components/videos/FeaturedVideo.tsx`<br>`src/components/videos/VideoExplorer.tsx` |
| `src/components/videos/VideoExplorer.tsx` | `VideoExplorer` | Client | `src/app/videos/page.tsx` |
| `src/components/videos/VideoPlaybackTrigger.tsx` | `VideoPlaybackTrigger` | Client | `src/components/videos/FeaturedVideo.tsx`<br>`src/components/videos/VideoCard.tsx` |
