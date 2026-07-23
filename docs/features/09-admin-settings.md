# Admin CMS và Site Settings

## Admin shell

`AdminShell` cung cấp sidebar/navigation, current user, responsive behavior và logout. Ant Design được đăng ký trong admin layout để SSR style đúng; uPlot stylesheet chỉ được nạp ở admin.

Admin navigation hiện có:

- Tổng quan
- Bài viết
- Mạng xã hội
- Video
- Hình ảnh
- Sự kiện
- Chiến dịch
- Hộp thư & đăng ký
- Giao diện
- Cài đặt

## Reusable admin components

Tra các module này trước khi tạo UI CRUD:

- `AdminPageHeader`
- `AdminResourceTable`
- `AdminResourceEditorModal`
- `AdminMediaPicker`
- `AdminMediaLibrary`
- `AdminTaxonomyManager`
- các manager/editor chuyên domain
- `admin-table-columns.tsx`
- `admin-table.config.ts`

Pattern chuẩn:

```text
Server page fetch DTO + current permission
-> Client manager nhận initial data/can*
-> modal/form gọi Server Action
-> Action trả AdminActionResult
-> toast + router.refresh
-> Action revalidate server routes
```

## Site Settings

`/admin/settings` sửa:

- site name/description
- creator name/username/contact email
- avatar/cover media
- SEO title/description

`/admin/appearance` sửa:

- light/dark/system
- creator/minimal/magazine layout
- card/button style
- primary/secondary/accent colors
- border radius
- homepage sections

Cả hai form merge phần contract không hiển thị để tránh ghi mất settings và gọi chung `updateSiteSettingsAction`.

## Social links

`/admin/social-links` quản lý platform, label, username, URL, follower count, description, enabled và sort order. Public chỉ đọc enabled links theo order.

## Server contract

- Settings/social mutation cần `settings:manage`.
- Media picker cần `media:manage`; settings page hiện gọi picker nên role thực tế cần thỏa cả luồng dữ liệu. Admin/super admin có cả hai.
- Settings là singleton `settingsKey=default`.
- Save revalidate root layout, homepage, related admin pages và sitemap.
- Social save revalidate root layout, about và contact.

## Mở rộng admin đúng cách

1. Thêm permission hoặc chọn permission hiện hữu theo capability.
2. Tạo Server page fetch DTO.
3. Tái dùng table/modal/picker.
4. Tạo Action chỉ làm error mapping + revalidation.
5. Đặt validation/authorization/business logic trong service.
6. Đặt query/transaction/audit trong repository.
7. Thêm navigation và page guard.
8. Cập nhật feature docs và AI map.

Không:

- mutate local array rồi gọi đó là CRUD
- gọi Drizzle từ Client Component/Action
- tin `canWrite` từ client
- tạo table/modal generic thứ hai khi component hiện có đáp ứng

## Kiểm tra

- Direct URL theo từng role.
- Controls disabled/hidden và server vẫn chặn request thủ công.
- Save/validation/field error.
- Reload vẫn còn dữ liệu.
- Public route phản ánh revalidation.
- Admin mobile/sidebar.

