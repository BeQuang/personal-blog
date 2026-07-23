# Site shell, homepage và theme

## Người dùng sử dụng

- Mở `/` để xem hero, social, bài viết/video mới, gallery, events, campaign, newsletter và CTA hợp tác.
- Dùng header/footer để điều hướng.
- Dùng theme toggle để chọn light/dark/system; lựa chọn được lưu ở browser.
- Mobile menu và social dialog là interaction client-side dùng chung.

## Quản trị

- `/admin/settings`: sửa tên site, mô tả, creator, username, email, avatar, cover và SEO mặc định.
- `/admin/appearance`: sửa mode/layout/card/button/colors/border radius và bật/tắt section trang chủ.
- Cả hai màn hình ghi vào `site_settings` qua `updateSiteSettingsAction`; không còn là local-only demo.

## Source ownership

| Vai trò | Source |
| --- | --- |
| Root shell | `src/app/layout.tsx` |
| Homepage | `src/app/page.tsx` |
| Layout UI | `src/components/layout/*` |
| Homepage sections | `src/components/home/*` |
| Theme provider | `src/components/providers/ThemeProvider.tsx` |
| Static fallback | `src/config/site.config.ts`, `theme.config.ts`, `homepage.config.ts` |
| Admin editors | `AdminSettingsForm.tsx`, `AdminAppearanceEditor.tsx` |
| Mutation | `src/actions/settings.actions.ts` |
| Business logic | `src/server/services/settings.service.ts` |
| Persistence | `settings.repository.ts`, `site-settings.ts` |

## Data flow

```text
RootLayout/Home
-> getSiteSettings + getEnabledSocialLinks
-> database khi USE_DATABASE_CONTENT=true, nếu không dùng config/mock
-> Server Components render section
-> interaction boundary hydrate riêng
```

Save flow:

```text
Admin form
-> updateSiteSettingsAction
-> validate settings + permission settings:manage
-> kiểm tra avatar/cover là public ready image
-> upsert singleton settings_key=default
-> revalidate root layout, admin settings/appearance và sitemap
```

## Business rules

- Site name 2–100; description 10–300.
- SEO title 2–100; SEO description 10–300 khi có.
- Color dùng `#RRGGBB`; border radius 0–32.
- Navigation tối đa 30 item và chỉ nhận internal path theo validator hiện tại.
- Avatar/cover phải là image public, status `ready`, chưa xóa.
- Homepage section keys là contract cố định trong `HomepageSectionKey`.

## Tái sử dụng trước khi tạo mới

- Button/link: `components/common/Button.tsx`.
- Container/section title: `Container.tsx`, `SectionHeader.tsx`.
- Navigation: `DesktopNavigation`, `MobileMenu`.
- Social UI: `SocialIcon`, `SocialLinksDialog`.
- Theme state: `ThemeProvider`/`useTheme`; không tạo store theme thứ hai.

## Kiểm tra khi thay đổi

- Light/dark/system không flash sai khi reload.
- Header/footer nhận settings mới sau save.
- Tắt từng homepage section không để khoảng trống.
- Avatar/cover R2 render qua `next/image`.
- Chạy `npm run type-check`, `npm run build` và test responsive.

