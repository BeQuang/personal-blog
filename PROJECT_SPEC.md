# Quang Official — Project Specification

> Trạng thái tài liệu: đặc tả hệ thống hiện hành
> Baseline source: 23/07/2026
> Stack chính: Next.js 16.2.10, React 19.2, TypeScript, PostgreSQL/Drizzle, Supabase Auth

## 1. Mục đích và nguồn sự thật

Tài liệu này mô tả đầy đủ Frontend và Backend đang tồn tại trong repository `personal-blog`. Đây là điểm bắt đầu cho thành viên mới và AI agent trước khi sửa source.

Thứ tự ưu tiên khi có khác biệt:

1. Source code và migration hiện tại.
2. `PROJECT_SPEC.md`.
3. Tài liệu nghiệp vụ trong `docs/features/`.
4. System map được sinh trong `docs/ai-map/`.
5. `README.md` và `BACKEND_ARCHITECTURE.md` là tài liệu lịch sử/vận hành; một số câu mô tả demo cũ có thể chưa phản ánh code mới.

Không sửa tay `docs/ai-map/*`. Chạy `npm run ai:setup` để sinh lại từ source.

## 2. Tổng quan sản phẩm

Quang Official là website cá nhân cho content creator, gồm hai bề mặt:

- Website public: giới thiệu creator, blog, video, gallery, events, campaigns, social links, newsletter, liên hệ, trang pháp lý và SEO.
- Admin CMS: đăng nhập, dashboard analytics, CRUD nội dung/media, quản lý submissions, theme, homepage sections và site settings.

Backend là modular monolith chạy trong Next.js App Router:

- Server Components đọc dữ liệu.
- Client Components xử lý tương tác.
- Server Actions xử lý mutation từ UI.
- Route Handlers xử lý HTTP boundary, webhook, callback và export.
- Application services chứa validation, authorization và nghiệp vụ.
- Repositories truy cập PostgreSQL qua Drizzle.
- Mappers giữ DTO của FE độc lập với database row.
- Provider abstractions kết nối R2, Mux, Resend, Turnstile và Upstash.

## 3. Công nghệ và phiên bản

### Frontend

- Next.js `16.2.10`, App Router và `src/proxy.ts`.
- React/React DOM `19.2.4`.
- TypeScript strict mode, alias `@/* -> src/*`.
- Tailwind CSS 4 kết hợp CSS tùy biến trong `src/app/globals.css`.
- Ant Design 6 và `@ant-design/nextjs-registry` cho Admin.
- Radix Dialog, Lucide icons.
- Mux Player React cho video nội bộ.
- uPlot cho biểu đồ analytics.

### Backend

- PostgreSQL, Drizzle ORM `0.45` và Drizzle Kit.
- Supabase SSR/Auth.
- Cloudflare R2 qua AWS S3-compatible SDK.
- Mux Video SDK.
- Resend transactional email.
- Cloudflare Turnstile.
- Upstash Redis sliding-window rate limit.
- Zod 4 cho validation.

### Runtime

- Node.js `>= 20.9.0`.
- Route upload/video webhook dùng Node.js runtime.
- `DATABASE_POOL_MAX` mặc định 1 ở production và 5 ở development.
- PostgreSQL client dùng `prepare: false`, phù hợp transaction pooler.

## 4. Cấu trúc repository

```text
src/
├── actions/                 # Server Actions và chuẩn hóa ActionResult
├── app/                     # App Router: public/admin/API/metadata
├── components/              # UI common và UI theo feature
├── config/                  # Site, navigation, theme, security, admin
├── data/                    # Fixture mock dùng cho development/fallback
├── lib/                     # Metadata, analytics client, admin helpers
├── server/
│   ├── anti-spam/           # Request fingerprint và Turnstile
│   ├── auth/                # Current user, RBAC, redirect, profile sync
│   ├── database/            # Drizzle client, schema, migrations
│   ├── email/               # Provider và template email
│   ├── errors/              # Typed application errors
│   ├── export/              # CSV an toàn
│   ├── mappers/             # Database row -> DTO
│   ├── rate-limit/          # Memory/Upstash adapters
│   ├── repositories/        # Truy vấn và transaction
│   ├── services/            # Nghiệp vụ ứng dụng
│   ├── storage/             # R2, object key, upload ticket
│   ├── validation/          # Zod schemas
│   └── video/               # Mux provider abstraction
├── services/                # Public read facades
├── types/                   # DTO/type dùng chung
├── utils/                   # Format/date/class helpers
└── proxy.ts                 # Làm mới Supabase session
scripts/                     # Migration, seed, audit, retention và test
docs/features/               # Tài liệu sử dụng theo tính năng
docs/ai-map/                 # Inventory sinh tự động từ source
```

## 5. Hợp đồng kiến trúc bắt buộc

Luồng đọc public:

```text
App Router page/layout
  -> src/services public facade
  -> src/server/services
  -> repository
  -> Drizzle/PostgreSQL
  -> mapper
  -> stable DTO
```

Luồng mutation:

```text
Client Component
  -> Server Action
  -> application service
  -> authorization + validation
  -> repository transaction
  -> audit log
  -> revalidatePath
```

Luồng HTTP:

```text
Browser/provider
  -> Route Handler
  -> request/security validation
  -> application service
  -> repository/provider
```

Quy tắc:

- Component/page không import repository, database client hoặc secret provider.
- Server Action không chứa truy vấn Drizzle và không tin quyền do client gửi.
- Service kiểm tra permission trước mutation hoặc private read.
- Repository không quyết định UX và không trả object provider ra FE.
- DTO trong `src/types` là hợp đồng với UI.
- Public service facade được giữ để không làm FE phụ thuộc trực tiếp vào hạ tầng.
- File có secret hoặc database phải dùng `server-only`.
- Mọi mutation ảnh hưởng public data phải revalidate các route liên quan.

## 6. Frontend public

### 6.1. Shell, layout và theme

- `src/app/layout.tsx` lấy Site Settings và social links ở server.
- `Header`, `Footer`, desktop navigation, mobile menu và social dialog dùng chung.
- Theme hỗ trợ `light`, `dark`, `system`.
- Theme có layout `creator|minimal|magazine`, card style, button style, ba màu chủ đạo và border radius.
- Script khởi tạo theme chạy trước hydrate để giảm flash sai theme.
- `RouteChrome` kiểm soát chrome theo route.
- `AnalyticsProvider` được đặt ở root và chỉ thu thập sau consent.

### 6.2. Trang chủ

Route `/` tổng hợp:

- Hero và thông tin creator.
- Social links.
- Featured post.
- Latest posts.
- Latest videos.
- Gallery preview/lightbox.
- Upcoming events.
- Active featured campaign.
- Newsletter.
- Collaboration CTA.

Mỗi section được bật/tắt bằng `site_settings.homepage_sections`, fallback sang `siteConfig` khi dùng mock.

### 6.3. Blog

Routes:

- `/blog`: featured post, tìm theo title/excerpt, lọc category/tag và tải thêm.
- `/blog/[slug]`: cover, metadata, content blocks, related posts, share buttons và analytics view.

Content block được hỗ trợ:

- heading cấp 2/3
- paragraph
- image + alt/caption
- quote
- ordered/unordered list
- code
- video
- CTA
- divider

Chỉ post `published`, chưa bị soft-delete và có `publishedAt <= now` được public. Slug là duy nhất không phân biệt hoa thường.

### 6.4. Video

Route `/videos` có featured video, lọc platform/topic và hỗ trợ orientation landscape/portrait.

Hai nguồn video:

- External: YouTube, TikTok, Instagram, Facebook và URL HTTP(S).
- Internal: upload trực tiếp lên Mux, xử lý webhook, playback ID, poster và HLS stream.

Video không tự phát; playback chỉ khởi tạo sau tương tác của người dùng.

### 6.5. Gallery

Route `/gallery` có:

- lọc category
- responsive grid
- lightbox
- previous/next/close
- keyboard navigation
- title, caption và alt

Gallery item luôn trỏ tới public image `ready` trong Media Library.

### 6.6. Events

Routes:

- `/events`: lọc theo type/status.
- `/events/[slug]`: banner, thời gian, timezone, location/platform, schedule, external link và share.

Event type: `livestream`, `premiere`, `fan-meeting`, `giveaway`, `workshop`, `offline`, `launch`.

Event status: `upcoming`, `live`, `ended`, `cancelled`; content status độc lập gồm `draft`, `scheduled`, `published`, `archived`.

### 6.7. Campaigns

Routes:

- `/campaigns`: nhóm campaign theo trạng thái hiệu lực.
- `/campaigns/[slug]`: banner, countdown, rules, terms, CTA và form tham gia.

Trạng thái hiệu lực được tính theo `startAt/endAt`; `draft` không public. Form chỉ mở khi campaign active, `submissionEnabled=true` và chưa đạt `submissionLimit`.

### 6.8. Contact, newsletter và trang khác

- `/contact`: form hợp tác có validation, Turnstile và rate limit.
- `/newsletter/unsubscribe?token=...`: hủy đăng ký bằng token hash.
- `/about`: profile, social links và tracked links.
- `/privacy`, `/terms`: legal document component.
- `not-found.tsx`: trang 404 tùy chỉnh.

Contact attachment hiện chưa đi vào server contract; không được mô tả là upload hoàn chỉnh.

### 6.9. SEO và accessibility

- Metadata mặc định và metadata động cho post/event/campaign.
- Canonical URL, Open Graph, Twitter card.
- `/sitemap.xml` lấy public posts/events/campaigns.
- `/robots.txt`.
- Admin/auth có `noindex`.
- Semantic landmarks, skip link, label/error form, dialog title, alt, focus state và reduced motion.

## 7. Admin CMS

### 7.1. Routes

| Route | Chức năng | Permission đầu vào |
| --- | --- | --- |
| `/admin/login` | Đăng nhập Supabase | Public, có rate limit |
| `/admin` | Analytics dashboard | `dashboard:view`; dữ liệu cần `analytics:view` |
| `/admin/posts` | Posts, categories, tags | `content:view` |
| `/admin/social-links` | Social links | `settings:manage` |
| `/admin/videos` | External/Mux videos | `media:manage` |
| `/admin/gallery` | Gallery và Media Library | `media:manage` |
| `/admin/events` | Events | `content:view` |
| `/admin/campaigns` | Campaigns | `content:view` |
| `/admin/submissions` | Contact/newsletter/campaign inbox | `submissions:view` |
| `/admin/appearance` | Theme và homepage sections | `settings:manage` |
| `/admin/settings` | Site identity, media, SEO | `settings:manage` |

Protected layout yêu cầu `dashboard:view`; từng page tiếp tục kiểm tra permission chuyên biệt.

### 7.2. Khả năng quản trị

- Search/filter/table pagination.
- Create/update/archive/publish/featured.
- Category/tag CRUD.
- Social link CRUD, enable/disable và sort order.
- R2 Media Library, upload, picker và xóa có kiểm tra đang được sử dụng.
- Mux direct upload và external video.
- Submission status workflow và CSV export tối đa 5.000 dòng.
- Analytics date range, metrics, breakdown và recent events.
- Site Settings/Appearance ghi PostgreSQL thật.

Client chỉ dùng `canWrite/canPublish/canManage` để ẩn/vô hiệu UI; service vẫn kiểm tra lại permission.

## 8. Authentication và authorization

### 8.1. Authentication

- Supabase email/password.
- `src/proxy.ts` làm mới session cookie qua Supabase SSR.
- `/auth/callback` exchange code, sync profile và redirect tới admin path an toàn.
- Login giới hạn 10 lần/15 phút theo request fingerprint.
- Account `disabled` bị sign out/từ chối.
- `predev` và `prestart` chạy bootstrap script; script chỉ tạo super admin khi được bật và Auth chưa có user.

### 8.2. Roles

- `super_admin`
- `admin`
- `editor`
- `viewer`

### 8.3. Permission matrix

| Permission | super_admin | admin | editor | viewer |
| --- | --- | --- | --- | --- |
| `dashboard:view` | Có | Có | Có | Có |
| `content:view` | Có | Có | Có | Không |
| `content:write` | Có | Có | Có | Không |
| `content:publish` | Có | Có | Không | Không |
| `media:manage` | Có | Có | Có | Không |
| `submissions:view/manage/export` | Có | Có | Không | Không |
| `analytics:view` | Có | Có | Không | Có |
| `settings:manage` | Có | Có | Không | Không |
| `users:manage` | Có | Không | Không | Không |
| `audit:view` | Có | Có | Không | Không |

User-management và audit-log UI chưa có dù permission/schema đã tồn tại.

## 9. Data source và caching

`USE_DATABASE_CONTENT`:

- `false` hoặc không đặt: public read dùng fixture trong `src/data`.
- `true`: public read dùng PostgreSQL.
- Giá trị khác: fail fast.

Admin mutation/private read luôn dùng database. Production phải đặt `USE_DATABASE_CONTENT=true`.

Không silently fallback sang mock khi database mode lỗi. Server Actions dùng `revalidatePath` cho route bị ảnh hưởng. API/admin/auth đặt `Cache-Control: private, no-store`.

## 10. Database

### 10.1. Bảng

| Domain | Bảng |
| --- | --- |
| Auth | `profiles` |
| Content | `categories`, `tags`, `posts`, `post_tags` |
| Media/video | `media_assets`, `videos`, `video_webhook_events`, `gallery_items` |
| Site | `site_settings`, `social_links` |
| Activity | `events`, `campaigns` |
| Forms | `contact_submissions`, `newsletter_subscriptions`, `campaign_submissions` |
| Analytics | `analytics_events`, `daily_analytics` |
| Audit | `audit_logs` |

Tất cả bảng application bật RLS. Migration nằm trong `src/server/database/migrations`; migration production hardening hiện tại là `0009_stage21-production-hardening.sql`.

### 10.2. Quy tắc dữ liệu quan trọng

- UUID primary key; timestamp có timezone.
- Slug category/tag/post/event/campaign là unique case-insensitive.
- Content dùng soft delete/archived khi phù hợp.
- Post published cần `publishedAt`; scheduled cần `scheduledAt`.
- Event/campaign end phải sau start.
- Campaign email unique theo campaign.
- Newsletter email và unsubscribe token hash unique.
- Mux upload/asset/playback IDs unique khi có giá trị.
- Audit log ghi actor/action/entity và before/after cho mutation quan trọng.

### 10.3. Migration và seed

- Runtime: `DATABASE_URL`.
- Migration: `DIRECT_DATABASE_URL`; có fallback command dùng runtime pooler.
- Seed idempotent theo deterministic key/slug và cần active `super_admin` làm author.
- Không dùng schema push ở production.

## 11. Media và video providers

### 11.1. R2 image flow

```text
Admin chọn file
-> createMediaUploadAction
-> service kiểm tra quyền/MIME/size/extension
-> sinh object key + presigned PUT + signed upload ticket 5 phút
-> browser PUT thẳng R2
-> confirmMediaUploadAction
-> kiểm tra ticket owner, HEAD metadata, size, MIME và magic signature
-> ghi media_assets ready
```

Cho phép JPEG, PNG, WebP, AVIF; ảnh tối đa 10 MB, avatar tối đa 5 MB. Xóa asset chỉ khi provider R2, status ready và không còn tham chiếu; nếu xóa object thất bại thì DB được restore.

### 11.2. Mux flow

```text
Admin yêu cầu direct upload
-> service tạo video row + Mux upload URL
-> browser upload thẳng Mux
-> Mux POST webhook raw body
-> verify signature
-> idempotency bằng video_webhook_events
-> cập nhật processing status / playback data
```

Cho phép MP4/M4V, MOV, WebM, MKV; tối đa 5 GB. Webhook xử lý created, ready, errored, deleted và trạng thái upload liên quan.

## 12. Forms, email và anti-abuse

### Contact

- Họ tên 2–120.
- Email được trim/lowercase.
- Số Việt Nam tùy chọn.
- Collaboration type nằm trong allowlist.
- Message 20–2.000.
- Rate limit 5/15 phút.
- Lưu DB trước, ghi analytics conversion, sau đó gửi email notification.
- Email lỗi không rollback submission.

### Newsletter

- Rate limit 5/giờ.
- Upsert theo normalized email.
- Token unsubscribe random 32 bytes; DB chỉ lưu SHA-256 hash.
- Gửi confirmation nếu status không phải `suppressed`.

### Campaign submission

- Phone bắt buộc.
- Platform: YouTube/TikTok/Instagram/Facebook.
- Rate limit 5/giờ theo campaign.
- Transaction/advisory lock bảo vệ limit và duplicate.
- Duplicate email trong cùng campaign trả kết quả `created=false`.

### Production behavior

- Turnstile xác minh success, action và hostname.
- Upstash là bắt buộc ở production; thiếu cấu hình sẽ fail closed.
- Development có in-memory rate limiter.

## 13. Analytics

Event allowlist:

- `page_view`
- `post_view`
- `video_view`
- `social_click`
- `campaign_view`
- `campaign_click`
- `campaign_submit`
- `contact_submit`
- `newsletter_submit`

Client event chỉ gửi sau consent. Endpoint `/api/analytics/events`:

- chỉ nhận POST
- JSON tối đa 4 KB
- kiểm tra same-origin
- validate allowlist/payload
- rate limit
- không lưu PII/form content/full IP

Anonymous session là UUID trong `sessionStorage`; server lưu SHA-256 hash. Dashboard dùng `daily_analytics` cho aggregate và raw events có retention mặc định 90 ngày.

## 14. Route Handlers

| Method/route | Mục đích |
| --- | --- |
| `GET /auth/callback` | Supabase OAuth/code exchange và profile sync |
| `POST /api/analytics/events` | Client analytics ingest |
| `POST /api/uploads/video-url` | Cấp Mux direct upload URL |
| `POST /api/webhooks/mux` | Mux signed webhook |
| `GET /api/admin/submissions/export` | CSV export có permission |

## 15. Environment variables

### App/public

- `NEXT_PUBLIC_SITE_URL`: canonical origin.
- `USE_DATABASE_CONTENT`: mock/database switch.
- `NEXT_PUBLIC_ANALYTICS_ENABLED`: bật/tắt analytics collection.

### Database/Auth

- `DATABASE_URL`
- `DATABASE_POOL_MAX`
- `DIRECT_DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- legacy: `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- bootstrap: `BOOTSTRAP_ADMIN_ENABLED`, `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_DISPLAY_NAME`, `BOOTSTRAP_ADMIN_PASSWORD`

### R2

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL`
- `MEDIA_ORPHAN_MIN_AGE_HOURS`

### Mux

- `MUX_TOKEN_ID`
- `MUX_TOKEN_SECRET`
- `MUX_WEBHOOK_SECRET`

### Forms

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CONTACT_NOTIFICATION_EMAIL`

Chỉ biến có prefix `NEXT_PUBLIC_` được phép vào client bundle. Không log hoặc commit giá trị secret.

## 16. Security

- CSP: chặn object, base khác self, framing và form action ngoài self.
- `X-Frame-Options: DENY`, nosniff, strict referrer và restrictive Permissions Policy.
- HSTS ở production.
- Admin/auth/API no-store; admin/auth noindex.
- Safe redirect chỉ nhận path bắt đầu `/admin`, chặn `//`, backslash và login loop.
- Zod validate ở server boundary.
- R2 kiểm tra extension, MIME, size, metadata và magic bytes.
- Mux verify raw-body signature và event idempotency.
- CSV escape công thức để giảm spreadsheet injection.
- Không tin permission hoặc status gửi từ client.
- RLS là lớp phòng thủ database bổ sung, không thay authorization trong service.

## 17. Commands

### Development và quality

```bash
npm install
npm run ai:setup
npm run dev
npm run lint
npm run type-check
npm run test
npm run build
```

### AI/source map

```bash
npm run ai:setup
npm run ai:check
```

### Database/Auth

```bash
npm run db:check
npm run db:generate
npm run db:migrate
npm run db:migrate:pooled
npm run db:seed -- --validate-only
npm run db:seed
npm run auth:bootstrap
```

### Focused tests/operations

```bash
npm run test:security
npm run test:database
npm run auth:test
npm run auth:test:rls
npm run content:test
npm run content:test:authorization
npm run content:test:service
npm run storage:test
npm run storage:test:database
npm run storage:test:security
npm run video:test
npm run submissions:test:database
npm run submissions:test:security
npm run analytics:test
npm run storage:orphans
npm run analytics:retention
```

`storage:orphans:delete` là lệnh destructive; chỉ chạy sau khi xem audit.

## 18. Quy trình phát triển

Trước khi sửa:

1. Chạy `npm run ai:start` để sinh map từ worktree mới nhất và nhận trình tự đọc.
2. Đọc tài liệu feature liên quan và đối chiếu yêu cầu mới với contract đang được mô tả.
3. Tra route/component/export/schema/reverse dependency trong `docs/ai-map`.
4. Kiểm tra `git status` và bảo toàn thay đổi không liên quan.
5. Đọc guide Next.js 16.2.10 cục bộ liên quan.
6. Xác nhận chưa có component/service/type/validator giải quyết cùng vấn đề.

Khi sửa:

1. Giữ layer boundary.
2. Giữ DTO hoặc cập nhật toàn bộ consumer.
3. Thêm authorization/validation tại server boundary.
4. Cập nhật revalidation và audit nếu là mutation.
5. Cập nhật feature doc ngay trong cùng thay đổi khi hành vi/cách dùng/source ownership thay đổi.
6. Nếu là feature mới, tạo file riêng trong `docs/features`, thêm vào mục lục và bổ sung feature ownership cho generator.
7. Cập nhật `PROJECT_SPEC.md` nếu thay đổi route, kiến trúc, schema, permission, environment, security, integration hoặc product contract.

Trước khi hoàn tất:

1. Chạy `npm run ai:setup` sau lần sửa source/config cuối cùng.
2. Chạy `npm run ai:check`.
3. Chạy lint, type-check và test phù hợp.
4. Kiểm tra `git diff` đã có feature doc/PROJECT_SPEC cần thiết và generated map tương ứng.
5. Kiểm tra không có secret, thay đổi ngoài phạm vi hoặc abstraction trùng.

Đây là hợp đồng đồng bộ bắt buộc: source, curated documentation và generated AI map phải cùng mô tả một trạng thái hệ thống trước khi bàn giao.

## 19. Known limitations và documentation debt

- Public data mặc định vẫn là mock khi chưa bật `USE_DATABASE_CONTENT`; production phải bật database mode.
- Contact attachment chưa được upload/lưu trong submission flow.
- Chưa có Admin UI quản lý users và audit logs.
- Trạng thái `scheduled` chưa có scheduler chuyển tự động thành `published`; public repository chỉ đọc status `published`.
- Legal text và dữ liệu/hình ảnh mẫu cần review/thay thế trước phát hành chính thức.
- Chưa có Dockerfile production.
- Backup/PITR, monitoring/alerting và scheduler retention là cấu hình hạ tầng ngoài repository.
- Một số copy cũ trong `README.md`/`homepage.config.ts` vẫn nhắc “demo/không lưu”, nhưng implementation forms/settings hiện ghi Backend thật.
- Test hiện chủ yếu là script integration/security; chưa có bộ browser E2E/accessibility hoàn chỉnh.

## 20. Definition of Done

Một thay đổi được xem là hoàn tất khi:

- Đúng yêu cầu nghiệp vụ và không phá responsive/accessibility.
- Không tạo component/service/type trùng với inventory hiện có.
- Server/client boundary đúng với Next.js 16.
- Mutation có validation, authorization, typed error và revalidation phù hợp.
- Database change có migration, index/constraint/RLS và rollback plan hợp lý.
- Provider boundary không làm lộ secret.
- Feature doc và generated AI map đã cập nhật.
- `npm run ai:check`, lint, type-check và focused tests pass.
- Không commit `.env.local`, token, password, connection string hoặc PII.
