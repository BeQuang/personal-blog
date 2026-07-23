# Database, operations và security

## Database connections

- `DATABASE_URL`: runtime app, ưu tiên Supavisor transaction pooler.
- `DIRECT_DATABASE_URL`: migration direct/session pooler.
- `DATABASE_POOL_MAX`: 1 production, 5 development mặc định; range 1–10.
- Drizzle client dùng global reuse trong development và `prepare:false`.

Không import `database/client.ts` từ UI, page, action hoặc mapper; repository là boundary duy nhất.

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

