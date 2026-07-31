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
- Ant Design 6 và `@ant-design/nextjs-registry` cho Admin; toàn bộ trường ngày/giờ admin dùng DatePicker/RangePicker với Day.js và locale Việt Nam thay cho input ngày native của trình duyệt.
- Modal form Admin dùng `AdminModal`: giới hạn theo viewport, khóa cuộn trang nền, giữ header/footer và cho body cuộn độc lập; hộp xác nhận Ant Design tuân theo cùng nguyên tắc overflow.
- Radix Dialog, Lucide icons; dialog public giới hạn theo viewport và tự cuộn nội dung thay vì kéo trang nền.
- Mux Player React cho video nội bộ.
- uPlot cho biểu đồ analytics.
- NProgress `0.2` cho phản hồi chuyển route và request client kéo dài; `loading.tsx`/Suspense cung cấp skeleton theo segment.

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
- `DATABASE_POOL_MAX` mặc định 2 ở production và 5 ở development; range hợp lệ 1–10.
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
- `NavigationProgressProvider` theo dõi link nội bộ/history và kết thúc thanh progress khi pathname/search mới được commit; helper dùng chung bao quanh upload/API client có thời gian chờ đáng kể.
- `src/app/loading.tsx` là fallback public dùng chung; admin protected có skeleton riêng để giữ shared shell trong lúc route stream.
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
| `/admin/gallery` | Workspace Hình ảnh với tab Gallery công khai và Thư viện ảnh | `media:manage` |
| `/admin/events` | Events | `content:view` |
| `/admin/campaigns` | Campaigns | `content:view` |
| `/admin/submissions` | Contact/newsletter/campaign inbox | `submissions:view` |
| `/admin/appearance` | Theme và homepage sections | `settings:manage` |
| `/admin/settings` | Site identity, media, SEO | `settings:manage` |

Protected layout yêu cầu `dashboard:view`; từng page tiếp tục kiểm tra permission chuyên biệt.

`/admin/posts` dùng `admin-posts-page.service.ts`: kiểm tra `content:view` một lần, đọc trang post đầu tiên bằng `COUNT + items`, rồi đọc categories, tags và media tuần tự để không làm nghẽn pool serverless. Workspace Hình ảnh chỉ tải dữ liệu của tab đang hoạt động; tab Gallery tải trang Gallery, lookup category bounded và media picker tuần tự, còn tab Thư viện ảnh chỉ tải trang media tương ứng. Video/Event/Campaign tải trang chính trước rồi mới tải media picker; không chạy lookup phụ song song với một paged query vốn đã dùng hai connection trong giới hạn pool production mặc định 2.

### 7.2. Khả năng quản trị

- Mọi Admin table dùng cấu hình pagination chung: mặc định 10 dòng, cho chọn 10/20/50, luôn hiển thị tổng bản ghi; cụm số dòng + tổng bám trái và nút chuyển trang bám phải. Danh sách tăng trưởng truyền `page/pageSize/sortBy/sortOrder` xuyên suốt Route Handler → service → repository và trả `{ items, total, page, pageSize, sortBy, sortOrder }`; repository áp dụng filter trước `COUNT + LIMIT + OFFSET + ORDER BY`, `pageSize` tối đa 100 và `sortBy` là allowlist có tie-breaker ổn định.
- `npm run table:audit`, `npm run api:list-audit` và completion gate `npm run ai:check` ngăn Table mới thiếu pagination hoặc GET collection mới bỏ qua contract phân trang/sắp xếp.
- Admin table dùng header và vùng pagination tím nhạt theo màu nhận diện `Admin MVP`; pagination active dùng tím đậm có độ tương phản rõ và vùng pagination bám sát hàng cuối, không tạo khoảng trắng bên trong khung.
- Bảng bài viết có STT dạng số thường, liên tục qua pagination. Trên desktop, search và trạng thái nằm cùng một hàng trong cụm bên trái của toolbar nền trong suốt, còn toggle **Hiện bài đã lưu trữ** nằm bên phải; bài `archived` bị ẩn mặc định và chỉ xuất hiện khi bật toggle.
- Create/update/archive/publish/featured.
- Post editor mặc định dùng trình soạn thảo trực quan cho 9 loại content block, hỗ trợ thêm/xóa/nhân bản/đổi thứ tự và trường tiếng Việt theo từng loại. Chế độ JSON nâng cao hiển thị dữ liệu parser tạo ra, cho phép developer sửa và chỉ đồng bộ ngược sau khi schema dùng chung kiểm tra hợp lệ.
- Category/tag CRUD dùng modal table rộng; UI quản lý đọc lười qua API phân trang thay vì nhúng toàn bộ danh sách vào popup. Mặc định người dùng chọn 10, 20 hoặc 50 dòng mỗi trang; footer tách thành cụm bộ chọn số dòng + tổng bản ghi bám trái và cụm nút chuyển trang bám phải; component cho phép truyền mảng lựa chọn khác và server giới hạn `pageSize` tối đa 100.
- Social link CRUD, enable/disable và sort order; danh sách Admin có search, lọc platform, sort Followers phía server và vùng row cuộn nội bộ để giữ toàn màn hình trong viewport. Modal social link rộng 760px trên desktop; ghi chú trường dùng typography nhỏ, ô subscriber lấp đầy cột và trạng thái/thời điểm đồng bộ YouTube nằm cùng một hàng với khoảng cách dưới rõ ràng. TikTok có thêm trường tổng lượt thích nhưng hiện dùng dữ liệu nhập thủ công; nút kết nối OAuth tạm ẩn. Mô tả cho phép tối đa 5.000 ký tự.
- Social link YouTube được xác minh và lấy subscriber count ngay trước lần tạo/đổi URL; request provider lỗi không được ghi bản ghi pending. Cron mỗi ngày một lần chỉ làm mới YouTube. Mã OAuth/token TikTok được giữ làm nền cho giai đoạn production sau này nhưng route kết nối, callback và job TikTok đều bị chặn khi cờ tính năng tắt.
- Workspace Hình ảnh đặt tab và nội dung đang mở trong một panel chung, tách Gallery công khai và Thư viện ảnh thành hai tab riêng. Workspace nằm gọn trong viewport dưới Admin header và giữ padding quanh nội dung: Gallery chỉ cuộn body row của table và dùng chiều cao body cố định `70vh`; Media Library cuộn vùng lưới/chi tiết và tích lũy từng batch khi gần đáy, dừng khi đạt `total`, không hiển thị pagination UI. Modal tạo Gallery hỗ trợ chọn/tải nhiều ảnh, title/alt riêng cho từng ảnh và tạo tuần tự nhiều Gallery item; modal sửa vẫn chọn một ảnh. Search/filter/sort Media Library reset về batch đầu và vẫn chạy phía server trên toàn bộ dữ liệu. Bảng Gallery có cột category, search và filter category phía server; danh sách category distinct được giới hạn 100 giá trị. Bảng Gallery và API Media Library đều phân trang tại database bằng `COUNT + LIMIT + OFFSET + ORDER BY`; client không tải collection không giới hạn trong một request.
- R2 Media Library, upload, picker và xóa có kiểm tra đang được sử dụng. Màn hình Media Library cho phép tạo một batch nhiều ảnh với purpose dùng chung và alt riêng cho từng preview; presign và direct PUT R2 chỉ bắt đầu khi người dùng xác nhận, sau đó client tải tuần tự từng ảnh và giữ ảnh lỗi trong hàng chờ để thử lại. Tab Thư viện ảnh chia hai panel 50/50 trên desktop: Upload ở trái, toolbar/lưới media ở phải; preview nằm trong panel Upload và hai panel xếp dọc dưới 1.200 px. Mọi `AdminMediaPicker` cho thumbnail, cover, banner, avatar và Gallery đều cho phép chọn asset có sẵn hoặc tải ảnh từ máy. Nhánh tải từ máy của picker ở cả chế độ single/multiple chỉ validate và tạo Object URL preview cục bộ, cho nhập alt và bỏ ảnh; presign/direct PUT chỉ bắt đầu sau nút xác nhận. Preview của picker dùng chung card CSS, toolbar và vùng cuộn giới hạn chiều cao với Media Library để không phủ modal. Ảnh tải mới dùng đúng purpose, được confirm vào Media Library rồi tự động chọn vào form hiện tại.
- Mux direct upload và external video.
- Submission status workflow và CSV export tối đa 5.000 dòng.
- Analytics date range, metrics và breakdown tổng hợp trên trang Tổng quan.
- Date/time UX thống nhất bằng `AdminDateTimePicker` và `AdminDateRangePicker`: định dạng `DD/MM/YYYY`, lịch tiếng Việt, chọn giờ theo bước 5 phút và giá trị server tiếp tục là ISO.
- Modal/popup dài không vượt viewport: form Admin có chiều cao tối đa `80dvh`, wrapper không cuộn, body cuộn độc lập và scroll không truyền sang trang nền.
- Site Settings/Appearance ghi PostgreSQL thật.

Client chỉ dùng `canWrite/canPublish/canManage` để ẩn/vô hiệu UI; service vẫn kiểm tra lại permission.

Admin desktop giữ sidebar cố định theo viewport và content chừa chiều rộng tương ứng; sidebar có vùng cuộn riêng. Toàn bộ route admin có nền sáng độc lập với public theme, chart/card bị giới hạn overflow nên dashboard dài hoặc resize không làm lộ nền dark hay phá layout.

Breadcrumb route nằm trong header Admin để content bắt đầu trực tiếp bằng nội dung
chính. Ant Design Tabs dùng style Admin toàn cục với vạch dọc phân cách; hover dùng
nền tím rất nhạt, active dùng toàn bộ nền tím nhạt và không có border tím; các màn
hình không lặp lại CSS tab riêng.

## 8. Authentication và authorization

### 8.1. Authentication

- Supabase email/password.
- `src/proxy.ts` làm mới session cookie qua Supabase SSR.
- `/auth/callback` exchange code, sync profile và redirect tới admin path an toàn.
- Login giới hạn 10 lần/15 phút theo request fingerprint.
- Nút đăng xuất trong header Admin yêu cầu xác nhận; hủy hộp thoại giữ nguyên phiên và chỉ xác nhận mới gọi logout action.
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
| Site | `site_settings`, `social_links`, `social_oauth_connections` |
| Activity | `events`, `campaigns` |
| Forms | `contact_submissions`, `newsletter_subscriptions`, `campaign_submissions` |
| Analytics | `analytics_events`, `daily_analytics` |
| Audit | `audit_logs` |

Tất cả bảng application bật RLS. Migration nằm trong `src/server/database/migrations`; `0010_hot_gravity.sql` bổ sung index phục vụ phân trang/order Admin cho post/video/taxonomy/Gallery/social link, kế tiếp migration production hardening `0009_stage21-production-hardening.sql`.

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
-> picker thêm asset vào danh sách cục bộ và tự động chọn vào form đang mở
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

Anonymous session là UUID trong `sessionStorage`; server lưu SHA-256 hash. Dashboard chỉ dùng dữ liệu tổng hợp cho totals, trend và breakdown; không hiển thị danh sách raw event. Raw events có retention mặc định 90 ngày.

## 14. Route Handlers

| Method/route | Mục đích |
| --- | --- |
| `GET /auth/callback` | Supabase OAuth/code exchange và profile sync |
| `POST /api/analytics/events` | Client analytics ingest |
| `POST /api/uploads/video-url` | Cấp Mux direct upload URL |
| `POST /api/webhooks/mux` | Mux signed webhook |
| `GET /api/admin/submissions/export` | CSV export có permission |
| `GET /api/admin/posts` | Trang bài viết có search/status/archive/order, yêu cầu `content:view` |
| `GET /api/admin/videos` | Trang video có search/status/order, yêu cầu `media:manage` |
| `GET /api/admin/gallery` | Trang Gallery có order, yêu cầu `media:manage` |
| `GET /api/admin/media` | Trang Media Library có search/filter/order, yêu cầu `media:manage` |
| `GET /api/admin/events` | Trang sự kiện có order, yêu cầu `content:view` |
| `GET /api/admin/campaigns` | Trang chiến dịch có order, yêu cầu `content:view` |
| `GET /api/admin/social-links` | Trang social links có search/order, yêu cầu `settings:manage` |
| `GET /api/cron/social-audience-sync` | Đồng bộ YouTube subscriber; Bearer `CRON_SECRET`, không dùng Admin session |
| `GET /api/auth/tiktok/start` | Route dự phòng đang tắt; redirect về Admin với trạng thái `tiktok=disabled` |
| `GET /api/auth/tiktok/callback` | Route dự phòng đang tắt; không đổi code hoặc ghi token TikTok |
| `GET /api/admin/taxonomies` | Trang category/tag có order, yêu cầu `content:view` |

Mọi GET collection ở trên dùng `Cache-Control: private, no-store` và cùng hợp đồng `page/pageSize/sortBy/sortOrder`. CSV export là ngoại lệ có chủ đích, giới hạn tối đa 5.000 dòng và không dùng response JSON phân trang.

## 15. Environment variables

### App/public

- `NEXT_PUBLIC_SITE_URL`: canonical origin.
- `USE_DATABASE_CONTENT`: `false` dùng mock, `true` dùng PostgreSQL; production bắt buộc `true`.
- `NEXT_PUBLIC_ANALYTICS_ENABLED`: `true` bật consent/collection, `false` tắt cả client và server analytics. Không khai báo hiện tương đương `true`; nên đặt rõ ràng theo environment.
- `YOUTUBE_DATA_API_KEY`: server-only key dùng đọc channel statistics từ YouTube Data API.
- `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REDIRECT_URI`, `SOCIAL_OAUTH_ENCRYPTION_KEY`: cấu hình dự phòng cho TikTok OAuth; hiện không bắt buộc vì tự động hóa TikTok đang tắt.
- `CRON_SECRET`: server-only Bearer secret bảo vệ cron social audience.

### Database/Auth

- `DATABASE_URL`
- `DATABASE_POOL_MAX`
- `DIRECT_DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- legacy: `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- bootstrap: `BOOTSTRAP_ADMIN_ENABLED`, `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_DISPLAY_NAME`, `BOOTSTRAP_ADMIN_PASSWORD`

`BOOTSTRAP_ADMIN_ENABLED` chỉ nên là `true` trong lần tạo Admin đầu tiên trên Supabase Auth trống; sau đó luôn trả về `false`.

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
- OAuth TikTok đang bị chặn bằng cờ tính năng dùng chung. Phần nền được giữ cho giai đoạn sau: state cookie HttpOnly/SameSite=Lax, so khớp constant-time và token AES-256-GCM không xuất qua DTO/Data API.
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
- YouTube subscriber được đồng bộ một lần/ngày lúc 00:00 UTC qua Vercel Cron, tương thích giới hạn lịch hằng ngày của Vercel Hobby.
- TikTok tự động đang tạm tắt; follower/tổng lượt thích TikTok cùng Facebook/Instagram/X/Threads/Zalo vẫn dùng số công khai nhập thủ công cho đến giai đoạn tích hợp production.
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
