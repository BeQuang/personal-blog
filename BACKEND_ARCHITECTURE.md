# Backend Audit, Architecture & Handoff

> Tài liệu sống dành cho việc triển khai Backend của dự án personal blog.
>
> Cập nhật lần đầu: 2026-07-16  
> Nguồn phân tích: Giai đoạn 11, `PROJECT_SPEC.md` và source hiện tại  
> Trạng thái: Architecture proposal — chưa có Backend, database hay API production

## 1. Mục đích tài liệu

Tài liệu này lưu lại:

- Hiện trạng source trước khi bắt đầu Backend.
- Các dependency và data flow đang dựa trên mock data.
- Kiến trúc Backend được đề xuất.
- Database schema và quan hệ dữ liệu mục tiêu.
- Luồng authentication, authorization, upload, email và analytics.
- Rủi ro migration và thứ tự triển khai.
- Các quyết định còn mở để AI hoặc developer sau có thể cải tiến có kiểm soát.

Đây không phải tài liệu bất biến. Khi source, yêu cầu nghiệp vụ hoặc giới hạn hạ tầng thay đổi, thiết kế có thể được điều chỉnh nếu:

1. Đã kiểm tra lại source thực tế.
2. Nêu rõ lý do thay đổi.
3. Đánh giá ảnh hưởng tới dữ liệu, API, UI và migration.
4. Cập nhật mục Decision Log và Change Log cuối tài liệu.
5. Không phá vỡ DTO hoặc route public hiện có nếu chưa có kế hoạch migration rõ ràng.

## 2. Hướng dẫn bắt buộc cho AI tiếp theo

Trước khi triển khai một giai đoạn Backend:

1. Đọc `AGENTS.md`, `CLAUDE.md`, `PROJECT_SPEC.md` và tài liệu này.
2. Kiểm tra `package.json` và tài liệu Next.js cục bộ trong `node_modules/next/dist/docs/` trước khi viết code Next.js.
3. Kiểm tra `git status`; không ghi đè thay đổi chưa commit của người dùng.
4. Re-audit các file thuộc domain sắp triển khai thay vì giả định tài liệu này luôn còn đúng.
5. Phân biệt rõ:
   - **Verified:** đã xác minh trong source.
   - **Proposed:** thiết kế đề xuất, chưa được triển khai.
   - **Open:** chưa có đủ dữ kiện hoặc cần quyết định nghiệp vụ.
6. Không gọi Route Handler nội bộ từ Server Component. Server Component phải gọi service/DAL trực tiếp.
7. Không import database, secret SDK hoặc module `server-only` vào Client Component.
8. Không trả database row trực tiếp cho UI; phải map sang DTO.
9. Mọi mutation phải validate phía server, kiểm tra authentication và authorization.
10. Sau mỗi giai đoạn, cập nhật tài liệu này theo source thật, không chỉ theo kế hoạch.

Nếu thiết kế hiện tại không còn phù hợp, AI được phép đề xuất phương án khác nhưng phải ghi:

- Vấn đề của thiết kế cũ.
- Phương án mới.
- Trade-off.
- Kế hoạch tương thích/migration.
- Quyết định nào cần người dùng phê duyệt.

## 3. Phạm vi và nguồn sự thật

Thứ tự ưu tiên khi có mâu thuẫn:

1. Yêu cầu mới nhất đã được người dùng xác nhận.
2. `AGENTS.md` và quy tắc môi trường hiện tại.
3. Source code và migration thực tế.
4. `PROJECT_SPEC.md`.
5. Tài liệu này.
6. README hoặc ghi chú cũ.

`PROJECT_SPEC.md` vẫn là đặc tả sản phẩm chính. Tài liệu này tập trung vào audit, lý do kiến trúc và handoff Backend.

---

# Phần A — Hiện trạng đã xác minh

## 4. Stack hiện tại

- Next.js 16 App Router.
- React 19.
- TypeScript strict.
- Tailwind CSS 4.
- Ant Design dùng chủ yếu cho Admin demo.
- Radix Dialog và Lucide icons.
- Chưa có ORM, database client, authentication SDK, storage SDK, Mux, email hoặc rate-limit dependency.
- Chưa có Route Handler, Server Action hoặc thư mục Backend chuyên biệt.

Các script hiện có:

- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm run start`

Chưa có script `type-check` riêng; có thể dùng `npx tsc --noEmit` khi cần và khi dependency đã sẵn sàng.

## 5. Model dữ liệu public hiện tại

Các type trong `src/types` là DTO cho UI, không phải database schema.

### 5.1. BlogPost

- `id`, `title`, `slug`, `excerpt`.
- `content: PostContentBlock[]`.
- Thumbnail và cover dưới dạng URL.
- Category và tags dưới dạng chuỗi.
- Author là object nhúng.
- Status: draft, published, scheduled.
- Featured, reading time, view count và timestamps.

Khoảng trống Backend:

- Chưa có media FK, category FK, author FK và bảng nối tags.
- Chưa có `scheduled_at`, SEO fields và soft delete.
- Content JSON cần schema validation và versioning.

### 5.2. SocialLink

- Gần tương ứng với database row.
- Có platform, URL, follower count, enabled và order.
- Thiếu timestamps và audit history.

### 5.3. VideoItem

- Hỗ trợ video ngoài và platform `internal`.
- Duration đang là chuỗi đã format.
- Thumbnail và video URL là chuỗi.
- Chưa có Mux upload/asset/playback ID hoặc processing status.

### 5.4. GalleryItem

- Ảnh và thumbnail là URL trực tiếp.
- Chưa có media asset FK, publish status và sort order bền vững.

### 5.5. EventItem

- Có slug, banner, type, operational status, start/end time.
- Schedule là JSON `{time, title}[]`.
- Chưa có content status riêng, timezone và soft delete.

### 5.6. Campaign

- Có slug, banner, thời gian, status, rules, terms và CTA.
- UI đang tính effective status dựa trên thời gian.
- Chưa có submission settings/limit và soft delete.

### 5.7. SiteConfig

- Chứa site identity, creator info, theme, navigation và homepage sections.
- Được đọc trực tiếp từ config trong nhiều page/component.
- `siteUrl` là deployment config và không được lưu vào database.
- Theme preference của khách truy cập trong localStorage là khái niệm khác với appearance mặc định của website.

## 6. Mock data và service hiện tại

Sáu service đồng bộ đang import trực tiếp từ `src/data`:

- `src/services/post.service.ts`
- `src/services/social.service.ts`
- `src/services/video.service.ts`
- `src/services/gallery.service.ts`
- `src/services/event.service.ts`
- `src/services/campaign.service.ts`

Ngoài service layer, còn hai điểm đọc mock data trực tiếp:

- `src/lib/admin-data.ts` import toàn bộ data và map sang `AdminTableRow` chung.
- `src/app/admin/page.tsx` import posts, videos, events và campaigns để tính dashboard mock.

Mục tiêu migration:

- Giữ `src/services/*` làm public facade.
- Chuyển facade thành async và trả DTO hiện tại.
- Facade gọi application service/repository phía server.
- Loại bỏ dần import trực tiếp từ `src/data` sau khi từng domain đã chuyển DB.
- Giữ mock data trong thời gian migration để fallback/seed/feature flag; không xóa sớm.

## 7. Admin demo hiện tại

Các route danh sách Admin dùng `getAdminRows()` và truyền `initialRows` vào `AdminResourceTable`.

Hành động hiện tại:

- Create, edit, delete, featured, enable/disable chỉ cập nhật `useState`.
- Refresh sẽ trở lại mock data.
- Search, filter và pagination chạy trên toàn bộ dữ liệu phía client.
- Modal CRUD chỉ xử lý tập field tối giản.
- Không có authentication, authorization, database transaction hoặc audit log.

Settings:

- Dùng Ant Design Form.
- Submit chỉ delay mock và toast.
- Không lưu dữ liệu.

Appearance:

- Lưu key `creator-blog-admin-appearance` trong localStorage.
- Chỉ ảnh hưởng preview Admin.
- Chưa cập nhật giao diện public hoặc database.

Hướng migration:

- Không dùng một payload CRUD generic cho mọi resource.
- Tạo Admin DTO, validation schema và Server Action riêng theo domain.
- Server pagination/search khi dataset tăng.
- Giữ optimistic/local state chỉ như UI enhancement sau khi mutation server thành công.

## 8. Form submit mock hiện tại

### Newsletter

- Validate email phía client.
- Chuyển local state sang success.
- Analytics hiện chỉ log trong development.

### Contact

- Validate required/email/phone phía client.
- File attachment chỉ được kiểm tra extension và size trong browser.
- Delay mock rồi reset form.

### Campaign submission

- Validate phía client.
- Delay mock rồi reset form.
- Countdown và trạng thái campaign chạy client-side.

### Admin Settings

- Delay mock và toast.
- Chưa persist.

Yêu cầu Backend chung:

- Client validation chỉ phục vụ UX.
- Server phải trim, normalize và validate lại toàn bộ input.
- Kiểm tra rate limit và Turnstile cho public form.
- Không log message, phone, email hoặc token vào production console.
- Campaign phải kiểm tra status, thời gian, duplicate và submission limit trong transaction.

## 9. Client Component bị ảnh hưởng khi chuyển server data

### Bắt buộc xử lý sớm

`src/components/layout/SocialLinksDialog.tsx` là Client Component nhưng gọi `getEnabledSocialLinks()` ở module scope. Khi service trở thành `server-only`, import này sẽ không hợp lệ.

Giải pháp:

- Server layout/header đọc social link DTO.
- Truyền danh sách serializable vào dialog bằng props.

`src/components/layout/Footer.tsx` cũng gọi service ở module scope. Footer cần trở thành async Server Component và gọi service bên trong component.

### Tiếp tục nhận DTO từ server

- BlogExplorer.
- VideoExplorer.
- GalleryExplorer.
- EventExplorer.
- ActiveCampaignSection.
- HeroMedia và HomeSections nếu site settings chuyển DB.

### Chuyển mutation sang server

- AdminResourceTable và editor modal.
- AdminSettingsForm.
- AdminAppearanceEditor.
- NewsletterForm.
- ContactForm.
- CampaignRegistrationForm.
- AnalyticsLink.

### Có thể giữ client-only

- Theme preference cá nhân.
- Lightbox state.
- Countdown display, nhưng trạng thái nhận submission vẫn do server quyết định.
- Share buttons.
- Mobile menu và dialog interaction.

## 10. Dynamic route và caching risk

Các route blog/event/campaign detail đang dùng `generateStaticParams()` và service đồng bộ.

Khi dùng database:

- Service phải async.
- Metadata, page, sitemap và static params phải `await` loader.
- Dùng request memoization/cached loader để metadata và page không query lặp.
- Quyết định rõ CI/build có được truy cập DB hay không.
- Nếu build không nên phụ thuộc DB, dùng dynamic rendering hoặc ISR thay vì enumerate toàn bộ slug ở build-time.
- Không fetch Route Handler nội bộ từ Server Component.

---

# Phần B — Kiến trúc mục tiêu

## 11. Kiến trúc tổng thể

```text
Browser
├── Public Server Components
│   └── src/services async facades
│       └── Application services
│           └── Repository interfaces/implementations
│               └── Drizzle → PostgreSQL
│
├── Admin Client Components
│   └── Server Actions
│       └── Auth → Authorization → Validation
│           └── Service → Transaction → Audit → Cache invalidation
│
└── Public forms / uploads / webhooks / analytics
    └── Route Handlers
        └── Validation → Rate limit → Application service
            ├── PostgreSQL
            ├── Cloudflare R2
            ├── Mux
            ├── Resend
            └── Analytics pipeline
```

Định hướng là modular monolith trong cùng repository Next.js. Không tách microservice ở MVP.

## 12. Cấu trúc thư mục mục tiêu

```text
src/
├── actions/
│   ├── auth.actions.ts
│   ├── posts.actions.ts
│   ├── social-links.actions.ts
│   ├── videos.actions.ts
│   ├── gallery.actions.ts
│   ├── events.actions.ts
│   ├── campaigns.actions.ts
│   └── settings.actions.ts
├── app/api/
│   ├── auth/callback/
│   ├── newsletter-subscriptions/
│   ├── contact-submissions/
│   ├── campaigns/[id]/submissions/
│   ├── analytics/events/
│   ├── media-assets/presign/
│   ├── media-assets/complete/
│   ├── videos/direct-upload/
│   └── webhooks/mux/
├── services/                    # Public DTO facades
└── server/
    ├── auth/
    ├── database/
    ├── repositories/
    ├── services/
    ├── mappers/
    ├── validation/
    ├── errors/
    ├── storage/
    ├── video/
    ├── email/
    ├── rate-limit/
    ├── analytics/
    ├── audit/
    └── security/

drizzle/
├── migrations/
└── meta/
```

Tất cả module trong `src/server` có khả năng truy cập secret/database phải được bảo vệ bằng `server-only`.

## 13. Trách nhiệm từng layer

### Route Handler

Dùng cho:

- Public form endpoint.
- Analytics ingest.
- Upload presign/complete.
- Mux webhook.
- Auth callback.
- Boundary cần raw request body, HTTP status hoặc external caller.

Không chứa business logic lớn.

### Server Action

Dùng cho mutation nội bộ từ UI Admin:

- Luôn authenticate và authorize lại.
- Validate input với schema.
- Gọi application service.
- Không query Drizzle trực tiếp trong component/action nếu logic thuộc domain service.

### Application service

- Business rules.
- Transaction boundary.
- Kết hợp nhiều repository/provider.
- Audit event.
- Trả result/DTO mapper input.

### Repository

- Query, insert, update và transaction-aware persistence.
- Không xử lý HTTP, toast, React state hoặc provider UI.
- Không trả raw row ra Client Component.

### Mapper/DTO

- Giữ tương thích các public type hiện tại.
- Map media asset thành URL.
- Map category/tag/author join thành object/string hiện tại.
- Map duration seconds thành chuỗi display.
- Tính effective campaign state phía server.

## 14. Cache policy

Có thể cache:

- Published posts/list/detail.
- Enabled social links.
- Public videos/gallery/events/campaigns.
- Site settings public.

Không cache:

- Auth session và quyền.
- Admin private queries nếu chưa có policy riêng.
- Contact/campaign submissions.
- Presigned upload/download URL.
- Rate-limit result.

Cache tags đề xuất:

- `posts`, `post:{slug}`.
- `social-links`.
- `videos`.
- `gallery`.
- `events`, `event:{slug}`.
- `campaigns`, `campaign:{slug}`.
- `site-settings`.

Chỉ invalidate sau khi transaction đã commit.

---

# Phần C — Database design

## 15. Quy ước chung

- PostgreSQL + Drizzle ORM/Kit.
- UUID PK với `gen_random_uuid()` trừ bảng aggregate có thể dùng identity bigint.
- `timestamptz` lưu UTC; format theo timezone khi hiển thị.
- Bảng mutable có `created_at` và `updated_at`.
- Soft delete chỉ cho nội dung/media quan trọng.
- Slug normalize lowercase và dùng unique index trên `lower(slug)`.
- Mọi FK query thường xuyên phải có index.
- JSONB luôn được validate bằng schema trước khi lưu.
- Migration phải được commit; không schema-push trực tiếp lên production.

## 16. PostgreSQL enums

```text
user_role:
  super_admin | admin | editor | viewer

profile_status:
  active | disabled

content_status:
  draft | scheduled | published | archived

social_platform:
  facebook | youtube | tiktok | instagram | x | threads |
  zalo | telegram | discord | website | email

media_type:
  image | document | video

media_provider:
  r2 | mux | external | local

media_visibility:
  public | private

media_status:
  pending | uploading | processing | ready | failed | deleted

video_platform:
  youtube | tiktok | instagram | facebook | internal

video_orientation:
  landscape | portrait

event_status:
  upcoming | live | ended | cancelled

event_type:
  livestream | premiere | fan-meeting | giveaway |
  workshop | offline | launch

campaign_status:
  draft | upcoming | active | ended

submission_status:
  new | reviewing | accepted | rejected | spam | archived

newsletter_status:
  subscribed | unsubscribed | suppressed
```

`media_visibility` là bổ sung cần thiết so với DTO hiện tại để phân biệt ảnh public với attachment private.

## 17. Bảng dữ liệu

### profiles

- `id uuid PK`, đồng thời FK `auth.users.id`.
- `email text` chỉ để hiển thị/cache, không là nguồn auth chính.
- `display_name text NOT NULL`.
- `role user_role NOT NULL DEFAULT 'viewer'`.
- `status profile_status NOT NULL DEFAULT 'active'`.
- `last_login_at timestamptz NULL`.
- `created_at`, `updated_at timestamptz NOT NULL`.
- Index: role, status, `(status, role)`.

### media_assets

- Metadata trung tâm cho ảnh, tài liệu và video/file liên quan.
- `id uuid PK`.
- `type media_type`, `provider media_provider`, `visibility media_visibility`, `status media_status`.
- `object_key text NULL`, partial unique khi không null.
- `public_url text NULL`; private asset không có public URL.
- Filename, MIME, extension, size, width, height, alt, checksum.
- `metadata jsonb DEFAULT '{}'`.
- `uploaded_by uuid NULL FK profiles.id ON DELETE SET NULL`.
- Timestamps và `deleted_at`.
- Check size/dimensions không âm.
- Index `(type,status)`, `(provider,status)`, uploader và created time.

### site_settings

- Một row chính với `settings_key='default'` unique.
- Site name/description, locale, creator name, username, contact email.
- Avatar/cover FK media assets.
- Theme, homepage sections, navigation, homepage content dạng JSONB đã validate.
- Default SEO title/description.
- Timestamps.
- Không lưu site URL production hoặc secret.

### social_links

- Platform, label, username, URL, follower count, description.
- Enabled và sort order.
- Timestamps.
- Index `(enabled,sort_order)` và platform.

### categories

- Name, slug, description và timestamps.
- Unique index `lower(slug)`.
- Không xóa khi còn post tham chiếu.

### tags

- Name, slug và timestamps.
- Unique index `lower(slug)`.

### posts

- Title, slug, excerpt, content JSONB.
- Thumbnail/cover FK media.
- Category và author FK.
- Content status, featured, reading time, view count.
- Scheduled/published time và SEO fields.
- Timestamps và soft delete.
- Unique lowercase slug.
- Index public list, featured, category và author.
- Published bắt buộc có published time; scheduled bắt buộc có scheduled time.

### post_tags

- Composite PK `(post_id, tag_id)`.
- Hai FK cascade khi post/tag bị xóa hợp lệ.
- Index riêng `tag_id`.

### videos

- Title, description, platform, orientation và topic.
- External URL cho platform ngoài.
- Thumbnail/video media FK.
- Mux upload/asset/playback IDs unique khi có.
- Duration seconds, aspect ratio.
- Processing status và content status riêng.
- Featured, view count, published time.
- Timestamps và soft delete.
- Internal video chỉ public khi Mux asset ready.

### gallery_items

- Media asset FK bắt buộc.
- Title, description, category, alt, sort order.
- Content status, published time.
- Timestamps và soft delete.
- Index `(status,sort_order)` và `(category,status)`.

### events

- Title, slug, description, banner media FK.
- Event type, operational status và content status.
- Start/end time, timezone, location, platform, external URL.
- Schedule JSONB và featured.
- Timestamps và soft delete.
- Unique lowercase slug.
- Check end time sau start time.

### campaigns

- Title, slug, description và banner FK.
- Start/end time và campaign status.
- CTA label/URL, rules và terms JSONB.
- Featured, submission enabled và optional submission limit.
- Timestamps và soft delete.
- Server tính khả năng nhận submission từ thời gian thật và config.

### campaign_submissions

- Campaign FK.
- Full name, raw/normalized email, phone, followed platform, social username, notes.
- Status, source và UTM JSONB.
- Timestamps.
- MVP unique `(campaign_id,email_normalized)` nếu business rule chưa đổi.
- Index theo campaign/status/time và normalized email.

### contact_submissions

- Các field form hiện tại.
- Normalized email.
- Private attachment media FK nullable.
- Status, source và UTM.
- Timestamps.
- Index status/time và normalized email.

### newsletter_subscriptions

- Raw/normalized email.
- Status và source.
- Unsubscribe token hash unique; không lưu plaintext token.
- Subscribe/unsubscribe time và timestamps.
- Unique normalized email.

### analytics_events

- Append-only raw event.
- Event type theo allowlist.
- Optional entity type/id.
- Path, referrer domain, UTM, device category, country code và anonymous session hash.
- Metadata nhỏ đã lọc.
- Created time.
- Không lưu password, auth token, form content, Turnstile token hoặc full IP dài hạn.
- Index theo event/time, entity/time và BRIN created time khi dữ liệu lớn.

### daily_analytics

- Aggregate tránh query raw event cho dashboard.
- Date, metric, optional entity, dimensions JSONB/hash, value và updated time.
- Unique `(date,metric,entity_type,entity_id,dimensions_hash)`.

### audit_logs

- Append-only.
- Actor profile FK nullable cho system action.
- Action, entity type/id, before/after JSONB đã lọc, request ID và created time.
- Index actor/time, entity/time và action/time.
- Không chứa secret, token hoặc PII không cần thiết.

## 18. ERD dạng văn bản

```text
auth.users  1 ─── 1 profiles
profiles    1 ─── N posts
profiles    1 ─── N media_assets
profiles    1 ─── N audit_logs

categories  1 ─── N posts
posts       N ─── N tags                 via post_tags

media_assets 1 ─── N posts               thumbnail/cover
media_assets 1 ─── N videos
media_assets 1 ─── N gallery_items
media_assets 1 ─── N events              banner
media_assets 1 ─── N campaigns           banner
media_assets 1 ─── N site_settings       avatar/cover
media_assets 1 ─── N contact_submissions private attachment

campaigns 1 ─── N campaign_submissions

analytics_events N ─── entity_id         polymorphic, no FK
audit_logs       N ─── entity_id         polymorphic, no FK
```

---

# Phần D — API, providers và security flow

## 19. Route Handlers dự kiến

```text
GET  /auth/callback
POST /api/newsletter-subscriptions
POST /api/newsletter/unsubscribe
POST /api/contact-submissions
POST /api/campaigns/[id]/submissions
POST /api/analytics/events
POST /api/media-assets/presign
POST /api/media-assets/complete
POST /api/videos/direct-upload
POST /api/webhooks/mux
```

Không cần public CRUD API cho nội dung ở MVP. Server Components đọc qua service trực tiếp.

## 20. Server Actions dự kiến

- Auth: login, logout.
- Posts: create, update, publish, schedule, archive, feature.
- Social links: create, update, toggle, reorder, delete.
- Videos, gallery, events và campaigns: typed mutation riêng.
- Settings/appearance: update và cache invalidation.
- Submissions: đổi status, archive; export để giai đoạn sau nếu cần.
- Users/roles: chỉ super admin.

Pipeline bắt buộc:

```text
authenticate
→ authorize
→ validate/normalize
→ application service/transaction
→ audit log
→ cache invalidation
→ safe DTO/result
```

## 21. Upload ảnh/tài liệu qua R2

1. Admin chọn file.
2. Gửi metadata, MIME, size và upload purpose.
3. Server kiểm tra session, quyền, extension, MIME và size.
4. Tạo media asset pending và object key an toàn.
5. Tạo presigned PUT URL TTL ngắn.
6. Browser upload trực tiếp R2.
7. Client gọi complete endpoint.
8. Server HEAD object và xác minh key/size/content type/checksum khi phù hợp.
9. Media asset chuyển ready.
10. Nội dung tham chiếu asset qua FK.

Yêu cầu:

- Public và private prefix/bucket policy riêng.
- Contact attachment là private.
- Signed download URL TTL ngắn cho Admin được phép.
- Cleanup asset pending/orphan.
- Không proxy file lớn qua Next.js nếu không cần.

## 22. Upload video qua Mux

1. Tạo video draft internal.
2. Server kiểm tra quyền và tạo Mux Direct Upload.
3. Lưu upload ID và trạng thái uploading.
4. Browser upload trực tiếp Mux.
5. Mux xử lý asset.
6. Webhook gọi Next.js.
7. Route Handler đọc raw body và verify signature.
8. Xử lý event idempotently.
9. Lưu asset ID, playback ID, duration, aspect ratio và trạng thái.
10. Chỉ cho publish khi ready.

Nên cân nhắc thêm bảng `webhook_events` với `(provider,event_id)` unique để theo dõi idempotency và retry.

## 23. Authentication

- Supabase Auth email/password.
- Không mở public signup cho Admin MVP.
- Session cookie HTTP-only phía server.
- Profiles đồng bộ từ auth user.
- Admin layout yêu cầu authenticated active profile.
- Disabled profile bị từ chối dù session còn hạn.
- Supabase service role không bao giờ xuất hiện ở client bundle.
- Cách refresh cookie phải theo tài liệu Supabase SSR hiện hành tại thời điểm triển khai.

## 24. Authorization

```text
super_admin:
  toàn quyền, user/role và cấu hình nhạy cảm

admin:
  content, media, submissions và site settings

editor:
  tạo/sửa/publish content được cấp; không quản lý role

viewer:
  chỉ đọc dashboard/admin data
```

Authorization phải được kiểm tra tại:

- Layout/page để phục vụ UX.
- Từng Server Action.
- Từng private Route Handler.
- Application service cho thao tác nhạy cảm.
- Database grants/RLS như defense-in-depth.

Ẩn button phía client không phải authorization.

## 25. Rate limit và anti-abuse

Đề xuất dùng Upstash Redis/Ratelimit và Turnstile cho public form.

Key rate limit có thể kết hợp:

- Route/action.
- Anonymous session hash.
- IP hash TTL ngắn.
- Normalized email hash khi phù hợp.

Không lưu full IP dài hạn. Giới hạn ban đầu phải cấu hình được, không hardcode như business invariant.

## 26. Email

- Resend nằm sau `EmailProvider` interface.
- Gửi xác nhận/notification chỉ sau khi DB commit.
- API failure không được làm mất submission đã lưu.
- Không gửi PII dư thừa trong subject/log.
- Nếu cần retry đáng tin cậy, bổ sung outbox table ở giai đoạn email thay vì retry tùy tiện trong request.

## 27. Analytics

- Public ingest Route Handler nhận allowlisted events.
- Payload nhỏ, giới hạn kích thước và metadata keys.
- Không nhận form content hoặc secret.
- Raw events có retention policy.
- Scheduled aggregation ghi `daily_analytics`.
- Admin dashboard đọc aggregate thay vì quét raw event.
- Số liệu mock hiện tại không được nhập thành analytics thật nếu không đánh dấu provenance.

---

# Phần E — Migration plan

## 28. Rủi ro migration đã biết

1. Mock ID đang là chuỗi như `post-001`, database dự kiến dùng UUID.
2. Category/tag hiện là string và có thể khác casing/dấu.
3. Author đang nhúng trong BlogPost, cần map thành profile.
4. Asset local/external chưa phải R2 media asset.
5. Video duration là display string, DB cần seconds.
6. Video internal local cần quyết định chuyển Mux hay giữ adapter local tạm thời.
7. Scheduled post chưa có scheduled timestamp trong DTO.
8. Event thiếu content status.
9. Campaign stored status có thể lệch thời gian thực.
10. Service sync → async ảnh hưởng page, metadata, sitemap, footer và dialog.
11. Static params có thể làm build phụ thuộc DB.
12. Admin generic row thiếu field domain-specific.
13. Client filtering toàn dataset không mở rộng tốt.
14. View count/analytics hiện là mock.
15. Contact/campaign chứa PII và cần retention/redaction.
16. JSON content/theme/navigation cần schema version.
17. Soft delete và slug reuse có thể tạo broken internal links.

## 29. Chiến lược seed/migration mock

- Tạo validator cho toàn bộ mock data trước khi seed.
- Seed theo natural key hoặc legacy ID map deterministic.
- Upsert idempotent; chạy lại không nhân đôi dữ liệu.
- Log thống kê record insert/update/skip/fail, không log PII.
- Có dry-run hoặc validation-only mode.
- Không xóa mock data ngay sau lần seed đầu.
- Dùng feature flag theo domain để fallback mock trong quá trình chuyển đổi.
- Chỉ bỏ fallback sau khi test public/Admin và xác nhận dữ liệu production.

## 30. Thứ tự triển khai đề xuất

### Giai đoạn 12 — Database foundation

- Drizzle schema/config/migrations.
- Connection và transaction helper.
- Environment validation.
- Database health check có bảo vệ.

### Giai đoạn 13 — Authentication và RBAC

- Supabase Auth SSR.
- Profiles sync.
- Admin guard và permission map.

### Giai đoạn 14 — Repository/service/mapper/seed

- Server-only DAL.
- DTO mapper.
- Mock/database feature flag.
- Idempotent seed.

### Giai đoạn 15 — Posts/categories/tags/social

- Chuyển public reads.
- Typed Admin mutations.
- Cache invalidation.

### Giai đoạn 16 — R2/media library

- Presigned upload.
- Public/private media.
- Media picker và cleanup.

### Giai đoạn 17 — Mux video

- Direct upload.
- Webhook/idempotency.
- Public player mapping.

### Giai đoạn 18 — Gallery/events/campaigns/settings

- CRUD và public reads.
- Campaign rules phía server.
- Site settings cache.

### Giai đoạn 19 — Forms/email/anti-abuse

- Contact/campaign/newsletter persistence.
- Turnstile, rate limit và Resend.
- Retention policy.

### Giai đoạn 20 — Analytics

- Event ingest.
- Aggregate job.
- Dashboard real data.

### Giai đoạn 21 — Hardening

- Audit coverage.
- Security headers/CSP.
- Idempotency review.
- Tests, backup/restore và deploy verification.

Không thực hiện big-bang migration. Chuyển từng domain, chạy song song và kiểm chứng trước khi bỏ mock fallback.

---

# Phần F — Quyết định mở và cơ chế cải tiến

## 31. Open decisions

Các điểm sau chưa phải quyết định cuối:

| ID | Câu hỏi | Phương án hiện tại | Khi nào phải chốt |
|---|---|---|---|
| O-01 | Build có truy cập production DB không? | Ưu tiên không phụ thuộc DB khi build nếu chưa có hạ tầng ổn định | Trước khi đổi `generateStaticParams` |
| O-02 | Giữ UUID hay bảo tồn legacy string ID? | UUID DB + legacy ID map khi seed | Trước migration đầu tiên |
| O-03 | R2 public bucket hay signed delivery/CDN? | Public asset cho nội dung, private attachment | Trước Stage 16 |
| O-04 | Campaign duplicate theo email hay email+phone? | Unique campaign + normalized email | Trước Stage 19 |
| O-05 | Analytics raw retention bao lâu? | Chưa chốt; đề xuất 60–90 ngày | Trước Stage 20 |
| O-06 | Admin appearance lưu toàn bộ trong site_settings? | Lưu default site appearance; visitor theme vẫn local | Trước Stage 18 |
| O-07 | Video internal local hiện tại xử lý thế nào? | Adapter local tạm thời hoặc migrate Mux | Trước Stage 17 |
| O-08 | Có cần email outbox không? | Chỉ thêm nếu cần retry đáng tin cậy | Trước Stage 19 |

## 32. Decision record template

Khi chốt hoặc đổi một quyết định, thêm bản ghi:

```text
### ADR-XXX — Tên quyết định

- Date:
- Status: proposed | accepted | superseded | rejected
- Context:
- Decision:
- Alternatives considered:
- Consequences:
- Migration/compatibility impact:
- Files/modules affected:
- Replaces:
```

## 33. Quy tắc cải tiến kiến trúc

Có thể thay đổi kiến trúc khi có căn cứ, nhưng ưu tiên:

- Đơn giản hơn mà vẫn đáp ứng security và data integrity.
- Backward-compatible với DTO và route public.
- Có migration rollback hoặc forward-fix rõ ràng.
- Provider nằm sau interface khi có khả năng thay đổi.
- Không tạo abstraction chỉ để dự đoán nhu cầu chưa tồn tại.
- Không thêm queue, microservice, event bus hoặc CQRS nếu MVP chưa cần.
- Không dùng RLS như lớp authorization duy nhất nếu request đi qua server application.
- Không dùng `any` hoặc cast để che mismatch giữa row và DTO.
- Không đưa secret/environment-specific URL vào database.

## 34. Checklist trước mỗi Backend phase

- [ ] Re-read project rules và relevant Next.js local docs.
- [ ] Kiểm tra source và git status hiện tại.
- [ ] Xác định phạm vi domain và file bị ảnh hưởng.
- [ ] Chốt input/output DTO và validation schema.
- [ ] Chốt authorization matrix.
- [ ] Chốt transaction boundary và idempotency.
- [ ] Chốt cache/invalidation.
- [ ] Chốt migration/seed/rollback.
- [ ] Không expose secret/PII trong client hoặc log.
- [ ] Viết test phù hợp.
- [ ] Chạy lint, type-check và build.
- [ ] Cập nhật tài liệu này theo implementation thực tế.

## 35. Checklist hoàn thành một domain

- [ ] Public read dùng service/repository thật.
- [ ] Admin mutation persist qua typed action.
- [ ] Authentication và authorization được kiểm tra phía server.
- [ ] Input được normalize/validate.
- [ ] Database constraints bảo vệ invariant quan trọng.
- [ ] Audit log phù hợp.
- [ ] Cache invalidation đúng.
- [ ] Error không làm lộ secret/PII.
- [ ] Mock fallback có quyết định giữ hoặc loại bỏ rõ ràng.
- [ ] Dynamic route, metadata và sitemap vẫn hoạt động.
- [ ] Responsive/Client Component không bị phá bởi async data.
- [ ] Migration và seed chạy lặp lại an toàn.

---

# Phần G — Decision Log và Change Log

## 36. Decision Log

### ADR-001 — Modular monolith trong Next.js

- Date: 2026-07-16
- Status: proposed
- Context: Public và Admin đang cùng một Next.js repository; quy mô MVP chưa cần distributed system.
- Decision: Dùng Next.js App Router, Server Actions, Route Handlers và server-only layers trong cùng repository.
- Consequences: Deploy đơn giản, transaction và DTO thống nhất; cần kỷ luật module boundary để tránh import server code vào client.

### ADR-002 — PostgreSQL + Drizzle

- Date: 2026-07-16
- Status: proposed
- Context: Dữ liệu có quan hệ, trạng thái, audit, submission và migration rõ ràng.
- Decision: PostgreSQL với Drizzle ORM/Kit và committed migrations.
- Consequences: Type-safe schema, kiểm soát migration; cần quản lý connection phù hợp serverless.

### ADR-003 — Giữ public service facade và DTO hiện tại

- Date: 2026-07-16
- Status: proposed
- Context: UI đã hoàn thiện và đang gọi `src/services`.
- Decision: Chuyển facade thành async, map DB row sang DTO thay vì để UI dùng schema row.
- Consequences: Giảm phạm vi sửa UI; cần mapper và kiểm soát query duplication.

### ADR-004 — Server Actions cho Admin, Route Handlers cho external/public boundary

- Date: 2026-07-16
- Status: proposed
- Context: Admin mutation xuất phát từ React UI; form/webhook/upload cần HTTP boundary rõ.
- Decision: Dùng typed Server Actions cho Admin và Route Handlers cho public forms, uploads, analytics, auth callback và webhooks.
- Consequences: Phù hợp App Router; mọi action/handler vẫn phải auth/validate độc lập.

### ADR-005 — Direct upload cho R2 và Mux

- Date: 2026-07-16
- Status: proposed
- Context: Không nên proxy file lớn qua Vercel/Next.js.
- Decision: Browser upload trực tiếp bằng presigned URL hoặc Mux Direct Upload; server tạo intent và verify completion/webhook.
- Consequences: Hiệu quả hơn; cần CORS, cleanup, signature verification và idempotency.

## 37. Change Log

### 2026-07-16

- Tạo tài liệu từ kết quả audit Giai đoạn 11.
- Ghi lại source dependency map, kiến trúc, schema, provider flows, migration risks và implementation order.
- Đánh dấu toàn bộ Backend design là proposal; chưa có code hoặc hạ tầng production tương ứng.

