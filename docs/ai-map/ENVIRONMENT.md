# Environment map

> Generated artifact — source fingerprint: `4d689e1cad1696a94e78ce4e1931bca6d670fb8bbbc18b1ecb89c7509e31fa15`

Không ghi giá trị secret vào tài liệu hoặc log. “Có trong .env.example” chỉ nói biến đã được tài liệu hóa, không có nghĩa là biến luôn bắt buộc trong mọi chế độ.

| Biến | Exposure | Trong .env.example | Được tham chiếu bởi |
| --- | --- | --- | --- |
| `AUTH_TEST_PROTECTED_PATH` | Server only | Có | `scripts/test-auth-flow.mjs` |
| `AUTH_TEST_PROTECTED_STATUS` | Server only | Có | `scripts/test-auth-flow.mjs` |
| `BOOTSTRAP_ADMIN_DISPLAY_NAME` | Server only | Có | `scripts/bootstrap-admin.mjs` |
| `BOOTSTRAP_ADMIN_EMAIL` | Server only | Có | `scripts/bootstrap-admin.mjs`<br>`scripts/test-auth-flow.mjs`<br>`src/server/services/seed.service.ts` |
| `BOOTSTRAP_ADMIN_ENABLED` | Server only | Có | `scripts/bootstrap-admin.mjs` |
| `BOOTSTRAP_ADMIN_PASSWORD` | Server only | Có | `scripts/bootstrap-admin.mjs`<br>`scripts/test-auth-flow.mjs` |
| `CONTACT_NOTIFICATION_EMAIL` | Server only | Có | `src/server/email/resend-provider.ts` |
| `DATABASE_POOL_MAX` | Server only | Có | `src/server/database/client.ts` |
| `DATABASE_URL` | Server only | Có | `scripts/migrate-with-runtime-pooler.mjs`<br>`scripts/test-content-services.ts`<br>`scripts/test-stage19-database.mjs`<br>`src/server/database/client.ts` |
| `DIRECT_DATABASE_URL` | Server only | Có | `drizzle.config.ts` |
| `MEDIA_ORPHAN_MIN_AGE_HOURS` | Server only | Có | `scripts/audit-orphan-media.ts` |
| `MUX_TOKEN_ID` | Server only | Có | `src/server/video/mux-provider.ts` |
| `MUX_TOKEN_SECRET` | Server only | Có | `src/server/video/mux-provider.ts` |
| `MUX_WEBHOOK_SECRET` | Server only | Có | `scripts/test-stage17-video.ts`<br>`src/server/video/mux-provider.ts` |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | Client + server | Có | `src/lib/analytics.ts`<br>`src/server/services/analytics.service.ts` |
| `NEXT_PUBLIC_SITE_URL` | Client + server | Có | `scripts/test-auth-flow.mjs`<br>`scripts/test-stage16-storage.ts`<br>`scripts/test-stage19-security.ts`<br>`src/app/api/uploads/video-url/route.ts`<br>`src/config/site.config.ts`<br>`src/server/anti-spam/turnstile.ts`<br>`src/server/services/settings.service.ts` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + server | Có | `scripts/test-editor-rls.mjs`<br>`scripts/test-stage15-authorization.mjs`<br>`scripts/test-stage15-content.mjs`<br>`src/server/supabase/browser.ts`<br>`src/server/supabase/middleware.ts`<br>`src/server/supabase/server.ts` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client + server | Có | `scripts/test-editor-rls.mjs`<br>`scripts/test-stage15-authorization.mjs`<br>`scripts/test-stage15-content.mjs`<br>`src/server/supabase/browser.ts`<br>`src/server/supabase/middleware.ts`<br>`src/server/supabase/server.ts` |
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | Có | `scripts/bootstrap-admin.mjs`<br>`scripts/test-editor-rls.mjs`<br>`scripts/test-stage15-authorization.mjs`<br>`scripts/test-stage15-content.mjs`<br>`src/server/supabase/admin.ts`<br>`src/server/supabase/browser.ts`<br>`src/server/supabase/middleware.ts`<br>`src/server/supabase/server.ts` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Client + server | Có | `src/components/common/TurnstileWidget.tsx` |
| `NODE_ENV` | Server only | Không | `next.config.ts`<br>`src/components/providers/ThemeProvider.tsx`<br>`src/server/database/client.ts`<br>`src/server/rate-limit/upstash-rate-limiter.ts` |
| `R2_ACCESS_KEY_ID` | Server only | Có | `src/server/storage/r2-storage.ts` |
| `R2_ACCOUNT_ID` | Server only | Có | `src/server/storage/r2-storage.ts` |
| `R2_BUCKET_NAME` | Server only | Có | `src/server/storage/r2-storage.ts` |
| `R2_PUBLIC_BASE_URL` | Server only | Có | `next.config.ts`<br>`scripts/test-stage16-security.ts`<br>`src/server/storage/r2-storage.ts` |
| `R2_SECRET_ACCESS_KEY` | Server only | Có | `src/server/storage/r2-storage.ts`<br>`src/server/storage/upload-ticket.ts` |
| `RESEND_API_KEY` | Server only | Có | `src/server/email/resend-provider.ts` |
| `RESEND_FROM_EMAIL` | Server only | Có | `src/server/email/resend-provider.ts` |
| `SUPABASE_SECRET_KEY` | Server only | Có | `scripts/bootstrap-admin.mjs`<br>`scripts/test-editor-rls.mjs`<br>`scripts/test-stage15-authorization.mjs`<br>`scripts/test-stage15-content.mjs`<br>`src/server/supabase/admin.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Có | `scripts/bootstrap-admin.mjs`<br>`scripts/test-editor-rls.mjs`<br>`scripts/test-stage15-authorization.mjs`<br>`scripts/test-stage15-content.mjs`<br>`src/server/supabase/admin.ts` |
| `TURNSTILE_SECRET_KEY` | Server only | Có | `scripts/test-stage19-security.ts`<br>`src/server/anti-spam/turnstile.ts` |
| `UPSTASH_REDIS_REST_TOKEN` | Server only | Có | `src/server/rate-limit/upstash-rate-limiter.ts` |
| `UPSTASH_REDIS_REST_URL` | Server only | Có | `src/server/rate-limit/upstash-rate-limiter.ts` |
| `USE_DATABASE_CONTENT` | Server only | Có | `scripts/test-content-services.ts`<br>`src/server/services/content-source.ts` |
