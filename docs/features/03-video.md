# Video

## Người dùng sử dụng

- `/videos`: xem video nổi bật, lọc platform/topic.
- Card giữ orientation landscape/portrait.
- External video chỉ mở khi click.
- Internal video dùng Mux playback; không autoplay.
- Dialog phát video giới hạn theo viewport và tự cuộn nội dung trên màn hình thấp, không kéo trang nền.

## Quản trị

Tại `/admin/videos`:

- Tạo external video cho YouTube/TikTok/Instagram/Facebook.
- Upload video internal trực tiếp lên Mux.
- Chọn thumbnail từ Media Library hoặc tải ảnh thumbnail mới từ máy ngay trong picker.
- Sửa metadata, publish/unpublish, featured và delete.
- Xem processing state/error của Mux.
- Bảng video gọi `GET /api/admin/videos` theo trang, mặc định 10 dòng và cho chọn 10/20/50. Search/trạng thái được áp dụng trước `COUNT`; repository dùng `LIMIT/OFFSET` và `ORDER BY` allowlist, mặc định `updatedAt desc`. Polling trạng thái Mux chỉ tải lại trang hiện tại.

## Source ownership

| Vai trò | Source |
| --- | --- |
| Public route/UI | `src/app/videos/page.tsx`, `src/components/videos/*` |
| Admin UI | `AdminVideosManager`, `AdminVideoEditorModal`, `AdminVideoUploadPanel` |
| Public facade | `src/services/video.service.ts` |
| Action/API | `videos.actions.ts`, `GET /api/admin/videos`, `/api/uploads/video-url`, `/api/webhooks/mux` |
| Service | `src/server/services/videos.service.ts` |
| Provider | `src/server/video/*` |
| Validation | `src/server/validation/videos.validation.ts` |
| Repository/schema | `videos.repository.ts`, `schema/videos.ts` |
| Types/mock | `types/video*.ts`, `data/videos.ts` |

## External video rules

- Platform khác `internal` bắt buộc có HTTP(S) `externalUrl`.
- Title 3–180, description tối đa 2.000, topic 1–100.
- Orientation chỉ `landscape|portrait`.
- Internal video không được nhận external URL.

## Mux direct-upload flow

1. UI gửi filename, MIME, size và metadata tới `/api/uploads/video-url`.
2. Service kiểm tra `media:manage`, extension/MIME, tối đa 5 GB.
3. Service tạo video row và Mux direct upload có `passthrough=videoId`.
4. Browser upload trực tiếp lên URL của Mux.
5. Mux gọi `/api/webhooks/mux`.
6. Route đọc raw body, verify `mux-signature`, sau đó mới process.
7. `video_webhook_events.event_id` bảo đảm idempotency.
8. Ready event cập nhật asset/playback/duration/aspect ratio; failed event lưu lỗi.

MIME: MP4/M4V, MOV, WebM, MKV.

## Delete

- External video có thể soft-delete record.
- Internal video cần explicit confirmation trước khi xóa provider asset.
- Service kiểm tra quyền và trạng thái; UI không được tự suy luận đã xóa provider.

## Environment

- `MUX_TOKEN_ID`
- `MUX_TOKEN_SECRET`
- `MUX_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL` cho CORS origin

## Tránh lặp code

- Dùng `VideoPlaybackTrigger` cho lazy playback.
- Dùng `VideoCard`/`FeaturedVideo`.
- Mọi Mux SDK call phải nằm sau `VideoProvider`, không gọi trong component/route mới.
- Webhook phải dùng service idempotent hiện có.

## Kiểm tra

```bash
npm run video:test
npm run test:security
npm run type-check
```

Test thủ công ready/failed/duplicate event, signature sai, external URL và playback mobile.

Thumbnail tải từ picker dùng purpose `post_thumbnail`, được confirm vào Media Library và tự động gắn vào form video; việc này không thay đổi direct-upload flow của file video lên Mux.
