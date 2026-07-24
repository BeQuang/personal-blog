# Gallery và Media Library

## Người dùng sử dụng

- `/gallery`: lọc category, mở lightbox, xem caption và điều hướng bằng nút/bàn phím.
- Lightbox giới hạn theo viewport; vùng caption dài cuộn riêng để ảnh và nút điều hướng không đẩy dialog vượt màn hình.
- Trang chủ dùng gallery preview giới hạn số item.
- Chỉ item public/published được render.

## Quản trị

`/admin/gallery` gồm hai phần:

- Gallery manager: tạo/sửa/archive item, category, alt, sort order, status; ảnh có thể chọn từ thư viện hoặc tải mới từ máy ngay trong picker.
- Thời điểm scheduled/published dùng picker ngày giờ dùng chung thay cho input native; contract gửi server vẫn là ISO.
- Media Library: upload, search/filter, chọn media và xóa asset chưa được sử dụng.

## Source ownership

| Vai trò | Source |
| --- | --- |
| Public | `src/app/gallery/page.tsx`, `components/gallery/GalleryExplorer.tsx`, `home/GalleryLightbox.tsx` |
| Admin | `AdminGalleryManager`, `AdminMediaLibrary`, `AdminMediaPicker` |
| Actions | `gallery.actions.ts`, `media.actions.ts` |
| Services | `gallery.service.ts`, `media.service.ts` |
| Storage | `src/server/storage/*` |
| Validation | `src/server/validation/media.validation.ts` |
| Repositories | `gallery.repository.ts`, `media.repository.ts` |
| Schema | `schema/gallery.ts`, `schema/media.ts` |

## Image upload flow

1. Admin chọn file và purpose.
2. `createMediaUploadAction` kiểm tra `media:manage`.
3. Service validate tên, MIME, extension và size.
4. Tạo object key ngẫu nhiên, presigned PUT 5 phút và signed upload ticket gắn user.
5. Browser PUT thẳng R2 với đúng `Content-Type`.
6. Browser gửi ticket + alt + dimensions để confirm.
7. Backend kiểm tra ticket owner/expiry, object metadata, size, MIME và magic signature.
8. Backend ghi `media_assets` status `ready`.
9. Khi upload bắt đầu từ `AdminMediaPicker`, picker thêm asset vừa confirm vào danh sách hiện tại, tự động chọn media ID/URL vào form và không buộc người dùng tải lại trang.

Allowed:

- JPEG/JPG
- PNG
- WebP
- AVIF
- tối đa 10 MB; avatar tối đa 5 MB

Purpose: `avatar`, `campaign_banner`, `event_banner`, `gallery`, `post_cover`, `post_thumbnail`, `site_banner`.

## Gallery rules

- `mediaAssetId` bắt buộc và phải trỏ tới image public ready.
- Title 2–180, caption tối đa 500, category 1–100, alt 3–300.
- Sort order 0–100.000.
- Publish now không nhận thời gian tương lai.
- Scheduled cần thời gian tương lai, nhưng chưa có scheduler tự publish.
- Xóa gallery item không xóa file gốc.

## Media delete rules

- Chỉ xóa asset do R2 quản lý, status ready và chưa soft-delete.
- Repository kiểm tra references từ post/gallery/event/campaign/settings/video.
- Nếu đang dùng, service trả conflict kèm usage.
- Nếu object deletion thất bại, DB restore record để tránh dangling state.
- Audit orphan bằng `npm run storage:orphans`; lệnh delete là thao tác destructive riêng.

## Environment

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL`
- `MEDIA_ORPHAN_MIN_AGE_HOURS`

## Tránh lặp code và kiểm tra

- Mọi màn hình chọn ảnh dùng `AdminMediaPicker`. Component có hai nhánh `Media Library` và `Tải từ máy`; caller bắt buộc truyền đúng `MediaPurpose`.
- `AdminMediaLibrary` và `AdminMediaPicker` cùng dùng `uploadMediaImage`; không nhân đôi validate, presign, PUT R2, đọc dimensions hoặc confirm.
- Không upload binary qua Next.js; giữ direct-to-R2.
- Không tự tạo presigned URL ngoài `MediaStorage`.
- Luôn dùng validator signature hiện có.

Kiểm tra picker tại Posts, Videos, Gallery, Events, Campaigns và Settings: chọn asset có sẵn vẫn hoạt động; upload JPEG/PNG/WebP/AVIF hợp lệ tự chọn asset mới; MIME/size sai hiển thị lỗi; avatar giữ giới hạn 5 MB và các purpose khác giữ giới hạn 10 MB.

```bash
npm run storage:test
npm run storage:test:database
npm run storage:test:security
npm run type-check
```
