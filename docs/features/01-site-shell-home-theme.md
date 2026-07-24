# Site shell, homepage và theme

## Người dùng sử dụng

- Mở `/` để xem hero, social, bài viết/video mới, gallery, events, campaign, newsletter và CTA hợp tác.
- Dùng header/footer để điều hướng.
- Khi chuyển route nội bộ, thanh NProgress ở mép trên và `loading.tsx` cung cấp phản hồi ngay nếu Server Component/API của route chưa hoàn tất.
- Dùng theme toggle để chọn light/dark/system; lựa chọn được lưu ở browser.
- Mobile menu và social dialog là interaction client-side dùng chung.
- Dialog public giới hạn chiều cao theo viewport, khóa cuộn trang nền và dùng vùng cuộn riêng; mobile menu chỉ cuộn phần navigation để header/footer của menu vẫn ổn định.

## Quản trị

- `/admin/settings`: sửa tên site, mô tả, creator, username, email, avatar, cover và SEO mặc định; avatar/cover có thể chọn từ Media Library hoặc tải trực tiếp từ máy trong picker.
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
| Route/API loading | `NavigationProgressProvider.tsx`, `src/lib/loading-progress.ts`, `src/app/loading.tsx` |
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

Loading flow:

```text
Click link / router.push
-> startNavigationProgress
-> NProgress xuất hiện sau 120 ms nếu tác vụ chưa xong
-> loading.tsx hiển thị fallback có ngữ nghĩa trong lúc route stream
-> pathname/search mới được commit
-> NavigationProgressProvider kết thúc progress
```

Các request client kéo dài có thể dùng `beginRequestProgress` hoặc `withLoadingProgress`. Không bọc analytics beacon nền để tránh làm phiền người đọc.

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
- Loading dùng `LoadingState`, `NavigationProgressProvider` và helper `loading-progress`; không tạo progress singleton khác.

## Kiểm tra khi thay đổi

- Light/dark/system không flash sai khi reload.
- Header/footer nhận settings mới sau save.
- Tắt từng homepage section không để khoảng trống.
- Avatar/cover R2 render qua `next/image`.
- Tải avatar/cover từ picker phải tạo asset đúng purpose (`avatar`/`site_banner`), tự động chọn ảnh vừa tải và vẫn lưu settings bằng media ID.
- Route nội bộ chậm có progress, fallback không làm mất shared layout và progress luôn kết thúc khi URL mới được commit.
- Chạy `npm run type-check`, `npm run build` và test responsive.
