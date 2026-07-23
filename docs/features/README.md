# Feature documentation

Bộ tài liệu này mô tả cách sử dụng, luồng dữ liệu, source ownership, business rules và checklist mở rộng của từng nhóm tính năng.

## Mục lục

1. [Site shell, homepage và theme](./01-site-shell-home-theme.md)
2. [Blog và taxonomy](./02-blog-taxonomy.md)
3. [Video](./03-video.md)
4. [Gallery và Media Library](./04-gallery-media.md)
5. [Events](./05-events.md)
6. [Campaigns](./06-campaigns.md)
7. [Contact, newsletter và submissions](./07-contact-newsletter-submissions.md)
8. [Authentication và RBAC](./08-auth-rbac.md)
9. [Admin CMS và Site Settings](./09-admin-settings.md)
10. [Analytics](./10-analytics.md)
11. [SEO, legal và accessibility](./11-seo-legal-accessibility.md)
12. [Database, operations và security](./12-database-operations-security.md)

## Cách dùng

- Thành viên mới: chạy `npm run ai:start`, đọc `PROJECT_SPEC.md`, rồi đọc feature mình phụ trách.
- AI agent: tra `docs/ai-map/COMPONENTS.md`, `BACKEND.md` và `SOURCE_INDEX.md` trước khi tạo code.
- Khi contract nghiệp vụ thay đổi: sửa file feature tương ứng ngay trong cùng thay đổi; generated inventory được cập nhật bằng `npm run ai:setup` sau lần sửa source/config cuối.

## Protocol khi thay đổi tính năng

### Tính năng hiện có

1. Đọc file feature trước khi sửa source.
2. Xác định phần usage, source ownership, data flow, business rules, permission, environment hoặc test bị ảnh hưởng.
3. Sửa source và cập nhật chính file feature đó trong cùng thay đổi.
4. Cập nhật `PROJECT_SPEC.md` nếu contract ảnh hưởng toàn hệ thống.
5. Chạy lại `npm run ai:setup` và yêu cầu `npm run ai:check` pass.

### Tính năng mới

1. Tạo `docs/features/NN-feature-name.md`.
2. Thêm link vào mục lục phía trên.
3. Ghi đủ public/admin usage, source ownership, data flow, business rules, permission, environment, reuse points và tests.
4. Cập nhật `PROJECT_SPEC.md`.
5. Thêm domain vào `featureOwnership` trong `scripts/generate-ai-map.mjs`.
6. Sinh lại AI map sau khi implementation hoàn tất.

## Quy ước chung

- “Public facade” là module trong `src/services`, không phải API endpoint.
- “Action” là Server Action trong `src/actions`.
- “Service” là application service trong `src/server/services`.
- Admin luôn dùng database; public read phụ thuộc `USE_DATABASE_CONTENT`.
- Permission hiển thị trên UI không thay thế kiểm tra quyền trong service.
