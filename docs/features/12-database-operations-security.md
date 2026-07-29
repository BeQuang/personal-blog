# Database, operations và security

## Database connections

- `DATABASE_URL`: runtime app, ưu tiên Supavisor transaction pooler.
- `DIRECT_DATABASE_URL`: migration direct/session pooler.
- `DATABASE_POOL_MAX`: 2 production, 5 development mặc định; range 1–10. Mức 2 đã được xác minh với Supavisor transaction pooler và các route Admin.
- Drizzle client dùng global reuse trong development và `prepare:false`.

Quy tắc pool:

- Không chạy từ ba database operation độc lập trở lên trong cùng một `Promise.all` ở Server page.
- Page cần nhiều read model phải dùng page-data service, kiểm tra quyền một lần và điều phối repository tuần tự.
- `/admin/posts` và `/admin/gallery` là regression cases bắt buộc kiểm tra khi đổi pool hoặc data-loading.

Không import `database/client.ts` từ UI, page, action hoặc mapper; repository là boundary duy nhất.

## Các cờ môi trường quan trọng

### `USE_DATABASE_CONTENT`

- `false`: public pages đọc fixture mock; phù hợp khi phát triển UI không cần database.
- `true`: public pages đọc PostgreSQL; bắt buộc cho staging/production và khi kiểm thử Backend thật.
- Không khai báo/rỗng: tương đương `false`.
- Giá trị ngoài lowercase `true|false`: ứng dụng fail fast.

Admin/private reads và mutations vẫn cần database dù cờ này là `false`.

### Social audience sync

- `YOUTUBE_DATA_API_KEY`: server-only API key cho YouTube Data API v3; giới hạn key theo API và quota trong Google Cloud.
- `CRON_SECRET`: secret dài/ngẫu nhiên để Vercel gửi qua Bearer authorization tới route đồng bộ; route từ chối cả khi biến bị thiếu.
- Không đưa hai biến này vào tên `NEXT_PUBLIC_*`, response, audit payload hoặc log.
- TikTok OAuth hiện bị chặn ở UI, service và Route Handler; các secret TikTok/encryption không bắt buộc cho runtime hiện tại và cron không đọc chúng.

### `BOOTSTRAP_ADMIN_ENABLED`

- `true`: `predev`/`prestart` có thể tạo Admin đầu tiên, nhưng chỉ khi Supabase Auth chưa có user.
- `false`: bỏ qua bootstrap; đây là giá trị bình thường sau khi Admin đầu tiên đã tồn tại.
- Chỉ bật tạm thời trong lần khởi tạo project; sau đó tắt và xóa/rotate bootstrap password.

Không bật lại trên environment đã có người dùng.

## Schema domains

- Auth: `profiles`.
- Content: categories/tags/posts/post_tags.
- Media: media_assets/gallery/videos/webhook events.
- Site: settings/social links.
- Activity: events/campaigns.
- Forms: contact/newsletter/campaign submissions.
- Analytics: raw/daily.
- Audit: audit_logs.

Schema, migration và generated metadata phải thay đổi cùng nhau. Không sửa migration đã chạy trên shared environment; tạo migration mới.

Migration `0010_hot_gravity.sql` bổ sung index cho các thứ tự Admin được dùng thường xuyên: `posts.updated_at`, `videos.updated_at`, `gallery_items.sort_order`, `social_links.sort_order`, `categories.name` và `tags.name`. Migration `0011_shocking_war_machine.sql` bổ sung index `social_links.follower_count` cho sort Followers phía server. Migration `0012_milky_taskmaster.sql` bổ sung metadata nguồn/trạng thái đồng bộ social audience, chuyển YouTube sang `pending` và xóa count không áp dụng cho Email/Website. Khi thêm `sortBy` mới cho list API có dữ liệu tăng trưởng, phải kiểm tra execution plan/index và tạo migration tiếp theo nếu cần.

## Setup local

```powershell
Copy-Item .env.example .env.local
npm install
npm run ai:setup
npm run db:check
npm run db:migrate
npm run db:seed -- --validate-only
npm run db:seed
npm run dev
```

Nếu direct hostname không kết nối nhưng runtime pooler hoạt động, dùng `npm run db:migrate:pooled`.

## Seed

- Validation-only không ghi DB.
- Seed thật idempotent, không update/delete dữ liệu sẵn có.
- Cần active `super_admin` làm post author.
- Fixture mock vẫn được giữ cho `USE_DATABASE_CONTENT=false`.

## Provider production setup

Xem runbook đầy đủ và template production tại [`docs/PRODUCTION_ENVIRONMENT_SETUP.md`](../PRODUCTION_ENVIRONMENT_SETUP.md).

### R2

- Token chỉ có Object Read/Write đúng bucket.
- CORS cho đúng origin và PUT/GET/HEAD + Content-Type.
- Public base URL dùng custom domain nếu có.

### Mux

- Webhook production: `/api/webhooks/mux`.
- Signing secret server-only.
- Test duplicate/out-of-order/error event.

### Resend/Turnstile/Upstash

- Verify sending domain.
- Widget hostname/action đúng canonical site.
- Redis region gần deployment.
- Production không fallback memory limiter.

## Security controls

- CSP, HSTS production, nosniff, deny framing, Permissions Policy.
- API/admin/auth no-store.
- Admin/auth noindex.
- Supabase session refresh và service-side RBAC.
- RLS trên application tables.
- Typed validation/errors.
- Upload presigned + signed ticket + magic bytes.
- Webhook signature + event idempotency.
- Same-origin/size validation cho analytics.
- CSV formula escaping.
- Không log secret/PII/form payload.

## Audit và destructive operations

Repositories ghi audit log cho mutation quan trọng. Khi thêm domain mutation, ghi actor, action, entity và before/after tối thiểu cần thiết; tránh ghi secret/PII dư thừa.

`npm run storage:orphans:delete` có thể xóa object R2. Luôn:

1. Chạy `npm run storage:orphans`.
2. Xem namespace, age threshold và danh sách.
3. Backup/đảm bảo recovery.
4. Mới chạy delete.

## CI/release gate

```bash
npm run ai:check
npm run lint
npm run type-check
npm run test
npm run build
```

Chạy migration bằng job khóa riêng trước deploy, không chạy từ request hoặc nhiều replica. Production cần backup/PITR, restore drill, error monitoring, provider alerts và retention scheduler.

## Schema-change checklist

- Migration forward an toàn.
- Constraint/index/foreign key/on-delete đúng.
- RLS policy cho public/roles/service paths.
- Repository và mapper cập nhật.
- DTO contract và seed/test cập nhật.
- Data backfill strategy.
- Rollout order tương thích app version cũ/mới.
- Feature docs và `npm run ai:setup`.
