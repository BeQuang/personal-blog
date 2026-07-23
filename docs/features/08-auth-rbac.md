# Authentication và RBAC

## Người dùng sử dụng

- `/admin/login`: email/password.
- Login thành công redirect về `next` an toàn trong `/admin`, mặc định `/admin`.
- Admin shell có logout.
- User chưa đăng nhập được redirect về login; account disabled bị từ chối.

## Source ownership

| Vai trò | Source |
| --- | --- |
| Login UI/action | `AdminLoginForm.tsx`, `src/actions/auth.actions.ts` |
| Callback | `src/app/auth/callback/route.ts` |
| Session proxy | `src/proxy.ts`, `src/server/supabase/middleware.ts` |
| Current user | `src/server/auth/current-user.ts` |
| Guards | `require-auth.ts`, `require-permission.ts`, `require-admin-page-permission.ts` |
| RBAC | `src/server/auth/permissions.ts` |
| Profile sync | `src/server/auth/profile-sync.ts` |
| Safe redirect | `src/server/auth/safe-redirect.ts` |
| Bootstrap | `scripts/bootstrap-admin.mjs` |
| Schema/RLS | `schema/profiles.ts`, auth migrations |

## Authentication flow

```text
credentials
-> loginAction validation
-> request fingerprint rate limit 10/15m
-> Supabase signInWithPassword
-> sync auth user to profiles
-> reject disabled
-> safe admin redirect
```

Mỗi request phù hợp matcher đi qua `src/proxy.ts` để refresh Supabase session. `getCurrentUser` dùng `supabase.auth.getUser()` rồi lấy/sync profile và được React `cache` trong request render.

## Roles và permissions

- `super_admin`: tất cả permission.
- `admin`: mọi vận hành nội dung/media/submission/analytics/settings/audit, không có `users:manage`.
- `editor`: dashboard, content read/write, media; không publish.
- `viewer`: dashboard và analytics.

Nguồn sự thật là `permissionMatrix`; không hard-code role check rải rác nếu yêu cầu thực chất là permission.

## Guard usage

- Page: `requireAdminPagePermission(permission)` để redirect khi forbidden.
- Service/Route/Action: `requirePermission` hoặc `requireServicePermission`; authorization failure là typed error.
- UI: `hasPermission` chỉ để quyết định controls, không phải lớp bảo mật.
- Protected admin layout yêu cầu `dashboard:view`.

## Safe redirect

Destination phải:

- bắt đầu `/admin`
- không bắt đầu `//`
- không có backslash
- không trỏ lại `/admin/login`

Không mở rộng sang arbitrary URL.

## Bootstrap

`npm run auth:bootstrap` chỉ tạo super admin khi:

- `BOOTSTRAP_ADMIN_ENABLED=true`
- đủ email/display name/password
- Supabase Auth hoàn toàn chưa có user

Sau lần production đầu: tắt flag, xóa password khỏi environment và đổi mật khẩu.

## Security/extension checklist

- Không dùng service role key trong browser.
- Không đọc cookie thủ công thay Supabase SSR helper.
- Khi thêm permission: cập nhật constant, matrix, page/service guard, navigation visibility, RLS/test và docs.
- User-management UI hiện chưa có; không suy luận `users:manage` đã có màn hình.

```bash
npm run auth:test
npm run auth:test:rls
npm run content:test:authorization
npm run test:security
```

