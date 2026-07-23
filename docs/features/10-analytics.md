# Analytics

## Mục tiêu

Analytics nội bộ đo page/content view, social/campaign click và conversion mà không lưu nội dung form hoặc định danh thô.

## Event types

- `page_view`
- `post_view`
- `video_view`
- `social_click`
- `campaign_view`
- `campaign_click`
- `campaign_submit`
- `contact_submit`
- `newsletter_submit`

Client allowlist là subset phù hợp cho browser; conversion form được ghi ở server sau persistence thành công.

## Người dùng và consent

`AnalyticsProvider`:

- kiểm tra `NEXT_PUBLIC_ANALYTICS_ENABLED`
- yêu cầu consent
- lưu consent theo storage key
- tạo anonymous session UUID trong `sessionStorage`
- gửi event bằng helper `src/lib/analytics.ts`

Không dùng analytics helper khác hoặc gọi `fetch` trực tiếp nếu event hiện có đã hỗ trợ.

## Ingest flow

```text
Client interaction
-> POST /api/analytics/events
-> content length <= 4096
-> same-origin check
-> request context + country hint
-> Zod allowlist
-> rate limit
-> sanitize path/referrer/UTM/metadata
-> hash anonymous session
-> insert raw event + update daily aggregate
```

Server conversions gọi `recordServerAnalyticsEventSafely`; lỗi analytics không làm hỏng nghiệp vụ chính.

## Privacy rules

Không lưu:

- email
- phone
- full name
- message/form content
- password/token/secret
- full IP

Anonymous session trong DB là SHA-256 hash. Referrer chỉ giữ domain. Metadata có allowlist/size limits.

## Admin dashboard

`/admin`:

- yêu cầu `dashboard:view`
- nếu thiếu `analytics:view`, không query dashboard chi tiết
- hỗ trợ date range
- hiển thị totals/trend/breakdown/recent events
- dùng uPlot cho chart

Dashboard ghi “ước tính phiên duy nhất”; không mô tả hash session là user identity.

## Storage và retention

- `analytics_events`: raw events.
- `daily_analytics`: aggregate theo date/metric/entity/dimensions hash.
- Raw retention mặc định 90 ngày.
- Chạy `npm run analytics:retention` bằng scheduler production.
- Daily aggregate không bị xóa bởi raw retention command.

## Source ownership

- Client: `components/analytics/*`, `components/home/AnalyticsLink.tsx`, `lib/analytics.ts`.
- Config: `config/analytics.config.ts`.
- Route: `app/api/analytics/events/route.ts`.
- Service/repository: `analytics.service.ts`, `analytics.repository.ts`.
- Schema: `schema/analytics.ts`.
- Dashboard: admin page, `AdminDashboard`, `AdminAnalyticsChart`.

## Thêm event mới

1. Xác định browser hay server event.
2. Cập nhật config allowlist/type.
3. Cập nhật service validation/aggregation.
4. Thêm tracking tại canonical interaction, không ở nhiều component.
5. Xác minh payload không có PII.
6. Cập nhật dashboard nếu cần.
7. Thêm test ingest/security/aggregate.

```bash
npm run analytics:test
npm run test:security
```

