# Hướng dẫn cấu hình biến môi trường Production

Tài liệu này là runbook thiết lập môi trường production cho Quang Official. Không sao chép secret thật vào tài liệu, Git, ticket, chat hoặc log.

## 1. Mục tiêu

Production hoàn chỉnh của dự án sử dụng:

- Domain HTTPS chính thức.
- PostgreSQL/Supabase ở database mode.
- Supabase Authentication.
- Cloudflare R2 cho ảnh/media.
- Mux cho video.
- Cloudflare Turnstile và Upstash cho chống abuse.
- Resend cho email.
- Internal analytics có consent và retention.

File `.env.example` chỉ là danh sách/template. Secret production nên được nhập trực tiếp vào Vercel/secret manager hoặc CI migration environment, không tạo và commit `.env.production`.

## 2. Template production khuyến nghị

Thay toàn bộ giá trị `replace-*` và domain ví dụ bằng giá trị thật.

```env
# Application
NEXT_PUBLIC_SITE_URL=https://example.com
USE_DATABASE_CONTENT=true

# Bắt đầu bằng false trong lần deploy đầu.
# Chuyển true sau khi privacy/consent và retention scheduler đã sẵn sàng.
NEXT_PUBLIC_ANALYTICS_ENABLED=false

# PostgreSQL runtime — Supavisor Transaction Pooler
DATABASE_URL=postgresql://replace-runtime-pooler-url
DATABASE_POOL_MAX=2

# Chỉ cần trong migration job/runner, không cần ở app runtime bình thường
DIRECT_DATABASE_URL=postgresql://replace-direct-or-session-pooler-url

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://replace-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=replace-publishable-key
SUPABASE_SECRET_KEY=replace-secret-key

# Legacy fallback — bỏ hai dòng này nếu đã dùng preferred keys phía trên
# NEXT_PUBLIC_SUPABASE_ANON_KEY=replace-anon-key
# SUPABASE_SERVICE_ROLE_KEY=replace-service-role-key

# Initial Admin — steady-state production luôn false
BOOTSTRAP_ADMIN_ENABLED=false

# Cloudflare R2
R2_ACCOUNT_ID=replace-account-id
R2_ACCESS_KEY_ID=replace-access-key-id
R2_SECRET_ACCESS_KEY=replace-secret-access-key
R2_BUCKET_NAME=replace-bucket-name
R2_PUBLIC_BASE_URL=https://media.example.com
MEDIA_ORPHAN_MIN_AGE_HOURS=24

# Mux
MUX_TOKEN_ID=replace-token-id
MUX_TOKEN_SECRET=replace-token-secret
MUX_WEBHOOK_SECRET=replace-webhook-signing-secret

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=replace-site-key
TURNSTILE_SECRET_KEY=replace-secret-key

# Resend
RESEND_API_KEY=replace-api-key
RESEND_FROM_EMAIL="Quang Official <no-reply@example.com>"
CONTACT_NOTIFICATION_EMAIL=hello@example.com

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://replace-upstash-endpoint
UPSTASH_REDIS_REST_TOKEN=replace-upstash-token
```

Không thêm `NODE_ENV`; Next.js/Vercel tự đặt `production`.

Hai biến `AUTH_TEST_PROTECTED_PATH` và `AUTH_TEST_PROTECTED_STATUS` chỉ là test override, không cần ở application runtime.

## 3. Biến nào bắt buộc

| Nhóm | Biến | Production |
| --- | --- | --- |
| Application | `NEXT_PUBLIC_SITE_URL` | Bắt buộc, domain HTTPS canonical |
| Content | `USE_DATABASE_CONTENT` | Bắt buộc `true` |
| Analytics | `NEXT_PUBLIC_ANALYTICS_ENABLED` | Đặt rõ `true` hoặc `false` |
| Database | `DATABASE_URL` | Bắt buộc ở runtime |
| Database | `DATABASE_POOL_MAX` | Khuyến nghị `2` trên serverless |
| Migration | `DIRECT_DATABASE_URL` | Bắt buộc ở migration runner |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL` | Bắt buộc |
| Supabase | Một public/publishable key | Bắt buộc |
| Supabase | Một secret/service-role key | Bắt buộc cho admin/bootstrap/test đặc quyền |
| R2 | Toàn bộ `R2_*` | Bắt buộc nếu dùng Media Library |
| Mux | Toàn bộ `MUX_*` | Bắt buộc nếu upload/phát video internal |
| Turnstile | Site key + secret key | Bắt buộc cho public forms |
| Upstash | REST URL + token | Bắt buộc; production không fallback memory |
| Resend | API key/from/notification email | Bắt buộc để email hoạt động |
| Bootstrap | `BOOTSTRAP_ADMIN_ENABLED` | Bình thường phải là `false` |

## 4. Giá trị boolean production

### `USE_DATABASE_CONTENT`

```env
USE_DATABASE_CONTENT=true
```

Production phải dùng PostgreSQL. Nếu đặt `false`, public pages đọc fixture mock dù Admin vẫn ghi database.

Chỉ dùng lowercase `true` hoặc `false`; giá trị khác làm ứng dụng fail fast.

### `NEXT_PUBLIC_ANALYTICS_ENABLED`

Lần deploy đầu an toàn:

```env
NEXT_PUBLIC_ANALYTICS_ENABLED=false
```

Chuyển thành:

```env
NEXT_PUBLIC_ANALYTICS_ENABLED=true
```

chỉ sau khi:

- Nội dung Privacy/consent đã được review.
- Consent banner được kiểm thử.
- Database analytics đúng environment.
- Có scheduler chạy `npm run analytics:retention`.
- Dashboard và chính sách lưu raw event 90 ngày đã được xác nhận.

Chỉ lowercase chính xác `false` mới tắt analytics. Vì là biến `NEXT_PUBLIC_*`, đổi giá trị phải rebuild/redeploy.

### `BOOTSTRAP_ADMIN_ENABLED`

Steady-state production:

```env
BOOTSTRAP_ADMIN_ENABLED=false
```

Chỉ đặt `true` tạm thời trong secure one-time bootstrap khi Supabase Auth hoàn toàn chưa có user. Sau khi thành công:

1. Đổi lại `false`.
2. Xóa `BOOTSTRAP_ADMIN_PASSWORD` khỏi environment.
3. Đổi mật khẩu Admin.
4. Redeploy nếu biến nằm trong Vercel Production environment.

Không bật bootstrap thường trực trên serverless instances.

## 5. Phân chia environment giữa Vercel và migration runner

### Vercel Production environment

Đặt:

- Tất cả biến application/runtime.
- Supabase public và server keys.
- R2, Mux, Turnstile, Resend, Upstash.
- `DATABASE_URL`.
- `DATABASE_POOL_MAX=2`.
- `BOOTSTRAP_ADMIN_ENABLED=false`.

`R2_PUBLIC_BASE_URL` phải có ngay lúc build vì `next.config.ts` dùng nó để tạo remote image pattern.

Các biến `NEXT_PUBLIC_*` được đóng gói vào client bundle lúc build, nên mọi thay đổi đều cần redeploy.

### Migration CI/secure runner

Đặt tối thiểu:

- `DIRECT_DATABASE_URL`.
- `DATABASE_URL` nếu cần chạy connection check/pooler fallback.
- Các Supabase admin key khi chạy bootstrap hoặc security tests.

Không cần cấp `DIRECT_DATABASE_URL` cho application runtime nếu migration được chạy ở job riêng.

## 6. Cấu hình domain

### Website canonical

```env
NEXT_PUBLIC_SITE_URL=https://example.com
```

Chỉ dùng origin, không dùng path/query/hash. Chọn một trong `www` hoặc non-`www` làm canonical và redirect domain còn lại.

Biến này ảnh hưởng:

- Metadata/canonical/Open Graph.
- Sitemap và robots.
- Newsletter unsubscribe URL.
- Turnstile hostname verification.
- Mux direct-upload CORS origin.

### Media domain

```env
R2_PUBLIC_BASE_URL=https://media.example.com
```

Domain này phải:

- Trỏ đúng Cloudflare R2 bucket/custom domain.
- Dùng HTTPS.
- Không chứa credential, query hoặc hash.
- Có DNS/SSL hoạt động trước deploy.

### Email domain

```env
RESEND_FROM_EMAIL="Quang Official <no-reply@example.com>"
CONTACT_NOTIFICATION_EMAIL=hello@example.com
```

Domain gửi phải được verify trong Resend.

## 7. Supabase production

### Keys

Ưu tiên keys mới:

```env
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

Chỉ dùng legacy fallback khi project chưa có preferred keys:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Không thêm secret/service-role key vào biến có prefix `NEXT_PUBLIC_`.

### Authentication URL configuration

Trong Supabase Dashboard → Authentication → URL Configuration:

```text
Site URL:
https://example.com

Redirect URL:
https://example.com/auth/callback
```

Thêm localhost/preview callback riêng nếu thật sự sử dụng:

```text
http://localhost:3000/auth/callback
https://preview.example.com/auth/callback
```

Không dùng wildcard rộng cho production nếu không cần.

## 8. PostgreSQL và migration

### Runtime connection

`DATABASE_URL` nên là Supavisor Transaction Pooler:

```env
DATABASE_URL=postgresql://...
DATABASE_POOL_MAX=2
```

### Migration connection

`DIRECT_DATABASE_URL` nên là direct connection hoặc Supavisor Session Pooler.

Trước deploy application:

```bash
npm run db:check
npm run db:migrate
```

Nếu direct hostname không truy cập được nhưng runtime pooler hoạt động:

```bash
npm run db:migrate:pooled
```

Migration phải chạy một lần từ job có khóa/kiểm soát, không chạy đồng thời từ nhiều Vercel instances và không chạy trong request.

## 9. Bootstrap Admin đầu tiên

Không dựa vào Vercel runtime tự chạy bootstrap. Thực hiện từ secure runner hoặc máy quản trị đã nạp production secrets.

Tạm thời đặt:

```env
BOOTSTRAP_ADMIN_ENABLED=true
BOOTSTRAP_ADMIN_EMAIL=admin@example.com
BOOTSTRAP_ADMIN_DISPLAY_NAME=Production Admin
BOOTSTRAP_ADMIN_PASSWORD=replace-one-time-strong-password
```

Sau đó chạy:

```bash
npm run auth:bootstrap
```

Khi thành công:

- Đặt `BOOTSTRAP_ADMIN_ENABLED=false`.
- Xóa `BOOTSTRAP_ADMIN_PASSWORD`.
- Đổi mật khẩu ngay.
- Kiểm tra profile có role `super_admin` và status `active`.

Script sẽ bỏ qua nếu Supabase Auth đã có bất kỳ user nào. Không xóa user để chạy lại bootstrap trên production.

## 10. Cloudflare R2

1. Tạo bucket production.
2. Tạo token chỉ có Object Read & Write trên đúng bucket.
3. Cấu hình custom domain, ví dụ `media.example.com`.
4. Cấu hình CORS chỉ cho origin thật:

```json
[
  {
    "AllowedOrigins": ["https://example.com"],
    "AllowedMethods": ["GET", "HEAD", "PUT"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

5. Đặt toàn bộ biến `R2_*`.
6. Test upload, confirm, render ảnh và xóa asset chưa được tham chiếu.

Không chạy `npm run storage:orphans:delete` nếu chưa xem kết quả audit và chưa có kế hoạch recovery.

## 11. Mux

1. Tạo Mux access token cho production.
2. Đặt `MUX_TOKEN_ID` và `MUX_TOKEN_SECRET`.
3. Tạo webhook:

```text
https://example.com/api/webhooks/mux
```

4. Đặt signing secret webhook vào `MUX_WEBHOOK_SECRET`.
5. Test direct upload, ready, failed, invalid signature và duplicate webhook.

Nếu tạo webhook mới khi đổi domain, signing secret thường thay đổi.

## 12. Turnstile, Upstash và Resend

### Turnstile

- Tạo widget production.
- Allowed hostname: domain canonical và `www` nếu sử dụng.
- Đặt site key và secret key cùng một widget.
- Backend kiểm tra hostname khớp hostname của `NEXT_PUBLIC_SITE_URL`.

### Upstash

- Tạo Redis REST database gần region deploy.
- Đặt REST URL/token.
- Production thiếu Upstash sẽ fail closed cho login/forms có rate limit.

### Resend

- Verify sending domain.
- Hoàn tất SPF/DKIM DNS.
- `RESEND_FROM_EMAIL` phải thuộc verified domain.
- `CONTACT_NOTIFICATION_EMAIL` phải là mailbox nhận được email thật.
- Test cả contact notification và newsletter confirmation/unsubscribe.

## 13. Analytics retention

Khi analytics bật, lên lịch:

```bash
npm run analytics:retention
```

Lệnh cần chạy bằng secure CI/scheduler có source và production database environment. Vercel Cron chỉ gọi HTTP endpoint; repository hiện chưa có protected retention Route Handler, nên không thể trỏ Vercel Cron trực tiếp vào command này nếu chưa bổ sung endpoint/job runner.

Khuyến nghị chạy mỗi ngày một lần. Theo dõi lỗi và không xóa `daily_analytics`.

## 14. Thứ tự triển khai production

1. Chốt domain canonical, media domain và email domain.
2. Tạo Supabase project/database và keys.
3. Tạo R2 bucket/domain/CORS.
4. Tạo Mux token/webhook.
5. Verify Resend domain.
6. Tạo Turnstile widget và Upstash Redis.
7. Nhập production variables vào Vercel/secret manager.
8. Chạy `db:check` và migration từ secure runner.
9. Bootstrap Admin một lần rồi tắt/xóa bootstrap secret.
10. Seed chỉ khi cần nhập fixture ban đầu.
11. Chạy quality/test gate.
12. Deploy application.
13. Chạy smoke checklist.
14. Bật analytics sau khi retention/privacy sẵn sàng.

## 15. Pre-deploy quality gate

```bash
npm run ai:check
npm run lint
npm run type-check
npm run test
npm run build
```

Không deploy nếu migration/security/database tests lỗi.

## 16. Post-deploy smoke checklist

### Public

- `/`, `/blog`, `/videos`, `/gallery`, `/events`, `/campaigns`.
- Dynamic detail route hợp lệ và 404.
- `/robots.txt`, `/sitemap.xml`.
- Canonical/OG URL dùng đúng production domain.
- Theme và responsive.

### Admin/Auth

- Login/logout.
- Account disabled.
- Permission theo role.
- CRUD post/social/video/gallery/event/campaign/settings.

### Providers

- R2 upload và image render.
- Mux upload và webhook ready.
- Contact, newsletter và campaign submission.
- Turnstile hostname.
- Upstash rate limit.
- Resend email delivery.
- Analytics consent/ingest/dashboard nếu bật.

### Headers

- HTTPS/HSTS.
- Admin/auth/API no-store.
- Admin/auth noindex.
- CSP, deny framing và nosniff.

## 17. Secret và rotation

- Không commit `.env.local`, `.env.production` hoặc Vercel env export.
- Không dán secret vào issue/chat/log.
- Secret server không được có prefix `NEXT_PUBLIC_`.
- Rotate ngay khi nghi ngờ lộ.
- Xóa bootstrap password sau sử dụng.
- Dùng token provider với quyền tối thiểu.
- Tách preview/staging/production database và provider resources khi có thể.
- Backup/PITR PostgreSQL và thử restore định kỳ.

## 18. Khi thay đổi domain sau này

Cập nhật:

- `NEXT_PUBLIC_SITE_URL`.
- `R2_PUBLIC_BASE_URL` nếu đổi media domain.
- Turnstile hostnames hoặc key pair.
- `RESEND_FROM_EMAIL`/`CONTACT_NOTIFICATION_EMAIL` nếu đổi email domain.
- Supabase Site URL/Redirect URLs.
- R2 CORS.
- Mux webhook URL; cập nhật `MUX_WEBHOOK_SECRET` nếu webhook mới.
- DNS, SSL và redirect canonical.

Sau đó rebuild/redeploy và chạy lại toàn bộ smoke checklist.
