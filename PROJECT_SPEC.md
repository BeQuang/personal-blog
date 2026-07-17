# PROJECT_SPEC.md

# Quang Official — Creator Blog & Social Hub

> **Trạng thái tài liệu:** Backend-ready specification  
> **Repository:** `BeQuang/personal-blog`  
> **Nhánh được đối chiếu:** `dev2026`  
> **Ngày cập nhật đặc tả:** 2026-07-16  
> **Phạm vi hiện tại:** Frontend và Admin Dashboard demo đã hoàn thành; Backend production sẽ được triển khai theo giai đoạn 11–21.

---

# 1. Mục đích của tài liệu

Tài liệu này là nguồn yêu cầu kỹ thuật chính thức cho dự án `personal-blog`.

AI Agent phải dùng tài liệu để:

1. Hiểu đúng mã nguồn Frontend hiện tại.
2. Không tạo lại hoặc thay đổi tùy tiện giao diện đã hoàn thành.
3. Chuyển dữ liệu mock sang dữ liệu thật theo từng module.
4. Xây dựng Backend production ngay trong repository Next.js hiện có.
5. Tích hợp authentication, authorization, database, ảnh, video, form, email và analytics.
6. Giữ dự án dễ triển khai trên Vercel ở giai đoạn đầu.
7. Giữ kiến trúc đủ tách lớp để có thể chuyển sang VPS, Docker hoặc tách service sau này.
8. Hoàn thành từng giai đoạn độc lập, có kiểm tra lint, TypeScript và production build.

Tài liệu cũ mô tả việc xây dựng Frontend từ đầu. Trạng thái đó không còn đúng. Frontend và Admin demo hiện đã tồn tại trong source; phần còn lại của tài liệu tập trung vào việc bảo toàn giao diện và phát triển Backend từ giai đoạn 11 đến 21.

---

# 2. Tổng quan sản phẩm

`Quang Official` là website cá nhân dành cho content creator, kết hợp:

- Blog cá nhân.
- Trang giới thiệu creator.
- Social Media Hub.
- Link-in-bio nâng cao.
- Trang video.
- Thư viện hình ảnh.
- Trang sự kiện.
- Trang chiến dịch marketing.
- Form newsletter.
- Form liên hệ hợp tác.
- Admin Dashboard quản lý nội dung và giao diện.
- Dashboard trực quan hóa dữ liệu marketing và hành vi truy cập.

Người truy cập có thể:

- Xem thông tin giới thiệu.
- Truy cập Facebook, YouTube, TikTok, Instagram, X và các nền tảng khác.
- Xem bài viết, video và hình ảnh.
- Theo dõi sự kiện và chiến dịch.
- Đăng ký nhận thông báo.
- Gửi yêu cầu hợp tác.

Quản trị viên có thể:

- Đăng nhập an toàn.
- Quản lý bài viết, mạng xã hội, video, gallery, sự kiện và chiến dịch.
- Upload ảnh, tài liệu và video.
- Thay avatar, banner và cấu hình website.
- Xem contact submission, newsletter và người tham gia campaign.
- Xem dashboard analytics.
- Phân quyền người quản trị.
- Theo dõi audit log.

---

# 3. Hiện trạng repository bắt buộc phải hiểu trước khi sửa code

## 3.1. Công nghệ hiện có

Repository hiện sử dụng:

```text
Next.js 16.2.10
React 19.2.4
React DOM 19.2.4
TypeScript 5 strict mode
Next.js App Router
Tailwind CSS 4
Ant Design 6.5.1
@ant-design/nextjs-registry
Radix UI Dialog
Lucide React 1.24.0
ESLint 9
Node.js >= 20.9.0
npm
```

Các dependency hiện tại trong `package.json` không gồm Axios, Redux, Day.js, Sonner hoặc bất kỳ Backend SDK nào.

AI Agent không được giả định các thư viện cũ trong bản PROJECT_SPEC trước vẫn còn tồn tại.

## 3.2. Scripts hiện có

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

Dự án hiện chưa có script `type-check`.

Lệnh kiểm tra TypeScript hiện tương đương:

```bash
npx tsc --noEmit
```

Trong giai đoạn Backend có thể thêm:

```json
{
  "type-check": "tsc --noEmit",
  "db:generate": "...",
  "db:migrate": "...",
  "db:studio": "...",
  "db:seed": "...",
  "test": "...",
  "test:e2e": "..."
}
```

Chỉ thêm script khi dependency và file thực thi tương ứng đã tồn tại.

## 3.3. Chỉ dẫn riêng của repository

Repository có `AGENTS.md` với yêu cầu quan trọng:

```text
Phiên bản Next.js hiện tại có thể có breaking changes so với dữ liệu huấn luyện của AI.
Trước khi viết code liên quan Next.js, phải đọc hướng dẫn phù hợp trong node_modules/next/dist/docs/ và tuân thủ deprecation notice.
```

`CLAUDE.md` tham chiếu trực tiếp đến `AGENTS.md`.

Mọi AI Agent phải đọc:

```text
AGENTS.md
CLAUDE.md
PROJECT_SPEC.md
README.md
package.json
tsconfig.json
next.config.ts
```

trước khi chỉnh sửa code.

## 3.4. Cấu trúc source hiện có

```text
src/
├── app/
│   ├── about/
│   ├── admin/
│   ├── blog/
│   ├── campaigns/
│   ├── contact/
│   ├── events/
│   ├── gallery/
│   ├── privacy/
│   ├── terms/
│   ├── videos/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   ├── page.tsx
│   ├── robots.ts
│   └── sitemap.ts
│
├── components/
│   ├── admin/
│   ├── blog/
│   ├── campaigns/
│   ├── common/
│   ├── contact/
│   ├── events/
│   ├── gallery/
│   ├── home/
│   ├── layout/
│   ├── legal/
│   ├── providers/
│   └── videos/
│
├── config/
│   ├── admin.config.ts
│   ├── campaign.config.ts
│   ├── contact.config.ts
│   ├── event.config.ts
│   ├── homepage.config.ts
│   ├── navigation.config.ts
│   ├── site.config.ts
│   └── theme.config.ts
│
├── data/
│   ├── campaigns.ts
│   ├── events.ts
│   ├── gallery.ts
│   ├── posts.ts
│   ├── social-links.ts
│   └── videos.ts
│
├── lib/
│   ├── admin-data.ts
│   ├── analytics.ts
│   └── metadata.ts
│
├── services/
│   ├── campaign.service.ts
│   ├── event.service.ts
│   ├── gallery.service.ts
│   ├── post.service.ts
│   ├── social.service.ts
│   └── video.service.ts
│
├── types/
│   ├── admin.ts
│   ├── campaign.ts
│   ├── event.ts
│   ├── gallery.ts
│   ├── index.ts
│   ├── post.ts
│   ├── site.ts
│   ├── social.ts
│   └── video.ts
│
└── utils/
    ├── cn.ts
    ├── data.ts
    ├── date.ts
    └── format.ts
```

Không tự ý chuyển các route public sang `src/app/(public)` vì repository hiện không sử dụng route group đó.

## 3.5. Public routes đã hoàn thành

```text
/
/blog
/blog/[slug]
/videos
/gallery
/events
/events/[slug]
/campaigns
/campaigns/[slug]
/about
/contact
/privacy
/terms
```

Ngoài ra đã có:

```text
/not-found thông qua src/app/not-found.tsx
/robots.txt thông qua src/app/robots.ts
/sitemap.xml thông qua src/app/sitemap.ts
```

## 3.6. Admin routes demo đã hoàn thành

```text
/admin
/admin/posts
/admin/social-links
/admin/videos
/admin/gallery
/admin/events
/admin/campaigns
/admin/appearance
/admin/settings
```

Admin hiện tại:

- Không có authentication.
- Không có authorization.
- Không có database.
- Dùng Ant Design.
- Dùng dữ liệu mock.
- Các thao tác chủ yếu cập nhật local state.
- Appearance Editor có thể dùng localStorage để preview.
- Không được xem là Admin production.

## 3.7. Nguồn dữ liệu hiện tại

Public website đọc dữ liệu từ:

```text
src/data/*.ts
```

thông qua:

```text
src/services/*.service.ts
```

Ví dụ `post.service.ts` hiện import trực tiếp:

```ts
import { posts } from "@/data/posts";
```

`src/lib/admin-data.ts` chuyển mock data thành `AdminTableRow` cho Admin Dashboard.

Mục tiêu của Backend là thay implementation bên trong service theo từng giai đoạn, không yêu cầu viết lại giao diện public.

---

# 4. Hợp đồng tương thích với Frontend hiện tại

## 4.1. Nguyên tắc bảo toàn giao diện

Trong giai đoạn 11–21, AI Agent phải:

- Giữ nguyên phong cách creator hiện tại.
- Giữ nguyên responsive behavior.
- Giữ nguyên light/dark/system theme.
- Giữ nguyên route public.
- Giữ nguyên route admin, trừ việc bổ sung `/admin/login` và các màn hình cần thiết.
- Giữ nguyên wording tiếng Việt nếu không có yêu cầu thay đổi.
- Không đổi Ant Design sang UI framework khác.
- Không đổi Tailwind CSS 4 sang CSS framework khác.
- Không viết lại `globals.css` trên diện rộng.
- Không phá metadata, sitemap, robots hoặc dynamic route.
- Không biến toàn bộ page thành Client Component.
- Không chuyển database query vào Client Component.

Chỉ được chỉnh UI khi cần để:

- Hiển thị loading/error/empty state thật.
- Thêm form CRUD.
- Thêm Media Picker.
- Thêm upload progress.
- Thêm trạng thái authentication.
- Thêm trạng thái processing video.
- Hiển thị analytics thật.
- Hiển thị permission denied.

## 4.2. Các type hiện có phải được bảo toàn ở lớp UI

### BlogPost

UI hiện sử dụng:

```ts
export type PostStatus = "draft" | "published" | "scheduled";

export type PostContentBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "list"; style: "ordered" | "unordered"; items: readonly string[] }
  | { type: "code"; language: string; code: string }
  | { type: "video"; url: string; title: string }
  | {
      type: "cta";
      title: string;
      description: string;
      label: string;
      href: string;
    }
  | { type: "divider" };
```

Database phải lưu được cấu trúc block này bằng `jsonb` hoặc một mô hình tương thích.

Service trả về UI DTO phải tiếp tục tương thích với:

```ts
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: readonly PostContentBlock[];
  thumbnail: string;
  coverImage?: string;
  category: string;
  tags: readonly string[];
  author: {
    name: string;
    avatar?: string;
  };
  status: PostStatus;
  featured: boolean;
  readingTime: number;
  viewCount?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

Không trả trực tiếp database row cho component. Repository hoặc service phải map row sang DTO.

### SocialLink

```ts
interface SocialLink {
  id: string;
  platform:
    | "facebook"
    | "youtube"
    | "tiktok"
    | "instagram"
    | "x"
    | "threads"
    | "zalo"
    | "telegram"
    | "discord"
    | "website"
    | "email";
  label: string;
  username?: string;
  url: string;
  followerCount?: number;
  description?: string;
  enabled: boolean;
  order: number;
}
```

### VideoItem

```ts
interface VideoItem {
  id: string;
  title: string;
  description?: string;
  platform: "youtube" | "tiktok" | "instagram" | "facebook" | "internal";
  orientation: "landscape" | "portrait";
  thumbnail: string;
  videoUrl: string;
  duration?: string;
  viewCount?: number;
  topic: string;
  featured: boolean;
  publishedAt: string;
}
```

Video internal từ Mux phải được map thành cùng cấu trúc DTO hoặc mở rộng type theo hướng backward-compatible.

### GalleryItem

```ts
interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category: string;
  alt: string;
  width?: number;
  height?: number;
  createdAt: string;
}
```

### EventItem

```ts
interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  banner: string;
  type:
    | "livestream"
    | "premiere"
    | "fan-meeting"
    | "giveaway"
    | "workshop"
    | "offline"
    | "launch";
  status: "upcoming" | "live" | "ended" | "cancelled";
  startAt: string;
  endAt?: string;
  location?: string;
  platform?: string;
  externalUrl?: string;
  schedule?: readonly { time: string; title: string }[];
  featured: boolean;
}
```

### Campaign

```ts
interface Campaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  banner: string;
  startAt: string;
  endAt: string;
  status: "draft" | "upcoming" | "active" | "ended";
  buttonLabel: string;
  buttonUrl?: string;
  rules: readonly string[];
  terms: readonly string[];
  featured: boolean;
}
```

## 4.3. Cấu hình hiện tại

Các file sau hiện là nguồn fallback hợp lệ:

```text
src/config/site.config.ts
src/config/theme.config.ts
src/config/navigation.config.ts
src/config/homepage.config.ts
src/config/contact.config.ts
src/config/event.config.ts
src/config/campaign.config.ts
src/config/admin.config.ts
```

Khi có database:

- `site.config.ts` vẫn giữ fallback build-time.
- Settings từ database có thể override các field được phép.
- `NEXT_PUBLIC_SITE_URL` vẫn là nguồn chuẩn cho canonical origin.
- Không lưu secret hoặc deployment URL trong bảng `site_settings`.
- Không cho Appearance Editor ghi trực tiếp vào source file.

## 4.4. Chiến lược đổi service từ sync sang async

Các service hiện có là synchronous vì đọc mock data.

Database query sẽ là asynchronous.

AI Agent phải:

1. Tìm toàn bộ call site trước khi đổi chữ ký hàm.
2. Chuyển Server Component sang `await` mà không biến thành Client Component.
3. Chỉ truyền DTO serializable xuống Client Component.
4. Không dùng `useEffect` để fetch dữ liệu vốn có thể lấy ở Server Component.
5. Không làm thay đổi URL, filter hoặc empty state hiện có.

Ví dụ mục tiêu:

```ts
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const rows = await postsRepository.findPublished();
  return rows.map(mapPostRowToBlogPost);
}
```

---

# 5. Kiến trúc Backend mục tiêu

## 5.1. Kiểu kiến trúc

Sử dụng **Modular Monolith** trong cùng repository Next.js.

```text
Browser
  │
  ├── Public Website
  └── Admin Dashboard
        │
        ▼
Next.js App Router
  ├── Server Components
  ├── Server Actions
  ├── Route Handlers
  ├── Auth Guards
  ├── Validation
  ├── Application Services
  ├── Repositories
  └── Provider Adapters
        │
        ├── Supabase PostgreSQL
        ├── Supabase Auth
        ├── Cloudflare R2
        ├── Mux Video
        ├── Resend
        ├── Cloudflare Turnstile
        └── Upstash Redis
```

Không tạo NestJS hoặc Backend repository riêng trong giai đoạn 11–21.

Kiến trúc phải đủ tách lớp để sau này có thể tách module thành service riêng mà không viết lại domain logic.

## 5.2. Stack Backend chuẩn

| Nhu cầu | Công nghệ |
|---|---|
| Database | PostgreSQL trên Supabase |
| ORM và migration | Drizzle ORM + Drizzle Kit |
| PostgreSQL driver | `postgres` hoặc driver ổn định tương thích Drizzle và môi trường hiện tại |
| Authentication | Supabase Auth |
| Supabase SSR | `@supabase/ssr` theo API hiện hành |
| Validation | Zod |
| Ảnh và tài liệu | Cloudflare R2, S3-compatible |
| Upload ảnh/file | Presigned URL, browser upload trực tiếp |
| Video | Mux Direct Upload + Mux Player |
| Email | Resend |
| Chống bot | Cloudflare Turnstile |
| Rate limit | Upstash Redis + Upstash Ratelimit |
| Analytics nội bộ | PostgreSQL raw event + daily aggregate |
| Hosting ban đầu | Vercel |
| Mở rộng hosting | Docker/VPS/Railway/Fly.io hoặc nền tảng Node.js tương thích |

## 5.3. Nguyên tắc không khóa nhà cung cấp

Business logic không được import SDK nhà cung cấp trực tiếp.

Tạo interface và adapter:

```text
MediaStorage
├── R2StorageAdapter
└── FutureS3StorageAdapter

VideoProvider
├── MuxVideoProvider
└── FutureVideoProvider

EmailProvider
├── ResendEmailProvider
└── FutureSmtpEmailProvider

RateLimiter
├── UpstashRateLimiter
└── InMemoryDevelopmentRateLimiter
```

Component và application service chỉ phụ thuộc interface hoặc service wrapper.

## 5.4. Runtime

- Database, Mux SDK, R2 signing và Resend dùng Node.js runtime trừ khi đã xác minh Edge-compatible.
- Không đặt webhook Mux vào static route.
- Không proxy file lớn qua Next.js server.
- Không upload video hoặc ảnh lớn qua Server Action body.
- Không giữ state quan trọng chỉ trong memory của serverless function.

---

# 6. Cấu trúc thư mục Backend cần bổ sung

Cấu trúc mục tiêu, có thể điều chỉnh nhẹ theo source thực tế:

```text
src/
├── actions/
│   ├── posts.actions.ts
│   ├── social-links.actions.ts
│   ├── videos.actions.ts
│   ├── gallery.actions.ts
│   ├── events.actions.ts
│   ├── campaigns.actions.ts
│   ├── settings.actions.ts
│   └── users.actions.ts
│
├── app/
│   ├── admin/
│   │   ├── login/
│   │   └── ...existing routes
│   │
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts
│   │
│   └── api/
│       ├── uploads/
│       │   ├── images/
│       │   │   ├── presign/route.ts
│       │   │   └── complete/route.ts
│       │   └── videos/route.ts
│       ├── webhooks/
│       │   └── mux/route.ts
│       ├── forms/
│       │   ├── contact/route.ts
│       │   └── newsletter/route.ts
│       ├── campaigns/
│       │   └── [id]/submissions/route.ts
│       └── analytics/
│           └── events/route.ts
│
├── server/
│   ├── auth/
│   │   ├── current-user.ts
│   │   ├── permissions.ts
│   │   ├── require-auth.ts
│   │   └── require-permission.ts
│   │
│   ├── database/
│   │   ├── client.ts
│   │   ├── schema/
│   │   ├── relations.ts
│   │   └── migrations/
│   │
│   ├── repositories/
│   ├── services/
│   ├── validation/
│   ├── mappers/
│   ├── errors/
│   ├── storage/
│   ├── video/
│   ├── email/
│   ├── rate-limit/
│   ├── analytics/
│   ├── audit/
│   └── security/
│
├── services/
│   └── ...existing public service facades
│
└── types/
    └── ...existing UI/domain DTOs
```

Ngoài `src`:

```text
drizzle.config.ts
drizzle/
scripts/seed.ts
```

File dùng để refresh Supabase session phải theo đúng convention của Next.js 16 hiện tại. AI Agent phải đọc local Next.js docs trước khi quyết định dùng `proxy.ts`, `middleware.ts` hoặc convention khác.

---

# 7. Quy tắc phân lớp

## 7.1. Component layer

Component chỉ chịu trách nhiệm:

- Render UI.
- Nhận DTO.
- Trigger Server Action hoặc gọi endpoint cần thiết.
- Hiển thị loading, error và success.

Component không được:

- Query Drizzle trực tiếp.
- Import database schema.
- Import secret.
- Import Supabase admin client.
- Import R2 hoặc Mux secret SDK.

## 7.2. Server Action layer

Dùng chủ yếu cho mutation từ Admin:

- Create/update/archive/publish post.
- Create/update social link.
- Update settings.
- Create/update event và campaign.
- Xóa hoặc detach media.

Mỗi Server Action phải:

1. Kiểm tra session.
2. Kiểm tra permission.
3. Parse input bằng Zod.
4. Gọi application service.
5. Không chứa query phức tạp trực tiếp.
6. Ghi audit log khi thay đổi dữ liệu quan trọng.
7. Revalidate route/tag phù hợp.
8. Trả typed result.

Result gợi ý:

```ts
export type ActionResult<T = undefined> =
  | { success: true; data: T; message?: string }
  | {
      success: false;
      message: string;
      fieldErrors?: Record<string, string[]>;
      code?: string;
    };
```

## 7.3. Route Handler layer

Dùng cho:

- Auth callback.
- Presigned upload URL.
- Upload completion.
- Mux webhook.
- Public form submission.
- Analytics ingest.
- CSV export nếu cần stream response.

Mỗi Route Handler phải:

- Validate method và content type.
- Giới hạn payload.
- Parse input server-side.
- Trả status code đúng.
- Không expose stack trace.
- Không log secret hoặc toàn bộ PII.

## 7.4. Application service layer

Service xử lý:

- Business rule.
- Publish rule.
- Slug rule.
- Campaign active rule.
- Media usage rule.
- Permission-independent domain validation.
- Transaction boundary.
- Provider orchestration.

## 7.5. Repository layer

Repository chỉ xử lý:

- Query database.
- Insert/update/delete.
- Transaction-aware persistence.
- Mapping primitive row khi cần.

Repository không được:

- Render UI message.
- Gửi email.
- Gọi Turnstile.
- Quyết định permission từ request.

## 7.6. Mapper layer

Mapper chuyển:

```text
Database Row -> Domain Model -> UI DTO
```

Mục đích:

- Không để tên cột snake_case lan vào component.
- Giữ type UI hiện tại.
- Dễ đổi database/provider.

---

# 8. Database schema mục tiêu

## 8.1. Quy ước chung

- Primary key dùng UUID.
- Timestamp dùng `timestamptz` và lưu UTC.
- Field thời gian trả ra UI dùng ISO 8601.
- Table và column trong database dùng `snake_case`.
- TypeScript dùng `camelCase`.
- Có `created_at` và `updated_at` cho entity thay đổi.
- Dùng soft delete cho content quan trọng khi phù hợp.
- Không dùng JSONB để né thiết kế quan hệ nếu cần filter/join thường xuyên.
- Chỉ dùng JSONB cho block content, settings linh hoạt, schedule, rules, terms và metadata.
- Mọi migration phải được commit vào repository.
- Không dùng schema push trực tiếp lên production thay migration.

## 8.2. Enums

Tạo PostgreSQL enum hoặc check constraint tương đương:

```text
user_role:
- super_admin
- admin
- editor
- viewer

profile_status:
- active
- disabled

content_status:
- draft
- scheduled
- published
- archived

social_platform:
- facebook
- youtube
- tiktok
- instagram
- x
- threads
- zalo
- telegram
- discord
- website
- email

media_type:
- image
- document
- video

media_provider:
- r2
- mux
- external
- local

media_status:
- pending
- uploading
- processing
- ready
- failed
- deleted

video_platform:
- youtube
- tiktok
- instagram
- facebook
- internal

video_orientation:
- landscape
- portrait

event_status:
- upcoming
- live
- ended
- cancelled

event_type:
- livestream
- premiere
- fan-meeting
- giveaway
- workshop
- offline
- launch

campaign_status:
- draft
- upcoming
- active
- ended

submission_status:
- new
- reviewing
- accepted
- rejected
- spam
- archived

newsletter_status:
- subscribed
- unsubscribed
- suppressed
```

## 8.3. profiles

Liên kết người dùng Supabase Auth với quyền trong ứng dụng.

| Column | Type | Rule |
|---|---|---|
| id | uuid | PK, trùng `auth.users.id` |
| email | text | Không dùng làm nguồn auth duy nhất; có thể cache để hiển thị |
| display_name | text | Bắt buộc |
| role | user_role | Mặc định `viewer` |
| status | profile_status | Mặc định `active` |
| last_login_at | timestamptz | Nullable |
| created_at | timestamptz | Bắt buộc |
| updated_at | timestamptz | Bắt buộc |

Index:

- `role`
- `status`

## 8.4. media_assets

Nguồn trung tâm cho ảnh, tài liệu và metadata file.

| Column | Type | Rule |
|---|---|---|
| id | uuid | PK |
| type | media_type | Bắt buộc |
| provider | media_provider | Bắt buộc |
| status | media_status | Bắt buộc |
| object_key | text | Unique khi provider là R2 |
| public_url | text | Nullable với file private |
| original_filename | text | Bắt buộc khi upload |
| mime_type | text | Bắt buộc |
| extension | text | Bắt buộc |
| size_bytes | bigint | Không âm |
| width | integer | Nullable |
| height | integer | Nullable |
| alt | text | Nullable; bắt buộc khi dùng làm ảnh public nếu phù hợp |
| checksum | text | Nullable |
| metadata | jsonb | Mặc định `{}` |
| uploaded_by | uuid | FK profiles.id |
| created_at | timestamptz | Bắt buộc |
| updated_at | timestamptz | Bắt buộc |
| deleted_at | timestamptz | Nullable |

Index:

- `(type, status)`
- `uploaded_by`
- `created_at desc`
- unique `object_key` khi không null

## 8.5. site_settings

Dự án hiện chỉ cần một cấu hình website chính.

| Column | Type | Rule |
|---|---|---|
| id | uuid | PK |
| settings_key | text | Unique, mặc định `default` |
| site_name | text | Bắt buộc |
| site_description | text | Bắt buộc |
| locale | text | Mặc định `vi-VN` |
| creator_name | text | Bắt buộc |
| username | text | Bắt buộc |
| contact_email | text | Bắt buộc |
| avatar_media_id | uuid | FK media_assets.id, nullable |
| cover_media_id | uuid | FK media_assets.id, nullable |
| theme | jsonb | Phải validate theo ThemeSettings |
| homepage_sections | jsonb | Phải validate theo HomepageSectionKey |
| navigation | jsonb | Phải validate NavigationItem[] |
| homepage_content | jsonb | Override nội dung homepage nếu cần |
| default_seo_title | text | Nullable |
| default_seo_description | text | Nullable |
| created_at | timestamptz | Bắt buộc |
| updated_at | timestamptz | Bắt buộc |

Không lưu:

- `NEXT_PUBLIC_SITE_URL` production.
- API key.
- Secret.
- Vercel URL tạm thời.

## 8.6. social_links

| Column | Type | Rule |
|---|---|---|
| id | uuid | PK |
| platform | social_platform | Bắt buộc |
| label | text | Bắt buộc |
| username | text | Nullable |
| url | text | URL hợp lệ |
| follower_count | bigint | Nullable, không âm |
| description | text | Nullable |
| enabled | boolean | Mặc định true |
| sort_order | integer | Mặc định 0 |
| created_at | timestamptz | Bắt buộc |
| updated_at | timestamptz | Bắt buộc |

Index:

- `(enabled, sort_order)`
- `platform`

## 8.7. categories

| Column | Type | Rule |
|---|---|---|
| id | uuid | PK |
| name | text | Bắt buộc |
| slug | text | Unique, lowercase, không dấu |
| description | text | Nullable |
| created_at | timestamptz | Bắt buộc |
| updated_at | timestamptz | Bắt buộc |

## 8.8. tags

| Column | Type | Rule |
|---|---|---|
| id | uuid | PK |
| name | text | Bắt buộc |
| slug | text | Unique |
| created_at | timestamptz | Bắt buộc |

## 8.9. posts

| Column | Type | Rule |
|---|---|---|
| id | uuid | PK |
| title | text | Bắt buộc |
| slug | text | Unique |
| excerpt | text | Bắt buộc |
| content | jsonb | Validate `PostContentBlock[]` |
| thumbnail_media_id | uuid | FK media_assets.id, nullable trong draft |
| cover_media_id | uuid | FK media_assets.id, nullable |
| category_id | uuid | FK categories.id |
| author_id | uuid | FK profiles.id |
| status | content_status | Bắt buộc |
| featured | boolean | Mặc định false |
| reading_time | integer | Không âm |
| view_count | bigint | Mặc định 0 |
| scheduled_at | timestamptz | Nullable |
| published_at | timestamptz | Nullable |
| seo_title | text | Nullable |
| seo_description | text | Nullable |
| created_at | timestamptz | Bắt buộc |
| updated_at | timestamptz | Bắt buộc |
| deleted_at | timestamptz | Nullable |

Business rules:

- `published` phải có `published_at`.
- `scheduled` phải có `scheduled_at` trong tương lai tại thời điểm tạo lịch.
- Slug phải unique theo lowercase.
- Public chỉ đọc `published`, chưa bị soft delete và `published_at <= now()`.
- Content JSON phải validate server-side trước khi lưu.

Index:

- unique lowercase slug.
- `(status, published_at desc)`.
- `(featured, status)`.
- `category_id`.
- `author_id`.

## 8.10. post_tags

| Column | Type | Rule |
|---|---|---|
| post_id | uuid | FK posts.id |
| tag_id | uuid | FK tags.id |

Primary key kết hợp:

```text
(post_id, tag_id)
```

## 8.11. videos

Hỗ trợ cả video ngoài và video internal từ Mux.

| Column | Type | Rule |
|---|---|---|
| id | uuid | PK |
| title | text | Bắt buộc |
| description | text | Nullable |
| platform | video_platform | Bắt buộc |
| orientation | video_orientation | Bắt buộc |
| topic | text | Bắt buộc |
| external_url | text | Nullable; dùng cho YouTube/TikTok/... |
| thumbnail_media_id | uuid | FK media_assets.id, nullable |
| video_media_id | uuid | FK media_assets.id, nullable |
| mux_upload_id | text | Unique khi không null |
| mux_asset_id | text | Unique khi không null |
| mux_playback_id | text | Unique khi không null |
| duration_seconds | numeric | Nullable |
| aspect_ratio | text | Nullable |
| processing_status | media_status | Bắt buộc |
| content_status | content_status | Bắt buộc |
| featured | boolean | Mặc định false |
| view_count | bigint | Mặc định 0 |
| published_at | timestamptz | Nullable |
| created_at | timestamptz | Bắt buộc |
| updated_at | timestamptz | Bắt buộc |
| deleted_at | timestamptz | Nullable |

Rules:

- Video `internal` chỉ được public khi `processing_status = ready`.
- Video ngoài phải có `external_url` hợp lệ.
- Không lưu Mux token trong database.
- Webhook update phải idempotent.

## 8.12. gallery_items

| Column | Type | Rule |
|---|---|---|
| id | uuid | PK |
| media_asset_id | uuid | FK media_assets.id |
| title | text | Bắt buộc |
| description | text | Nullable |
| category | text | Bắt buộc |
| alt | text | Bắt buộc |
| sort_order | integer | Mặc định 0 |
| status | content_status | Bắt buộc |
| published_at | timestamptz | Nullable |
| created_at | timestamptz | Bắt buộc |
| updated_at | timestamptz | Bắt buộc |
| deleted_at | timestamptz | Nullable |

## 8.13. events

| Column | Type | Rule |
|---|---|---|
| id | uuid | PK |
| title | text | Bắt buộc |
| slug | text | Unique |
| description | text | Bắt buộc |
| banner_media_id | uuid | FK media_assets.id, nullable |
| type | event_type | Bắt buộc |
| event_status | event_status | Bắt buộc |
| content_status | content_status | Bắt buộc |
| start_at | timestamptz | Bắt buộc |
| end_at | timestamptz | Nullable |
| timezone | text | Mặc định `Asia/Ho_Chi_Minh` |
| location | text | Nullable |
| platform | text | Nullable |
| external_url | text | Nullable |
| schedule | jsonb | Validate `{time,title}[]` |
| featured | boolean | Mặc định false |
| created_at | timestamptz | Bắt buộc |
| updated_at | timestamptz | Bắt buộc |
| deleted_at | timestamptz | Nullable |

Index:

- unique slug.
- `(content_status, start_at)`.
- `event_status`.
- `type`.

## 8.14. campaigns

| Column | Type | Rule |
|---|---|---|
| id | uuid | PK |
| title | text | Bắt buộc |
| slug | text | Unique |
| description | text | Bắt buộc |
| banner_media_id | uuid | FK media_assets.id, nullable |
| start_at | timestamptz | Bắt buộc |
| end_at | timestamptz | Bắt buộc |
| status | campaign_status | Bắt buộc |
| button_label | text | Bắt buộc |
| button_url | text | Nullable |
| rules | jsonb | Validate string[] |
| terms | jsonb | Validate string[] |
| featured | boolean | Mặc định false |
| submission_enabled | boolean | Mặc định true |
| submission_limit | integer | Nullable, lớn hơn 0 |
| created_at | timestamptz | Bắt buộc |
| updated_at | timestamptz | Bắt buộc |
| deleted_at | timestamptz | Nullable |

Rules:

- `end_at > start_at`.
- Server tính campaign có thể nhận submission dựa trên thời gian thật, không chỉ dựa vào status client.
- Draft không xuất hiện public hoặc sitemap.

## 8.15. campaign_submissions

| Column | Type | Rule |
|---|---|---|
| id | uuid | PK |
| campaign_id | uuid | FK campaigns.id |
| full_name | text | Bắt buộc |
| email | text | Bắt buộc |
| email_normalized | text | Bắt buộc |
| phone | text | Nullable |
| followed_platform | text | Nullable |
| social_username | text | Nullable |
| notes | text | Nullable |
| status | submission_status | Mặc định `new` |
| source | text | Nullable |
| utm | jsonb | Mặc định `{}` |
| created_at | timestamptz | Bắt buộc |
| updated_at | timestamptz | Bắt buộc |

Duplicate rule phải cấu hình theo campaign, ví dụ:

- Unique `(campaign_id, email_normalized)`.
- Hoặc kết hợp email/phone tùy business rule.

## 8.16. contact_submissions

| Column | Type | Rule |
|---|---|---|
| id | uuid | PK |
| full_name | text | Bắt buộc |
| email | text | Bắt buộc |
| email_normalized | text | Bắt buộc |
| phone | text | Nullable |
| company | text | Nullable |
| collaboration_type | text | Bắt buộc |
| budget_range | text | Nullable |
| message | text | Bắt buộc |
| attachment_media_id | uuid | FK media_assets.id, nullable |
| status | submission_status | Mặc định `new` |
| source | text | Nullable |
| utm | jsonb | Mặc định `{}` |
| created_at | timestamptz | Bắt buộc |
| updated_at | timestamptz | Bắt buộc |

Không log toàn bộ message hoặc PII vào console production.

## 8.17. newsletter_subscriptions

| Column | Type | Rule |
|---|---|---|
| id | uuid | PK |
| email | text | Bắt buộc |
| email_normalized | text | Unique |
| status | newsletter_status | Bắt buộc |
| source | text | Nullable |
| unsubscribe_token_hash | text | Unique |
| subscribed_at | timestamptz | Bắt buộc |
| unsubscribed_at | timestamptz | Nullable |
| created_at | timestamptz | Bắt buộc |
| updated_at | timestamptz | Bắt buộc |

Không lưu unsubscribe token dạng plaintext nếu có thể dùng hash.

## 8.18. analytics_events

| Column | Type | Rule |
|---|---|---|
| id | uuid | PK |
| event_type | text | Theo allowlist |
| entity_type | text | Nullable |
| entity_id | uuid/text | Nullable |
| path | text | Bắt buộc |
| referrer_domain | text | Nullable |
| utm_source | text | Nullable |
| utm_medium | text | Nullable |
| utm_campaign | text | Nullable |
| device_category | text | Nullable |
| country_code | text | Nullable nếu hạ tầng cung cấp hợp pháp |
| anonymous_session_hash | text | Nullable |
| metadata | jsonb | Payload nhỏ, đã lọc |
| created_at | timestamptz | Bắt buộc |

Không lưu:

- Password.
- Auth token.
- Form content.
- Full IP dài hạn.
- Turnstile token.
- Secret.

## 8.19. daily_analytics

Dùng để tổng hợp dữ liệu, tránh query raw events cho mọi dashboard request.

| Column | Type | Rule |
|---|---|---|
| date | date | Bắt buộc |
| metric | text | Bắt buộc |
| entity_type | text | Nullable |
| entity_id | uuid/text | Nullable |
| dimensions | jsonb | Mặc định `{}` |
| value | bigint | Không âm |
| updated_at | timestamptz | Bắt buộc |

Unique key phải ngăn duplicate aggregate theo date/metric/entity/dimensions hash.

## 8.20. audit_logs

| Column | Type | Rule |
|---|---|---|
| id | uuid | PK |
| actor_profile_id | uuid | FK profiles.id, nullable cho system |
| action | text | Bắt buộc |
| entity_type | text | Bắt buộc |
| entity_id | text | Nullable |
| before_data | jsonb | Đã loại secret/PII không cần thiết |
| after_data | jsonb | Đã loại secret/PII không cần thiết |
| request_id | text | Nullable |
| created_at | timestamptz | Bắt buộc |

Audit log không được chứa:

- Password.
- Access token.
- Refresh token.
- API key.
- R2 secret.
- Mux secret.
- Turnstile token.

---

# 9. Authentication và authorization

## 9.1. Authentication

Dùng Supabase Auth.

MVP Backend production cần hỗ trợ:

- Email và password cho Admin.
- Đăng nhập.
- Đăng xuất.
- Session cookie phía server.
- Refresh session theo convention hiện hành.
- Auth callback nếu flow cần.
- Disabled account.
- Session hết hạn.

Không mở đăng ký Admin công khai.

Tài khoản quản trị ban đầu được tạo thủ công trong Supabase Dashboard hoặc qua script an toàn.

## 9.2. API key Supabase

Ưu tiên key naming hiện hành:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

Nếu project cũ chỉ có legacy keys, có thể hỗ trợ:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Không dùng đồng thời một cách mơ hồ. README phải ghi rõ lựa chọn thực tế.

Secret key hoặc service role:

- Chỉ dùng server-side.
- Không import vào Client Component.
- Không xuất hiện trong bundle.
- Có quyền cao và có thể bypass RLS; phải dùng tối thiểu.

## 9.3. Roles

```text
super_admin
admin
editor
viewer
```

## 9.4. Permission matrix

| Permission | super_admin | admin | editor | viewer |
|---|---:|---:|---:|---:|
| Xem dashboard | Yes | Yes | Yes | Yes |
| Xem content | Yes | Yes | Yes | Yes |
| Tạo/sửa content | Yes | Yes | Yes | No |
| Publish/archive content | Yes | Yes | Theo cấu hình | No |
| Quản lý media | Yes | Yes | Yes | No |
| Xem submissions | Yes | Yes | Theo cấu hình | No |
| Export CSV | Yes | Yes | No mặc định | No |
| Quản lý site settings | Yes | Yes | No | No |
| Quản lý user/role | Yes | No | No | No |
| Xem audit log | Yes | Yes | No | No |

Permission phải được định nghĩa thành constant hoặc typed map, không hardcode rải rác trong component.

## 9.5. Bảo vệ route

- Người chưa đăng nhập truy cập `/admin/*` phải được chuyển đến `/admin/login`.
- `/admin/login` không được redirect loop.
- UI guard không thay thế server authorization.
- Mọi Server Action private phải gọi `requirePermission()`.
- Mọi Route Handler private phải kiểm tra permission.
- Không tin role gửi từ client.
- Không chỉ kiểm tra URL middleware/proxy.

## 9.6. Row Level Security

RLS là lớp bảo vệ bổ sung.

Yêu cầu:

- Bật RLS cho application table được expose qua Supabase Data API.
- Public chỉ đọc nội dung published nếu thật sự dùng client Data API.
- Public không được write trực tiếp vào content table.
- Form submission ưu tiên đi qua Backend Route Handler có validation, Turnstile và rate limit.
- Admin write vẫn phải kiểm tra application permission.
- Không phụ thuộc hoàn toàn vào RLS nếu query bằng privileged server connection.

---

# 10. Database connection và migration

## 10.1. Environment

```env
DATABASE_URL=
DIRECT_DATABASE_URL=
```

- `DATABASE_URL`: pooled connection cho application runtime nếu provider hỗ trợ.
- `DIRECT_DATABASE_URL`: direct connection cho migration nếu cần.

## 10.2. Drizzle

Tạo:

```text
drizzle.config.ts
src/server/database/client.ts
src/server/database/schema/*
drizzle/* migration files
```

Yêu cầu:

- Không tạo database client mới cho mỗi query nếu driver cần reuse.
- Xử lý connection phù hợp serverless.
- Không chạy migration tự động trong request production.
- Không gọi `db:push` production.
- Migration phải có thể review trong Git.
- Seed là lệnh riêng.

## 10.3. Transaction

Dùng transaction cho các nghiệp vụ nhiều bước:

- Create/update post cùng tags.
- Delete/archive content cùng relation.
- Campaign submission cùng counter/limit.
- Media attach/detach.
- Mux webhook update nhiều record.
- Settings update và audit log khi cần atomicity.

---

# 11. Chiến lược migration từ mock data

## 11.1. Không xóa mock data ngay

Giữ:

```text
src/data/*.ts
```

cho đến khi:

- Schema hoàn thành.
- Seed chạy thành công.
- Public pages đọc database.
- Admin CRUD thật hoạt động.
- Build thành công.

Sau đó mock data có thể tiếp tục được giữ như seed fixture hoặc demo fallback development.

## 11.2. Seed idempotent

Seed phải:

- Chạy nhiều lần không tạo duplicate.
- Upsert theo slug hoặc stable key.
- Không xóa dữ liệu người dùng.
- Không chạy tự động production.
- Có log tổng số inserted/updated/skipped.
- Map image local thành media provider `local` hoặc giữ URL local hợp lệ.

## 11.3. Feature flag tạm thời

Có thể dùng:

```env
USE_DATABASE_CONTENT=false
```

trong quá trình migration.

Behavior:

- `false`: service đọc mock data.
- `true`: service đọc database.

Feature flag chỉ là cầu nối migration, không được trở thành cấu hình mơ hồ lâu dài.

## 11.4. Service facade

Giữ tên service public hiện có khi hợp lý:

```text
getPublishedPosts
getFeaturedPosts
getPostBySlug
getEnabledSocialLinks
getVideos
getUpcomingEvents
getFeaturedCampaign
```

Thay implementation bên trong sang server repository/service để giảm số component phải sửa.

---

# 12. Upload ảnh và tài liệu bằng Cloudflare R2

## 12.1. Phạm vi

R2 dùng cho:

- Avatar.
- Cover website.
- Post thumbnail.
- Post cover.
- Ảnh trong content block.
- Gallery.
- Event banner.
- Campaign banner.
- Contact attachment nếu cho phép.
- Media Kit.

Không dùng R2 để tự xây adaptive video streaming trong giai đoạn này.

## 12.2. Upload flow

```text
Admin chọn file
  ↓
Client gửi metadata đến Backend
  ↓
Backend kiểm tra auth + permission + MIME + size + purpose
  ↓
Backend tạo object key và presigned PUT URL
  ↓
Browser upload trực tiếp lên R2
  ↓
Client gọi complete endpoint
  ↓
Backend HEAD object / xác minh metadata
  ↓
Backend tạo media_assets record status=ready
```

## 12.3. Object key

Không dùng nguyên filename người dùng làm key.

Format gợi ý:

```text
images/{yyyy}/{mm}/{uuid}.{ext}
documents/{yyyy}/{mm}/{uuid}.{ext}
```

## 12.4. File rules

Ảnh public cho phép mặc định:

```text
image/jpeg
image/png
image/webp
image/avif
```

Không cho SVG mặc định.

Tài liệu contact theo config hiện tại:

```text
.pdf
.doc
.docx
.ppt
.pptx
```

Giới hạn hiện tại trên UI là 10 MB; Backend phải dùng cùng hoặc chặt hơn.

## 12.5. Security

- Validate MIME server-side.
- Validate extension.
- Validate file size.
- Presigned URL hết hạn ngắn.
- Không nhận object key tùy ý từ client để xóa.
- Xóa file phải kiểm tra DB reference.
- Không xóa asset đang được sử dụng.
- Secret R2 không ra client.
- CORS chỉ cho origin cần thiết.
- Có checksum nếu triển khai được hợp lý.

## 12.6. Storage abstraction

```ts
interface MediaStorage {
  createUploadUrl(input: CreateUploadUrlInput): Promise<UploadUrlResult>;
  headObject(objectKey: string): Promise<StoredObjectMetadata>;
  deleteObject(objectKey: string): Promise<void>;
  getPublicUrl(objectKey: string): string;
}
```

---

# 13. Video bằng Mux

## 13.1. Mục tiêu

Hỗ trợ Admin đăng video thật mà:

- File không đi qua Vercel Function.
- Có resumable/direct upload.
- Có processing status.
- Có playback ID.
- Có adaptive streaming.
- Có thumbnail/poster.
- Có webhook xác nhận ready/failed.

## 13.2. Direct upload flow

```text
Admin yêu cầu upload URL
  ↓
Backend kiểm tra auth và permission
  ↓
Backend tạo Mux Direct Upload
  ↓
Database tạo videos record status=uploading
  ↓
Browser upload trực tiếp đến Mux
  ↓
Mux xử lý video
  ↓
Mux webhook gọi Next.js
  ↓
Backend verify signature
  ↓
Cập nhật upload_id, asset_id, playback_id, duration, aspect ratio, status
```

## 13.3. Trạng thái

```text
pending
uploading
processing
ready
failed
deleted
```

Admin UI phải hiển thị trạng thái thật.

## 13.4. Webhook

Endpoint:

```text
/api/webhooks/mux
```

Yêu cầu:

- Đọc raw body theo cách Mux SDK yêu cầu.
- Verify webhook signature trước khi parse/trust event.
- Xử lý idempotent.
- Chấp nhận event gửi lặp.
- Không throw 500 vô hạn cho event không liên quan.
- Log event ID và loại event, không log secret.

Các event tối thiểu:

```text
video.upload.asset_created
video.asset.ready
video.asset.errored
video.asset.deleted
```

## 13.5. Public playback

- Chỉ hiển thị video `content_status=published` và `processing_status=ready`.
- Không autoplay mặc định.
- Lazy load player khi phù hợp.
- Tiếp tục hỗ trợ YouTube, TikTok, Instagram và Facebook external URLs.
- Không nhúng tất cả iframe ngay khi tải page.

## 13.6. Provider abstraction

```ts
interface VideoProvider {
  createDirectUpload(input: CreateVideoUploadInput): Promise<DirectUploadResult>;
  getAsset(assetId: string): Promise<VideoAssetInfo>;
  deleteAsset(assetId: string): Promise<void>;
  verifyWebhook(rawBody: string, signature: string): VerifiedVideoEvent;
}
```

---

# 14. Form thật, email, chống spam và rate limit

## 14.1. Các form cần kết nối Backend

- Newsletter.
- Contact.
- Campaign submission.
- Settings Admin.
- CRUD forms Admin.

## 14.2. Validation

Mọi form cần:

- Validation client để UX tốt.
- Validation server bằng Zod.
- Trim text.
- Normalize email.
- Giới hạn độ dài.
- Field errors cụ thể.
- Chống submit lặp.
- Không tin hidden field từ client.

## 14.3. Cloudflare Turnstile

Public form phải verify token phía server.

Không coi widget client là đủ.

Quy tắc:

- Token chỉ dùng một lần.
- Không lưu token.
- Không log token.
- Xử lý token expired hoặc duplicate.
- Có reset widget khi cần.
- Development có test key hoặc documented bypass an toàn, không bypass production.

## 14.4. Rate limit

Dùng rate limit cho:

- Login attempts nếu flow cho phép tích hợp.
- Contact form.
- Newsletter.
- Campaign submission.
- Analytics ingest.
- Presigned upload URL.
- Mux upload URL.
- CSV export nếu cần.

Rate limit key có thể kết hợp:

```text
route + anonymous/session/user + hashed network signal
```

Không lưu full IP lâu dài nếu không cần.

## 14.5. Resend

Email dùng cho:

- Thông báo contact mới cho Admin.
- Xác nhận đã nhận contact nếu bật.
- Thông báo campaign submission nếu cần.
- Authentication email thông qua Supabase SMTP khi cấu hình.

Yêu cầu:

- Domain gửi phải được verify trước production.
- Email failure không làm mất submission đã lưu.
- Lưu trạng thái gửi nếu cần retry.
- Không gửi marketing broadcast trong giai đoạn 19 nếu chưa có consent workflow đầy đủ.

## 14.6. Contact attachment

Nếu bật upload attachment:

- Upload lên R2 trước khi submit.
- Chỉ lưu `media_asset_id`.
- File private ưu tiên signed download URL.
- Admin phải có permission mới tải được.
- Không đính kèm file lớn trực tiếp vào email; gửi link an toàn.

## 14.7. CSV export

CSV export phải:

- Kiểm tra permission.
- Escape đúng CSV.
- Chống formula injection với value bắt đầu bằng `=`, `+`, `-`, `@`.
- Không export field không cần thiết.
- Có date range/filter.
- Có audit log cho export nhạy cảm nếu phù hợp.

---

# 15. Analytics và trực quan hóa

## 15.1. Event allowlist

```text
page_view
post_view
video_view
social_click
campaign_view
campaign_click
campaign_submit
contact_submit
newsletter_submit
```

Client không được tự tạo event type tùy ý.

## 15.2. Event payload

Cho phép:

- Path.
- Entity type/id.
- Referrer domain.
- UTM source/medium/campaign.
- Device category.
- Anonymous session hash.
- Timestamp server.

Không cho phép:

- Full form data.
- Email.
- Phone.
- Password.
- Token.
- Full IP dài hạn.

## 15.3. Dashboard cần có

- Tổng page views.
- Lượt xem theo ngày.
- Social clicks.
- Top posts.
- Top videos.
- Top campaigns.
- Campaign conversion.
- Traffic sources.
- UTM campaign.
- Device breakdown.
- Contact và newsletter conversion.

Date filter:

```text
7 ngày
30 ngày
90 ngày
Custom range
```

## 15.4. Query strategy

- Aggregate phía server/database.
- Không gửi toàn bộ raw event lên browser.
- Mọi query có date range.
- Có index theo `created_at` và `event_type`.
- Dùng `daily_analytics` cho dashboard dài hạn.
- Raw event có retention policy được ghi trong README.

## 15.5. Unique session

Nếu chỉ dùng anonymous session hash thì phải gọi là:

```text
Ước tính phiên duy nhất
```

Không tuyên bố là số người dùng duy nhất tuyệt đối.

---

# 16. Caching, revalidation và SEO

## 16.1. Public content

Public page ưu tiên Server Components.

Khi Admin mutation thành công:

- Revalidate route liên quan.
- Revalidate cache tag nếu dùng tag.
- Revalidate sitemap khi publish/unpublish content có route.

Ví dụ:

```text
Post publish:
- /
- /blog
- /blog/{slug}
- /sitemap.xml

Event update:
- /
- /events
- /events/{slug}
- /sitemap.xml

Campaign update:
- /
- /campaigns
- /campaigns/{slug}
- /sitemap.xml
```

## 16.2. Dynamic metadata

Metadata cho blog/event/campaign phải đọc dữ liệu database và:

- Xử lý missing record.
- Chỉ index published content.
- Có canonical URL từ `NEXT_PUBLIC_SITE_URL`.
- Có Open Graph image từ media asset.
- Không để draft xuất hiện sitemap.

## 16.3. Settings cache

`site_settings` được đọc thường xuyên nên có thể cache ngắn hoặc tag cache.

Sau update settings phải invalidate ngay.

## 16.4. Không cache dữ liệu private

Không cache công khai:

- Admin session.
- Submission data.
- User role.
- Presigned URL.
- Private media URL.

---

# 17. Error handling và logging

## 17.1. Typed errors

Tạo ít nhất:

```text
ValidationError
NotFoundError
UnauthorizedError
ForbiddenError
ConflictError
RateLimitError
ExternalProviderError
```

## 17.2. User-facing error

- Không hiển thị stack trace.
- Thông báo tiếng Việt, dễ hiểu.
- Field error nằm gần input.
- Provider error được map sang message an toàn.

## 17.3. Logging

Log production cần:

- Request ID nếu có.
- Error code.
- Entity ID.
- Provider name.
- Event ID webhook.

Không log:

- Password.
- Auth token.
- Refresh token.
- API key.
- Turnstile token.
- Full contact message nếu không cần.
- Raw file content.

---

# 18. Environment variables mục tiêu

`.env.example` sau khi hoàn thành Backend phải gồm:

```env
# Application
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
USE_DATABASE_CONTENT=false

# Database
DATABASE_URL=
DIRECT_DATABASE_URL=

# Supabase Auth — preferred current keys
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

# Supabase legacy fallback — only when project uses legacy keys
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_BASE_URL=

# Mux
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
MUX_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=
EMAIL_FROM=
CONTACT_NOTIFICATION_EMAIL=

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Upstash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Optional marketing integrations
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_TIKTOK_PIXEL_ID=
```

Quy tắc:

- Không bắt buộc khai báo cả current và legacy Supabase key.
- README phải chỉ ra bộ key thực tế đang dùng.
- Website development có thể chạy ở mock mode khi chưa có Backend credentials.
- Production không được silently fallback mock nếu `USE_DATABASE_CONTENT=true` nhưng database lỗi.
- Secret không bắt đầu bằng `NEXT_PUBLIC_`.

---

# 19. Giai đoạn triển khai Backend 11–21

Mỗi giai đoạn phải được thực hiện độc lập.

Không tự động tiếp tục sang giai đoạn sau.

Sau mỗi giai đoạn phải báo cáo:

```text
Files created/updated
Dependencies added/removed
Database changes
Environment variables
Security decisions
Lint result
Type-check result
Build result
Tests result nếu có
Known limitations
```

## Giai đoạn 11 — Audit source và thiết kế Backend

### Mục tiêu

Xác nhận hiện trạng repository trước khi viết Backend.

### Phải làm

- Đọc toàn bộ file hướng dẫn.
- Đọc package.json.
- Đọc các route public/admin.
- Tìm mọi import từ `src/data`.
- Tìm mọi service sync.
- Tìm mọi Admin local state/mock action.
- Tìm form mock.
- Xác định Client Component bị ảnh hưởng.
- Đối chiếu type hiện có với schema trong tài liệu này.
- Lập dependency plan.
- Lập migration plan.

### Không được làm

- Không sửa code.
- Không cài package.
- Không tạo Supabase project.
- Không tạo migration.
- Không thay UI.

### Deliverable

- Audit report.
- Dependency map.
- Data-flow map.
- ERD dạng text.
- Risk list.
- Danh sách file dự kiến thay đổi theo giai đoạn.

### Acceptance criteria

- Báo cáo chỉ ra chính xác source mock hiện tại.
- Báo cáo không đề xuất dựng lại FE.
- Báo cáo xác định `src/services` là facade cần migration.
- Báo cáo xác định Admin demo chưa được bảo vệ.

---

## Giai đoạn 12 — Database và Drizzle foundation

### Mục tiêu

Tạo schema, migration và database client nhưng chưa nối UI.

### Dependencies dự kiến

```text
dependencies:
- drizzle-orm
- postgres hoặc driver ổn định đã chọn
- zod

devDependencies:
- drizzle-kit
- dotenv nếu Drizzle config cần
- tsx nếu seed/migration script cần
```

AI Agent phải dùng bản stable tương thích với repository tại thời điểm thực hiện.

### Phải làm

- Tạo Drizzle config.
- Tạo database client.
- Tạo enums.
- Tạo toàn bộ schema từ mục 8.
- Tạo relations.
- Tạo index và unique constraints.
- Tạo migration SQL.
- Thêm scripts db.
- Cập nhật `.env.example`.
- Thêm `type-check` script.

### Không được làm

- Không nối public page vào DB.
- Không làm auth.
- Không xóa mock data.
- Không chạy migration destructive.
- Không dùng schema push production.

### Acceptance criteria

- Schema compile.
- Migration có thể review.
- Không có circular import nghiêm trọng.
- `npm run lint` passed.
- `npm run type-check` passed.
- `npm run build` passed khi không bắt buộc DB connection lúc build hoặc có fallback được thiết kế rõ.

---

## Giai đoạn 13 — Supabase Authentication và RBAC

### Mục tiêu

Bảo vệ Admin bằng authentication và permission thật.

### Dependencies dự kiến

```text
@supabase/supabase-js
@supabase/ssr
```

### Phải làm

- Tạo browser/server Supabase clients.
- Tạo privileged server client chỉ khi cần.
- Tạo `/admin/login`.
- Tạo auth callback nếu flow cần.
- Thiết lập session refresh theo Next.js 16 hiện hành.
- Tạo `profiles` synchronization.
- Tạo permission map.
- Tạo `requireAuth`, `requirePermission`, `getCurrentUser`.
- Bảo vệ `/admin/*`.
- Thêm logout.
- Thêm RLS migration/policy phù hợp.

### Không được làm

- Không làm CRUD content.
- Không upload file.
- Không expose secret key.
- Không chỉ ẩn menu để bảo vệ.
- Không tin role từ client.

### Acceptance criteria

- Chưa login không vào `/admin`.
- Login hợp lệ vào Admin.
- Disabled user bị chặn.
- Role thiếu quyền bị từ chối server-side.
- Refresh giữ session.
- Logout hủy session.
- Public routes vẫn hoạt động.

---

## Giai đoạn 14 — Repository, service, mapper và seed

### Mục tiêu

Tạo tầng dữ liệu thật mà chưa chuyển toàn bộ UI.

### Phải làm

- Tạo repository cho từng domain.
- Tạo server application service.
- Tạo mapper row -> DTO.
- Tạo typed errors.
- Tạo seed từ `src/data`.
- Tạo feature flag migration.
- Tạo service facade tương thích.
- Seed idempotent.

### Không được làm

- Không xóa existing service API nếu component đang dùng.
- Không chuyển tất cả page một lần.
- Không dùng database row trực tiếp trong UI.

### Acceptance criteria

- Seed có thể chạy lặp.
- Không duplicate slug.
- Existing DTO shape được giữ.
- Mock mode vẫn chạy.
- DB mode có integration smoke test hoặc documented verification.

---

## Giai đoạn 15 — Posts, categories, tags và social links CRUD

### Mục tiêu

Thay module nội dung quan trọng nhất sang database thật.

### Phải làm

Posts:

- List admin thật.
- Create.
- Edit.
- Archive/soft delete.
- Publish.
- Unpublish.
- Schedule.
- Featured.
- Category.
- Tags.
- Block content editor tương thích `PostContentBlock[]`.
- SEO title/description.
- Slug validation.

Social links:

- Create.
- Edit.
- Delete.
- Enable/disable.
- Sort order.
- URL validation.
- Follower count.

Public:

- `/blog` đọc DB.
- `/blog/[slug]` đọc DB.
- Homepage latest/featured posts đọc DB.
- Header/footer/social dialog đọc DB.
- Sitemap và metadata đọc DB.

### Không được làm

- Không upload ảnh thật trong giai đoạn này.
- Không xóa mock trước khi migration được xác nhận.
- Không query DB từ Client Component.

### Acceptance criteria

- Draft không public.
- Publish xuất hiện public và sitemap.
- Unpublish biến mất public.
- Duplicate slug bị chặn.
- Invalid block content bị chặn server-side.
- Social order đúng.
- Permission hoạt động.

---

## Giai đoạn 16 — R2 Media Library và upload ảnh/tài liệu

### Mục tiêu

Upload media thật, quản lý tập trung và sử dụng lại trong content.

### Dependencies dự kiến

```text
@aws-sdk/client-s3
@aws-sdk/s3-request-presigner
```

### Phải làm

- Tạo `MediaStorage` interface.
- Tạo R2 adapter.
- Tạo presign endpoint.
- Tạo complete endpoint.
- Verify object metadata.
- Tạo Media Library admin.
- Search/filter/pagination.
- Upload progress.
- Copy URL.
- Delete an toàn.
- Media Picker.
- Gắn media vào post, site settings, event/campaign placeholders.
- Cập nhật `next.config.ts` cho remote image host nếu cần.

### Không được làm

- Không proxy file qua Next.js.
- Không cho SVG mặc định.
- Không expose R2 secret.
- Không xóa asset đang được tham chiếu.

### Acceptance criteria

- Unauthorized user không lấy được presigned URL.
- Invalid MIME/size bị từ chối.
- Upload trực tiếp thành công.
- DB chỉ tạo ready asset sau verify.
- Public image render bằng `next/image`.
- Orphan/delete rule hoạt động.

---

## Giai đoạn 17 — Mux video upload và streaming

### Mục tiêu

Cho phép upload, xử lý và phát video internal thật.

### Dependencies dự kiến

```text
@mux/mux-node
@mux/mux-uploader-react
@mux/mux-player-react
```

Tên package thực tế phải được xác minh từ docs chính thức tại thời điểm triển khai.

### Phải làm

- Tạo VideoProvider.
- Tạo Mux adapter.
- Tạo authenticated direct upload endpoint.
- Tạo video DB record trước upload.
- Tạo webhook.
- Verify signature.
- Update trạng thái idempotent.
- Admin processing UI.
- Publish/unpublish video.
- Mux Player cho internal video.
- Giữ external video support.

### Không được làm

- Không proxy video qua Vercel.
- Không trust webhook chưa verify.
- Không expose Mux secret.
- Không public video processing/failed.

### Acceptance criteria

- Direct upload URL chỉ cấp cho role có quyền.
- Webhook duplicate không tạo record duplicate.
- Ready video phát được.
- Failed video hiển thị lỗi Admin.
- External videos vẫn hoạt động.
- `/videos` và homepage không bị vỡ layout portrait/landscape.

---

## Giai đoạn 18 — Gallery, Events, Campaigns và Site Settings

### Mục tiêu

Chuyển các module còn lại từ mock/localStorage sang database.

### Phải làm

Gallery:

- CRUD thật.
- Media Picker.
- Alt/caption/category.
- Sort order.
- Publish/archive.

Events:

- CRUD thật.
- Banner media.
- Schedule JSON validation.
- Start/end/timezone.
- Event status.
- Content status.
- Slug và metadata.

Campaigns:

- CRUD thật.
- Rules/terms.
- Start/end.
- Submission enable/limit.
- Banner media.
- Slug và metadata.

Site Settings:

- Tên site.
- Mô tả.
- Creator name.
- Username.
- Contact email.
- Avatar/cover.
- Theme.
- Homepage sections.
- Navigation.
- Default SEO.

### Không được làm

- Không lưu setting chỉ bằng localStorage.
- Không lưu secret trong site settings.
- Không cho Editor quản lý security settings mặc định.

### Acceptance criteria

- Public gallery/events/campaigns đọc DB.
- Dynamic route và notFound hoạt động.
- Draft không public.
- Appearance Editor thay đổi cấu hình server thật theo permission.
- Settings update invalidate cache.

---

## Giai đoạn 19 — Contact, Newsletter, Campaign submissions và Email

### Mục tiêu

Biến form mock thành form production có lưu dữ liệu và chống spam.

### Dependencies dự kiến

```text
resend
@upstash/redis
@upstash/ratelimit
```

Turnstile có thể dùng HTTP API trực tiếp hoặc package nhẹ nếu thật sự cần.

### Phải làm

- Zod server schemas.
- Turnstile server verification.
- Rate limit.
- Contact insert.
- Newsletter subscribe/unsubscribe foundation.
- Campaign submission.
- Duplicate rules.
- Campaign time/limit check.
- Resend notification.
- Admin inbox/list/table.
- Filter/search/pagination.
- CSV export an toàn.
- Contact attachment bằng R2 nếu bật.

### Không được làm

- Không chỉ validate client.
- Không lưu Turnstile token.
- Không log PII đầy đủ.
- Không làm mất submission nếu email thất bại.
- Không gửi broadcast marketing chưa có consent workflow.

### Acceptance criteria

- Bot/invalid token bị chặn.
- Rate limit hoạt động.
- Valid submission được lưu.
- Duplicate campaign submission bị xử lý đúng.
- Ended campaign không nhận submission.
- Admin xem được data theo permission.
- CSV không có formula injection.

---

## Giai đoạn 20 — Analytics và Dashboard trực quan

### Mục tiêu

Thay analytics console placeholder bằng analytics nội bộ có dashboard.

### Phải làm

- Analytics ingest endpoint.
- Event allowlist.
- Payload size limit.
- Rate limit.
- Anonymous session strategy.
- Raw event storage.
- Daily aggregation.
- Dashboard charts.
- Date filters.
- Top content.
- Traffic/UTM/device breakdown.
- Campaign conversion.
- Privacy documentation.

### Không được làm

- Không gửi raw event table toàn bộ xuống client.
- Không lưu form data trong analytics.
- Không gọi estimated unique là exact unique.
- Không cài chart library nặng nếu không cần.

### Acceptance criteria

- Event invalid bị từ chối.
- Query dashboard có date range.
- Index phù hợp.
- Dashboard load bằng aggregate.
- Existing Admin design được giữ.
- Analytics có thể tắt theo config/consent nếu cần.

---

## Giai đoạn 21 — Security audit, tests và production hardening

### Mục tiêu

Đưa toàn bộ hệ thống về trạng thái sẵn sàng deploy production.

### Phải làm

Authentication/authorization:

- Audit tất cả Server Actions.
- Audit private Route Handlers.
- Audit role matrix.
- Audit session refresh.

Database:

- Audit migration.
- Index.
- Unique constraints.
- Foreign keys.
- Cascade/delete behavior.
- Transaction.
- Connection pooling.
- Backup plan.

Media:

- MIME/size.
- Presigned URL expiry.
- Object key.
- Reference check.
- Orphan cleanup.
- Private file access.

Mux:

- Signature.
- Idempotency.
- Failed event.
- Delete flow.

Forms:

- Turnstile.
- Rate limit.
- Validation.
- PII logging.
- CSV injection.

Security:

- Secret scanning.
- XSS.
- SSRF.
- SQL injection.
- Open redirect.
- Broken access control.
- Security headers.
- Error leakage.

Testing:

- Unit tests cho business rules.
- Integration tests cho repository/action nếu môi trường cho phép.
- E2E cho login, publish post, upload image và campaign submit nếu phù hợp.

Documentation:

- README Backend setup.
- Supabase setup.
- Migration/seed.
- R2 setup.
- Mux webhook.
- Resend/domain.
- Turnstile.
- Upstash.
- Vercel environment.
- Backup/restore.
- Docker deployment path.

### Acceptance criteria

Các lệnh thực tế phải đạt:

```bash
npm run lint
npm run type-check
npm run build
npm run test
```

Nếu chưa có test script hoặc một test phụ thuộc external credential, báo chính xác và cung cấp cách chạy; không báo Passed giả.

---

# 20. Test requirements

## 20.1. Unit tests

Tối thiểu cho:

- Slug normalization và uniqueness rule.
- Post publish/schedule validation.
- Campaign active rule.
- Campaign limit/duplicate rule.
- Permission matrix.
- Media MIME/size validation.
- Analytics event allowlist.
- CSV cell sanitization.
- DTO mappers.

## 20.2. Integration tests

Ưu tiên:

- Repository create/read/update.
- Server Action unauthorized/forbidden/success.
- Contact endpoint validation.
- Campaign submission transaction.
- Mux webhook signature và idempotency.
- R2 upload completion verify.

## 20.3. E2E tests

Các luồng quan trọng:

```text
Admin login
Create draft post
Publish post
Public can view post
Unpublish post
Upload image
Create campaign
Submit campaign form
Admin views submission
```

Không bắt buộc E2E gọi thật Mux/R2 production; có thể dùng test provider hoặc sandbox/mock adapter có kiểm soát.

---

# 21. Security requirements

## 21.1. Secret management

- Không commit `.env.local`.
- Không commit credential.
- Không đặt secret trong `NEXT_PUBLIC_*`.
- Không gửi secret trong action result.
- Không log secret.
- Có hướng dẫn rotate key.

## 21.2. Input validation

- Zod ở server boundary.
- Giới hạn string length.
- Normalize URL/email/slug.
- Không render HTML chưa sanitize.
- Content block chỉ cho type trong allowlist.
- External URL chỉ cho protocol hợp lệ.

## 21.3. Authorization

- Default deny.
- Permission check nằm server-side.
- Viewer không mutation.
- Editor không quản lý role/settings nhạy cảm.
- Super admin operations có audit log.

## 21.4. File upload

- Allowlist MIME.
- Allowlist extension.
- Size limit.
- Random object key.
- Không executable.
- Không SVG mặc định.
- Không public attachment nhạy cảm.

## 21.5. Webhook

- Verify signature.
- Idempotency.
- Raw body handling đúng provider.
- Không trust event metadata chưa verify.

## 21.6. Public forms

- Turnstile server verification.
- Rate limit.
- Generic error khi cần tránh enumeration.
- Không expose database error.

---

# 22. Performance requirements

- Public page ưu tiên Server Components.
- Không fetch lại cùng dữ liệu nhiều lần trong một request nếu có thể memoize hợp lý.
- Không tạo N+1 query cho post tags/media/author.
- Pagination cho Admin table.
- Pagination/load more cho dataset lớn.
- Analytics aggregate server-side.
- Không proxy media lớn.
- `next/image` có `sizes` đúng.
- Mux Player lazy load khi phù hợp.
- Không tạo hydration mismatch.
- Không thêm Redux chỉ để cache server data.

---

# 23. Accessibility và UX khi nối Backend

Mọi UI Backend mới phải giữ:

- Label cho form.
- Field error gần input.
- Focus state.
- Keyboard navigation.
- Dialog title.
- Loading state.
- Disabled state.
- Empty state.
- Error state.
- Success feedback.
- Confirmation cho destructive action.
- Upload progress có text, không chỉ màu.
- Processing video có trạng thái dễ hiểu.

Không dùng toast làm cách duy nhất báo lỗi field.

---

# 24. Deployment strategy

## 24.1. Giai đoạn đầu

```text
Vercel
+ Supabase PostgreSQL/Auth
+ Cloudflare R2
+ Mux
+ Resend
+ Cloudflare Turnstile
+ Upstash Redis
```

## 24.2. Vercel requirements

- Cấu hình toàn bộ environment variables.
- Mux webhook trỏ đến domain production ổn định.
- `NEXT_PUBLIC_SITE_URL` là canonical domain.
- Không dùng preview URL làm canonical.
- Database dùng pooled URL cho runtime nếu cần.
- Migration chạy ở bước kiểm soát riêng, không chạy trong request.

## 24.3. Khả năng chuyển server

Kiến trúc phải cho phép:

- Build Docker image.
- Chạy `next start` trên Node server.
- Chuyển Postgres provider.
- Chuyển R2 sang S3-compatible provider khác.
- Chuyển Resend sang SMTP adapter.
- Tách analytics ingest thành service riêng.
- Tách video webhook thành worker/service riêng.

Không hardcode Vercel-specific API trong domain service nếu có phương án trung lập.

---

# 25. README sau Backend

README phải cập nhật:

1. Trạng thái Frontend và Backend.
2. Kiến trúc.
3. Dependencies.
4. Local setup.
5. Supabase setup.
6. Environment variables.
7. Database migration.
8. Seed.
9. Auth Admin.
10. R2 setup và CORS.
11. Mux setup và webhook.
12. Resend domain.
13. Turnstile keys.
14. Upstash setup.
15. Analytics.
16. Test.
17. Vercel deployment.
18. Backup/restore.
19. Security notes.
20. Mock fallback và thời điểm tắt fallback.

---

# 26. Quy tắc làm việc bắt buộc cho AI Agent

1. Đọc toàn bộ tài liệu trước khi sửa code.
2. Đọc `AGENTS.md` và local Next.js docs.
3. Kiểm tra repository thực tế, không giả định cấu trúc từ tài liệu cũ.
4. Không dựng lại Frontend.
5. Không đổi route hiện có nếu không có migration rõ ràng.
6. Không thay UI framework.
7. Không hạ Next.js hoặc React.
8. Không nâng dependency hiện có nếu không cần.
9. Chỉ thêm dependency trong phạm vi giai đoạn.
10. Không thực hiện nhiều giai đoạn trong một lần.
11. Không chuyển sang giai đoạn sau khi chưa được yêu cầu.
12. Không xóa mock data sớm.
13. Không dùng `any` hoặc `as any` để che lỗi.
14. Không bỏ auth/permission để làm nhanh.
15. Không expose service key.
16. Không query database trong Client Component.
17. Không upload media qua server nếu có direct upload.
18. Không báo build Passed khi chưa chạy hoặc đang Failed.
19. Không chạy destructive migration nếu chưa được cho phép.
20. Không tạo file rỗng hoặc placeholder không dùng.
21. Không để TODO cho yêu cầu thuộc giai đoạn đang làm.
22. Nếu provider credential chưa có, hoàn thành code, test unit và báo rõ phần integration chưa thể xác minh.
23. Mọi quyết định khác tài liệu phải được ghi trong báo cáo.
24. Mọi schema change phải có migration.
25. Mọi action private phải có permission check.
26. Mọi public form phải có server validation.
27. Mọi webhook phải verify signature.
28. Mọi content public phải lọc trạng thái server-side.
29. Mọi mutation quan trọng phải revalidate cache phù hợp.
30. Mọi external provider phải nằm sau adapter/interface.

---

# 27. Báo cáo chuẩn sau mỗi giai đoạn

AI Agent phải trả về:

```text
## Giai đoạn đã thực hiện

## Phạm vi hoàn thành

## Files created

## Files updated

## Dependencies added

## Database/migration changes

## Environment variables added

## Security decisions

## Compatibility with existing FE

## Commands executed

Lint: Passed / Failed / Not run
Type-check: Passed / Failed / Not run
Build: Passed / Failed / Not run
Tests: Passed / Failed / Not available / Not run

## Known limitations

## Manual configuration required

## Not implemented in this stage
```

Nếu lệnh Failed, phải nêu lỗi thật và không được đổi thành Passed.

---

# 28. Definition of Done cho Backend toàn dự án

Dự án chỉ được xem là hoàn thành Backend giai đoạn 11–21 khi:

## Authentication

- Admin login thật.
- Session hoạt động.
- Logout hoạt động.
- Admin route được bảo vệ.
- RBAC server-side hoạt động.

## Database

- Schema có migration.
- Seed dữ liệu mock thành công.
- Public content đọc database.
- Admin CRUD ghi database.
- Không còn phụ thuộc local state cho dữ liệu production.

## Content

- Posts CRUD thật.
- Social links CRUD thật.
- Videos CRUD thật.
- Gallery CRUD thật.
- Events CRUD thật.
- Campaigns CRUD thật.
- Site settings lưu server thật.

## Media

- Upload ảnh/tài liệu trực tiếp R2.
- Media Library.
- Reference-safe delete.
- Video Direct Upload đến Mux.
- Webhook verify.
- Video ready phát được.

## Forms

- Contact lưu database.
- Newsletter lưu database.
- Campaign submission lưu database.
- Turnstile server verify.
- Rate limit.
- Email notification.
- Admin xem/export data theo quyền.

## Analytics

- Event ingest thật.
- Event allowlist.
- Aggregation.
- Dashboard charts.
- Date filters.
- Privacy limitation được ghi rõ.

## Security

- Không secret leak.
- Không broken access control đã biết.
- Upload validation.
- Webhook signature.
- CSV injection protection.
- Audit log cho mutation quan trọng.

## Quality

```bash
npm install
npm run lint
npm run type-check
npm run build
npm run test
```

phải chạy thành công trong môi trường được cấu hình đầy đủ, hoặc test phụ thuộc external sandbox phải có hướng dẫn và báo cáo chính xác.

## Deployment

- Vercel deploy thành công.
- Supabase connection hoạt động.
- R2 upload hoạt động.
- Mux webhook hoạt động.
- Resend email hoạt động.
- Turnstile hoạt động.
- Upstash rate limit hoạt động.
- Canonical URL, sitemap và robots đúng production.

---

# 29. Những phần vẫn nằm ngoài phạm vi giai đoạn 11–21

Không bắt buộc triển khai:

- Thanh toán trực tuyến.
- Fan account/membership.
- Bình luận thời gian thực.
- Chat trực tiếp.
- Social API tự đồng bộ follower.
- Lịch đăng tự động lên mạng xã hội.
- Livestream infrastructure riêng.
- Recommendation engine.
- Mobile app.
- Multi-tenant CMS.
- Multi-language CMS hoàn chỉnh.
- Workflow phê duyệt nhiều cấp phức tạp.
- Marketing broadcast automation đầy đủ.

Các tính năng này phải được thiết kế ở giai đoạn sau, không tự ý đưa vào Backend hiện tại.

---

# 30. Prompt khởi động chuẩn cho từng giai đoạn

Khi bắt đầu bất kỳ giai đoạn Backend nào, dùng mẫu sau:

```text
Đọc toàn bộ PROJECT_SPEC.md, AGENTS.md, CLAUDE.md, README.md và kiểm tra repository hiện tại.

Chỉ thực hiện GIAI ĐOẠN <SỐ VÀ TÊN GIAI ĐOẠN> trong PROJECT_SPEC.md.

Yêu cầu:

1. Không thực hiện giai đoạn khác.
2. Không dựng lại hoặc thay đổi thiết kế Frontend hiện tại ngoài phần thật sự cần để kết nối Backend.
3. Giữ tương thích các route và TypeScript DTO hiện có.
4. Đọc local Next.js docs trong node_modules/next/dist/docs/ trước khi dùng API Next.js có thể đã thay đổi.
5. Trực tiếp tạo và chỉnh sửa source code trong phạm vi giai đoạn.
6. Không dùng any/as any để che lỗi.
7. Không expose secret.
8. Không bỏ authentication/authorization/validation để làm nhanh.
9. Chạy lint, type-check và production build sau khi hoàn thành.
10. Chạy test thuộc phạm vi giai đoạn nếu đã có.
11. Tự sửa lỗi thuộc phạm vi giai đoạn.
12. Báo cáo theo format trong PROJECT_SPEC.md.
13. Sau báo cáo, dừng lại.
```

---

# 31. Tóm tắt trạng thái dự án

```text
Giai đoạn 0–10:
Đã hoàn thành Frontend public, responsive, SEO cơ bản và Admin Dashboard demo.

Giai đoạn 11:
Audit Backend.

Giai đoạn 12:
PostgreSQL + Drizzle schema/migration.

Giai đoạn 13:
Supabase Auth + RBAC.

Giai đoạn 14:
Repository + Service + Mapper + Seed.

Giai đoạn 15:
Posts/Categories/Tags/Social CRUD.

Giai đoạn 16:
Cloudflare R2 + Media Library.

Giai đoạn 17:
Mux Video.

Giai đoạn 18:
Gallery/Events/Campaigns/Site Settings.

Giai đoạn 19:
Contact/Newsletter/Campaign Submission/Email/Turnstile/Rate Limit.

Giai đoạn 20:
Analytics + Admin Visualization.

Giai đoạn 21:
Security/Test/Production Hardening.
```

Đây là đặc tả chuẩn để AI Agent tiếp tục phát triển Backend trên source hiện tại mà không dựng lại Frontend hoặc làm sai cấu trúc repository.
