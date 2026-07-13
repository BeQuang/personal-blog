# PROJECT_SPEC.md

# Creator Blog & Social Hub

## 1. Tổng quan dự án

Xây dựng một website cá nhân kết hợp giữa:

- Blog cá nhân.
- Trang giới thiệu người sáng tạo nội dung.
- Social Media Hub.
- Link-in-bio nâng cao.
- Trang tổng hợp video, hình ảnh và sự kiện.
- Landing page cho các chiến dịch marketing.
- Trang quản trị để tùy chỉnh nội dung và giao diện.

Website là nơi tập trung toàn bộ thông tin của một cá nhân hoặc nhà sáng tạo nội dung, giúp fan truy cập nhanh để:

- Xem thông tin giới thiệu.
- Truy cập các mạng xã hội.
- Xem bài viết mới.
- Xem video mới.
- Xem hình ảnh nổi bật.
- Theo dõi lịch livestream và sự kiện.
- Tham gia giveaway hoặc chiến dịch marketing.
- Liên hệ hợp tác quảng cáo.

Tên tạm thời của dự án:

```text
Creator Blog Hub
```

Tên thư mục dự án đề xuất:

```text
creator-blog-hub
```

---

# 2. Mục tiêu chính

## 2.1. Mục tiêu người dùng

Người truy cập có thể:

1. Nhận biết nhanh người sáng tạo nội dung là ai.
2. Truy cập Facebook, YouTube, TikTok, Instagram, X và các nền tảng khác.
3. Xem nội dung mới nhất chỉ trong một trang.
4. Xem bài viết theo từng chủ đề.
5. Xem video YouTube, TikTok hoặc Reels.
6. Xem các chiến dịch đang diễn ra.
7. Theo dõi lịch livestream, sự kiện hoặc hoạt động mới.
8. Đăng ký nhận thông báo.
9. Liên hệ hợp tác.

## 2.2. Mục tiêu quản trị

Quản trị viên có thể:

1. Thay đổi tên, mô tả, avatar và ảnh bìa.
2. Thêm, sửa, xóa hoặc ẩn các liên kết mạng xã hội.
3. Đổi màu sắc và phong cách giao diện.
4. Tạo và chỉnh sửa bài viết.
5. Tạo chiến dịch marketing.
6. Chọn bài viết hoặc video nổi bật.
7. Bật hoặc tắt từng section trên trang chủ.
8. Thay đổi thứ tự các section.
9. Theo dõi một số thống kê cơ bản.

---

# 3. Đối tượng sử dụng

## 3.1. Người truy cập

- Fan.
- Người theo dõi trên mạng xã hội.
- Nhãn hàng.
- Đối tác.
- Người muốn tìm hiểu về người sáng tạo nội dung.
- Người tham gia sự kiện hoặc chiến dịch.

## 3.2. Quản trị viên

- Chủ website.
- Người quản lý nội dung.
- Nhân viên marketing.
- Người quản lý mạng xã hội.

---

# 4. Phạm vi triển khai

Dự án được chia thành hai giai đoạn.

## 4.1. Giai đoạn 1 — MVP bắt buộc

Giai đoạn đầu phải tạo được website chạy hoàn chỉnh với dữ liệu mock.

Bao gồm:

- Trang chủ.
- Trang danh sách bài viết.
- Trang chi tiết bài viết.
- Trang video.
- Trang thư viện ảnh.
- Trang sự kiện.
- Trang giới thiệu.
- Trang liên hệ.
- Trang chiến dịch.
- Light mode và Dark mode.
- Responsive cho desktop, tablet và mobile.
- Cấu hình nội dung bằng file TypeScript.
- Dữ liệu bài viết và video dạng mock.
- SEO cơ bản.
- Sitemap.
- Robots.
- Trang 404.
- Build production không lỗi.

Không cần backend thật trong giai đoạn này.

## 4.2. Giai đoạn 2 — Trang quản trị và backend

Chỉ triển khai sau khi giao diện public của MVP đã hoàn thiện.

Bao gồm:

- Đăng nhập quản trị.
- CRUD bài viết.
- CRUD mạng xã hội.
- CRUD video.
- CRUD sự kiện.
- CRUD chiến dịch.
- Trình tùy chỉnh giao diện.
- Upload hình ảnh.
- Database.
- Phân quyền.
- Analytics.
- Form liên hệ gửi dữ liệu thật.
- Email marketing.
- Xuất dữ liệu người tham gia chiến dịch.

---

# 5. Ngoài phạm vi MVP

Trong phiên bản MVP không triển khai:

- Thanh toán trực tuyến.
- Bình luận thời gian thực.
- Chat trực tiếp.
- Đồng bộ follower tự động từ mạng xã hội.
- Đăng nhập dành cho fan.
- Hệ thống tích điểm.
- Hệ thống membership.
- Livestream trực tiếp trên server riêng.
- Backend phức tạp.
- API mạng xã hội có yêu cầu phê duyệt ứng dụng.
- CMS hoàn chỉnh.
- Upload ảnh thật lên cloud.

Các tính năng này có thể được bổ sung trong tương lai.

---

# 6. Công nghệ sử dụng

## 6.1. Công nghệ bắt buộc

```text
Next.js 16
React 19
TypeScript
App Router
Ant Design
Radix UI
Lucide React
Day.js
Axios
CSS Modules hoặc Tailwind CSS
```

## 6.2. Thư viện có thể sử dụng

```text
@reduxjs/toolkit
react-redux
redux-persist
sonner
nprogress
react-spinners
```

## 6.3. Quy tắc thư viện

- Không cài thêm thư viện khi tính năng có thể được triển khai đơn giản bằng React hoặc CSS.
- Không thay Ant Design bằng một UI framework khác.
- Ant Design ưu tiên dùng cho trang quản trị.
- Radix UI dùng cho dialog, popover, tooltip và dropdown.
- Lucide React dùng cho icon chung.
- Không sử dụng nhiều thư viện icon cùng lúc.
- Không sử dụng thư viện animation nặng nếu không cần thiết.
- Ưu tiên CSS transition và CSS animation.

---

# 7. Kiến trúc tổng thể

Website gồm hai khu vực:

```text
Public Website
Admin Dashboard
```

## 7.1. Public Website

Dành cho fan và khách truy cập.

Các route:

```text
/
/blog
/blog/[slug]
/videos
/gallery
/events
/events/[slug]
/campaigns
/campaigns/[slug]
/about
/contact
/privacy
/terms
```

## 7.2. Admin Dashboard

Dành cho quản trị viên.

Các route dự kiến:

```text
/admin
/admin/posts
/admin/posts/new
/admin/posts/[id]
/admin/social-links
/admin/videos
/admin/gallery
/admin/events
/admin/campaigns
/admin/appearance
/admin/settings
```

Trong MVP có thể chỉ tạo giao diện demo cho `/admin`, chưa cần chức năng lưu database thật.

---

# 8. Phong cách thiết kế

## 8.1. Phong cách mặc định

Sử dụng phong cách:

```text
Creator Gradient
```

Đặc điểm:

- Hiện đại.
- Trẻ trung.
- Phù hợp TikTok, YouTube và nội dung giải trí.
- Nền tối hoặc nền trung tính.
- Gradient tím, hồng và xanh.
- Card bo tròn.
- Hiệu ứng ánh sáng nhẹ.
- Tập trung vào hình ảnh và video.
- Không lạm dụng hiệu ứng.
- Nội dung vẫn phải dễ đọc.

## 8.2. Phong cách bổ sung

Hỗ trợ thêm:

```text
Personal Minimal
```

Đặc điểm:

- Nền sáng.
- Nhiều khoảng trắng.
- Card đơn giản.
- Ít đổ bóng.
- Tập trung vào bài viết.
- Phù hợp blog cá nhân và đời sống.

## 8.3. Không được thiết kế theo kiểu

- Quá nhiều gradient.
- Quá nhiều hiệu ứng glow.
- Mỗi section một phong cách khác nhau.
- Dùng màu quá chói gây khó đọc.
- Animation liên tục.
- Giao diện giống dashboard doanh nghiệp.
- Nhồi nhét quá nhiều thông tin trên mobile.

---

# 9. Design System

## 9.1. Màu mặc định

```ts
export const defaultTheme = {
  primary: "#8B5CF6",
  secondary: "#EC4899",
  accent: "#22D3EE",

  background: "#09090B",
  backgroundSecondary: "#18181B",

  surface: "#18181B",
  surfaceHover: "#27272A",

  textPrimary: "#FAFAFA",
  textSecondary: "#A1A1AA",
  textMuted: "#71717A",

  border: "rgba(255, 255, 255, 0.1)",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
};
```

## 9.2. Màu Light Mode

```ts
export const lightTheme = {
  background: "#FFFFFF",
  backgroundSecondary: "#F8FAFC",

  surface: "#FFFFFF",
  surfaceHover: "#F1F5F9",

  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#64748B",

  border: "#E2E8F0",
};
```

## 9.3. Typography

Font mặc định:

```text
Be Vietnam Pro
```

Font dự phòng:

```text
Inter
system-ui
sans-serif
```

Kích thước tham khảo:

```text
Display: 56px
H1: 44px
H2: 36px
H3: 28px
H4: 22px
Body Large: 18px
Body: 16px
Body Small: 14px
Caption: 12px
```

Trên mobile phải giảm kích thước tiêu đề bằng `clamp()`.

## 9.4. Border radius

```text
Small: 8px
Medium: 12px
Large: 20px
Extra Large: 28px
Pill: 999px
```

## 9.5. Container

```text
Desktop maximum width: 1280px
Article maximum width: 800px
Horizontal padding desktop: 32px
Horizontal padding tablet: 24px
Horizontal padding mobile: 16px
```

## 9.6. Khoảng cách

Sử dụng hệ spacing:

```text
4
8
12
16
20
24
32
40
48
64
80
96
```

---

# 10. Responsive Design

Thiết kế theo hướng mobile-first.

## 10.1. Breakpoint tham khảo

```text
Mobile: dưới 640px
Tablet: 640px đến dưới 1024px
Desktop: từ 1024px
Large Desktop: từ 1440px
```

## 10.2. Mobile

Trên mobile:

- Mỗi section chủ yếu hiển thị một cột.
- Card phải đủ lớn để bấm.
- Không để chữ quá nhỏ.
- Không dùng hover làm tương tác duy nhất.
- Menu chuyển thành drawer hoặc mobile navigation.
- Có thể hiển thị bottom navigation.
- Social links phải dễ bấm bằng ngón tay.
- Hero không được chiếm toàn bộ màn hình quá lâu.
- Video dọc phải được tối ưu tốt.
- Không xuất hiện horizontal scroll.

## 10.3. Tablet

- Sử dụng bố cục hai cột khi phù hợp.
- Header có thể vẫn sử dụng menu thu gọn.
- Card bài viết hiển thị hai cột.

## 10.4. Desktop

- Blog có thể hiển thị ba cột.
- Social links có thể hiển thị bốn đến sáu card.
- Hero chia hai cột.
- Video hiển thị ba hoặc bốn card.

---

# 11. Cấu trúc trang chủ

Route:

```text
/
```

Thứ tự mặc định:

```text
Header
Hero
Social Links
Featured Content
Latest Posts
Latest Videos
Gallery Preview
Upcoming Events
Active Campaign
Newsletter
Collaboration CTA
Footer
```

Mỗi section phải có thể bật hoặc tắt thông qua cấu hình.

---

# 12. Header

## 12.1. Nội dung

Header gồm:

- Logo.
- Tên website.
- Navigation.
- Nút chuyển Light/Dark mode.
- Nút “Theo dõi”.
- Mobile menu.

## 12.2. Navigation

```text
Trang chủ
Bài viết
Video
Hình ảnh
Sự kiện
Giới thiệu
```

## 12.3. Hành vi

- Header sticky khi cuộn.
- Khi cuộn xuống có thể giảm chiều cao nhẹ.
- Không che nội dung.
- Mobile menu sử dụng Radix Dialog hoặc Ant Design Drawer.
- Route đang hoạt động phải được đánh dấu rõ ràng.

---

# 13. Hero Section

## 13.1. Nội dung

Hero gồm:

- Avatar.
- Ảnh bìa hoặc background.
- Tên người sáng tạo.
- Username.
- Mô tả ngắn.
- Danh sách chủ đề.
- Hai nút hành động.
- Thống kê social.
- Icon các mạng xã hội chính.

## 13.2. Nội dung mock

```text
Tên: Quang

Username: @quangofficial

Mô tả:
Chia sẻ về TikTok, YouTube, công nghệ, cuộc sống
và những câu chuyện thú vị mỗi ngày.

Nút chính:
Xem nội dung mới

Nút phụ:
Theo dõi tôi
```

## 13.3. Chủ đề

```text
TikTok
YouTube
Đời sống
Công nghệ
Giải trí
```

## 13.4. Thống kê mock

```text
250K+ Followers
120+ Videos
30M+ Views
```

## 13.5. Hành vi

- Nút “Xem nội dung mới” cuộn đến Featured Content.
- Nút “Theo dõi tôi” mở Social Links Dialog.
- Hero phải hiển thị tốt khi thiếu ảnh bìa.
- Avatar phải có fallback.

---

# 14. Social Links Section

## 14.1. Nền tảng hỗ trợ

```text
Facebook
YouTube
TikTok
Instagram
X
Threads
Zalo
Telegram
Discord
Website
Email
```

## 14.2. Mỗi social card gồm

- Icon.
- Tên nền tảng.
- Username.
- Số follower tùy chọn.
- Mô tả ngắn tùy chọn.
- Nút truy cập.
- Trạng thái bật hoặc tắt.

## 14.3. Hành vi

- Link mở tab mới.
- Có `rel="noopener noreferrer"`.
- Có thể hiển thị dạng card hoặc icon.
- Thứ tự dựa trên thuộc tính `order`.
- Social link bị tắt không được render.
- Ghi nhận analytics event thông qua hàm placeholder.

## 14.4. Dữ liệu mock

```ts
export const socialLinks = [
  {
    id: "facebook",
    platform: "facebook",
    label: "Facebook",
    username: "Quang Official",
    url: "#",
    followerCount: "50K",
    enabled: true,
    order: 1,
  },
  {
    id: "youtube",
    platform: "youtube",
    label: "YouTube",
    username: "@quangofficial",
    url: "#",
    followerCount: "100K",
    enabled: true,
    order: 2,
  },
  {
    id: "tiktok",
    platform: "tiktok",
    label: "TikTok",
    username: "@quangofficial",
    url: "#",
    followerCount: "150K",
    enabled: true,
    order: 3,
  },
  {
    id: "instagram",
    platform: "instagram",
    label: "Instagram",
    username: "@quangofficial",
    url: "#",
    followerCount: "30K",
    enabled: true,
    order: 4,
  },
  {
    id: "x",
    platform: "x",
    label: "X",
    username: "@quangofficial",
    url: "#",
    enabled: true,
    order: 5,
  },
];
```

---

# 15. Featured Content Section

## 15.1. Mục đích

Hiển thị nội dung quan trọng nhất tại thời điểm hiện tại.

Có thể là:

- Bài viết.
- Video.
- Sự kiện.
- Chiến dịch.
- Thông báo.
- Livestream.

## 15.2. Nội dung

- Ảnh hoặc video thumbnail.
- Nhãn loại nội dung.
- Tiêu đề.
- Mô tả.
- Ngày đăng.
- CTA.
- Badge “Nổi bật”.

## 15.3. Bố cục

Desktop:

```text
Ảnh/video bên trái
Nội dung bên phải
```

Mobile:

```text
Ảnh/video phía trên
Nội dung phía dưới
```

---

# 16. Latest Posts Section

## 16.1. Nội dung mỗi card

- Thumbnail.
- Category.
- Title.
- Excerpt.
- Published date.
- Reading time.
- View count tùy chọn.
- Nút đọc tiếp.

## 16.2. Hiển thị

```text
Desktop: 3 cột
Tablet: 2 cột
Mobile: 1 cột
```

## 16.3. Yêu cầu

- Hiển thị tối đa 6 bài trên trang chủ.
- Có nút “Xem tất cả bài viết”.
- Tiêu đề card tối đa ba dòng.
- Excerpt tối đa ba dòng.
- Hình ảnh có tỷ lệ thống nhất.
- Card phải có hover nhẹ trên desktop.

---

# 17. Latest Videos Section

## 17.1. Nguồn video

- YouTube.
- TikTok.
- Instagram Reels.
- Video nội bộ.

## 17.2. Mỗi video card gồm

- Thumbnail.
- Nút play.
- Platform badge.
- Tiêu đề.
- Thời lượng tùy chọn.
- Ngày đăng.
- Lượt xem tùy chọn.

## 17.3. Hành vi

- Có thể mở link nền tảng trong tab mới.
- Có thể mở modal xem video mock.
- Video dọc và ngang phải có layout phù hợp.
- Không tự động phát video khi tải trang.
- Không nhúng quá nhiều iframe cùng lúc.

---

# 18. Gallery Preview Section

## 18.1. Nội dung

Hiển thị tối đa 6 đến 8 hình ảnh.

Chủ đề:

- Hậu trường.
- Đời sống.
- Sự kiện.
- Du lịch.
- Fan art.
- Poster.

## 18.2. Bố cục

- Có thể dùng CSS Grid.
- Có thể tạo kiểu Masonry giả lập.
- Không bắt buộc dùng thư viện Masonry.
- Ảnh dùng `next/image`.
- Có lazy loading.
- Khi bấm mở Lightbox.

---

# 19. Upcoming Events Section

## 19.1. Loại sự kiện

```text
Livestream
Video Premiere
Fan Meeting
Giveaway
Workshop
Offline Event
Product Launch
```

## 19.2. Mỗi sự kiện gồm

- Ngày.
- Giờ.
- Tiêu đề.
- Loại sự kiện.
- Địa điểm hoặc nền tảng.
- Mô tả ngắn.
- Nút xem chi tiết.
- Nút thêm lịch dạng placeholder.

## 19.3. Trạng thái

```text
upcoming
live
ended
cancelled
```

---

# 20. Active Campaign Section

## 20.1. Mục đích

Hiển thị chiến dịch marketing đang chạy.

Ví dụ:

```text
Giveaway tháng 7
Theo dõi TikTok và YouTube để nhận quà
```

## 20.2. Nội dung

- Banner.
- Tiêu đề.
- Mô tả.
- Điều kiện.
- Thời gian kết thúc.
- Countdown.
- Nút tham gia.
- Trạng thái.

## 20.3. Trạng thái

```text
draft
upcoming
active
ended
```

## 20.4. MVP

Trong MVP:

- Countdown tính từ dữ liệu mock.
- Nút tham gia dẫn đến trang campaign.
- Form đăng ký chỉ demo.
- Không gửi dữ liệu thật.

---

# 21. Newsletter Section

## 21.1. Nội dung

- Tiêu đề.
- Mô tả.
- Input email.
- Nút đăng ký.
- Checkbox đồng ý điều khoản nếu cần.

## 21.2. MVP

- Validate định dạng email.
- Khi submit hiển thị toast thành công.
- Không gọi backend.
- Không lưu email thật.

---

# 22. Collaboration CTA

## 22.1. Mục đích

Dẫn nhãn hàng hoặc đối tác đến trang liên hệ.

## 22.2. Nội dung mock

```text
Bạn muốn hợp tác cùng Quang?

Booking quảng cáo, review sản phẩm, tham gia sự kiện
hoặc xây dựng chiến dịch truyền thông.

Nút:
Liên hệ hợp tác
```

---

# 23. Footer

Footer gồm:

## 23.1. Thông tin thương hiệu

- Logo.
- Tên.
- Mô tả ngắn.

## 23.2. Liên kết nhanh

```text
Trang chủ
Bài viết
Video
Hình ảnh
Sự kiện
Giới thiệu
Liên hệ
```

## 23.3. Mạng xã hội

Hiển thị các nền tảng đang bật.

## 23.4. Chính sách

```text
Chính sách quyền riêng tư
Điều khoản sử dụng
Chính sách cookie
```

## 23.5. Copyright

```text
© 2026 Quang Official. All rights reserved.
```

Không hardcode năm nếu có thể lấy năm hiện tại bằng JavaScript.

---

# 24. Trang Blog

Route:

```text
/blog
```

## 24.1. Nội dung

- Page header.
- Bài viết nổi bật.
- Search input.
- Category filter.
- Tag filter tùy chọn.
- Danh sách bài viết.
- Pagination hoặc Load More.
- Sidebar tùy chọn trên desktop.

## 24.2. Danh mục mock

```text
Tất cả
TikTok
YouTube
Đời sống
Công nghệ
Giải trí
Hậu trường
Du lịch
Thông báo
```

## 24.3. Search

- Search theo title và excerpt.
- Search phía client trong MVP.
- Có debounce nhẹ nếu cần.
- Có empty state.

## 24.4. Pagination

Trong MVP có thể dùng:

- Pagination phía client.
- Hoặc nút “Xem thêm”.

---

# 25. Trang Chi tiết Bài viết

Route:

```text
/blog/[slug]
```

## 25.1. Nội dung

- Breadcrumb.
- Category.
- Title.
- Excerpt.
- Author.
- Published date.
- Reading time.
- Cover image.
- Nội dung bài viết.
- Table of contents tùy chọn.
- Share buttons.
- Tags.
- Bài viết liên quan.
- CTA cuối bài.

## 25.2. Nội dung bài viết hỗ trợ

- Heading.
- Paragraph.
- Image.
- Quote.
- List.
- Code block.
- Video embed.
- CTA block.
- Divider.

## 25.3. MVP

Có thể lưu nội dung dưới dạng:

```text
MDX
Markdown
Hoặc cấu trúc JSON block đơn giản
```

Ưu tiên phương án đơn giản, ổn định và dễ bảo trì.

## 25.4. Không sử dụng

Không dùng `dangerouslySetInnerHTML` với nội dung chưa được sanitize.

---

# 26. Trang Video

Route:

```text
/videos
```

## 26.1. Nội dung

- Header.
- Featured video.
- Filter theo nền tảng.
- Filter theo chủ đề.
- Video grid.
- Load more.
- Empty state.

## 26.2. Filter nền tảng

```text
Tất cả
YouTube
TikTok
Instagram
Facebook
```

## 26.3. Video layout

- Video ngang sử dụng tỷ lệ 16:9.
- Video dọc sử dụng tỷ lệ 9:16.
- Không ép tất cả video cùng một tỷ lệ.
- Card vẫn phải đồng nhất về chiều cao nội dung.

---

# 27. Trang Gallery

Route:

```text
/gallery
```

## 27.1. Nội dung

- Header.
- Category filters.
- Image grid.
- Lightbox.
- Caption.
- Share button placeholder.

## 27.2. Category

```text
Tất cả
Đời sống
Hậu trường
Sự kiện
Du lịch
Fan Art
```

## 27.3. Lightbox

Lightbox hỗ trợ:

- Previous.
- Next.
- Close.
- Caption.
- Keyboard navigation.
- Mobile swipe không bắt buộc trong MVP.

---

# 28. Trang Events

Route:

```text
/events
```

## 28.1. Nội dung

- Upcoming events.
- Live events.
- Past events.
- Filter theo loại.
- Filter theo trạng thái.

## 28.2. Trang chi tiết

Route:

```text
/events/[slug]
```

Nội dung:

- Banner.
- Title.
- Date và time.
- Location.
- Description.
- Schedule.
- CTA.
- Social sharing.

---

# 29. Trang Campaigns

Route:

```text
/campaigns
```

## 29.1. Nội dung

- Active campaigns.
- Upcoming campaigns.
- Ended campaigns.

## 29.2. Trang chi tiết

Route:

```text
/campaigns/[slug]
```

Nội dung:

- Banner.
- Campaign title.
- Description.
- Start time.
- End time.
- Countdown.
- Participation rules.
- Registration form.
- Terms.
- CTA.

## 29.3. Form mock

Các field:

```text
Họ tên
Email
Số điện thoại
Nền tảng đã theo dõi
Username mạng xã hội
Ghi chú
```

MVP chỉ validate và hiển thị toast thành công.

---

# 30. Trang About

Route:

```text
/about
```

## 30.1. Nội dung

- Avatar hoặc ảnh cá nhân lớn.
- Tiểu sử.
- Chủ đề nội dung.
- Thành tích.
- Timeline.
- Giá trị cá nhân.
- Social stats.
- CTA theo dõi.
- CTA hợp tác.

## 30.2. Timeline mock

```text
2023 — Bắt đầu tạo nội dung
2024 — Đạt 100.000 lượt theo dõi
2025 — Mở rộng nội dung trên YouTube
2026 — Xây dựng cộng đồng fan riêng
```

---

# 31. Trang Contact

Route:

```text
/contact
```

## 31.1. Form

Các field:

```text
Họ và tên
Email
Số điện thoại
Tên công ty
Loại hợp tác
Ngân sách dự kiến
Nội dung
File đính kèm
```

## 31.2. Loại hợp tác

```text
Booking quảng cáo
Review sản phẩm
Tham gia sự kiện
Đại sứ thương hiệu
Sản xuất video
Truyền thông
Khác
```

## 31.3. MVP

- Validate bắt buộc.
- Validate email.
- Validate số điện thoại cơ bản.
- File upload chỉ hiển thị UI.
- Submit hiển thị toast.
- Không gửi dữ liệu thật.

## 31.4. Thông tin liên hệ phụ

- Email.
- Social links.
- Thời gian phản hồi dự kiến.
- Nút tải Media Kit dạng placeholder.

---

# 32. Trang Privacy và Terms

Routes:

```text
/privacy
/terms
```

Tạo nội dung mẫu rõ ràng.

Không cần nội dung pháp lý hoàn chỉnh, nhưng phải ghi chú đây là nội dung mẫu cần được kiểm tra trước khi đưa lên production.

---

# 33. Trang 404

Yêu cầu:

- Thiết kế đồng bộ với website.
- Có thông báo rõ ràng.
- Có nút về trang chủ.
- Có nút xem bài viết.
- Không dùng giao diện mặc định của framework nếu có thể tùy chỉnh.

---

# 34. Bottom Navigation trên Mobile

Có thể hiển thị thanh điều hướng cố định phía dưới:

```text
Trang chủ
Bài viết
Video
Theo dõi
```

Yêu cầu:

- Không che nội dung.
- Có padding cho safe area.
- Không hiển thị nếu gây trùng lặp quá nhiều với header.
- Nút “Theo dõi” mở social dialog.

---

# 35. Theme và tùy chỉnh giao diện

## 35.1. Theme mode

Hỗ trợ:

```text
light
dark
system
```

## 35.2. Layout style

Hỗ trợ:

```text
creator
minimal
magazine
```

MVP chỉ cần hoàn thiện tốt:

```text
creator
minimal
```

## 35.3. Card style

Hỗ trợ:

```text
solid
bordered
glass
minimal
```

## 35.4. Button style

Hỗ trợ:

```text
solid
gradient
outline
pill
```

## 35.5. Cấu hình

Tạo file:

```text
src/config/site.config.ts
```

Ví dụ:

```ts
export const siteConfig = {
  siteName: "Quang Official",
  siteDescription:
    "Nơi tổng hợp bài viết, video, hình ảnh và các hoạt động mới nhất.",

  logo: "/images/logo.svg",
  avatar: "/images/avatar.jpg",
  coverImage: "/images/hero-cover.jpg",

  theme: {
    mode: "dark",
    layout: "creator",
    cardStyle: "glass",
    buttonStyle: "gradient",

    primaryColor: "#8B5CF6",
    secondaryColor: "#EC4899",
    accentColor: "#22D3EE",

    borderRadius: 20,
  },

  navigation: [
    { label: "Trang chủ", href: "/" },
    { label: "Bài viết", href: "/blog" },
    { label: "Video", href: "/videos" },
    { label: "Hình ảnh", href: "/gallery" },
    { label: "Sự kiện", href: "/events" },
    { label: "Giới thiệu", href: "/about" },
  ],

  homepageSections: {
    hero: true,
    socialLinks: true,
    featuredContent: true,
    latestPosts: true,
    latestVideos: true,
    gallery: true,
    events: true,
    campaign: true,
    newsletter: true,
    collaboration: true,
  },
};
```

---

# 36. Data Models

Tạo các interface trong:

```text
src/types
```

## 36.1. SiteConfig

```ts
export type ThemeMode = "light" | "dark" | "system";

export type LayoutStyle = "creator" | "minimal" | "magazine";

export type CardStyle = "solid" | "bordered" | "glass" | "minimal";

export type ButtonStyle = "solid" | "gradient" | "outline" | "pill";

export interface SiteConfig {
  siteName: string;
  siteDescription: string;

  logo: string;
  avatar: string;
  coverImage: string;

  theme: {
    mode: ThemeMode;
    layout: LayoutStyle;
    cardStyle: CardStyle;
    buttonStyle: ButtonStyle;

    primaryColor: string;
    secondaryColor: string;
    accentColor: string;

    borderRadius: number;
  };

  homepageSections: Record<string, boolean>;
}
```

## 36.2. SocialLink

```ts
export type SocialPlatform =
  | "facebook"
  | "youtube"
  | "tiktok"
  | "instagram"
  | "x"
  | "threads"
  | "zalo"
  | "telegram"
  | "discord"
  | "website"
  | "email";

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  label: string;
  username?: string;
  url: string;
  followerCount?: string;
  description?: string;
  enabled: boolean;
  order: number;
}
```

## 36.3. BlogPost

```ts
export type PostStatus = "draft" | "published" | "scheduled";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;

  thumbnail: string;
  coverImage?: string;

  category: string;
  tags: string[];

  author: {
    name: string;
    avatar?: string;
  };

  status: PostStatus;
  featured: boolean;

  readingTime: number;
  viewCount?: number;

  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 36.4. VideoItem

```ts
export type VideoPlatform =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "facebook"
  | "internal";

export type VideoOrientation = "landscape" | "portrait";

export interface VideoItem {
  id: string;
  title: string;
  description?: string;

  platform: VideoPlatform;
  orientation: VideoOrientation;

  thumbnail: string;
  videoUrl: string;

  duration?: string;
  viewCount?: string;

  featured: boolean;
  publishedAt: string;
}
```

## 36.5. GalleryItem

```ts
export interface GalleryItem {
  id: string;
  title: string;
  description?: string;

  imageUrl: string;
  thumbnailUrl?: string;

  category: string;
  alt: string;

  width?: number;
  height?: number;

  createdAt: string;
}
```

## 36.6. EventItem

```ts
export type EventStatus = "upcoming" | "live" | "ended" | "cancelled";

export type EventType =
  | "livestream"
  | "premiere"
  | "fan-meeting"
  | "giveaway"
  | "workshop"
  | "offline"
  | "launch";

export interface EventItem {
  id: string;
  title: string;
  slug: string;

  description: string;
  banner: string;

  type: EventType;
  status: EventStatus;

  startAt: string;
  endAt?: string;

  location?: string;
  platform?: string;
  externalUrl?: string;

  featured: boolean;
}
```

## 36.7. Campaign

```ts
export type CampaignStatus = "draft" | "upcoming" | "active" | "ended";

export interface Campaign {
  id: string;
  title: string;
  slug: string;

  description: string;
  banner: string;

  startAt: string;
  endAt: string;

  status: CampaignStatus;

  buttonLabel: string;
  buttonUrl?: string;

  rules: string[];

  featured: boolean;
}
```

---

# 37. Mock Data

Tạo dữ liệu mock trong:

```text
src/data
```

Cấu trúc:

```text
src/data/
├── posts.ts
├── videos.ts
├── gallery.ts
├── events.ts
├── campaigns.ts
└── social-links.ts
```

Yêu cầu dữ liệu:

```text
Tối thiểu 8 bài viết
Tối thiểu 8 video
Tối thiểu 10 hình ảnh
Tối thiểu 4 sự kiện
Tối thiểu 3 chiến dịch
Tối thiểu 5 social links
```

Dữ liệu mock phải tự nhiên, không sử dụng toàn bộ nội dung dạng Lorem Ipsum.

---

# 38. Cấu trúc thư mục đề xuất

```text
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── videos/
│   │   │   └── page.tsx
│   │   ├── gallery/
│   │   │   └── page.tsx
│   │   ├── events/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── campaigns/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   └── terms/
│   │       └── page.tsx
│   │
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── posts/
│   │   ├── social-links/
│   │   ├── videos/
│   │   ├── gallery/
│   │   ├── events/
│   │   ├── campaigns/
│   │   ├── appearance/
│   │   └── settings/
│   │
│   ├── layout.tsx
│   ├── not-found.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   └── globals.css
│
├── components/
│   ├── common/
│   │   ├── Container.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingState.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── SocialIcon.tsx
│   │
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── MobileMenu.tsx
│   │   ├── MobileBottomNav.tsx
│   │   └── Footer.tsx
│   │
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── SocialLinksSection.tsx
│   │   ├── FeaturedContentSection.tsx
│   │   ├── LatestPostsSection.tsx
│   │   ├── LatestVideosSection.tsx
│   │   ├── GalleryPreviewSection.tsx
│   │   ├── UpcomingEventsSection.tsx
│   │   ├── ActiveCampaignSection.tsx
│   │   ├── NewsletterSection.tsx
│   │   └── CollaborationSection.tsx
│   │
│   ├── blog/
│   │   ├── PostCard.tsx
│   │   ├── PostGrid.tsx
│   │   ├── PostFilters.tsx
│   │   ├── PostContent.tsx
│   │   └── RelatedPosts.tsx
│   │
│   ├── video/
│   │   ├── VideoCard.tsx
│   │   ├── VideoGrid.tsx
│   │   └── VideoDialog.tsx
│   │
│   ├── gallery/
│   │   ├── GalleryGrid.tsx
│   │   ├── GalleryCard.tsx
│   │   └── GalleryLightbox.tsx
│   │
│   ├── events/
│   │   ├── EventCard.tsx
│   │   └── EventList.tsx
│   │
│   ├── campaigns/
│   │   ├── CampaignCard.tsx
│   │   ├── CampaignCountdown.tsx
│   │   └── CampaignForm.tsx
│   │
│   └── admin/
│       ├── AdminSidebar.tsx
│       ├── AdminHeader.tsx
│       ├── StatCard.tsx
│       └── ContentTable.tsx
│
├── config/
│   ├── site.config.ts
│   ├── theme.config.ts
│   └── navigation.config.ts
│
├── data/
│   ├── posts.ts
│   ├── videos.ts
│   ├── gallery.ts
│   ├── events.ts
│   ├── campaigns.ts
│   └── social-links.ts
│
├── hooks/
│   ├── useTheme.ts
│   ├── useMediaQuery.ts
│   └── useCountdown.ts
│
├── lib/
│   ├── analytics.ts
│   ├── metadata.ts
│   └── utils.ts
│
├── services/
│   ├── post.service.ts
│   ├── video.service.ts
│   ├── event.service.ts
│   └── campaign.service.ts
│
├── store/
│   ├── index.ts
│   └── slices/
│
├── types/
│   ├── site.ts
│   ├── social.ts
│   ├── post.ts
│   ├── video.ts
│   ├── gallery.ts
│   ├── event.ts
│   └── campaign.ts
│
└── utils/
    ├── cn.ts
    ├── date.ts
    ├── format.ts
    └── validation.ts
```

Không bắt buộc phải tạo file chưa được sử dụng.

Không tạo file rỗng chỉ để khớp cấu trúc.

---

# 39. Server Components và Client Components

## 39.1. Server Component mặc định

Tất cả component phải là Server Component nếu không cần:

- State.
- Effect.
- Browser API.
- Event handler.
- Context phía client.
- Local storage.

## 39.2. Client Component

Chỉ thêm `"use client"` khi thực sự cần.

Ví dụ:

- Theme toggle.
- Search và filter.
- Dialog.
- Countdown.
- Form.
- Lightbox.
- Mobile menu.
- Toast.
- Local state.

Không biến toàn bộ page thành Client Component chỉ vì một component con cần tương tác.

---

# 40. State Management

## 40.1. MVP

Ưu tiên:

- Local state.
- URL search params.
- React Context cho theme.
- Server data từ mock files.

Không dùng Redux cho dữ liệu đơn giản.

## 40.2. Redux

Chỉ dùng Redux Toolkit nếu triển khai admin editor hoặc trạng thái toàn cục phức tạp.

Không lưu toàn bộ nội dung website vào Redux nếu không cần thiết.

---

# 41. Image Handling

- Sử dụng `next/image`.
- Thêm `alt` có ý nghĩa.
- Khai báo kích thước hoặc sử dụng `fill` đúng cách.
- Dùng `sizes`.
- Không tải ảnh gốc quá lớn.
- Có placeholder hoặc fallback.
- Không làm layout shift.
- Ảnh trong mock data dùng local assets trong `/public/images`.

Tạo các thư mục:

```text
public/images/avatar
public/images/posts
public/images/videos
public/images/gallery
public/images/events
public/images/campaigns
```

Nếu chưa có hình ảnh thật, có thể sử dụng placeholder được tạo bằng CSS gradient hoặc ảnh mẫu hợp lệ.

---

# 42. SEO

## 42.1. Metadata toàn website

Bao gồm:

- Title template.
- Description.
- Keywords cơ bản.
- Author.
- Open Graph.
- Twitter card.
- Favicon.
- Robots.
- Sitemap.

## 42.2. Metadata từng bài viết

Mỗi bài viết phải có:

- Title.
- Description.
- Cover image.
- Canonical URL.
- Open Graph.
- Published time.
- Modified time.
- Article metadata.

## 42.3. URL

Slug phải:

- Viết thường.
- Không dấu.
- Dùng dấu gạch ngang.
- Không chứa ký tự đặc biệt.

Ví dụ:

```text
/blog/kinh-nghiem-phat-trien-kenh-tiktok
```

---

# 43. Accessibility

Yêu cầu tối thiểu:

- Semantic HTML.
- Heading đúng cấp.
- Nút phải dùng `<button>`.
- Link phải dùng `<a>` hoặc `Link`.
- Form có label.
- Hình ảnh có alt.
- Focus state rõ ràng.
- Dialog có title.
- Điều khiển được bằng keyboard.
- Độ tương phản đủ đọc.
- Không dùng màu sắc làm dấu hiệu duy nhất.
- Tôn trọng `prefers-reduced-motion`.
- Icon-only button phải có `aria-label`.

---

# 44. Performance

Mục tiêu:

- Không tải iframe video hàng loạt khi chưa cần.
- Lazy load hình ảnh dưới fold.
- Hạn chế Client Components.
- Không import toàn bộ icon package.
- Không dùng ảnh quá lớn.
- Không dùng JavaScript cho hiệu ứng có thể làm bằng CSS.
- Tránh re-render không cần thiết.
- Không tạo animation nặng trên mobile.
- Không để layout shift đáng kể.

---

# 45. Analytics Placeholder

Tạo file:

```text
src/lib/analytics.ts
```

Tạo các hàm:

```ts
export function trackSocialClick(platform: string): void {
  console.info("social_click", { platform });
}

export function trackPostView(slug: string): void {
  console.info("post_view", { slug });
}

export function trackVideoClick(videoId: string): void {
  console.info("video_click", { videoId });
}

export function trackCampaignClick(campaignId: string): void {
  console.info("campaign_click", { campaignId });
}
```

Trong MVP chỉ log ở development.

Thiết kế sao cho sau này dễ thay bằng Google Analytics, Meta Pixel hoặc TikTok Pixel.

---

# 46. Form Validation

Các form phải:

- Hiển thị lỗi bên dưới field.
- Không chỉ dùng toast để báo lỗi.
- Disable submit khi đang gửi.
- Có loading state.
- Không cho submit nhiều lần liên tục.
- Trim dữ liệu text.
- Validate email.
- Validate field bắt buộc.
- Không crash khi dữ liệu trống.

Có thể dùng validation thủ công hoặc thư viện có sẵn nếu dự án đã cài.

Không cài thêm thư viện form lớn nếu chưa cần.

---

# 47. Loading, Empty và Error States

Mỗi trang có dữ liệu phải có:

- Loading state.
- Empty state.
- Error state cơ bản.

Ví dụ:

```text
Không tìm thấy bài viết phù hợp.
Hiện chưa có sự kiện sắp diễn ra.
Chưa có chiến dịch nào đang hoạt động.
```

Không để khu vực trống hoàn toàn mà không có giải thích.

---

# 48. Admin Dashboard MVP

Route:

```text
/admin
```

Trong phiên bản đầu, tạo giao diện dashboard demo.

## 48.1. Sidebar

```text
Tổng quan
Bài viết
Mạng xã hội
Video
Hình ảnh
Sự kiện
Chiến dịch
Giao diện
Cài đặt
```

## 48.2. Dashboard

Hiển thị mock:

```text
Tổng lượt truy cập
Tổng bài viết
Tổng video
Tổng lượt bấm mạng xã hội
Chiến dịch đang chạy
Sự kiện sắp tới
```

## 48.3. Danh sách nội dung

Dùng Ant Design Table cho:

- Posts.
- Social links.
- Videos.
- Events.
- Campaigns.

## 48.4. Hành động demo

- Add.
- Edit.
- Delete.
- Enable/Disable.
- Mark as Featured.

Trong MVP, hành động chỉ cập nhật local state hoặc hiển thị toast.

Không cần database thật.

---

# 49. Appearance Editor MVP

Route:

```text
/admin/appearance
```

Cho phép demo:

- Chọn Light/Dark.
- Chọn primary color.
- Chọn secondary color.
- Chọn card style.
- Chọn button style.
- Chọn layout.
- Bật/tắt section.
- Preview cơ bản.

Có thể lưu trong `localStorage`.

Khi reload, giao diện có thể đọc lại cấu hình local.

Không cần đồng bộ server.

---

# 50. Coding Standards

## 50.1. TypeScript

- Bật strict mode.
- Không sử dụng `any` nếu không thật sự cần.
- Không dùng `as any` để che lỗi.
- Dữ liệu phải có type rõ ràng.
- Function public nên có return type.
- Props component phải có interface hoặc type.

## 50.2. Component

- Mỗi component chỉ nên có một trách nhiệm chính.
- Không tạo component dài hàng trăm dòng nếu có thể tách hợp lý.
- Không tách component quá nhỏ mà không mang lại giá trị.
- Dùng tên component rõ nghĩa.
- Không dùng tên chung chung như `Item`, `Box`, `Test`.

## 50.3. Naming

```text
Component: PascalCase
Hook: useSomething
Function: camelCase
Constant: camelCase hoặc UPPER_CASE
Type/Interface: PascalCase
File component: PascalCase.tsx
Utility file: kebab-case.ts hoặc camelCase.ts
```

## 50.4. Import

- Ưu tiên alias `@/`.
- Không sử dụng đường dẫn tương đối quá sâu.
- Không để import không sử dụng.
- Nhóm import hợp lý.

## 50.5. Comment

Chỉ comment khi:

- Logic khó hiểu.
- Có quyết định kỹ thuật quan trọng.
- Có workaround.
- Có TODO rõ ràng.

Không comment lại điều code đã thể hiện rõ.

---

# 51. Error Handling

- Không nuốt lỗi bằng `catch {}` trống.
- Khi catch phải xử lý hoặc log hợp lý.
- Không hiển thị stack trace cho người dùng.
- Thông báo lỗi phải dễ hiểu.
- App không được crash khi dữ liệu mock thiếu field tùy chọn.
- Các dynamic route phải xử lý trường hợp slug không tồn tại bằng `notFound()`.

---

# 52. Security cơ bản

Mặc dù MVP chưa có backend, vẫn phải:

- Không hardcode API key.
- Không commit secret.
- Tạo `.env.example`.
- External link sử dụng `noopener noreferrer`.
- Không render HTML không tin cậy.
- Không dùng `dangerouslySetInnerHTML` tùy tiện.
- Form upload phải giới hạn loại file khi triển khai thật.
- Admin hiện tại chỉ là demo, không được mô tả là đã bảo mật production.

---

# 53. Environment Variables

Tạo file:

```text
.env.example
```

Nội dung dự kiến:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_TIKTOK_PIXEL_ID=

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

DATABASE_URL=
AUTH_SECRET=
```

Trong MVP không bắt buộc các biến này phải có giá trị.

Website vẫn phải chạy khi chưa cấu hình analytics hoặc database.

---

# 54. Service Layer

Dữ liệu không nên được truy cập trực tiếp từ mọi component.

Tạo service đơn giản:

```ts
export async function getPublishedPosts(): Promise<BlogPost[]> {
  return posts
    .filter((post) => post.status === "published")
    .sort((a, b) => {
      return (
        new Date(b.publishedAt ?? b.createdAt).getTime() -
        new Date(a.publishedAt ?? a.createdAt).getTime()
      );
    });
}
```

Tương tự cho:

- Videos.
- Gallery.
- Events.
- Campaigns.

Mục đích là sau này có thể thay mock data bằng API mà không sửa toàn bộ component.

---

# 55. Date Handling

Sử dụng Day.js.

Quy tắc:

- Lưu ngày ở định dạng ISO.
- Hiển thị ngày theo tiếng Việt.
- Countdown phải xử lý khi hết thời gian.
- Không tạo hydration mismatch do thời gian.
- Với countdown phía client, chỉ render sau khi mounted nếu cần.

---

# 56. Toast và Notification

Sử dụng một hệ thống toast duy nhất.

Có thể dùng:

```text
Sonner
hoặc Ant Design message
```

Không dùng cả hai trong cùng một khu vực nếu không cần.

Toast dùng cho:

- Submit form thành công.
- Copy link.
- Thao tác admin demo.
- Lỗi không nghiêm trọng.

---

# 57. Animation

Cho phép:

- Fade in nhẹ.
- Slide up nhẹ.
- Hover translate nhỏ.
- Image zoom nhẹ.
- Gradient animation rất nhẹ.

Không cho phép:

- Parallax nặng.
- Animation liên tục gây mất tập trung.
- Bounce quá nhiều.
- Hiệu ứng làm chậm mobile.
- Animation chặn tương tác.

Thời lượng gợi ý:

```text
150ms đến 300ms
```

---

# 58. Nội dung tiếng Việt

Toàn bộ giao diện mặc định dùng tiếng Việt.

Không trộn lẫn tiếng Anh không cần thiết.

Ngoại lệ:

- Tên nền tảng.
- Thuật ngữ thương hiệu.
- Một số nhãn kỹ thuật trong admin nếu cần.

Text phải tự nhiên, tránh Lorem Ipsum.

---

# 59. Tiêu chí nghiệm thu MVP

Dự án chỉ được xem là hoàn thành khi đáp ứng toàn bộ tiêu chí sau.

## 59.1. Chức năng

- Trang chủ render đầy đủ.
- Navigation hoạt động.
- Tất cả route public hoạt động.
- Dynamic route bài viết hoạt động.
- Dynamic route sự kiện hoạt động.
- Dynamic route chiến dịch hoạt động.
- Search bài viết hoạt động.
- Filter bài viết hoạt động.
- Filter video hoạt động.
- Gallery Lightbox hoạt động.
- Theme toggle hoạt động.
- Social dialog hoạt động.
- Form validation hoạt động.
- Countdown hoạt động.
- Trang 404 hoạt động.
- Admin demo hoạt động.

## 59.2. Responsive

- Không horizontal scroll.
- Không vỡ layout trên mobile.
- Không vỡ layout trên tablet.
- Không vỡ layout trên desktop.
- Menu mobile hoạt động.
- Các nút dễ bấm trên mobile.
- Hình ảnh đúng tỷ lệ.

## 59.3. Code

- Không còn TypeScript error.
- Không còn lỗi build.
- Không còn import thừa.
- Không có `any` không cần thiết.
- Không có component client quá lớn.
- Không có lỗi console nghiêm trọng.
- Không có link nội bộ bị hỏng.

## 59.4. SEO

- Có metadata.
- Có sitemap.
- Có robots.
- Có Open Graph cơ bản.
- Dynamic pages có metadata riêng.
- Hình ảnh có alt.

## 59.5. Build

Các lệnh sau phải chạy thành công:

```bash
npm run lint
npm run build
```

Nếu dự án có script type-check:

```bash
npm run type-check
```

---

# 60. Deliverables

AI Agent phải tạo:

1. Toàn bộ source code.
2. Cấu trúc thư mục rõ ràng.
3. Mock data.
4. Public website.
5. Admin dashboard demo.
6. Theme system.
7. Responsive UI.
8. SEO metadata.
9. Sitemap.
10. Robots.
11. Trang 404.
12. `.env.example`.
13. `README.md`.
14. Hướng dẫn chạy local.
15. Hướng dẫn build.
16. Hướng dẫn deploy Vercel.
17. Danh sách các tính năng chưa triển khai.
18. Kết quả kiểm tra lint và build.

---

# 61. README yêu cầu

File `README.md` phải gồm:

```text
Giới thiệu dự án
Danh sách tính năng
Công nghệ sử dụng
Cách cài đặt
Cách chạy development
Cách build production
Cấu trúc thư mục
Cách thay avatar
Cách thay banner
Cách thay social links
Cách thêm bài viết
Cách đổi màu giao diện
Cách deploy Vercel
Các biến môi trường
Các tính năng tương lai
```

---

# 62. Thứ tự triển khai bắt buộc

AI Agent phải thực hiện theo thứ tự:

## Bước 1

- Kiểm tra repository hiện tại.
- Đọc `package.json`.
- Không tự ý thay đổi framework đang dùng.
- Xác định các thư viện đã cài.
- Kiểm tra cấu trúc App Router.

## Bước 2

- Tạo types.
- Tạo site config.
- Tạo mock data.
- Tạo utilities và service layer.

## Bước 3

- Tạo layout.
- Tạo header.
- Tạo footer.
- Tạo theme system.
- Tạo các common components.

## Bước 4

- Hoàn thiện trang chủ.
- Kiểm tra responsive trang chủ.

## Bước 5

- Hoàn thiện Blog.
- Hoàn thiện Blog Detail.

## Bước 6

- Hoàn thiện Videos.
- Hoàn thiện Gallery.
- Hoàn thiện Events.
- Hoàn thiện Campaigns.

## Bước 7

- Hoàn thiện About.
- Hoàn thiện Contact.
- Hoàn thiện Privacy.
- Hoàn thiện Terms.
- Hoàn thiện 404.

## Bước 8

- Tạo Admin Dashboard demo.
- Tạo Appearance Editor demo.

## Bước 9

- Thêm SEO.
- Thêm sitemap.
- Thêm robots.
- Thêm analytics placeholders.

## Bước 10

- Chạy lint.
- Chạy type-check.
- Chạy build.
- Sửa toàn bộ lỗi.
- Cập nhật README.

---

# 63. Quy tắc làm việc dành cho AI Agent

AI Agent phải tuân thủ:

1. Đọc toàn bộ tài liệu trước khi sửa code.
2. Không chỉ tạo kế hoạch rồi dừng.
3. Phải trực tiếp tạo và chỉnh sửa file.
4. Không xóa code hiện tại nếu chưa hiểu mục đích.
5. Không thay đổi dependency không cần thiết.
6. Không hạ phiên bản Next.js hoặc React.
7. Không tự ý chuyển sang framework khác.
8. Không tự ý thêm backend trong MVP.
9. Không sử dụng dữ liệu thật hoặc API key thật.
10. Không để TODO cho tính năng thuộc phạm vi MVP.
11. Không bỏ qua lỗi TypeScript.
12. Không bỏ qua lỗi build.
13. Không dùng mock component sơ sài chỉ để route tồn tại.
14. Mỗi trang phải có giao diện hoàn chỉnh và đồng bộ.
15. Ưu tiên code đơn giản, dễ đọc và dễ mở rộng.
16. Phải xử lý responsive ngay trong lúc xây dựng, không để đến cuối.
17. Phải kiểm tra route sau khi hoàn thiện từng nhóm trang.
18. Khi có lựa chọn chưa được chỉ định, sử dụng phương án hợp lý nhất và ghi lại trong README.
19. Không hỏi lại những thông tin có thể tự quyết định hợp lý từ tài liệu này.
20. Nếu một tính năng không thể triển khai đầy đủ, phải tạo phiên bản mock hoạt động và ghi chú rõ.

---

# 64. Yêu cầu báo cáo sau khi hoàn thành

Sau khi hoàn thành, AI Agent phải trả về báo cáo gồm:

## 64.1. Đã thực hiện

Liệt kê:

- Các trang đã tạo.
- Các component chính.
- Các tính năng đã hoàn thiện.
- Các cấu hình đã thêm.

## 64.2. File quan trọng

Liệt kê đường dẫn:

```text
src/config/site.config.ts
src/data/posts.ts
src/data/social-links.ts
src/app/(public)/page.tsx
src/app/layout.tsx
README.md
.env.example
```

## 64.3. Kiểm tra

Ghi rõ kết quả:

```text
Lint: Passed hoặc Failed
Type-check: Passed hoặc Failed
Build: Passed hoặc Failed
```

Nếu failed phải nêu lỗi thật, không được báo thành công sai sự thật.

## 64.4. Chưa triển khai

Liệt kê rõ:

- Backend.
- Database.
- Authentication.
- Upload thật.
- Analytics thật.
- Email thật.
- API mạng xã hội thật.

---

# 65. Prompt thực thi đề xuất

Sau khi đặt file này vào thư mục gốc dự án, sử dụng prompt sau cho AI Agent:

```text
Đọc toàn bộ file PROJECT_SPEC.md và kiểm tra repository hiện tại.

Hãy triển khai dự án theo đúng phạm vi MVP trong tài liệu.

Yêu cầu:

1. Không chỉ lập kế hoạch.
2. Trực tiếp tạo và chỉnh sửa source code.
3. Giữ nguyên Next.js, React và các dependency hiện tại nếu không thật sự cần thay đổi.
4. Sử dụng TypeScript strict.
5. Ưu tiên Server Components.
6. Chỉ dùng Client Components khi cần tương tác.
7. Hoàn thiện responsive cho mobile, tablet và desktop.
8. Sử dụng mock data, chưa làm backend thật.
9. Không để route trống hoặc component placeholder sơ sài.
10. Chạy lint, type-check và production build sau khi hoàn thành.
11. Tự sửa các lỗi phát hiện được.
12. Cập nhật README với hướng dẫn sử dụng và tùy chỉnh.

Hãy làm theo từng giai đoạn trong PROJECT_SPEC.md và tiếp tục cho đến khi MVP có thể chạy được.

Sau khi hoàn thành, báo cáo:

- Các tính năng đã làm.
- Các file quan trọng.
- Các quyết định kỹ thuật.
- Kết quả lint.
- Kết quả type-check.
- Kết quả build.
- Các tính năng chưa triển khai.
```

---

# 66. Định nghĩa hoàn thành

Dự án được xem là hoàn thành khi:

```text
Người dùng có thể chạy npm install
Người dùng có thể chạy npm run dev
Website hiển thị đầy đủ
Tất cả route chính hoạt động
Giao diện responsive
Theme hoạt động
Mock data hiển thị đúng
Form demo hoạt động
Admin demo hoạt động
Không có TypeScript error
Production build thành công
README đầy đủ
```
