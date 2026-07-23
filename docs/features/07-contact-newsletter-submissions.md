# Contact, newsletter và submissions

## Người dùng sử dụng

### Contact

`/contact` nhận họ tên, email, phone tùy chọn, company, loại hợp tác, budget và message. Form hiển thị field errors, Turnstile và trạng thái submit.

### Newsletter

Homepage newsletter nhận email + Turnstile. Email confirmation có link `/newsletter/unsubscribe?token=...`.

### Campaign

Campaign detail nhận họ tên, email, phone, followed platform, social username, notes và Turnstile.

## Admin sử dụng

`/admin/submissions` có ba tab/resource:

- Contact submissions.
- Newsletter subscriptions.
- Campaign submissions.

Hỗ trợ search, status filter, campaign filter, pagination, status update và CSV export nếu có quyền.

## Source ownership

| Vai trò | Source |
| --- | --- |
| Public UI | `components/contact/*`, `home/NewsletterForm.tsx`, `campaigns/CampaignRegistrationForm.tsx` |
| Actions | `src/actions/submissions.actions.ts` |
| Admin | `AdminSubmissionsManager.tsx`, admin submissions page |
| Service/repository | `submissions.service.ts`, `submissions.repository.ts` |
| Anti-abuse | `server/anti-spam/*`, `server/rate-limit/*` |
| Email | `server/email/*` |
| CSV | `server/export/safe-csv.ts`, export Route Handler |
| Schema/types | `schema/submissions.ts`, `types/submissions.ts` |

## Validation và limits

### Contact

- Name 2–120.
- Email normalize lowercase.
- Phone nếu có: Việt Nam `+84` hoặc `0`, 9–10 số sau prefix.
- Collaboration type/budget nằm trong config allowlist.
- Message 20–2.000.
- 5 request/15 phút.

### Newsletter

- Email hợp lệ và normalize.
- 5 request/giờ.
- Upsert theo email.
- Token random chỉ gửi qua email; DB lưu SHA-256 hash.

### Campaign

- Name 2–120, phone bắt buộc.
- Platform allowlist: YouTube, TikTok, Instagram, Facebook.
- Social username 2–120, notes tối đa 1.000.
- 5 request/giờ theo slug.
- Campaign phải active/open và chưa đạt limit.

Turnstile token 10–4.096 ký tự; server xác minh action và hostname.

## Persistence và side effects

- Record DB được lưu trước email.
- Email failure chỉ log submission ID + error name, không log payload và không rollback.
- Conversion analytics được ghi từ server.
- Production thiếu Upstash hoặc Turnstile configuration sẽ từ chối submit.
- Contact attachment chưa có trong server input; không thêm UI-only field mà mô tả là đã lưu.

## Status workflow

- Contact: `new`, `read`, `replied`, `spam`, `archived`.
- Campaign: `new`, `reviewing`, `accepted`, `rejected`, `spam`, `archived`.
- Newsletter: `subscribed`, `unsubscribed`, `suppressed`.

## CSV security

- Export cần `submissions:export`.
- Filter được validate lại ở server.
- Tối đa 5.000 dòng mỗi lần.
- Dùng `safe-csv.ts` để escape delimiter/quote và spreadsheet formula; không tự nối CSV bằng string.

## Environment và kiểm tra

- Turnstile site/secret key.
- Upstash REST URL/token.
- Resend API key/from/notification email.

```bash
npm run submissions:test:database
npm run submissions:test:security
npm run analytics:test
npm run type-check
```

