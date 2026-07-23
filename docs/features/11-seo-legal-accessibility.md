# SEO, legal và accessibility

## SEO

### Static metadata

Public list/about/contact/legal pages dùng `Metadata` và `withSocialMetadata`. Root metadata dùng Site Settings để phản ánh cấu hình database.

### Dynamic metadata

- Blog detail lấy post SEO title/description/cover.
- Event detail lấy title/description/banner.
- Campaign detail lấy title/description/banner.
- Record không public trả 404 và không sinh metadata public.

### Discovery routes

- `src/app/sitemap.ts`: static routes + published posts/events/public campaigns.
- `src/app/robots.ts`: dựa trên canonical site URL.
- Admin/auth headers có `X-Robots-Tag: noindex, nofollow, noarchive`.

`NEXT_PUBLIC_SITE_URL` phải là production canonical origin; thay đổi public env cần redeploy.

## Legal

- `/privacy`
- `/terms`
- shared `LegalDocument` renderer

Nội dung hiện là mẫu sản phẩm, không phải tư vấn pháp lý. Trước production cần review:

- privacy purpose/retention/deletion
- analytics consent theo jurisdiction
- newsletter/contact data handling
- cookie/storage usage
- terms, external links và campaign rules

## Accessibility contract

- Semantic header/nav/main/footer.
- Skip link.
- Mọi field có label, error association và focus.
- Dialog/lightbox có accessible title, close và keyboard behavior.
- Image có alt; Gallery bắt buộc alt ở service.
- Controls có focus-visible.
- Reduced motion được tôn trọng.
- Không autoplay media.
- Theme colors phải giữ contrast đủ.

## Source ownership

- Metadata helper: `src/lib/metadata.ts`.
- Root/static/dynamic metadata: `src/app/**`.
- Sitemap/robots: `src/app/sitemap.ts`, `src/app/robots.ts`.
- Legal: `src/components/legal/LegalDocument.tsx`, privacy/terms pages.
- Global accessibility/theme CSS: `src/app/globals.css`.
- Security/noindex headers: `next.config.ts`.

## Checklist thay đổi

- Route public mới: metadata, navigation nếu cần, sitemap/robots decision.
- Dynamic content mới: canonical, notFound, OG image URL và data visibility.
- Form mới: keyboard, label, status/error announcement.
- Dialog mới: focus trap/title/escape/return focus.
- Image mới: dimensions/alt và allowed remote origin.
- Chạy build để bắt metadata/route type issues và test bằng trình duyệt thật.

