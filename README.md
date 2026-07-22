# Quang Official — Creator Blog & Social Hub

Quang Official là website cá nhân dành cho content creator, tập trung vào bài viết, video, hình ảnh, sự kiện và chiến dịch cộng đồng. Dự án gồm website public, Admin Dashboard dùng dữ liệu mock, nền tảng PostgreSQL/Drizzle và lớp xác thực, phân quyền Supabase phía server.

## Giao diện

Phần public sử dụng phong cách creator hiện đại, hỗ trợ light/dark/system theme, card nội dung giàu hình ảnh và bố cục responsive. Phần admin có sidebar, bảng dữ liệu Ant Design, biểu mẫu mock và trình chỉnh giao diện với preview riêng. Ảnh minh họa mẫu được đặt trong `public/images/creator/`.

## Tính năng

### Website public

- Trang chủ tổng hợp hero, social links, bài viết, video, gallery, sự kiện, chiến dịch, newsletter và CTA hợp tác.
- Blog có bài nổi bật, tìm kiếm theo tiêu đề/mô tả, lọc category/tag, xem thêm và trang chi tiết có metadata riêng.
- Video có lọc platform/chủ đề, phân biệt landscape/portrait và chỉ mở video ngoài khi người dùng chọn.
- Gallery có lọc category, lightbox, caption, previous/next/close và điều hướng bằng bàn phím.
- Events và Campaigns có danh sách theo trạng thái, trang chi tiết, metadata và xử lý slug không tồn tại.
- Campaign có countdown an toàn với hydration và form đăng ký mock có validation.
- About, Contact, Privacy, Terms và trang 404 tùy biến.
- SEO cơ bản gồm metadata, canonical URL, Open Graph, Twitter card, sitemap và robots.
- Accessibility cơ bản gồm semantic HTML, label form, focus state, skip link, dialog title, alt text và reduced motion.

### Admin Dashboard demo

- Dashboard thống kê và hoạt động gần đây bằng dữ liệu mock.
- Bảng quản lý Posts, Social Links, Videos, Gallery, Events và Campaigns.
- Search, filter, thêm, sửa, xóa, featured và enable/disable chỉ cập nhật local state.
- Appearance Editor có theme, màu sắc, kiểu card/button/layout, bật tắt section và preview.
- Settings form chỉ mô phỏng thao tác lưu.

> **Cảnh báo:** `/admin` đã có Supabase Authentication và RBAC phía server, nhưng các bảng và thao tác nội dung vẫn dùng local state/mock data. Đây chưa phải CMS production hoàn chỉnh.

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
npx tsc --noEmit
npm run build
npm run start
```

Dự án hiện chưa khai báo script `type-check`; lệnh kiểm tra TypeScript tương đương là `npx tsc --noEmit`.

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
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | Mặc định `true` | Tắt toàn bộ ingest/banner analytics khi đặt `false`; vẫn cần consent trước khi ghi event. |
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
- Form newsletter, campaign, contact và settings không gửi dữ liệu thật.
- File đính kèm chỉ được kiểm tra trên UI, không upload.
- Analytics nội bộ phụ thuộc consent và scheduler production cần chạy `analytics:retention` định kỳ.
- Đã có authentication, authorization và database foundation; chưa có CRUD content, email service hoặc API nghiệp vụ.
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
- Chạy lại `npm run lint`, `npx tsc --noEmit` và `npm run build`.
- Kiểm thử trình duyệt thật ở mobile, tablet và desktop trước khi go-live.
