# Events

## Người dùng sử dụng

- `/events`: xem và lọc event theo type/status.
- `/events/[slug]`: xem banner, thời gian, timezone, địa điểm/nền tảng, schedule, link ngoài và share.
- Slug không tồn tại trả 404; metadata được tạo theo event.

## Quản trị

Tại `/admin/events`:

- Tạo/sửa/archive event.
- Chọn banner từ Media Library hoặc tải banner mới từ máy ngay trong picker.
- Đặt event status và content status độc lập.
- Nhập start/end/timezone, location hoặc platform, external URL và schedule.
- Start/end dùng picker ngày giờ tiếng Việt, chọn giờ theo bước 5 phút và chuyển về ISO trước khi gọi Action.
- Đánh dấu featured.
- Bảng sự kiện gọi `GET /api/admin/events` theo trang, mặc định 10 dòng và cho chọn 10/20/50. API nhận `sortBy/sortOrder` allowlist; repository trả `COUNT + LIMIT/OFFSET`, mặc định sự kiện mới nhất theo `startAt desc`.

## Source ownership

| Vai trò | Source |
| --- | --- |
| Routes/UI | `src/app/events/*`, `src/components/events/*` |
| Public facade | `src/services/event.service.ts` |
| Action/API | `src/actions/events.actions.ts`, `GET /api/admin/events` |
| Service | `src/server/services/events.service.ts` |
| Repository/mapper | `events.repository.ts`, `events.mapper.ts` |
| Schema/type/config | `schema/events.ts`, `types/event.ts`, `config/event.config.ts` |
| Mock | `src/data/events.ts` |

## Status model

Event status:

- `upcoming`
- `live`
- `ended`
- `cancelled`

Content status:

- `draft`
- `scheduled`
- `published`
- `archived`

Public database query chỉ trả content đã published. `getUpcomingEvents` tiếp tục lọc event status upcoming/live và end/start còn trong tương lai.

## Business rules

- Title 3–180, description 10–5.000.
- Slug unique case-insensitive; bỏ trống sẽ tạo từ title.
- Banner bắt buộc, phải public ready image.
- End nếu có phải sau start.
- `upcoming`: start trong tương lai.
- `live`: khoảng start/end phải bao gồm hiện tại.
- `ended`: có end trong quá khứ.
- Phải có ít nhất location hoặc platform.
- External URL nếu có phải HTTP(S).
- Schedule tối đa 30 item; mỗi item có time/title và description tùy chọn.
- Publish/schedule cần `content:publish`; draft edit cần `content:write`.

## Revalidation

Mutation revalidate `/admin/events`, `/events`, dynamic event page, slug cụ thể, `/` và sitemap.

## Tránh lặp code và kiểm tra

- Dùng `EventExplorer`, `EventCard`, `EventShareButtons`.
- Dùng `assertDateRange`, slug helpers và `AdminMediaPicker`.
- Không gộp event status với content status.

Kiểm tra timezone, boundary start/end, 404, metadata, permission editor và featured event trên homepage.

Kiểm tra banner tải mới dùng purpose `event_banner`, được confirm vào Media Library và tự động gắn vào event form.
