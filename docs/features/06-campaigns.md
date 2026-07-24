# Campaigns

## Người dùng sử dụng

- `/campaigns`: xem các campaign public được nhóm theo trạng thái hiệu lực.
- `/campaigns/[slug]`: xem banner, countdown, rules, terms, CTA và form tham gia.
- `draft` không xuất hiện public hoặc sitemap.

## Quản trị

Tại `/admin/campaigns`:

- Tạo/sửa/archive.
- Chọn banner từ Media Library hoặc tải banner mới từ máy ngay trong picker.
- Đặt start/end, status, featured.
- Start/end dùng picker ngày giờ tiếng Việt, chọn giờ theo bước 5 phút và chuyển về ISO trước khi gọi Action.
- Đặt CTA label/URL.
- Quản lý rules/terms.
- Bật/tắt submission và đặt giới hạn.

## Source ownership

| Vai trò | Source |
| --- | --- |
| Routes/UI | `src/app/campaigns/*`, `src/components/campaigns/*`, `home/ActiveCampaignSection.tsx` |
| Public facade | `src/services/campaign.service.ts` |
| Actions | `campaigns.actions.ts`, `submissions.actions.ts` |
| Services | `campaigns.service.ts`, `submissions.service.ts` |
| Repositories | `campaigns.repository.ts`, `submissions.repository.ts` |
| Schema/type | `schema/campaigns.ts`, `schema/submissions.ts`, `types/campaign.ts` |
| Config/mock | `config/campaign.config.ts`, `data/campaigns.ts` |

## Effective status

`getEffectiveCampaignStatus`:

- status DB `draft` -> `draft`
- `now < startAt` -> `upcoming`
- `now >= endAt` -> `ended`
- còn lại -> `active`

UI danh sách/detail phải dùng logic này thay vì tự tính phiên bản khác.

## Campaign business rules

- Title 3–180, description 10–5.000.
- Slug unique case-insensitive.
- Banner public ready image.
- End sau start.
- `upcoming`: start tương lai.
- `active`: start <= now < end.
- `ended`: end quá khứ.
- Rules và terms mỗi danh sách tối đa 50 item.
- CTA URL nếu có là internal path hoặc HTTP(S) theo validator service.
- Submission limit nếu có phải positive; khi tắt submissions thì limit được lưu null.
- Draft edit cần `content:write`; trạng thái public/archive cần `content:publish`.

## Submission concurrency

Service dùng transaction/lock:

1. Resolve campaign theo slug.
2. Khóa luồng kiểm tra/insert.
3. Xác nhận active, đang trong time range, submission enabled.
4. Đếm submission và kiểm tra limit.
5. Insert; unique `(campaign_id, email_normalized)` chống trùng.

Duplicate trả `{created:false}`; không tạo record thứ hai.

## Revalidation và analytics

- Mutation revalidate admin, list/detail, homepage và sitemap.
- Detail ghi `campaign_view`.
- CTA có thể ghi `campaign_click`.
- Submit thành công ghi `campaign_submit` ở server.

## Tránh lặp code và kiểm tra

- Dùng `CampaignCard`, `CampaignGroup`, `CampaignParticipation`, `CampaignRegistrationForm`, `Countdown`.
- Không tính status bằng logic mới trong component.
- Không kiểm tra limit chỉ ở client.

Kiểm tra boundary start/end, hydration countdown, duplicate email, limit cạnh tranh, Turnstile/rate limit và 404 draft.

Kiểm tra banner tải mới dùng purpose `campaign_banner`, được confirm vào Media Library và tự động gắn vào campaign form.
