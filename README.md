# Quang Official — Creator Blog & Social Hub

Quang Official là website cá nhân dành cho content creator, tập trung vào bài viết, video, hình ảnh, sự kiện và chiến dịch cộng đồng. Dự án gồm website public, Admin CMS, PostgreSQL/Drizzle, Supabase Authentication/RBAC, R2 media, Mux video, form/email và analytics nội bộ.

## Bắt đầu cho thành viên mới và AI

```bash
npm run ai:start
```

Sau đó đọc `PROJECT_SPEC.md`, `docs/ai-map/SYSTEM_MAP.md` và tài liệu domain tương ứng trong `docs/features/`. Lệnh start quét lại source để lập inventory route, component, Server Action, service, repository, schema, environment và reverse dependencies, rồi in checklist mở đầu phiên. Dùng `npm run ai:check` trong CI để phát hiện map đã cũ.

Prompt mẫu cho AI không tự đọc `AGENTS.md` nằm trong `AI_START_HERE.md`. Trên PowerShell bị chặn `npm.ps1`, dùng `npm.cmd run ai:start`.

## Giao diện

Phần public sử dụng phong cách creator hiện đại, hỗ trợ light/dark/system theme, card nội dung giàu hình ảnh và bố cục responsive. Phần admin có sidebar, bảng dữ liệu Ant Design, CRUD có kiểm tra quyền và trình chỉnh giao diện với preview riêng. Ảnh minh họa fallback được đặt trong `public/images/creator/`.

## Tính năng

### Website public

- Trang chủ tổng hợp hero, social links, bài viết, video, gallery, sự kiện, chiến dịch, newsletter và CTA hợp tác.
- Blog có bài nổi bật, tìm kiếm theo tiêu đề/mô tả, lọc category/tag, xem thêm và trang chi tiết có metadata riêng.
- Video có lọc platform/chủ đề, phân biệt landscape/portrait và chỉ mở video ngoài khi người dùng chọn.
- Gallery có lọc category, lightbox, caption, previous/next/close và điều hướng bằng bàn phím.
- Events và Campaigns có danh sách theo trạng thái, trang chi tiết, metadata và xử lý slug không tồn tại.
- Campaign có countdown an toàn với hydration và form đăng ký thật có validation server, Turnstile và rate limit.
- About, Contact, Privacy, Terms và trang 404 tùy biến.
- SEO cơ bản gồm metadata, canonical URL, Open Graph, Twitter card, sitemap và robots.
- Accessibility cơ bản gồm semantic HTML, label form, focus state, skip link, dialog title, alt text và reduced motion.

### Admin Dashboard

- Dashboard thống kê nội bộ theo khoảng ngày và dữ liệu aggregate phía server.
- Bảng quản lý Posts, Social Links, Videos, Gallery, Events và Campaigns.
- Search, filter, thêm, sửa, archive/publish, featured và enable/disable ghi PostgreSQL qua service/repository có RBAC.
- Appearance Editor có theme, màu sắc, kiểu card/button/layout, bật tắt section và preview.
- Settings form chỉ mô phỏng thao tác lưu.

> **Cảnh báo:** `/admin` là CMS có Authentication/RBAC thật, nhưng vẫn cần hoàn tất cấu hình provider, backup, monitoring, legal/privacy review và kiểm thử trình duyệt trước khi được xem là production-ready.

## Route

Public:

- `/`
- `/blog` và `/blog/[slug]`
- `/videos`
- `/gallery`
- `/events` và `/events/[slug]`
- `/campaigns` và `/campaigns/[slug]`
- `/about`
- `/contact`
- `/privacy`
- `/terms`

Admin demo:

- `/admin`
- `/admin/posts`
- `/admin/social-links`
- `/admin/videos`
- `/admin/gallery`
- `/admin/events`
- `/admin/campaigns`
- `/admin/appearance`
- `/admin/settings`

## Công nghệ

- Next.js 16 App Router
- React 19
- TypeScript strict mode
- Tailwind CSS 4 và CSS tùy biến
- Ant Design 6, chỉ dùng chủ yếu cho admin
- Radix UI Dialog
- Lucide React icons
- ESLint 9

## Yêu cầu môi trường

- Node.js `>= 20.9.0`
- npm và kết nối mạng khi cài dependency
- Kết nối mạng trong lần build nếu `next/font/google` cần tải font

## Cài đặt

```bash
git clone <repository-url>
cd personal-blog
npm install
```

Tạo file môi trường local từ file mẫu:

```bash
cp .env.example .env.local
```

Trên PowerShell có thể dùng:

```powershell
Copy-Item .env.example .env.local
```

## Chạy development

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Build và chạy production

```bash
npm run lint
npm run type-check
npm run test
npm run build
npm run start
```

## Cấu trúc thư mục

```text
src/
├── app/                 # App Router, route public/admin, metadata, sitemap, robots
├── components/          # Component common và theo từng khu vực nghiệp vụ
├── config/              # Cấu hình site, navigation, theme và admin
├── data/                # Dữ liệu mock cho nội dung
├── lib/                 # Analytics client và tiện ích nền tảng
├── services/            # Hàm truy vấn dữ liệu mock
├── types/               # TypeScript types dùng chung
└── utils/               # Formatter và helper
public/
└── images/creator/      # Ảnh avatar, cover và nội dung mẫu
```

## Tùy biến nội dung

### Tên website, mô tả, avatar và banner

Chỉnh `src/config/site.config.ts`:

- `siteName`, `siteDescription`, `creatorName`, `username`
- `avatar`, `coverImage`
- `contactEmail`
- `homepageSections`

Đặt ảnh mới trong `public/images/` rồi dùng đường dẫn bắt đầu bằng `/images/...`.

### Social links

Chỉnh `src/data/social-links.ts`. Footer, dialog social và các khu vực public cùng đọc từ nguồn dữ liệu này.

### Bài viết

Chỉnh `src/data/posts.ts`. Mỗi bài cần slug duy nhất, status phù hợp, thumbnail/cover hợp lệ và content blocks đúng type. Chỉ bài có status `published` xuất hiện trên public và sitemap.

### Video

Chỉnh `src/data/videos.ts`. Cập nhật platform, orientation, thumbnail, URL ngoài, ngày đăng và các số liệu tùy chọn.

### Gallery

Chỉnh `src/data/gallery.ts`. Mỗi ảnh nên có `alt` mô tả rõ, caption, category và kích thước để hạn chế layout shift.

### Events

Chỉnh `src/data/events.ts`. Giữ slug duy nhất, thời gian ISO hợp lệ, status, location/platform và URL ngoài nếu có.

### Campaigns

Chỉnh `src/data/campaigns.ts`. Campaign status `draft` không có route public và không xuất hiện trong sitemap.

### Màu và giao diện

- Giá trị theme mặc định: `src/config/theme.config.ts`
- CSS variables và responsive styles: `src/app/globals.css`
- Appearance Editor admin lưu preview demo vào localStorage; không ghi ngược vào source hoặc thay đổi cấu hình public trên server.

## Environment variables

| Biến | Trạng thái | Mục đích |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Cần đặt khi deploy | Origin canonical của website, dùng cho metadata, sitemap và robots. Ví dụ `https://example.com`. |
| `USE_DATABASE_CONTENT` | Mặc định `false` | Cầu nối migration cho server service mới: `false` đọc mock, `true` đọc PostgreSQL và không silently fallback khi query lỗi. |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | Không đặt hiện tương đương `true` | `true` bật consent/collection; `false` tắt toàn bộ client và server analytics. Nên dùng `false` cho local/preview để tránh dữ liệu nhiễu và chỉ bật production sau privacy/retention setup. |
| `NEXT_PUBLIC_GA_ID` | Dự phòng | Chưa tích hợp Google Analytics thật trong MVP. |
| `NEXT_PUBLIC_META_PIXEL_ID` | Dự phòng | Chưa tích hợp Meta Pixel thật trong MVP. |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | Dự phòng | Chưa tích hợp TikTok Pixel thật trong MVP. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Dự phòng | Chưa có upload hoặc Cloudinary integration. |
| `DATABASE_URL` | Bắt buộc cho Backend | Kết nối runtime PostgreSQL; ưu tiên Supavisor Transaction Pooler khi deploy serverless. |
| `DIRECT_DATABASE_URL` | Bắt buộc khi migrate | Kết nối Direct hoặc Supavisor Session Pooler cho Drizzle migration. |
| `NEXT_PUBLIC_SUPABASE_URL` | Bắt buộc cho Auth | URL Supabase project. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Ưu tiên | Publishable key cho Supabase Auth trên browser/server SSR. |
| `SUPABASE_SECRET_KEY` | Chỉ server | Secret key đặc quyền; tuyệt đối không thêm tiền tố `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Legacy fallback | Chỉ dùng nếu project cũ chưa có publishable key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Legacy fallback, chỉ server | Chỉ dùng nếu project cũ chưa có secret key; có thể bypass RLS. |
| `BOOTSTRAP_ADMIN_ENABLED` | Mặc định `false` | Khi là `true`, kiểm tra và tạo Admin đầu tiên trước `npm run dev`/`npm start` nếu Supabase Auth chưa có user nào. |
| `BOOTSTRAP_ADMIN_EMAIL` | Cần khi bật bootstrap | Email của Admin đầu tiên. |
| `BOOTSTRAP_ADMIN_DISPLAY_NAME` | Cần khi bật bootstrap | Tên hiển thị của Admin đầu tiên. |
| `BOOTSTRAP_ADMIN_PASSWORD` | Secret, chỉ server | Mật khẩu bootstrap, chỉ đặt trong `.env.local` hoặc secret manager. |

Không commit `.env.local` hoặc secret. Các biến bắt đầu bằng `NEXT_PUBLIC_` được đưa vào client bundle tại thời điểm build, vì vậy cần redeploy sau khi thay giá trị production.

### Biến Backend production

- `DATABASE_POOL_MAX=1` là mặc định an toàn cho mỗi instance serverless. `DATABASE_URL` nên là Supavisor Transaction Pooler; `DIRECT_DATABASE_URL` nên là Direct connection hoặc Supavisor Session Pooler.
- R2 cần `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_BASE_URL`. `MEDIA_ORPHAN_MIN_AGE_HOURS` mặc định là `24` để tránh xóa upload vừa cấp URL nhưng chưa confirm.
- Mux cần `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`, `MUX_WEBHOOK_SECRET`.
- Form thật cần `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_NOTIFICATION_EMAIL`.
- Chỉ `NEXT_PUBLIC_SUPABASE_URL`, publishable/anon key, `NEXT_PUBLIC_SITE_URL`, Turnstile site key và cờ analytics được phép có tiền tố `NEXT_PUBLIC_`. Không đặt secret Supabase, R2, Mux, Resend, Turnstile hoặc Upstash dưới tiền tố này.

## Thiết lập Backend production

Runbook đầy đủ theo thứ tự triển khai, template biến môi trường và checklist provider nằm tại [`docs/PRODUCTION_ENVIRONMENT_SETUP.md`](docs/PRODUCTION_ENVIRONMENT_SETUP.md).

### Supabase, migration và seed

1. Tạo Supabase project, lấy runtime pooler URL, migration URL, project URL và API keys. Bật email/password Auth và cấu hình Site URL/Redirect URL thành `https://your-domain.com/auth/callback`.
2. Sao chép `.env.example` sang `.env.local`, điền secret bằng dashboard/secret manager và chạy `npm run db:check`. Lệnh này chỉ báo database/user, không in connection string.
3. Chạy `npm run db:migrate`. Nếu máy không phân giải được hostname Direct IPv6 nhưng `DATABASE_URL` pooler kết nối được, chạy `npm run db:migrate:pooled`. Không dùng schema push trên production.
4. Chạy `npm run auth:bootstrap` đúng một lần nếu Auth hoàn toàn trống, sau đó tắt `BOOTSTRAP_ADMIN_ENABLED`, xóa bootstrap password khỏi môi trường và đổi mật khẩu quản trị.
5. Có thể chạy `npm run db:seed -- --validate-only` trước, rồi `npm run db:seed` khi cần nhập dữ liệu mock. Seed là idempotent theo slug/external key và không xóa dữ liệu đã có.
6. Xác minh RLS bằng `npm run test:database` và test role bằng `npm run content:test:authorization` trước khi mở admin cho người dùng khác.

Migration phải được chạy trong CI/CD job riêng hoặc thủ công trước deploy ứng dụng. Không chạy migration đồng thời từ nhiều Vercel instance.

### Cloudflare R2

1. Tạo bucket và Account API Token chỉ có `Object Read & Write` trên đúng bucket.
2. Bật custom domain cho production (ưu tiên) hoặc `r2.dev` chỉ để phát triển; đặt origin đó vào `R2_PUBLIC_BASE_URL`.
3. Cấu hình CORS `PUT, GET, HEAD` cho chính xác origin development/production và cho phép header `Content-Type`. Browser upload trực tiếp bằng presigned URL; file không đi qua Next.js/Vercel.
4. Chạy `npm run storage:orphans` để audit khô. Chỉ sau khi kiểm tra danh sách mới chạy `npm run storage:orphans:delete`; lệnh chỉ xét object `images/` không có record DB và cũ hơn ngưỡng cấu hình.

### Mux

1. Tạo access token có quyền Mux Video và đặt token ID/secret ở server environment.
2. Tạo webhook production trỏ tới `https://your-domain.com/api/webhooks/mux`, sao chép signing secret vào `MUX_WEBHOOK_SECRET` rồi redeploy.
3. Test upload trực tiếp, event processing/ready/failed, signature sai và event lặp. Endpoint xác minh raw body trước khi xử lý; `video_webhook_events` bảo đảm idempotency.
4. Khi phát triển local, dùng HTTPS tunnel. Mux CLI chưa có binary Windows ở một số phiên bản nên có thể dùng WSL/Linux/macOS hoặc tunnel và webhook dashboard.

### Resend, Turnstile và Upstash

1. Xác minh domain gửi trong Resend, tạo API key chỉ cho ứng dụng, cấu hình `RESEND_FROM_EMAIL` thuộc domain đã xác minh và email nhận thông báo.
2. Tạo Turnstile widget cho đúng hostname production/local test. Backend kiểm tra token, action và hostname khớp `NEXT_PUBLIC_SITE_URL`.
3. Tạo Upstash Redis REST database gần khu vực deploy. Production fail closed nếu thiếu rate limiter; không dùng in-memory fallback giữa nhiều instance.
4. Không log payload form. Email gửi lỗi không rollback submission đã lưu; theo dõi lỗi gửi bằng log/alert không chứa nội dung cá nhân.

### Vercel và security checklist

- Khai báo biến cho đúng scope Production/Preview/Development, đặt `NEXT_PUBLIC_SITE_URL` theo từng environment và redeploy sau khi đổi public variables.
- Security headers được cấu hình ở `next.config.ts`; admin/auth/API dùng `no-store`, admin/auth có `noindex`.
- Chạy `npm run lint`, `npm run type-check`, `npm run test`, `npm run build` trong CI. Chạy migration như một bước có khóa trước deploy, không trong request/runtime startup.
- Cấu hình scheduler cho `npm run analytics:retention`; theo dõi error rate của upload, webhook, email, rate limit và DB connection.
- Giữ secret trong Vercel/Supabase/Cloudflare secret manager, xoay key định kỳ và ngay khi nghi ngờ bị lộ.

### Backup PostgreSQL

- Bật backup/PITR phù hợp với gói Supabase. Ngoài backup managed, lên lịch `pg_dump` bằng `DIRECT_DATABASE_URL` từ runner tin cậy, mã hóa file và lưu ở bucket/tài khoản tách biệt.
- Thường xuyên kiểm tra restore vào project/database tạm; backup chưa test restore không được xem là hoàn chỉnh.
- Backup trước migration có thay đổi schema lớn. Không đưa dump chứa dữ liệu cá nhân hoặc credential vào Git.

### Docker trong tương lai

Dự án hiện chưa cung cấp Dockerfile production. Khi container hóa, dùng multi-stage build, chạy user không phải root, chỉ copy output cần thiết, truyền secret lúc runtime (không `ARG`/bake vào image), có health check và đặt reverse proxy TLS phía trước. Database migration vẫn chạy bằng job riêng, không chạy đồng thời trong mọi replica.

`npm run dev` và `npm start` tự chạy `auth:bootstrap` trước khi khởi động. Script chỉ tạo user khi Auth hoàn toàn trống, xác nhận email, tạo `profiles` với role `super_admin`, và bỏ qua nếu đã có bất kỳ user nào. Có thể chạy kiểm tra thủ công bằng `npm run auth:bootstrap`. Sau khi bootstrap production thành công, nên tắt `BOOTSTRAP_ADMIN_ENABLED` và xoay mật khẩu ban đầu.

## Seed dữ liệu mock

- `npm run db:seed -- --validate-only`: chỉ validate fixture, không kết nối hoặc ghi database.
- `npm run db:seed`: insert category, tag, media và nội dung còn thiếu. Script dùng slug, object key và UUID xác định; không update hay delete record đã tồn tại.
- `npm run db:smoke`: kiểm tra mapper/repository/service ở DB mode và fallback mock khi không có `DATABASE_URL`.

Seed cần một profile `super_admin` active để làm author cho bài viết. Từ Giai đoạn 15, `/`, `/blog`, `/blog/[slug]`, sitemap, metadata và các vị trí social public đọc PostgreSQL khi `USE_DATABASE_CONTENT=true`; đặt `false` để giữ fallback mock trong development. Admin Posts và Social Links luôn dùng database thật và mọi mutation đều kiểm tra permission phía server.

## Analytics nội bộ

- Client chỉ gửi event view/click trong allowlist sau khi người dùng đồng ý; submit conversion được ghi từ backend sau khi submission thành công.
- Endpoint `/api/analytics/events` giới hạn JSON ở 4 KB, kiểm tra same-origin, Zod allowlist và rate limit.
- Không lưu nội dung form, email, số điện thoại, full IP, password, token hoặc secret trong analytics.
- Anonymous session là UUID ngẫu nhiên trong `sessionStorage`; server chỉ lưu SHA-256 hash. Dashboard ghi rõ đây là **ước tính phiên duy nhất**.
- Raw event có chính sách retention 90 ngày. Chạy `npm run analytics:retention` định kỳ bằng Vercel Cron hoặc scheduler tương đương; daily aggregate không bị xóa bởi lệnh này.
- Dashboard chỉ query theo date range, đọc `daily_analytics` cho metric dài hạn và phân trang recent raw events.

Các smoke test Backend nội dung:

- `npm run content:test:service`: kiểm tra Zod từ chối content block sai và Server Action không có session bị từ chối.
- `npm run content:test`: tạo các bản ghi có namespace tạm trên Supabase để kiểm tra category/tag/post/social CRUD, duplicate slug, publish/unpublish/schedule, RLS public visibility và social order; script tự dọn đúng các bản ghi test trong `finally`.
- `npm run content:test:authorization`: tạo editor tạm để xác minh taxonomy và post-tag chỉ được sửa trên draft, bị từ chối khi ảnh hưởng nội dung đã publish, sau đó tự cleanup.

## Deploy lên Vercel

1. Push repository lên Git provider và import project vào Vercel.
2. Giữ framework preset là Next.js và dùng build command mặc định `npm run build`.
3. Trong Project Settings → Environment Variables, đặt `NEXT_PUBLIC_SITE_URL` bằng domain production chính thức, không dùng URL localhost.
4. Deploy project. Khi đổi domain canonical, cập nhật biến trên rồi redeploy.
5. Sau deploy, kiểm tra trang chủ, các route động, `/robots.txt`, `/sitemap.xml` và một route không tồn tại.
6. Bật bootstrap duy nhất cho lần deploy đầu khi Auth còn trống, xác nhận profile `super_admin` đã được tạo, sau đó tắt `BOOTSTRAP_ADMIN_ENABLED` và xoay mật khẩu ban đầu.

## Giới hạn của MVP

- Admin Dashboard là demo; thao tác bảng phần lớn mất khi refresh.
- Appearance Editor chỉ lưu cấu hình demo trong localStorage của trình duyệt.
- Contact, newsletter và campaign submission lưu PostgreSQL thật; email phụ thuộc Resend, chống spam phụ thuộc Turnstile/Upstash.
- File đính kèm chỉ được kiểm tra trên UI, không upload.
- Analytics nội bộ phụ thuộc consent và scheduler production cần chạy `analytics:retention` định kỳ.
- Một số dữ liệu mock vẫn được giữ làm development fallback khi `USE_DATABASE_CONTENT=false`; không nên bật chế độ này ở production.
- Không đồng bộ dữ liệu với YouTube, TikTok, Instagram, Facebook hoặc social API khác.
- Nội dung Privacy và Terms là nội dung mẫu, cần được chuyên gia pháp lý kiểm tra trước production.
- Dữ liệu, hình ảnh, địa chỉ liên hệ và external URL hiện là dữ liệu minh họa cần được thay trước khi phát hành chính thức.

## Hướng phát triển sau MVP

- CMS hoặc backend quản lý nội dung và media.
- CRUD content thật, quản lý user/role và ghi audit log.
- Database, object storage và upload có kiểm soát.
- Email transactional cho form và newsletter.
- Mở rộng consent theo khu vực pháp lý và bổ sung cơ chế quản lý/xóa dữ liệu production.
- Tích hợp social API, lịch xuất bản và cập nhật số liệu tự động.
- Bộ kiểm thử tự động cho unit, integration, accessibility và end-to-end.

## Checklist trước production

- Thay toàn bộ nội dung, hình ảnh và social link mock.
- Đặt `NEXT_PUBLIC_SITE_URL` đúng domain canonical.
- Kiểm tra pháp lý cho Privacy, Terms, cookie/analytics consent.
- Thêm backend, chống spam, rate limit và lưu trữ an toàn nếu bật form thật.
- Tạo Admin đầu tiên, gán role tối thiểu cần thiết và kiểm thử toàn bộ permission trước khi phát hành.
- Chạy lại `npm run lint`, `npm run type-check`, `npm run test` và `npm run build`.
- Kiểm thử trình duyệt thật ở mobile, tablet và desktop trước khi go-live.
